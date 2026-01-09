/**
 * Excel Handler - Module xử lý đọc/ghi file Excel
 */

const ExcelJS = require('exceljs');
const config = require('./config');

class ExcelHandler {
  constructor(filePath = config.excelFilePath) {
    this.filePath = filePath;
    this.workbook = null;
    this.worksheet = null;
  }

  /**
   * Đọc file Excel và load worksheet
   */
  async load() {
    try {
      this.workbook = new ExcelJS.Workbook();
      await this.workbook.xlsx.readFile(this.filePath);
      
      // Lấy sheet đầu tiên hoặc sheet theo tên config
      this.worksheet = config.sheetName 
        ? this.workbook.getWorksheet(config.sheetName)
        : this.workbook.worksheets[0];
      
      if (!this.worksheet) {
        throw new Error(`Không tìm thấy worksheet: ${config.sheetName || 'Sheet đầu tiên'}`);
      }
      
      console.log(`✓ Đã load worksheet: ${this.worksheet.name}`);
      console.log(`  Số dòng: ${this.worksheet.rowCount}`);
      
      return true;
    } catch (error) {
      console.error('✗ Lỗi khi load Excel file:', error.message);
      throw error;
    }
  }

  /**
   * Lấy danh sách các dòng cần xử lý
   * @param {number} limit - Giới hạn số dòng (để test)
   */
  getRowsToProcess(limit = null) {
    const rows = [];
    const startRow = config.startRow;
    const maxRow = limit 
      ? Math.min(startRow + limit - 1, this.worksheet.rowCount)
      : this.worksheet.rowCount;

    for (let rowNum = startRow; rowNum <= maxRow; rowNum++) {
      const row = this.worksheet.getRow(rowNum);
      const linkCell = row.getCell(config.columns.LINK_INTERNAL);
      
      // Lấy link từ cell - có thể là string hoặc object với result
      let link = linkCell.value;
      if (link && typeof link === 'object' && link.result) {
        link = link.result; // Lấy từ formula result
      }

      // Chỉ xử lý các dòng có link
      if (link && typeof link === 'string' && link.trim() !== '') {
        rows.push({
          rowNumber: rowNum,
          link: link.trim(),
          currentFcCode: row.getCell(config.columns.FC_CODE_REF).value,
          referenceCodeOfSo: row.getCell(config.columns.REFERENCE_CODE_OF_SO).value
        });
      }
    }

    return rows;
  }

  /**
   * Cập nhật dữ liệu vào Excel
   * @param {number} rowNumber - Số dòng cần update
   * @param {object} data - Dữ liệu cần update { fcCodeRef, checkStatus }
   */
  async updateRow(rowNumber, data) {
    try {
      const row = this.worksheet.getRow(rowNumber);

      if (data.fcCodeRef !== null && data.fcCodeRef !== undefined) {
        row.getCell(config.columns.FC_CODE_REF).value = data.fcCodeRef;
      }

      if (data.checkStatus !== null && data.checkStatus !== undefined) {
        row.getCell(config.columns.CHECK_STATUS).value = data.checkStatus;
      }

      row.commit();
      // Không log để tối ưu tốc độ
      
      return true;
    } catch (error) {
      console.error(`  ✗ Lỗi khi cập nhật dòng ${rowNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Lưu file Excel
   * @param {string} outputPath - Đường dẫn file output (mặc định ghi đè file gốc)
   */
  async save(outputPath = null) {
    try {
      const savePath = outputPath || this.filePath;
      await this.workbook.xlsx.writeFile(savePath);
      console.log(`✓ Đã lưu file Excel: ${savePath}`);
      return true;
    } catch (error) {
      console.error('✗ Lỗi khi lưu file Excel:', error.message);
      throw error;
    }
  }

  /**
   * Hiển thị thông tin tổng quan
   */
  displayInfo() {
    console.log('\n=== THÔNG TIN FILE EXCEL ===');
    console.log(`File: ${this.filePath}`);
    console.log(`Worksheet: ${this.worksheet.name}`);
    console.log(`Tổng số dòng: ${this.worksheet.rowCount}`);
    console.log(`Cột FC_CODE_REF: ${config.columns.FC_CODE_REF}`);
    console.log(`Cột LINK_INTERNAL: ${config.columns.LINK_INTERNAL}`);
    console.log(`Cột REFERENCE_CODE_OF_SO: ${config.columns.REFERENCE_CODE_OF_SO}`);
    console.log(`Cột CHECK_STATUS: ${config.columns.CHECK_STATUS}`);
    console.log('===========================\n');
  }

  /**
   * Tạo backup file Excel
   */
  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const backupPath = this.filePath.replace('.xlsx', `_backup_${timestamp}.xlsx`);
      await this.workbook.xlsx.writeFile(backupPath);
      console.log(`✓ Đã tạo backup: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('✗ Lỗi khi tạo backup:', error.message);
      throw error;
    }
  }
}

module.exports = ExcelHandler;
