const request = require('supertest');
const app = require('../../server.js');

describe('Auth API Integration Tests', () => {
  let server;
  
  beforeAll(async () => {
    // 테스트 서버 시작
    server = app.listen(0); // 임의의 포트 사용
    await global.beforeAllTests();
  });

  afterAll(async () => {
    await global.afterAllTests();
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    await global.beforeEachTest();
  });

  afterEach(async () => {
    await global.afterEachTest();
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      username: 'testuser123',
      email: 'test@example.com',
      password: 'password123',
      fullName: '테스트 사용자',
      userType: 'student'
    };

    it('새 사용자를 성공적으로 등록해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', validUserData.username);
      expect(response.body.user).toHaveProperty('email', validUserData.email);
      expect(response.body.user).not.toHaveProperty('password'); // 비밀번호는 반환되지 않아야 함
    });

    it('중복된 이메일로 등록 시 실패해야 함', async () => {
      // 첫 번째 사용자 등록
      await request(app)
        .post('/api/auth/register')
        .send(validUserData);

      // 같은 이메일로 다시 등록 시도
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          username: 'differentuser'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('유효하지 않은 이메일 형식으로 등록 시 실패해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('비밀번호가 너무 짧으면 등록 실패해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          password: '123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('필수 필드가 누락되면 등록 실패해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com'
          // password, fullName 누락
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    const testUser = {
      username: 'logintest',
      email: 'logintest@example.com',
      password: 'password123',
      fullName: '로그인 테스트',
      userType: 'student'
    };

    beforeEach(async () => {
      // 테스트용 사용자 등록
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('올바른 이메일과 비밀번호로 로그인 성공해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('올바른 사용자명과 비밀번호로 로그인 성공해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
    });

    it('잘못된 비밀번호로 로그인 실패해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('존재하지 않는 사용자로 로그인 실패해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('필수 필드가 누락되면 로그인 실패해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email
          // password 누락
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;
    const testUser = {
      username: 'metest',
      email: 'metest@example.com',
      password: 'password123',
      fullName: '프로필 테스트',
      userType: 'instructor'
    };

    beforeEach(async () => {
      // 테스트용 사용자 등록 및 로그인
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      authToken = loginResponse.body.token;
    });

    it('유효한 토큰으로 사용자 정보 조회 성공해야 함', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('username', testUser.username);
      expect(response.body.user).toHaveProperty('userType', testUser.userType);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('토큰 없이 요청 시 실패해야 함', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('유효하지 않은 토큰으로 요청 시 실패해야 함', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('잘못된 형식의 Authorization 헤더로 요청 시 실패해야 함', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', authToken) // Bearer 없음
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
