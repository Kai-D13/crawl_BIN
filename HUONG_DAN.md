# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG CRAWL DỮ LIỆU

## 📋 THÔNG TIN HỆ THỐNG

### File Excel: `just_test_1.xlsx`
- **Cột I (fc_code_ref)**: Cột để lưu mã đơn hàng format SOBD... (được crawl từ web)
- **Cột J (link_internal)**: Link để truy cập vào web internal

### Cấu hình hiện tại:
- ✅ Chỉ crawl **FC_CODE_REF** (mã đơn hàng SOBD...)
- ✅ Delay giữa các page: **1500ms** (1.5 giây)
- ✅ Đã bỏ logic lấy RFID
- ✅ Test mode: 3 dòng đầu tiên

---

## 🚀 CÁCH SỬ DỤNG

### 1. Chạy ở chế độ TEST (3 dòng đầu tiên):
```powershell
node main.js --test
```

### 2. Chạy FULL (toàn bộ file Excel):
```powershell
node main.js
```

---

## 📝 QUY TRÌNH HOẠT ĐỘNG

1. **Đọc file Excel** `just_test_1.xlsx`
2. **Tạo backup** file Excel tự động
3. **Khởi động browser** (headless = false)
4. **Đăng nhập thủ công**:
   - Hệ thống sẽ mở browser
   - Bạn đăng nhập vào web internal (mật khẩu + 2FA)
   - Nhấn **Enter** trong terminal khi đã đăng nhập xong
5. **Crawl dữ liệu**:
   - Truy cập từng link trong cột J
   - Lấy mã đơn hàng (FC_CODE_REF) theo format SOBD...
   - Lưu vào cột I
   - Delay 1.5 giây giữa các page
6. **Lưu kết quả** vào file Excel
7. **Hiển thị thống kê**

---

## ⚙️ CẤU HÌNH

File: `config.js`

### Thay đổi delay giữa các page:
```javascript
delayBetweenPages: 1500,   // 1.5 giây
```

### Thay đổi file Excel:
```javascript
excelFilePath: './just_test_1.xlsx',
```

### Thay đổi số dòng test:
```javascript
testRowCount: 3,   // Số dòng chạy khi --test
```

---

## 📊 LOGIC CRAWL FC_CODE_REF

Hệ thống sử dụng **3 phương án** để tìm mã đơn hàng:

1. **Phương án 1**: Tìm legend có text "Mã đơn hàng" → lấy input gần đó
2. **Phương án 2**: Tìm input có value bắt đầu bằng "SOBD"
3. **Phương án 3**: Tìm tất cả input disabled và filter theo pattern `/^SOBD\d{8}$/`

---

## ✅ KIỂM TRA KẾT QUẢ

Sau khi chạy xong, kiểm tra:
- Cột I (fc_code_ref) đã được điền mã SOBD...
- File backup được tạo với tên: `just_test_1_backup_YYYY-MM-DD...xlsx`
- Log file: `scraper.log`

---

## ⚠️ LƯU Ý

1. **Phải đăng nhập thủ công** vào web internal trước khi crawl
2. **Không đóng browser** khi đang chạy
3. Hệ thống sẽ **tự động minimize browser** sau khi đăng nhập để tiết kiệm tài nguyên
4. Có **retry mechanism** khi gặp lỗi (tối đa 3 lần)
5. Có **checkpoint system** để resume khi bị gián đoạn

---

## 🐛 TROUBLESHOOTING

### Lỗi "Cannot find module":
```powershell
npm install
```

### Lỗi không tìm thấy file Excel:
- Kiểm tra đường dẫn file trong `config.js`
- Đảm bảo file `just_test_1.xlsx` nằm trong thư mục hiện tại

### Không crawl được dữ liệu:
- Kiểm tra selector trong `config.js` → `selectors.fcCodeRef`
- Có thể cần cập nhật CSS selector nếu web thay đổi giao diện
