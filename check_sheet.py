import openpyxl

wb = openpyxl.load_workbook('D:/WHM_BIN/just_test_1.xlsx')

print('Danh sách sheet names:')
for i, sheet_name in enumerate(wb.sheetnames, 1):
    print(f'  {i}. "{sheet_name}"')

print(f'\nActive sheet: "{wb.active.title}"')
