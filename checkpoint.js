/**
 * Checkpoint Manager - Lưu tiến trình để resume khi bị gián đoạn
 */

const fs = require('fs');
const config = require('./config');

class CheckpointManager {
  constructor() {
    this.enabled = config.checkpoint?.enabled || false;
    this.filePath = config.checkpoint?.filePath || './checkpoint.json';
    this.saveInterval = config.checkpoint?.saveInterval || 5;
    this.data = {
      lastProcessedRow: 0,
      totalRows: 0,
      successCount: 0,
      failedCount: 0,
      timestamp: null,
      processedRows: []
    };
  }

  /**
   * Load checkpoint từ file
   */
  load() {
    if (!this.enabled) return null;

    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(content);
        console.log(`✓ Đã load checkpoint: Dòng ${this.data.lastProcessedRow}/${this.data.totalRows}`);
        return this.data;
      }
    } catch (error) {
      console.error('⚠️ Lỗi khi load checkpoint:', error.message);
    }
    return null;
  }

  /**
   * Lưu checkpoint
   */
  save(rowNumber, totalRows, success = true) {
    if (!this.enabled) return;

    try {
      this.data.lastProcessedRow = rowNumber;
      this.data.totalRows = totalRows;
      this.data.timestamp = new Date().toISOString();
      
      if (success) {
        this.data.successCount++;
      } else {
        this.data.failedCount++;
      }
      
      this.data.processedRows.push({
        row: rowNumber,
        success,
        timestamp: this.data.timestamp
      });

      // Chỉ lưu khi đủ interval hoặc là dòng cuối
      if (rowNumber % this.saveInterval === 0 || rowNumber === totalRows) {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
      }
    } catch (error) {
      console.error('⚠️ Lỗi khi lưu checkpoint:', error.message);
    }
  }

  /**
   * Xóa checkpoint (khi hoàn thành)
   */
  clear() {
    if (!this.enabled) return;

    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
        console.log('✓ Đã xóa checkpoint file');
      }
    } catch (error) {
      console.error('⚠️ Lỗi khi xóa checkpoint:', error.message);
    }
  }

  /**
   * Kiểm tra xem có nên resume không
   */
  shouldResume() {
    return this.enabled && this.data.lastProcessedRow > 0;
  }

  /**
   * Lấy dòng tiếp theo cần xử lý
   */
  getNextRow() {
    return this.data.lastProcessedRow + 1;
  }
}

module.exports = CheckpointManager;
