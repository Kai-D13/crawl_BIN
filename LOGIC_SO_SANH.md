# LOGIC SO SÁNH VÀ XÁC ĐỊNH TRẠNG THÁI

## 📊 MÔ TẢ

Sau khi fetch dữ liệu `fc_code_ref` từ web internal, hệ thống sẽ so sánh với cột `reference_code_of_so` trong Excel để xác định trạng thái và ghi vào cột AA.

---

## 📋 CẤU TRÚC CỘT

| Cột | Tên | Mô tả | Ví dụ |
|-----|-----|-------|-------|
| I | `fc_code_ref` | Mã đơn hàng fetch từ web | SOBD36782622 |
| K | `reference_code_of_so` | Mã đơn hàng gốc từ Excel | SOBD36782622-F |
| AA | `check` (checkStatus) | Trạng thái so sánh | "Chưa trả" / "Đã trả" |

---

## 🔍 LOGIC SO SÁNH

### **Trường hợp 1: TRÙNG NHAU → "Chưa trả"**

**Điều kiện:**
- `fc_code_ref` có giá trị (không null, không empty)
- `fc_code_ref` == `reference_code_of_so` (sau khi bỏ suffix -F hoặc -L)

**Ví dụ:**
```
fc_code_ref = "SOBD36782622"
reference_code_of_so = "SOBD36782622-F"
→ Chuẩn hóa: "SOBD36782622" == "SOBD36782622"
→ Kết quả: "Chưa trả" ✓
```

**Các test cases:**
- ✅ `SOBD36782622` vs `SOBD36782622-F` → "Chưa trả"
- ✅ `SOBD36782622` vs `SOBD36782622-L` → "Chưa trả"
- ✅ `SOBD36782622` vs `SOBD36782622` → "Chưa trả"
- ✅ `  SOBD36782622  ` vs `SOBD36782622-F` → "Chưa trả" (trim space)

---

### **Trường hợp 2: KHÁC NHAU hoặc KHÔNG CÓ GIÁ TRỊ → "Đã trả"**

**Điều kiện:**
- `fc_code_ref` khác `reference_code_of_so` HOẶC
- `fc_code_ref` = null HOẶC
- `fc_code_ref` = undefined HOẶC
- `fc_code_ref` = empty string

**Ví dụ:**

**2.1. Khác mã:**
```
fc_code_ref = "SOBD36994410"
reference_code_of_so = "SOBD36964797-F"
→ Chuẩn hóa: "SOBD36994410" != "SOBD36964797"
→ Kết quả: "Đã trả" ✓
```

**2.2. Không fetch được:**
```
fc_code_ref = null (hoặc "" hoặc undefined)
reference_code_of_so = "SOBD36782622-F"
→ Kết quả: "Đã trả" ✓
```

**Các test cases:**
- ✅ `SOBD36994410` vs `SOBD36964797-F` → "Đã trả"
- ✅ `null` vs `SOBD36782622-F` → "Đã trả"
- ✅ `""` vs `SOBD36782622-F` → "Đã trả"
- ✅ `undefined` vs `SOBD36782622-F` → "Đã trả"

---

## ⚙️ IMPLEMENTATION

### File: `config.js`
```javascript
columns: {
  FC_CODE_REF: 'I',              // Mã đơn hàng fetch từ web
  LINK_INTERNAL: 'J',            // Link để crawl
  REFERENCE_CODE_OF_SO: 'K',     // Mã đơn hàng gốc
  CHECK_STATUS: 'AA'             // Trạng thái kiểm tra
}
```

### File: `main.js`
```javascript
compareAndGetStatus(fcCodeRef, referenceCodeOfSo) {
  // Trường hợp 2: fc_code_ref null/empty → "Đã trả"
  if (!fcCodeRef || fcCodeRef.trim() === '') {
    return 'Đã trả';
  }

  // Chuẩn hóa: bỏ suffix -F hoặc -L
  let normalizedReference = referenceCodeOfSo;
  if (normalizedReference && typeof normalizedReference === 'string') {
    normalizedReference = normalizedReference.trim().replace(/-[A-Z]$/, '');
  }

  // Trường hợp 1: Trùng → "Chưa trả"
  if (fcCodeRef.trim() === normalizedReference) {
    return 'Chưa trả';
  }

  // Trường hợp 2: Khác → "Đã trả"
  return 'Đã trả';
}
```

### File: `excelHandler.js`
```javascript
async updateRow(rowNumber, data) {
  // Ghi fc_code_ref vào cột I
  if (data.fcCodeRef !== null && data.fcCodeRef !== undefined) {
    row.getCell(config.columns.FC_CODE_REF).value = data.fcCodeRef;
  }

  // Ghi checkStatus vào cột AA
  if (data.checkStatus !== null && data.checkStatus !== undefined) {
    row.getCell(config.columns.CHECK_STATUS).value = data.checkStatus;
  }
}
```

---

## ✅ TEST RESULTS

Đã chạy 8 test cases - **TẤT CẢ ĐỀU PASS** ✓

```bash
node test_logic.js
```

Output:
```
✓ Test 1: Trường hợp 1: Trùng nhau (có -F)
✓ Test 2: Trường hợp 1: Trùng nhau (có -L)
✓ Test 3: Trường hợp 1: Trùng nhau (không có suffix)
✓ Test 4: Trường hợp 2: Khác nhau
✓ Test 5: Trường hợp 2: fc_code_ref = null
✓ Test 6: Trường hợp 2: fc_code_ref = empty string
✓ Test 7: Trường hợp 2: fc_code_ref = undefined
✓ Test 8: Edge case: fc_code_ref có khoảng trắng

=== KẾT QUẢ ===
Passed: 8/8
Failed: 0/8

✅ TẤT CẢ TEST CASES ĐỀU PASS!
```

---

## 🚀 CÁCH SỬ DỤNG

### Chạy test logic:
```powershell
node test_logic.js
```

### Chạy hệ thống (TEST MODE):
```powershell
node main.js --test
```

### Chạy hệ thống (FULL):
```powershell
node main.js
```

---

## 📝 KẾT QUẢ SAU KHI CHẠY

Sau khi chạy xong, file Excel sẽ có:

| I (fc_code_ref) | K (reference_code_of_so) | AA (check) |
|-----------------|--------------------------|------------|
| SOBD36782622 | SOBD36782622-F | Chưa trả |
| SOBD36994410 | SOBD36964797-F | Đã trả |
| (null) | SOBD36912424-F | Đã trả |

---

## ⚠️ LƯU Ý

1. **Suffix -F hoặc -L** trong `reference_code_of_so` sẽ được tự động bỏ qua khi so sánh
2. **Khoảng trắng** trong `fc_code_ref` sẽ được tự động trim
3. **Luôn update cột AA** (checkStatus) mỗi lần chạy, kể cả khi fc_code_ref không thay đổi
4. Logic được test kỹ với 8 test cases khác nhau
