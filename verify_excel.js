const ExcelHandler = require('./excelHandler');
const config = require('./config');

async function verifyExcel() {
  console.log('=== KIỂM TRA FILE EXCEL ===\n');
  
  try {
    const handler = new ExcelHandler();
    await handler.load();
    
    console.log('✅ Đã load file thành công!');
    handler.displayInfo();
    
    // Lấy 5 dòng đầu để kiểm tra
    const rows = handler.getRowsToProcess(5);
    
    console.log(`\n=== ${rows.length} DÒNG ĐẦU TIÊN ===\n`);
    
    rows.forEach((row, index) => {
      console.log(`Row ${row.rowNumber}:`);
      console.log(`  Link: ${row.link.substring(0, 80)}...`);
      console.log(`  Current FC Code: ${row.currentFcCode}`);
      console.log(`  Reference Code of SO: ${row.referenceCodeOfSo}`);
      console.log();
    });
    
    console.log('=== THỐNG KÊ ===');
    const allRows = handler.getRowsToProcess();
    console.log(`Tổng số dòng cần xử lý: ${allRows.length}`);
    console.log(`Tổng số dòng trong file: ${handler.worksheet.rowCount}`);
    
    console.log('\n✅ FILE EXCEL HỢP LỆ - SẴN SÀNG XỬ LÝ!\n');
    
  } catch (error) {
    console.error('\n❌ LỖI:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

verifyExcel();
