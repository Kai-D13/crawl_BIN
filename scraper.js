/**
 * Scraper - Module chính để scrape dữ liệu từ web internal
 */

const puppeteer = require('puppeteer');
const config = require('./config');

class Scraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
  }

  async initialize(firstUrl) {
    try {
      console.log('\n Đang khởi động browser...');
      
      this.browser = await puppeteer.launch(config.puppeteer);
      this.page = await this.browser.newPage();
      
      // Set timeout
      this.page.setDefaultNavigationTimeout(config.timing.navigationTimeout);
      this.page.setDefaultTimeout(config.timing.elementWaitTimeout);
      
      // Navigate đến URL đầu tiên
      console.log(` Đang mở trang: ${firstUrl}`);
      await this.page.goto(firstUrl, { waitUntil: 'networkidle2' });
      
      console.log('\n Vui lòng đăng nhập vào hệ thống (nhập mật khẩu và 2FA)...');
      console.log(`   Bạn có ${config.timing.loginWaitTime / 1000} giây để đăng nhập.`);
      console.log('   Sau khi đăng nhập xong, hệ thống sẽ tự động tiếp tục.\n');
      
      await this.waitForLogin();
      
      return true;
    } catch (error) {
      console.error('✗ Lỗi khi khởi tạo browser:', error.message);
      throw error;
    }
  }

  /**
   * Đợi user đăng nhập thủ công
   */
  async waitForLogin() {
    // Đợi một khoảng thời gian hoặc cho đến khi phát hiện đã login
    await new Promise(resolve => {
      console.log('   Nhấn Enter trong terminal khi bạn đã đăng nhập xong...');
      
      // Lắng nghe Enter từ stdin
      const stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');
      
      const onData = (key) => {
        // Ctrl+C
        if (key === '\u0003') {
          process.exit();
        }
        // Enter
        if (key === '\r' || key === '\n') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          resolve();
        }
      };
      
      stdin.on('data', onData);
    });
    
    this.isLoggedIn = true;
    console.log('✓ Đã xác nhận đăng nhập thành công!');
    
    // HYBRID MODE: Chuyển sang minimize window để tiết kiệm tài nguyên
    console.log('🔧 Đang tối ưu hóa browser (minimize window)...\n');
    await this.minimizeBrowser();
  }

  /**
   * Minimize browser window để tiết kiệm tài nguyên
   */
  async minimizeBrowser() {
    try {
      // Sử dụng CDP (Chrome DevTools Protocol) để minimize window
      const session = await this.page.target().createCDPSession();
      const { windowId } = await session.send('Browser.getWindowForTarget');
      await session.send('Browser.setWindowBounds', {
        windowId,
        bounds: { windowState: 'minimized' }
      });
      console.log('   ✓ Browser đã được minimize để tiết kiệm tài nguyên');
    } catch (error) {
      console.log('   ℹ Không thể minimize browser, tiếp tục bình thường');
    }
  }

  /**
   * Scrape dữ liệu từ một URL với retry logic
   * @param {string} url - URL cần scrape
   * @param {number} retryCount - Số lần đã retry
   */
  async scrapePage(url, retryCount = 0) {
    try {
      // Navigate đến URL
      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: config.timing.pageLoadTimeout 
      });
      
      // Scrape dữ liệu
      const data = await this.extractData();
      
      return data;
    } catch (error) {
      // Retry logic
      const maxRetries = config.retry?.maxRetries || 3;
      if (config.retry?.retryOnErrors && retryCount < maxRetries) {
        await this.delay(config.timing.retryDelay || 3000);
        return this.scrapePage(url, retryCount + 1);
      }
      
      return {
        fcCodeRef: null,
        error: error.message
      };
    }
  }

  /**
   * Extract dữ liệu từ page hiện tại
   */
  async extractData() {
    const data = {
      fcCodeRef: null
    };

    try {
      // Lấy FC Code Ref (Mã đơn hàng)
      data.fcCodeRef = await this.extractFcCodeRef();
      
    } catch (error) {
      console.error('  ⚠ Lỗi khi extract data:', error.message);
    }

    return data;
  }

  /**
   * Lấy mã đơn hàng (FC Code Ref) từ input element
   */
  async extractFcCodeRef() {
    try {
      // PHƯƠNG ÁN 1: Tìm input gần với legend có text "Mã đơn hàng"
      let value = await this.page.evaluate(() => {
        // Tìm legend có text "Mã đơn hàng"
        const legends = Array.from(document.querySelectorAll('legend'));
        const legend = legends.find(l => l.textContent.includes('Mã đơn hàng'));
        
        if (legend) {
          // Tìm fieldset chứa legend này
          const fieldset = legend.closest('fieldset');
          if (fieldset) {
            // Tìm input trong cùng parent với fieldset
            const parent = fieldset.parentElement;
            const input = parent ? parent.querySelector('input') : null;
            if (input && input.value) {
              return input.value;
            }
          }
        }
        return null;
      });
      
      if (value) {
        console.log('  ✓ Tìm thấy FC Code (từ legend):', value);
        return value.trim();
      }
      
      // PHƯƠNG ÁN 2: Tìm input có value bắt đầu bằng SOBD
      value = await this.page.evaluate(() => {
        const inputs = document.querySelectorAll('input[value^="SOBD"]');
        if (inputs.length > 0) {
          return inputs[0].value;
        }
        return null;
      });
      
      if (value) {
        console.log('  ✓ Tìm thấy FC Code (từ SOBD pattern):', value);
        return value.trim();
      }
      
      // PHƯƠNG ÁN 3: Tìm tất cả input disabled và filter theo pattern
      value = await this.page.evaluate(() => {
        const inputs = document.querySelectorAll('input.MuiInputBase-input.Mui-disabled');
        const sobdPattern = /^SOBD\d{8}$/;
        
        for (const input of inputs) {
          if (input.value && sobdPattern.test(input.value)) {
            return input.value;
          }
        }
        return null;
      });
      
      if (value) {
        console.log('  ✓ Tìm thấy FC Code (từ disabled inputs):', value);
        return value.trim();
      }
      
      console.log('  ⚠ Không tìm thấy mã SOBD');
      return null;
      
    } catch (error) {
      console.error('  ⚠ Lỗi khi lấy FC Code Ref:', error.message);
      return null;
    }
  }

  /**
   * Lấy RFID từ span element
   */
  async extractRFID() {
    try {
      const selector = config.selectors.rfid;
      
      // Thử với CSS selector chính
      let element = await this.page.$(selector.css);
      
      // Nếu không tìm thấy, thử backup selector
      if (!element && selector.backupCss) {
        console.log('  ℹ Dùng backup selector cho RFID');
        element = await this.page.$(selector.backupCss);
      }
      
      if (!element) {
        console.log('  ⚠ Không tìm thấy element RFID');
        return null;
      }
      
      // Lấy text content
      const textContent = await this.page.evaluate(el => {
        return el.textContent || el.innerText;
      }, element);
      
      if (!textContent) {
        return null;
      }
      
      // Extract số từ text sử dụng pattern
      if (selector.textPattern) {
        const match = textContent.match(selector.textPattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      
      // Nếu không match được pattern, return null thay vì toàn bộ text
      console.log('  ⚠ Không extract được RFID từ text:', textContent);
      return null;
      
    } catch (error) {
      console.error('  ⚠ Lỗi khi lấy RFID:', error.message);
      return null;
    }
  }

  /**
   * Delay utility
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Đóng browser
   */
  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        console.log('\n✓ Đã đóng browser');
      }
    } catch (error) {
      console.error('✗ Lỗi khi đóng browser:', error.message);
    }
  }

  /**
   * Take screenshot (cho debug)
   */
  async takeScreenshot(filename) {
    try {
      await this.page.screenshot({ path: filename, fullPage: true });
      console.log(`  📸 Đã lưu screenshot: ${filename}`);
    } catch (error) {
      console.error('  ⚠ Lỗi khi chụp screenshot:', error.message);
    }
  }
}

module.exports = Scraper;
