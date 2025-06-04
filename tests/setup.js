require('dotenv').config();

// 테스트 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

console.log('🧪 Jest 테스트 환경 설정 완료');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - DB_NAME:', process.env.DB_NAME || 'magic7');

// Jest 타임아웃 확장
jest.setTimeout(30000);

// 테스트 간소화를 위해 실제 DB 연결은 각 테스트에서 처리

