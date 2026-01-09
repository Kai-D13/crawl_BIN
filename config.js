/**
 * File cấu hình cho hệ thống scraper
 */

module.exports = {
  // Đường dẫn file Excel
  excelFilePath: './mai_js.xlsx',
  
  // Tên sheet trong Excel
  sheetName: 'Sheet1', // Tên sheet trong file Excel
  
  // Mapping các cột trong Excel (zero-based index)
  columns: {
    FC_CODE_REF: 'I',              // Cột I - Mã đơn hàng fetch từ web (SOBD36951370)
    LINK_INTERNAL: 'J',            // Cột J - Link truy cập
    REFERENCE_CODE_OF_SO: 'K',     // Cột K - Mã đơn hàng gốc từ Excel (SOBD36951370-F)
    CHECK_STATUS: 'AA'             // Cột AA - Trạng thái kiểm tra ("Chưa trả" / "Đã trả")
  },
  
  // Selectors cho các element cần lấy dữ liệu
  selectors: {
    // Selector cho mã đơn hàng (fc_code_ref)
    fcCodeRef: {
      // CSS Selector
      css: '#__next > div.layout_layout__3tyNV > div.layout_appContent__2Rn9j > div.app_appWrapper__31bsE > div.app-content_contentWrapper__10l7c.app-content_noMenu__2eZwD > div > div:nth-child(1) > div.MuiCardContent-root > div > div.MuiGrid-root.MuiGrid-container.MuiGrid-spacing-xs-3.MuiGrid-item.MuiGrid-align-items-xs-center.MuiGrid-grid-xs-12 > div:nth-child(4) > div > div > input',
      // Backup selector - tìm bất kỳ input nào có value bắt đầu bằng SOBD
      backupCss: 'input[value^="SOBD"]',
      // Selector thứ 3 - tìm tất cả input disabled
      fallbackCss: 'input.MuiInputBase-input.Mui-disabled',
      attribute: 'value', // Lấy giá trị từ attribute 'value'
      valuePattern: /^SOBD\d{8}$/ // Pattern để validate mã SOBD (SOBD + 8 số)
    },
    
    // Selector cho RFID code
    rfid: {
      // CSS Selector
      css: '#__next > div.layout_layout__3tyNV > div.layout_appContent__2Rn9j > div.app_appWrapper__31bsE > div.app-content_contentWrapper__10l7c.app-content_noMenu__2eZwD > div > div:nth-child(1) > div.MuiCardContent-root > div > div:nth-child(2) > div:nth-child(1) > div > p > span',
      // Backup selector
      backupCss: 'span.MuiTypography-colorPrimary',
      textPattern: /(\d{12})/, // Pattern để extract 12 chữ số
      directText: true // Lấy textContent thay vì attribute
    }
  },
  
  // Cấu hình Puppeteer
  puppeteer: {
    headless: false, // Hiển thị browser để user đăng nhập 2FA
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  },
  
  // Timing configuration
  timing: {
    loginWaitTime: 60000,      // 60 giây để user đăng nhập
    pageLoadTimeout: 20000,    // 20 giây timeout cho page load (giảm từ 30s)
    navigationTimeout: 20000,  // 20 giây timeout cho navigation (giảm từ 30s)
    elementWaitTimeout: 5000,  // 5 giây đợi element xuất hiện (giảm từ 10s)
    delayBetweenPages: 800,    // 0.8 giây delay giữa các page (giảm từ 1.5s)
    retryDelay: 2000           // 2 giây delay trước khi retry (giảm từ 3s)
  },
  
  // Retry configuration
  retry: {
    maxRetries: 3,             // Số lần retry tối đa cho mỗi page
    retryOnErrors: true        // Bật retry khi gặp lỗi
  },
  
  // Logging configuration
  logging: {
    enableFileLog: true,       // Ghi log ra file
    logFilePath: './scraper.log',
    logLevel: 'info'           // info, debug, error
  },
  
  // Checkpoint configuration
  checkpoint: {
    enabled: true,             // Bật checkpoint để resume
    filePath: './checkpoint.json',
    saveInterval: 10           // Lưu checkpoint mỗi 10 dòng (giảm từ 5)
  },
  
  // Số dòng test (để test với 3 dòng đầu tiên)
  testRowCount: 3,
  
  // Bắt đầu từ dòng nào (1-based, dòng 1 thường là header)
  startRow: 2
};
