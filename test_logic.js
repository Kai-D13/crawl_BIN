/**
 * Test logic so sánh fc_code_ref vs reference_code_of_so
 */

// Mock function
function compareAndGetStatus(fcCodeRef, referenceCodeOfSo) {
  // Trường hợp 2: fc_code_ref null/empty/undefined -> "Đã trả"
  if (!fcCodeRef || fcCodeRef.trim() === '') {
    return 'Đã trả';
  }

  // Chuẩn hóa reference_code_of_so: bỏ suffix -F hoặc -L (nếu có)
  let normalizedReference = referenceCodeOfSo;
  if (normalizedReference && typeof normalizedReference === 'string') {
    normalizedReference = normalizedReference.trim().replace(/-[A-Z]$/, '');
  }

  // Trường hợp 1: Trùng nhau -> "Chưa trả"
  if (fcCodeRef.trim() === normalizedReference) {
    return 'Chưa trả';
  }

  // Trường hợp 2: Khác nhau -> "Đã trả"
  return 'Đã trả';
}

console.log('=== TEST LOGIC SO SÁNH ===\n');

// Test cases
const tests = [
  {
    name: 'Trường hợp 1: Trùng nhau (có -F)',
    fcCodeRef: 'SOBD36782622',
    referenceCodeOfSo: 'SOBD36782622-F',
    expected: 'Chưa trả'
  },
  {
    name: 'Trường hợp 1: Trùng nhau (có -L)',
    fcCodeRef: 'SOBD36782622',
    referenceCodeOfSo: 'SOBD36782622-L',
    expected: 'Chưa trả'
  },
  {
    name: 'Trường hợp 1: Trùng nhau (không có suffix)',
    fcCodeRef: 'SOBD36782622',
    referenceCodeOfSo: 'SOBD36782622',
    expected: 'Chưa trả'
  },
  {
    name: 'Trường hợp 2: Khác nhau',
    fcCodeRef: 'SOBD36994410',
    referenceCodeOfSo: 'SOBD36964797-F',
    expected: 'Đã trả'
  },
  {
    name: 'Trường hợp 2: fc_code_ref = null',
    fcCodeRef: null,
    referenceCodeOfSo: 'SOBD36782622-F',
    expected: 'Đã trả'
  },
  {
    name: 'Trường hợp 2: fc_code_ref = empty string',
    fcCodeRef: '',
    referenceCodeOfSo: 'SOBD36782622-F',
    expected: 'Đã trả'
  },
  {
    name: 'Trường hợp 2: fc_code_ref = undefined',
    fcCodeRef: undefined,
    referenceCodeOfSo: 'SOBD36782622-F',
    expected: 'Đã trả'
  },
  {
    name: 'Edge case: fc_code_ref có khoảng trắng',
    fcCodeRef: '  SOBD36782622  ',
    referenceCodeOfSo: 'SOBD36782622-F',
    expected: 'Chưa trả'
  }
];

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  const result = compareAndGetStatus(test.fcCodeRef, test.referenceCodeOfSo);
  const isPass = result === test.expected;
  
  if (isPass) {
    passed++;
    console.log(`✓ Test ${index + 1}: ${test.name}`);
  } else {
    failed++;
    console.log(`✗ Test ${index + 1}: ${test.name}`);
    console.log(`  Expected: "${test.expected}", Got: "${result}"`);
  }
  
  console.log(`  Input: fc_code_ref="${test.fcCodeRef}", reference_code_of_so="${test.referenceCodeOfSo}"`);
  console.log(`  Output: "${result}"\n`);
});

console.log('=== KẾT QUẢ ===');
console.log(`Passed: ${passed}/${tests.length}`);
console.log(`Failed: ${failed}/${tests.length}`);

if (failed === 0) {
  console.log('\n✅ TẤT CẢ TEST CASES ĐỀU PASS!');
} else {
  console.log('\n❌ CÓ TEST CASES BỊ FAIL!');
  process.exit(1);
}
