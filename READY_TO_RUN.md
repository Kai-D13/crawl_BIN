# ✅ PROJECT ĐÃ HOÀN THIỆN

## 📁 FILE EXCEL: mai_js.xlsx

### Thông tin:
- **Tên file**: `mai_js.xlsx`
- **Sheet name**: `Sheet1`
- **Tổng số dòng**: 3,711 dòng
- **Số dòng cần xử lý**: 3,710 dòng (bỏ header)

### Cấu trúc cột:
- **Cột I (fc_code_ref)**: Mã đơn hàng fetch từ web (SOBD...) - HIỆN TẠI ĐANG TRỐNG
- **Cột J (link_internal)**: Link để crawl dữ liệu
- **Cột K (reference_code_of_so)**: Mã đơn hàng gốc (SOBD...-F)
- **Cột AA (check)**: Trạng thái so sánh - HIỆN TẠI ĐANG TRỐNG

---

## 🎯 CHỨC NĂNG HỆ THỐNG

Hệ thống sẽ:
1. ✅ Đọc từng link trong cột J
2. ✅ Fetch mã đơn hàng (fc_code_ref) từ web internal
3. ✅ Ghi vào cột I
4. ✅ So sánh với cột K (reference_code_of_so)
5. ✅ Ghi kết quả vào cột AA:
   - **"Chưa trả"** nếu trùng nhau
   - **"Đã trả"** nếu khác nhau hoặc không fetch được

---

## 🚀 CÂU LỆNH CHẠY

### 1️⃣ Kiểm tra file Excel:
```powershell
node verify_excel.js
```

### 2️⃣ Test với 3 dòng đầu:
```powershell
node main.js --test
```

### 3️⃣ Chạy FULL (3,710 dòng):
```powershell
node main.js
```

**⚠️ LƯU Ý**: Với 3,710 dòng và delay 1.5 giây/dòng:
- Thời gian ước tính: **~1.5 giờ** (93 phút)
- Nên chạy test trước để đảm bảo mọi thứ hoạt động đúng

---

## 📊 QUY TRÌNH

1. **Đọc file Excel** `mai_js.xlsx` (Sheet1)
2. **Tạo backup** tự động
3. **Mở browser** và đợi đăng nhập
4. **Đăng nhập thủ công** (password + 2FA)
5. **Nhấn Enter** trong terminal khi đã đăng nhập
6. **Browser minimize** tự động để tiết kiệm tài nguyên
7. **Xử lý từng dòng**:
   - Truy cập link (cột J)
   - Fetch fc_code_ref từ web
   - So sánh với reference_code_of_so (cột K)
   - Ghi kết quả vào cột I và AA
   - Delay 1.5 giây
8. **Lưu file** Excel
9. **Hiển thị thống kê**

---

## 📝 VÍ DỤ OUTPUT

```
[1/3710] (0.0%) Dòng 2
    Link: https://internal.thuocsi.vn/wms/BUYMED/BD/inventory/location/edit?code=BINT03A29
    📄 Đang xử lý: https://...
    ✓ Đã lấy dữ liệu: { fcCodeRef: 'SOBD37164023' }
    📊 So sánh: fc_code_ref="SOBD37164023" vs reference_code_of_so="SOBD37164023-F"
    ✓ Kết quả: Chưa trả
    ✓ Đã cập nhật dòng 2: { fcCodeRef: 'SOBD37164023', checkStatus: 'Chưa trả' }
    ⏳ Chờ 1.5s...
```

---

## ✅ CHECKLIST TRƯỚC KHI CHẠY

- ✅ File Excel `mai_js.xlsx` đã có trong thư mục
- ✅ Config đã cập nhật đúng (file name, sheet name)
- ✅ Dependencies đã cài đặt (`npm install`)
- ✅ Logic đã test kỹ (8/8 test cases passed)
- ✅ Đã verify file Excel (chạy `node verify_excel.js`)

---

## 🎯 KẾT QUẢ SAU KHI CHẠY

File Excel sẽ có:
- **Cột I**: Đầy đủ mã SOBD... từ web
- **Cột AA**: Trạng thái "Chưa trả" hoặc "Đã trả"
- **File backup**: `mai_js_backup_YYYY-MM-DD...xlsx`

---

## 📞 TROUBLESHOOTING

### Lỗi "Cannot find module":
```powershell
npm install
```

### Lỗi không tìm thấy file Excel:
- Kiểm tra file `mai_js.xlsx` có trong thư mục D:\WHM_BIN
- Kiểm tra tên file trong config.js

### Browser không mở:
- Kiểm tra Puppeteer đã cài đặt đúng chưa
- Thử chạy: `npm install puppeteer --force`

### Không crawl được dữ liệu:
- Kiểm tra đã đăng nhập đúng chưa
- Kiểm tra selector trong config.js
- Chạy với `--test` để debug

---

## 🚀 SẴN SÀNG!

Project đã hoàn thiện và sẵn sàng chạy với file **mai_js.xlsx** (3,710 dòng).

**Bắt đầu với test mode:**
```powershell
node main.js --test
```
