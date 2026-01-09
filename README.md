# 🤖 Hệ Thống Tự Động Fetch Dữ Liệu Web Internal (Enhanced)

Hệ thống tự động sử dụng Puppeteer để truy cập web internal, lấy dữ liệu từ các element và cập nhật vào file Excel với khả năng retry, resume và logging.

## 📋 Tính năng

### ✅ Core Features
- ✅ Tự động đọc danh sách link từ file Excel
- ✅ Truy cập từng link và lấy dữ liệu chính xác
- ✅ Hỗ trợ đăng nhập 2FA thủ công
- ✅ Extract dữ liệu: RFID (chỉ số 12 chữ số), Mã đơn hàng (SOBD...)
- ✅ Cập nhật tự động vào file Excel
- ✅ Tạo backup tự động trước khi xử lý

### 🚀 Enhanced Features (NEW!)
- ✅ **Retry Logic**: Tự động retry 3 lần khi gặp lỗi network
- ✅ **Checkpoint/Resume**: Lưu tiến trình, tiếp tục từ dòng bị gián đoạn
- ✅ **File Logging**: Ghi log chi tiết ra file để review
- ✅ **Progress Tracking**: Hiển thị % tiến trình real-time
- ✅ **Hybrid Mode**: Browser minimize sau đăng nhập để tiết kiệm tài nguyên
- ✅ **Tối ưu tốc độ**: Giảm delay từ 2s xuống 1s giữa các page

## 📦 Cài đặt

### 1. Cài đặt Node.js

Đảm bảo bạn đã cài đặt Node.js (phiên bản 16 trở lên)
- Tải tại: https://nodejs.org/

### 2. Cài đặt dependencies

Mở PowerShell tại thư mục `D:\WHM_BIN` và chạy:

```powershell
npm install
```

Lệnh này sẽ cài đặt:
- `puppeteer` - Để điều khiển Chrome browser
- `exceljs` - Để đọc/ghi file Excel
- `chalk` - Để hiển thị màu sắc trong console

## 🚀 Cách sử dụng

### Chế độ TEST (khuyến nghị chạy lần đầu)

Chạy với 3 dòng đầu tiên để test:

```powershell
npm start -- --test
```

Hoặc:

```powershell
node main.js --test
```

### Chế độ PRODUCTION (xử lý toàn bộ)

```powershell
npm start
```

Hoặc:

```powershell
node main.js
```

## 🔄 Quy trình hoạt động

1. **Load file Excel** - Đọc file `sample_data.xlsx`
2. **Tạo backup** - Tạo file backup với timestamp
3. **Khởi động browser** - Mở Chrome browser (headless=false)
4. **Đăng nhập 2FA** - Bạn đăng nhập thủ công, sau đó nhấn Enter
5. **Scrape dữ liệu** - Tự động truy cập từng link và lấy dữ liệu
6. **Cập nhật Excel** - Ghi dữ liệu vào cột G và H
7. **Lưu file** - Lưu file Excel đã cập nhật
8. **Hiển thị thống kê** - Báo cáo kết quả

## 📊 Cấu trúc file Excel

| Cột | Tên | Mô tả |
|-----|-----|-------|
| G | RFID | Mã RFID (ví dụ: 000000020124) |
| H | fc_code_ref | Mã đơn hàng (ví dụ: SOBD36951370) |
| I | link_internal | Link truy cập web internal |

## ⚙️ Cấu hình

Mở file `config.js` để tùy chỉnh:

```javascript
module.exports = {
  // Đường dẫn file Excel
  excelFilePath: './sample_data.xlsx',
  
  // Tên sheet
  sheetName: 'Sheet1',
  
  // Số dòng test
  testRowCount: 3,
  
  // Timeout settings
  timing: {
    loginWaitTime: 60000,      // Thời gian chờ đăng nhập
    pageLoadTimeout: 30000,    // Timeout load page
    delayBetweenPages: 2000    // Delay giữa các page
  }
};
```

## 🐛 Debug

### Nếu không tìm thấy element

1. Mở file `scraper.js`
2. Bật chức năng screenshot:

```javascript
// Thêm dòng này sau khi navigate
await this.takeScreenshot(`debug_row_${rowNumber}.png`);
```

### Nếu selector không đúng

Cập nhật selector trong `config.js`:

```javascript
selectors: {
  fcCodeRef: {
    css: 'selector-mới-của-bạn',
    backupCss: 'backup-selector',
    attribute: 'value'
  }
}
```

## 📁 Cấu trúc dự án

```
WHM_BIN/
├── main.js              # Entry point chính
├── scraper.js           # Module Puppeteer scraper
├── excelHandler.js      # Module xử lý Excel
├── config.js            # File cấu hình
├── package.json         # Dependencies
├── sample_data.xlsx     # File Excel dữ liệu
└── README.md           # Hướng dẫn này
```

## 🎯 Lưu ý quan trọng

1. **Đăng nhập 2FA**: Browser sẽ mở tự động, bạn đăng nhập thủ công, sau đó quay lại terminal và nhấn Enter

2. **Backup tự động**: Mỗi lần chạy sẽ tạo backup file Excel với tên dạng:
   ```
   sample_data_backup_2025-12-07T10-30-00.xlsx
   ```

3. **Selector có thể thay đổi**: Nếu web internal cập nhật giao diện, cần update selector trong `config.js`

4. **Network stability**: Đảm bảo kết nối mạng ổn định trong quá trình chạy

## 🔧 Troubleshooting

### Lỗi: "Cannot find module 'puppeteer'"

```powershell
npm install
```

### Lỗi: "Error: Failed to launch the browser"

Puppeteer tự động tải Chrome. Nếu lỗi, chạy:

```powershell
npx puppeteer browsers install chrome
```

### Lỗi: "File not found: sample_data.xlsx"

Đảm bảo file Excel nằm trong thư mục `D:\WHM_BIN`

### Browser không mở

Kiểm tra `config.js`, đảm bảo:

```javascript
puppeteer: {
  headless: false  // Phải là false
}
```

## 📈 Kết quả

Sau khi chạy, bạn sẽ thấy thống kê:

```
╔════════════════════════════════════════════════════════╗
║                    THỐNG KÊ KẾT QUẢ                   ║
╠════════════════════════════════════════════════════════╣
║  Tổng số dòng xử lý:        3                         ║
║  Cập nhật thành công:       3                         ║
║  Bỏ qua (đã có dữ liệu):    0                         ║
║  Thất bại:                  0                         ║
╚════════════════════════════════════════════════════════╝
```

## 🚀 Nâng cao

### Thêm selector mới

Chỉnh sửa `config.js`:

```javascript
selectors: {
  newField: {
    css: '#new-selector',
    backupCss: '.backup-class',
    attribute: 'value'  // hoặc directText: true
  }
}
```

Sau đó update `scraper.js` để extract field mới.

### Xử lý nhiều sheet

Chỉnh `config.js`:

```javascript
sheetName: 'Sheet2'  // Tên sheet cần xử lý
```

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console log để xem lỗi chi tiết
2. Chạy ở chế độ test trước
3. Kiểm tra selector có còn đúng không
4. Đảm bảo đã đăng nhập thành công

---

**Chúc bạn sử dụng hiệu quả! 🎉**
