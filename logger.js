/**
 * Logger - Module ghi log ra console và file
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

class Logger {
  constructor() {
    this.logFilePath = config.logging?.logFilePath || './scraper.log';
    this.enabled = config.logging?.enableFileLog || false;
    
    if (this.enabled) {
      // Tạo file log mới mỗi lần chạy
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      this.logFilePath = this.logFilePath.replace('.log', `_${timestamp}.log`);
      this.initLogFile();
    }
  }

  initLogFile() {
    try {
      const header = `=== SCRAPER LOG - ${new Date().toISOString()} ===\n\n`;
      fs.writeFileSync(this.logFilePath, header, 'utf8');
      console.log(`📝 Log file: ${this.logFilePath}`);
    } catch (error) {
      console.error('⚠️ Không thể tạo log file:', error.message);
      this.enabled = false;
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = data 
      ? `[${timestamp}] [${level.toUpperCase()}] ${message} ${JSON.stringify(data)}`
      : `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // Ghi ra console
    console.log(message, data || '');
    
    // Ghi ra file
    if (this.enabled) {
      try {
        fs.appendFileSync(this.logFilePath, logMessage + '\n', 'utf8');
      } catch (error) {
        // Ignore write errors
      }
    }
  }

  info(message, data = null) {
    this.log('info', message, data);
  }

  error(message, data = null) {
    this.log('error', message, data);
  }

  debug(message, data = null) {
    this.log('debug', message, data);
  }

  success(message, data = null) {
    this.log('success', message, data);
  }
}

module.exports = Logger;
