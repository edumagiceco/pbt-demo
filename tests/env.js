// 테스트 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jest';

// 기존 DB를 사용하되, 테스트 모드임을 표시
process.env.TEST_MODE = 'true';

// API 타임아웃 설정
process.env.API_TIMEOUT = '30000';

console.log('🔧 테스트 환경 변수 설정 완료');
