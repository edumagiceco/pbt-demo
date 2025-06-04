const { execSync } = require('child_process');
const path = require('path');

module.exports = async () => {
  console.log('🚀 전역 테스트 환경 설정 시작...');
  
  // 환경 변수 설정
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-for-jest';
  process.env.TEST_MODE = 'true';
  
  // 테스트용 디렉토리 생성
  const testDirs = [
    'tests/reports',
    'uploads/test',
    'tmp/test'
  ];
  
  testDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    try {
      execSync(`mkdir -p "${fullPath}"`, { stdio: 'pipe' });
    } catch (error) {
      // 디렉토리가 이미 존재하는 경우 무시
    }
  });
  
  console.log('✅ 전역 테스트 환경 설정 완료');
};
