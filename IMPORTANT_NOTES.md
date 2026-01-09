# GHI CHÚ QUAN TRỌNG

## ⚠️ VẤN ĐỀ ĐÃ SỬA

**Ngày 9/1/2026**: Phát hiện bug nghiêm trọng - **990 dòng dữ liệu bị mất**!

### Nguyên nhân:
- Code chỉ lưu file Excel 1 lần duy nhất ở cuối quá trình
- Khi dừng giữa chừng (Ctrl+C, lỗi, tắt máy), TẤT CẢ dữ liệu trong RAM bị mất
- Checkpoint vẫn ghi nhận đã xử lý 990 dòng nhưng Excel không có dữ liệu

### Giải pháp đã áp dụng:
✅ **Auto-save mỗi 50 dòng** - Lưu dữ liệu định kỳ để tránh mất
✅ **Lưu khi Ctrl+C** - Xử lý graceful shutdown
✅ **Lưu khi có lỗi** - Trước khi thoát chương trình

### Cách sử dụng:
1. **Trên máy mới**: Clone repo về
   ```bash
   git clone https://github.com/Kai-D13/crawl_BIN.git
   cd crawl_BIN
   npm install
   ```

2. **Copy file Excel**: 
   - File `mai_js.xlsx` KHÔNG được đẩy lên Git (quá lớn)
   - Phải copy thủ công từ máy cũ sang máy mới
   - Hoặc dùng Google Drive / OneDrive để sync

3. **Chạy tiếp tục**:
   - Nếu có `checkpoint.json`, code sẽ tự động resume
   - Nếu muốn chạy lại từ đầu, xóa `checkpoint.json`

4. **Kiểm tra dữ liệu**:
   ```bash
   python check_data.py
   ```

## 📝 FILE CẦN SYNC THỦ CÔNG
- `mai_js.xlsx` - File chính (3711 dòng)
- `checkpoint.json` - Trạng thái xử lý (nếu muốn resume)

## 🚀 CHẠY CHƯƠNG TRÌNH
```bash
# Chạy đầy đủ
node main.js

# Chạy test 3 dòng
node main.js --test
```

## 💡 MẸO
- Dữ liệu được lưu mỗi 50 dòng, an toàn hơn
- Nhấn Ctrl+C sẽ lưu file trước khi thoát
- Kiểm tra log trong `scraper_*.log`
