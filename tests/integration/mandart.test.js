const request = require('supertest');
const app = require('../../server.js');

describe('Mandart System API Integration Tests', () => {
  let server;
  let authToken;
  let userId;
  let createdMandartId;
  
  const testUser = {
    username: 'mandarttest',
    email: 'mandarttest@example.com',
    password: 'password123',
    fullName: '만다라트 테스트 사용자',
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

  describe('POST /api/mandart/generate', () => {
    const validMandartData = {
      template: 'career',
      centerGoal: '소프트웨어 개발자가 되기',
      title: '개발자 커리어 만다라트',
      description: '소프트웨어 개발자가 되기 위한 목표 설정'
    };

    it('유효한 템플릿으로 만다라트를 생성할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/mandart/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validMandartData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('mandart');
      expect(response.body.mandart).toHaveProperty('id');
      expect(response.body.mandart).toHaveProperty('title', validMandartData.title);
      expect(response.body.mandart).toHaveProperty('centerGoal', validMandartData.centerGoal);
      expect(response.body.mandart).toHaveProperty('template', validMandartData.template);
      
      // 생성된 만다라트 ID 저장
      createdMandartId = response.body.mandart.id;
    });

    it('다양한 템플릿으로 만다라트를 생성할 수 있어야 함', async () => {
      const templates = [
        { template: 'health', centerGoal: '건강한 생활하기', title: '건강 관리 만다라트' },
        { template: 'study', centerGoal: '영어 마스터하기', title: '영어 학습 만다라트' },
        { template: 'business', centerGoal: '스타트업 창업하기', title: '창업 만다라트' },
        { template: 'personal', centerGoal: '자기계발하기', title: '개인성장 만다라트' },
        { template: 'financial', centerGoal: '재정 안정성 확보', title: '재정 관리 만다라트' }
      ];

      for (const templateData of templates) {
        const response = await request(app)
          .post('/api/mandart/generate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ...templateData,
            description: `${templateData.title} 설명`
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.mandart).toHaveProperty('template', templateData.template);
        expect(response.body.mandart).toHaveProperty('centerGoal', templateData.centerGoal);
      }
    });

    it('필수 필드가 누락되면 실패해야 함', async () => {
      const response = await request(app)
        .post('/api/mandart/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          template: 'career',
          title: '테스트 만다라트'
          // centerGoal 누락
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('인증 토큰 없이 요청 시 실패해야 함', async () => {
      const response = await request(app)
        .post('/api/mandart/generate')
        .send(validMandartData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/mandart/list', () => {
    beforeEach(async () => {
      // 테스트용 만다라트가 없다면 생성
      if (!createdMandartId) {
        const response = await request(app)
          .post('/api/mandart/generate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            template: 'career',
            centerGoal: '테스트 목표',
            title: '테스트 만다라트',
            description: '테스트용 만다라트'
          });
        
        createdMandartId = response.body.mandart.id;
      }
    });

    it('사용자의 만다라트 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get('/api/mandart/list')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('mandarts');
      expect(Array.isArray(response.body.mandarts)).toBe(true);
      expect(response.body.mandarts.length).toBeGreaterThan(0);
      
      // 첫 번째 만다라트 구조 확인
      const firstMandart = response.body.mandarts[0];
      expect(firstMandart).toHaveProperty('id');
      expect(firstMandart).toHaveProperty('title');
      expect(firstMandart).toHaveProperty('centerGoal');
      expect(firstMandart).toHaveProperty('template');
      expect(firstMandart).toHaveProperty('status');
      expect(firstMandart).toHaveProperty('progressPercent');
    });

    it('인증 토큰 없이 요청 시 실패해야 함', async () => {
      const response = await request(app)
        .get('/api/mandart/list')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/mandart/:id', () => {
    it('만다라트 상세 정보를 조회할 수 있어야 함', async () => {
      const response = await request(app)
        .get(`/api/mandart/${createdMandartId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('mandart');
      expect(response.body.mandart).toHaveProperty('id', createdMandartId);
      expect(response.body.mandart).toHaveProperty('goals');
      expect(response.body.mandart).toHaveProperty('tasks');
      expect(Array.isArray(response.body.mandart.goals)).toBe(true);
      expect(Array.isArray(response.body.mandart.tasks)).toBe(true);
    });

    it('존재하지 않는 만다라트 조회 시 실패해야 함', async () => {
      const response = await request(app)
        .get('/api/mandart/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('인증 토큰 없이 요청 시 실패해야 함', async () => {
      const response = await request(app)
        .get(`/api/mandart/${createdMandartId}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
