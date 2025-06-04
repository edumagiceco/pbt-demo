const request = require('supertest');
const app = require('../../server.js');

describe('User Profile API Integration Tests', () => {
  let server;
  let authToken;
  let userId;
  
  const testUser = {
    username: 'profiletest',
    email: 'profiletest@example.com',
    password: 'password123',
    fullName: '프로필 테스트 사용자',
    userType: 'student'
  };

  beforeAll(async () => {
    server = app.listen(0);
    await global.beforeAllTests();
    
    // 테스트용 사용자 등록 및 로그인
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    userId = registerResponse.body.user.id;
    authToken = registerResponse.body.token;
  });

  afterAll(async () => {
    await global.afterAllTests();
    if (server) {
      server.close();
    }
  });

  describe('GET /api/users/profile', () => {
    it('인증된 사용자의 프로필 정보를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user).toHaveProperty('id', userId);
      expect(response.body.user).toHaveProperty('username', testUser.username);
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('fullName', testUser.fullName);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('인증 토큰 없이 요청 시 실패해야 함', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('유효하지 않은 토큰으로 요청 시 실패해야 함', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/users/profile', () => {
    const updatedProfile = {
      fullName: '수정된 사용자 이름',
      email: 'updated@example.com'
    };

    it('프로필 정보를 성공적으로 수정할 수 있어야 함', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedProfile)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user).toHaveProperty('fullName', updatedProfile.fullName);
      expect(response.body.user).toHaveProperty('email', updatedProfile.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('수정된 정보가 실제로 저장되는지 확인해야 함', async () => {
      // 먼저 수정
      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedProfile);

      // 다시 조회하여 확인
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.user).toHaveProperty('fullName', updatedProfile.fullName);
      expect(response.body.user).toHaveProperty('email', updatedProfile.email);
    });

    it('유효하지 않은 이메일 형식으로 수정 시 실패해야 함', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: '테스트 사용자',
          email: 'invalid-email-format'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('이미 존재하는 이메일로 수정 시 실패해야 함', async () => {
      // 다른 사용자 등록
      const anotherUser = {
        username: 'another',
        email: 'another@example.com',
        password: 'password123',
        fullName: '다른 사용자',
        userType: 'student'
      };

      await request(app)
        .post('/api/auth/register')
        .send(anotherUser);

      // 기존 사용자가 다른 사용자의 이메일로 변경 시도
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: '테스트 사용자',
          email: anotherUser.email
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('이미 사용 중인 이메일');
    });

    it('인증 토큰 없이 요청 시 실패해야 함', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .send(updatedProfile)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('빈 값으로 수정 시도 시 실패해야 함', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: '',
          email: ''
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/users/password', () => {
    const passwordData = {
      currentPassword: testUser.password,
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123'
    };

    it('올바른 현재 비밀번호로 비밀번호 변경이 성공해야 함', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('변경된 비밀번호로 로그인이 가능해야 함', async () => {
      // 비밀번호 변경
      await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      // 새 비밀번호로 로그인 시도
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: passwordData.newPassword
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
    });

    it('잘못된 현재 비밀번호로 변경 시도 시 실패해야 함', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('현재 비밀번호가 일치하지 않습니다');
    });

    it('새 비밀번호와 확인 비밀번호가 다르면 실패해야 함', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'newpassword123',
          confirmPassword: 'differentpassword'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('비밀번호 확인이 일치하지 않습니다');
    });

    it('새 비밀번호가 너무 짧으면 실패해야 함', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: '123',
          confirmPassword: '123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('인증 토큰 없이 요청 시 실패해야 함', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .send(passwordData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('필수 필드가 누락되면 실패해야 함', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'newpassword123'
          // confirmPassword 누락
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
