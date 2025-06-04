const request = require('supertest');
const app = require('../../server.js');

describe('PBT Demo E2E Tests - Login and Dashboard', () => {
  let server;
  let testUser;
  let baseUrl;

  beforeAll(async () => {
    // 테스트 서버 시작
    server = app.listen(0);
    const address = server.address();
    baseUrl = `http://localhost:${address.port}`;
    
    await global.beforeAllTests();
    
    // 테스트용 사용자 생성
    testUser = {
      username: 'e2etest',
      email: 'e2etest@example.com',
      password: 'password123',
      fullName: 'E2E 테스트 사용자',
      userType: 'student'
    };

    await request(app)
      .post('/api/auth/register')
      .send(testUser);
  });

  afterAll(async () => {
    await global.afterAllTests();
    if (server) {
      server.close();
    }
  });

  describe('Homepage and Navigation', () => {
    it('홈페이지가 정상적으로 로드되어야 함', async () => {
      // Playwright 브라우저 시작
      const { chromium } = require('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      try {
        // 홈페이지 접속
        await page.goto(baseUrl);
        
        // 페이지 제목 확인
        const title = await page.title();
        expect(title).toContain('PBT Demo');
        
        // 메인 네비게이션 요소들 확인
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('text=로그인')).toBeVisible();
        await expect(page.locator('text=회원가입')).toBeVisible();
        
        // 메인 콘텐츠 확인
        await expect(page.locator('main')).toBeVisible();
        
      } finally {
        await browser.close();
      }
    });

    it('로그인 페이지로 이동할 수 있어야 함', async () => {
      const { chromium } = require('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      try {
        await page.goto(baseUrl);
        
        // 로그인 버튼 클릭
        await page.click('text=로그인');
        
        // 로그인 페이지로 이동 확인
        await page.waitForURL('**/login.html');
        
        // 로그인 폼 요소들 확인
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
        
      } finally {
        await browser.close();
      }
    });

    it('회원가입 페이지로 이동할 수 있어야 함', async () => {
      const { chromium } = require('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      try {
        await page.goto(baseUrl);
        
        // 회원가입 버튼 클릭
        await page.click('text=회원가입');
        
        // 회원가입 페이지로 이동 확인
        await page.waitForURL('**/register.html');
        
        // 회원가입 폼 요소들 확인
        await expect(page.locator('#username')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('#fullName')).toBeVisible();
        
      } finally {
        await browser.close();
      }
    });
  });

  describe('User Authentication Flow', () => {
    it('올바른 정보로 로그인할 수 있어야 함', async () => {
      const { chromium } = require('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      try {
        // 로그인 페이지로 이동
        await page.goto(`${baseUrl}/login.html`);
        
        // 로그인 폼 입력
        await page.fill('#email', testUser.email);
        await page.fill('#password', testUser.password);
        
        // 로그인 버튼 클릭
        await page.click('button[type="submit"]');
        
        // 대시보드로 리다이렉트 확인
        await page.waitForURL('**/dashboard.html', { timeout: 5000 });
        
        // 로그인 성공 후 사용자 정보 확인
        const welcomeText = page.locator('.user-welcome');
        await expect(welcomeText).toContainText(testUser.fullName);
        
      } finally {
        await browser.close();
      }
    });

    it('잘못된 정보로 로그인 시 오류 메시지가 표시되어야 함', async () => {
      const { chromium } = require('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      try {
        await page.goto(`${baseUrl}/login.html`);
        
        // 잘못된 로그인 정보 입력
        await page.fill('#email', 'wrong@example.com');
        await page.fill('#password', 'wrongpassword');
        
        // 로그인 시도
        await page.click('button[type="submit"]');
        
        // 오류 메시지 확인
        const errorMessage = page.locator('.error-message, .alert-danger');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('로그인');
        
      } finally {
        await browser.close();
      }
    });

    it('새 계정을 등록할 수 있어야 함', async () => {
      const { chromium } = require('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      try {
        await page.goto(`${baseUrl}/register.html`);
        
        // 회원가입 폼 입력
        const newUser = {
          username: `e2enew${Date.now()}`,
          email: `e2enew${Date.now()}@example.com`,
          password: 'password123',
          fullName: '새로운 E2E 사용자'
        };
        
        await page.fill('#username', newUser.username);
        await page.fill('#email', newUser.email);
        await page.fill('#password', newUser.password);
        await page.fill('#fullName', newUser.fullName);
        
        // 사용자 유형 선택
        await page.selectOption('#userType', 'student');
        
        // 회원가입 버튼 클릭
        await page.click('button[type="submit"]');
        
        // 성공 시 대시보드로 리다이렉트 확인
        await page.waitForURL('**/dashboard.html', { timeout: 5000 });
        
      } finally {
        await browser.close();
      }
    });
  });

  describe('Dashboard Functionality', () => {
    let page, browser;

    beforeEach(async () => {
      const { chromium } = require('playwright');
      browser = await chromium.launch({ headless: true });
      page = await browser.newPage();
      
      // 로그인 후 대시보드로 이동
      await page.goto(`${baseUrl}/login.html`);
      await page.fill('#email', testUser.email);
      await page.fill('#password', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard.html');
    });

    afterEach(async () => {
      if (browser) {
        await browser.close();
      }
    });

    it('대시보드 메인 요소들이 표시되어야 함', async () => {
      // 사이드바 확인
      await expect(page.locator('.sidebar, .nav-sidebar')).toBeVisible();
      
      // 메인 콘텐츠 영역 확인
      await expect(page.locator('.main-content, .dashboard-content')).toBeVisible();
      
      // 사용자 프로필 정보 확인
      await expect(page.locator('.user-info, .profile-card')).toBeVisible();
      
      // 통계 카드들 확인
      const statsCards = page.locator('.stats-card, .dashboard-card');
      expect(await statsCards.count()).toBeGreaterThan(0);
    });

    it('프로필 페이지로 이동할 수 있어야 함', async () => {
      // 프로필 메뉴 클릭
      await page.click('text=프로필');
      
      // 프로필 페이지로 이동 확인
      await page.waitForURL('**/profile.html');
      
      // 프로필 정보 표시 확인
      await expect(page.locator('#fullName')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
    });

    it('강의 목록 페이지로 이동할 수 있어야 함', async () => {
      // 강의 메뉴 클릭
      await page.click('text=강의');
      
      // 강의 목록 페이지로 이동 확인
      await page.waitForURL('**/courses.html');
      
      // 강의 목록 확인
      await expect(page.locator('.courses-list, .course-grid')).toBeVisible();
    });

    it('만다라트 페이지로 이동할 수 있어야 함', async () => {
      // 만다라트 메뉴 클릭 (있는 경우)
      const mandartLink = page.locator('text=만다라트');
      if (await mandartLink.isVisible()) {
        await mandartLink.click();
        
        // 만다라트 페이지로 이동 확인
        await page.waitForURL('**/mandart**');
        
        // 만다라트 관련 요소 확인
        await expect(page.locator('.mandart-container')).toBeVisible();
      }
    });

    it('로그아웃 기능이 작동해야 함', async () => {
      // 로그아웃 버튼 찾기 및 클릭
      const logoutButton = page.locator('text=로그아웃, .logout-btn, #logout');
      await logoutButton.click();
      
      // 홈페이지나 로그인 페이지로 리다이렉트 확인
      await page.waitForURL(new RegExp(`${baseUrl}/(login.html|index.html|)$`));
      
      // 로그인 상태가 해제되었는지 확인
      await expect(page.locator('text=로그인')).toBeVisible();
    });
  });

  describe('Responsive Design', () => {
    it('모바일 화면에서도 정상적으로 표시되어야 함', async () => {
      const { chromium } = require('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      try {
        // 모바일 화면 크기로 설정
        await page.setViewportSize({ width: 375, height: 667 });
        
        await page.goto(baseUrl);
        
        // 모바일에서도 주요 요소들이 표시되는지 확인
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
        
        // 모바일 메뉴 버튼이 있는지 확인
        const mobileMenuButton = page.locator('.mobile-menu, .hamburger, .menu-toggle');
        if (await mobileMenuButton.isVisible()) {
          await mobileMenuButton.click();
          // 메뉴가 펼쳐지는지 확인
          await expect(page.locator('.mobile-nav, .dropdown-menu')).toBeVisible();
        }
        
      } finally {
        await browser.close();
      }
    });

    it('태블릿 화면에서도 정상적으로 표시되어야 함', async () => {
      const { chromium } = require('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      try {
        // 태블릿 화면 크기로 설정
        await page.setViewportSize({ width: 768, height: 1024 });
        
        await page.goto(baseUrl);
        
        // 태블릿에서도 주요 요소들이 표시되는지 확인
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
        
      } finally {
        await browser.close();
      }
    });
  });

  describe('Error Handling', () => {
    it('존재하지 않는 페이지 접근 시 404 페이지가 표시되어야 함', async () => {
      const { chromium } = require('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      try {
        // 존재하지 않는 페이지로 이동
        const response = await page.goto(`${baseUrl}/nonexistent-page.html`);
        
        // 404 상태 코드 확인
        expect(response.status()).toBe(404);
        
      } finally {
        await browser.close();
      }
    });

    it('네트워크 오류 시 적절한 오류 메시지가 표시되어야 함', async () => {
      const { chromium } = require('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      try {
        // 네트워크 요청을 실패하도록 설정
        await page.route('**/api/**', route => {
          route.abort('failed');
        });
        
        await page.goto(`${baseUrl}/login.html`);
        
        // 로그인 시도
        await page.fill('#email', testUser.email);
        await page.fill('#password', testUser.password);
        await page.click('button[type="submit"]');
        
        // 네트워크 오류 메시지 확인
        const errorMessage = page.locator('.error-message, .alert-danger, .network-error');
        await expect(errorMessage).toBeVisible({ timeout: 10000 });
        
      } finally {
        await browser.close();
      }
    });
  });
});
