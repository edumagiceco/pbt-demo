#!/usr/bin/env node

/**
 * PBT Demo 테스트 실행 스크립트
 * 
 * 사용법:
 * npm test                 # 모든 테스트 실행
 * npm run test:unit        # 단위 테스트만 실행
 * npm run test:integration # 통합 테스트만 실행
 * npm run test:e2e         # E2E 테스트만 실행
 * npm run test:watch       # 파일 변경 감지하여 자동 테스트
 * npm run test:ci          # CI 환경용 테스트 실행
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 PBT Demo 테스트 시스템을 시작합니다...\n');

// 테스트 환경 확인
const requiredDirs = [
  'tests',
  'tests/unit',
  'tests/integration', 
  'tests/e2e',
  'tests/reports'
];

console.log('📂 테스트 디렉토리 구조 확인 중...');
requiredDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    console.log(`   ✅ 생성: ${dir}`);
    fs.mkdirSync(fullPath, { recursive: true });
  } else {
    console.log(`   ✅ 존재: ${dir}`);
  }
});

// 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

console.log('\n🔧 테스트 환경 설정 완료');
console.log('   - NODE_ENV: test');
console.log('   - JWT_SECRET: ✓ 설정됨');

// 테스트 실행
const testType = process.argv[2] || 'all';

try {
  switch (testType) {
    case 'unit':
      console.log('\n🔍 단위 테스트 실행 중...');
      execSync('jest tests/unit --coverage --verbose', { stdio: 'inherit' });
      break;
      
    case 'integration':
      console.log('\n🔗 통합 테스트 실행 중...');
      execSync('jest tests/integration --coverage --verbose', { stdio: 'inherit' });
      break;
      
    case 'e2e':
      console.log('\n🌐 E2E 테스트 실행 중...');
      execSync('jest tests/e2e --coverage --verbose', { stdio: 'inherit' });
      break;
      
    case 'watch':
      console.log('\n👀 감시 모드로 테스트 실행 중...');
      execSync('jest --watch --verbose', { stdio: 'inherit' });
      break;
      
    case 'ci':
      console.log('\n🤖 CI 모드로 테스트 실행 중...');
      execSync('jest --ci --coverage --watchAll=false --verbose', { stdio: 'inherit' });
      break;
      
    case 'all':
    default:
      console.log('\n🚀 모든 테스트 실행 중...');
      execSync('jest --coverage --verbose', { stdio: 'inherit' });
      break;
  }
  
  console.log('\n✅ 테스트 실행 완료!');
  
  // 커버리지 리포트 위치 안내
  if (fs.existsSync(path.join(__dirname, 'coverage'))) {
    console.log('\n📊 커버리지 리포트:');
    console.log('   - HTML: coverage/lcov-report/index.html');
    console.log('   - 텍스트: 위에 표시된 커버리지 요약 참조');
  }
  
  // 테스트 리포트 위치 안내
  if (fs.existsSync(path.join(__dirname, 'tests/reports'))) {
    console.log('\n📋 테스트 리포트:');
    console.log('   - tests/reports/test-report.html');
  }
  
  console.log('\n🎉 모든 테스트가 성공적으로 완료되었습니다!');
  
} catch (error) {
  console.error('\n❌ 테스트 실행 중 오류 발생:');
  console.error(error.message);
  
  console.log('\n🔧 문제 해결 방법:');
  console.log('1. 데이터베이스 연결 확인');
  console.log('   - MySQL 서버가 실행 중인지 확인');
  console.log('   - .env 파일의 DB 설정 확인');
  console.log('');
  console.log('2. 의존성 설치 확인');
  console.log('   npm install');
  console.log('');
  console.log('3. 개별 테스트 실행하여 문제 파악');
  console.log('   npm run test:unit');
  console.log('   npm run test:integration');
  console.log('   npm run test:e2e');
  
  process.exit(1);
}
