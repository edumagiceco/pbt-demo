const request = require('supertest');
const app = require('../../server.js');

describe('Instructor AI Chatbot API Integration Tests', () => {
  let server;
  let authToken;
  let userId;
  let courseId;
  let lectureId;
  
  const testUser = {
    username: 'aitest',
    email: 'aitest@example.com',
    password: 'password123',
    fullName: 'AI 테스트 사용자',
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

    // 테스트용 강의 및 과정 데이터 설정 (실제 DB에서 조회)
    // 실제 환경에서는 샘플 데이터가 있다고 가정
    courseId = 1;
    lectureId = 1;
  });

  afterAll(async () => {
    await global.afterAllTests();
    if (server) {
      server.close();
    }
  });

  describe('POST /api/instructor-ai/chat', () => {
    const validChatRequest = {
      message: '이 강의 내용에 대해 설명해주세요',
      courseId: 1,
      lectureId: 1,
      sessionId: 'test-session-123'
    };

    it('유효한 메시지로 AI 챗봇 응답을 받을 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/instructor-ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validChatRequest)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('sessionId');
      expect(typeof response.body.response).toBe('string');
      expect(response.body.response.length).toBeGreaterThan(0);
    });

    it('메시지 없이 요청 시 실패해야 함', async () => {
      const response = await request(app)
        .post('/api/instructor-ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          courseId: 1,
          lectureId: 1,
          sessionId: 'test-session-123'
          // message 누락
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('빈 메시지로 요청 시 실패해야 함', async () => {
      const response = await request(app)
        .post('/api/instructor-ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: '',
          courseId: 1,
          lectureId: 1,
          sessionId: 'test-session-123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('너무 긴 메시지로 요청 시 실패해야 함', async () => {
      const longMessage = 'a'.repeat(5001); // 5000자 초과

      const response = await request(app)
        .post('/api/instructor-ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: longMessage,
          courseId: 1,
          lectureId: 1,
          sessionId: 'test-session-123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('인증 토큰 없이 요청 시 실패해야 함', async () => {
      const response = await request(app)
        .post('/api/instructor-ai/chat')
        .send(validChatRequest)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('유효하지 않은 courseId로 요청 시에도 처리되어야 함', async () => {
      const response = await request(app)
        .post('/api/instructor-ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validChatRequest,
          courseId: 999999 // 존재하지 않는 과정 ID
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('response');
    });

    it('다양한 질문 유형에 대해 적절한 응답을 받을 수 있어야 함', async () => {
      const questions = [
        '이 개념을 쉽게 설명해주세요',
        '실제 예시를 들어주세요',
        '이 내용을 효과적으로 학습하는 방법은?',
        '관련된 추가 자료가 있나요?',
        '이해가 안 되는 부분이 있어요'
      ];

      for (const question of questions) {
        const response = await request(app)
          .post('/api/instructor-ai/chat')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            message: question,
            courseId: 1,
            lectureId: 1,
            sessionId: `test-session-${Date.now()}`
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('response');
        expect(response.body.response.length).toBeGreaterThan(10);
      }
    });

    it('세션 ID가 제공되면 대화 기록이 유지되어야 함', async () => {
      const sessionId = `test-session-${Date.now()}`;
      
      // 첫 번째 메시지
      const firstResponse = await request(app)
        .post('/api/instructor-ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: '안녕하세요, 강사님',
          courseId: 1,
          lectureId: 1,
          sessionId: sessionId
        })
        .expect(200);

      expect(firstResponse.body).toHaveProperty('success', true);

      // 두 번째 메시지 (이전 대화 맥락 참조)
      const secondResponse = await request(app)
        .post('/api/instructor-ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: '방금 전에 말씀드린 내용에 대해 더 자세히 설명해주세요',
          courseId: 1,
          lectureId: 1,
          sessionId: sessionId
        })
        .expect(200);

      expect(secondResponse.body).toHaveProperty('success', true);
      expect(secondResponse.body).toHaveProperty('response');
    });
  });

  describe('GET /api/instructor-ai/history/:sessionId', () => {
    let testSessionId;

    beforeEach(async () => {
      testSessionId = `test-history-${Date.now()}`;
      
      // 테스트용 채팅 기록 생성
      await request(app)
        .post('/api/instructor-ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: '테스트 메시지입니다',
          courseId: 1,
          lectureId: 1,
          sessionId: testSessionId
        });
    });

    it('세션 ID로 채팅 기록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get(`/api/instructor-ai/history/${testSessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('messages');
      expect(Array.isArray(response.body.messages)).toBe(true);
      expect(response.body.messages.length).toBeGreaterThan(0);
    });

    it('존재하지 않는 세션 ID로 조회 시 빈 배열을 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/instructor-ai/history/nonexistent-session')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('messages');
      expect(Array.isArray(response.body.messages)).toBe(true);
      expect(response.body.messages.length).toBe(0);
    });

    it('인증 토큰 없이 요청 시 실패해야 함', async () => {
      const response = await request(app)
        .get(`/api/instructor-ai/history/${testSessionId}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/instructor-ai/history/:sessionId', () => {
    let testSessionId;

    beforeEach(async () => {
      testSessionId = `test-delete-${Date.now()}`;
      
      // 테스트용 채팅 기록 생성
      await request(app)
        .post('/api/instructor-ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: '삭제 테스트 메시지입니다',
          courseId: 1,
          lectureId: 1,
          sessionId: testSessionId
        });
    });

    it('세션 ID로 채팅 기록을 삭제할 수 있어야 함', async () => {
      const response = await request(app)
        .delete(`/api/instructor-ai/history/${testSessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('삭제 후 해당 세션의 기록이 실제로 없어져야 함', async () => {
      // 삭제 실행
      await request(app)
        .delete(`/api/instructor-ai/history/${testSessionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // 삭제 확인
      const response = await request(app)
        .get(`/api/instructor-ai/history/${testSessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.messages.length).toBe(0);
    });

    it('존재하지 않는 세션 ID 삭제 요청 시에도 성공 응답을 해야 함', async () => {
      const response = await request(app)
        .delete('/api/instructor-ai/history/nonexistent-session')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('인증 토큰 없이 요청 시 실패해야 함', async () => {
      const response = await request(app)
        .delete(`/api/instructor-ai/history/${testSessionId}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
