/** @type {import('jest').Config} */
const config = {
  // Jest가 테스트 파일을 찾을 위치
  testMatch: [
    "<rootDir>/tests/**/*.test.js",
    "<rootDir>/tests/**/*.spec.js"
  ],

  // Node.js 환경에서 실행
  testEnvironment: 'node',

  // 테스트 전 설정 파일
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // 코드 커버리지 설정
  collectCoverageFrom: [
    'src/**/*.js',
    'server.js',
    '!src/**/*.test.js',
    '!node_modules/**',
    '!coverage/**'
  ],

  // 커버리지 임계값 설정
  coverageThreshold: {
    global: {
      branches: 50,  // 초기에는 낮게 설정
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // 테스트 타임아웃 (30초)
  testTimeout: 30000,

  // 병렬 실행 비활성화 (DB 테스트 때문에)
  maxWorkers: 1,

  // 모듈 경로 매핑 (올바른 속성명 사용)
  moduleNameMapper: {
    '^@/(.*)

  // 테스트 전역 변수
  globals: {
    NODE_ENV: 'test'
  },

  // 상세한 출력
  verbose: true,

  // 첫 번째 실패에서 중단하지 않음
  bail: false,

  // 캐시 비활성화 (개발 중)
  cache: false,

  // 전역 설정/해제
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',

  // 각 테스트 전후 설정
  setupFiles: ['<rootDir>/tests/env.js']
};

module.exports = config;
: '<rootDir>/src/$1',
    '^@root/(.*)

  // 테스트 전역 변수
  globals: {
    NODE_ENV: 'test'
  },

  // 상세한 출력
  verbose: true,

  // 첫 번째 실패에서 중단하지 않음
  bail: false,

  // 캐시 비활성화 (개발 중)
  cache: false,

  // 전역 설정/해제
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',

  // 각 테스트 전후 설정
  setupFiles: ['<rootDir>/tests/env.js']
};

module.exports = config;
: '<rootDir>/$1'
  },

  // 테스트 전역 변수
  globals: {
    NODE_ENV: 'test'
  },

  // 상세한 출력
  verbose: true,

  // 첫 번째 실패에서 중단하지 않음
  bail: false,

  // 캐시 비활성화 (개발 중)
  cache: false,

  // 전역 설정/해제
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',

  // 각 테스트 전후 설정
  setupFiles: ['<rootDir>/tests/env.js']
};

module.exports = config;
