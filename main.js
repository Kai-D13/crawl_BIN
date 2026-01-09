/**
 * Main Entry Point - Orchestrate toàn bộ flow
 */

const ExcelHandler = require('./excelHandler');
const Scraper = require('./scraper');
const Logger = require('./logger');
const CheckpointManager = require('./checkpoint');
const config = require('./config');

class MainApp {
  constructor() {
    this.excelHandler = new ExcelHandler();
    this.scraper = new Scraper();
    this.logger = new Logger();
    this.checkpoint = new CheckpointManager();
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      retried: 0
    };
  }

  /**
   * Main execution flow
   */
  async run(testMode = false) {
    try {
      console.log('\n╔════════════════════════════════════════════════════════╗');
      console.log('║     HỆ THỐNG TỰ ĐỘNG FETCH DỮ LIỆU WEB INTERNAL      ║');
      console.log('╚════════════════════════════════════════════════════════╝\n');

      // Xử lý Ctrl+C để lưu file trước khi thoát
      let isShuttingDown = false;
      process.on('SIGINT', async () => {
        if (isShuttingDown) return;
        isShuttingDown = true;
        
        console.log('\n\n⚠️  Đã nhận tín hiệu dừng (Ctrl+C)');
        console.log('💾 Đang lưu file Excel và dọn dẹp...');
        
        try {
          await this.excelHandler.save();
          console.log('✓ Đã lưu file Excel!');
        } catch (error) {
          console.error('✗ Lỗi khi lưu file:', error.message);
        }
        
        try {
          await this.scraper.close();
          console.log('✓ Đã đóng browser!');
        } catch (error) {
          console.error('✗ Lỗi khi đóng browser:', error.message);
        }
        
        console.log('\n👋 Tạm biệt!\n');
        process.exit(0);
      });

      // 1. Load Excel file
      console.log('📂 BƯỚC 1: Đọc file Excel');
      await this.excelHandler.load();
      this.excelHandler.displayInfo();

      // 2. Tạo backup
      console.log('💾 BƯỚC 2: Tạo file backup');
      await this.excelHandler.createBackup();

      // 3. Lấy danh sách rows cần xử lý
      const rowLimit = testMode ? config.testRowCount : null;
      let rows = this.excelHandler.getRowsToProcess(rowLimit);
      
      if (rows.length === 0) {
        console.log('\n⚠ Không tìm thấy dòng nào cần xử lý!');
        return;
      }

      // 3.1. Kiểm tra checkpoint để resume
      const checkpoint = this.checkpoint.load();
      let startIndex = 0;
      
      if (checkpoint && checkpoint.lastProcessedRow > 0) {
        // Tìm index của dòng tiếp theo cần xử lý
        const lastRow = checkpoint.lastProcessedRow;
        startIndex = rows.findIndex(r => r.rowNumber > lastRow);
        
        if (startIndex > 0) {
          console.log(`\n🔄 RESUME: Bỏ qua ${startIndex} dòng đã xử lý (từ dòng ${rows[0].rowNumber} đến ${lastRow})`);
          rows = rows.slice(startIndex);
        } else if (startIndex === -1) {
          console.log('\n✅ Tất cả dòng đã được xử lý!');
          return;
        }
      }

      console.log(`\n📋 BƯỚC 3: Xử lý ${rows.length} dòng dữ liệu`);
      if (testMode) {
        console.log('   ⚠ Đang chạy ở chế độ TEST - chỉ xử lý 3 dòng đầu tiên');
      }

      this.stats.total = rows.length;

      // 4. Khởi động browser với URL đầu tiên
      console.log('\n🌐 BƯỚC 4: Khởi động trình duyệt');
      await this.scraper.initialize(rows[0].link);

      // 5. Xử lý từng dòng
      console.log('\n⚙️  BƯỚC 5: Bắt đầu scrape dữ liệu');
      console.log('═'.repeat(60));

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const progressPercent = ((i + 1) / rows.length * 100).toFixed(1);
        
        // Chỉ hiển thị progress đơn giản
        process.stdout.write(`\r[${i + 1}/${rows.length}] (${progressPercent}%) - Dòng ${row.rowNumber} - Đang xử lý...`);
        
        // Hiển thị stats và LƯU FILE mỗi 50 dòng
        if ((i + 1) % 50 === 0) {
          process.stdout.write(`\n📊 Stats: ✓${this.stats.success} | ⊗${this.stats.skipped} | ✗${this.stats.failed}\n`);
          process.stdout.write(`💾 Đang lưu file Excel...\n`);
          await this.excelHandler.save();
          process.stdout.write(`✓ Đã lưu thành công!\n`);
        }
        
        try {
          // Scrape data với retry
          const data = await this.scraper.scrapePage(row.link);
          
          // Kiểm tra kết quả
          if (data.error) {
            process.stdout.write(` Lỗi!\n`);
            this.stats.failed++;
            this.checkpoint.save(row.rowNumber, this.stats.total, false);
            continue;
          }

          // So sánh fc_code_ref với reference_code_of_so để xác định status
          const checkStatus = this.compareAndGetStatus(data.fcCodeRef, row.referenceCodeOfSo);
          data.checkStatus = checkStatus;

          // Kiểm tra dữ liệu
          const hasNewData = (data.fcCodeRef && data.fcCodeRef !== row.currentFcCode);

          if (!hasNewData && !data.checkStatus) {
            process.stdout.write(` Bỏ qua\n`);
            this.stats.skipped++;
          } else {
            await this.excelHandler.updateRow(row.rowNumber, data);
            process.stdout.write(` ✓ Hoàn thành\n`);
            this.stats.success++;
          }

          this.checkpoint.save(row.rowNumber, this.stats.total, true);

          // Delay giữa các page
          if (i < rows.length - 1) {
            await this.delay(config.timing.delayBetweenPages);
          }

        } catch (error) {
          process.stdout.write(` Lỗi: ${error.message}\n`);
          this.logger.error(`Lỗi dòng ${row.rowNumber}`, { error: error.message, link: row.link });
          this.stats.failed++;
          this.checkpoint.save(row.rowNumber, this.stats.total, false);
        }
      }

      // 7. Lưu file Excel
      console.log('\n═'.repeat(60));
      console.log('\n💾 BƯỚC 7: Lưu file Excel');
      await this.excelHandler.save();

      // 8. Hiển thị thống kê
      this.displayStats();

      // 9. Xóa checkpoint khi hoàn thành
      if (!testMode) {
        this.checkpoint.clear();
      }

      // 10. Đóng browser
      await this.scraper.close();

      console.log('\n✅ HOÀN THÀNH!\n');

    } catch (error) {
      console.error('\n❌ LỖI NGHIÊM TRỌNG:', error.message);
      console.error(error.stack);
      
      // LƯU FILE EXCEL TRƯỚC KHI THOÁT để không mất dữ liệu
      try {
        console.log('\n💾 Đang lưu file Excel trước khi thoát...');
        await this.excelHandler.save();
        console.log('✓ Đã lưu file Excel!');
      } catch (saveError) {
        console.error('✗ Không thể lưu file Excel:', saveError.message);
      }
      
      // Đảm bảo đóng browser
      await this.scraper.close();
      
      process.exit(1);
    }
  }

  /**
   * So sánh fc_code_ref với reference_code_of_so và trả về status
   * @param {string} fcCodeRef - Mã fetch được từ web (SOBD36782622)
   * @param {string} referenceCodeOfSo - Mã gốc từ Excel (SOBD36782622-F)
   * @returns {string} - "Chưa trả" hoặc "Đã trả"
   */
  compareAndGetStatus(fcCodeRef, referenceCodeOfSo) {
    // Trường hợp 2: fc_code_ref null/empty/undefined -> "Đã trả"
    if (!fcCodeRef || fcCodeRef.trim() === '') {
      return 'Đã trả';
    }

    // Chuẩn hóa reference_code_of_so: bỏ suffix -F hoặc -L (nếu có)
    let normalizedReference = referenceCodeOfSo;
    if (normalizedReference && typeof normalizedReference === 'string') {
      normalizedReference = normalizedReference.trim().replace(/-[A-Z]$/, '');
    }

    // Trường hợp 1: Trùng nhau -> "Chưa trả"
    if (fcCodeRef.trim() === normalizedReference) {
      return 'Chưa trả';
    }

    // Trường hợp 2: Khác nhau -> "Đã trả"
    return 'Đã trả';
  }

  /**
   * Hiển thị thống kê
   */
  displayStats() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                    THỐNG KÊ KẾT QUẢ                   ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║  Tổng số dòng xử lý:      ${this.pad(this.stats.total)}                      ║`);
    console.log(`║  Cập nhật thành công:     ${this.pad(this.stats.success)}                      ║`);
    console.log(`║  Bỏ qua (đã có dữ liệu):  ${this.pad(this.stats.skipped)}                      ║`);
    console.log(`║  Thất bại:                ${this.pad(this.stats.failed)}                      ║`);
    console.log('╚════════════════════════════════════════════════════════╝');
  }

  /**
   * Helper để format số
   */
  pad(num) {
    return String(num).padStart(3, ' ');
  }

  /**
   * Hỏi Yes/No từ user
   */
  async askYesNo(question) {
    return new Promise(resolve => {
      process.stdout.write(question);
      process.stdin.once('data', (data) => {
        const answer = data.toString().trim().toLowerCase();
        resolve(answer === 'y' || answer === 'yes');
      });
    });
  }

  /**
   * Delay utility
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run application
(async () => {
  const app = new MainApp();
  
  // Check arguments
  const args = process.argv.slice(2);
  const testMode = args.includes('--test') || args.includes('-t');
  
  if (testMode) {
    console.log('🧪 Chạy ở chế độ TEST MODE');
  }
  
  await app.run(testMode);
})();
