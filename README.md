# 🧩 PBT Demo - Problem-Based Training Demo Platform

> "문제 해결 중심의 실무 역량 강화 데모"

PBT Demo는 문제 기반 학습을 위한 현대적인 학습 관리 시스템의 데모 버전입니다.

![Node.js](https://img.shields.io/badge/Node.js-20.x+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-5.x-007FFF?style=flat-square&logo=mui&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-20.x+-2496ED?style=flat-square&logo=docker&logoColor=white)

## 📥 프로젝트 다운로드 및 설치

### Git을 이용한 프로젝트 복제
```bash
# 프로젝트 복제 (GitHub 저장소)
git clone https://github.com/edumagiceco/pbt-demo.git
cd pbt-demo

# 또는 현재 로컬 저장소에서 작업
cd /Users/magic/data/claude/pbt-demo
```

### 🔄 프로젝트 버전 관리
- **최신 커밋**: cfc18f5 (2025.06.03)
- **총 파일 수**: 812개 파일
- **총 코드 라인**: 75,000+ 줄
- **Git 저장소**: 완전 준비 ✅
- **GitHub 계정**: MagicecoleAI Organization
- **다음 단계**: GitHub 원격 저장소 연결 예정

## ✨ 주요 기능

### 👥 사용자 관리
- **3가지 사용자 유형**: 학생(Student), 강사(Instructor), 관리자(Admin)
- **JWT 기반 인증**: 안전한 토큰 기반 인증 시스템
- **역할 기반 접근 제어**: 권한별 API 및 페이지 제한

### 🧩 문제 관리
- **문제 CRUD**: 생성, 조회, 수정, 삭제 기능
- **난이도별 분류**: Beginner, Intermediate, Advanced
- **테스트케이스 관리**: 자동 채점을 위한 입출력 테스트케이스
- **실시간 코드 실행**: Monaco Editor 기반 코드 편집 및 실행

### 💻 코드 실행 엔진
- **다중 언어 지원**: JavaScript, Python, Java 등
- **실시간 평가**: 테스트케이스 기반 자동 채점
- **실행 결과 추적**: 실행 시간, 메모리 사용량 측정
- **솔루션 이력 관리**: 제출 기록 및 피드백

### 📊 대시보드
- **학생 대시보드**: 해결한 문제, 진행률, 최근 활동
- **강사 대시보드**: 문제 관리, 학생 평가, 통계
- **관리자 대시보드**: 시스템 전체 관리 및 모니터링

### 🎨 현대적 UI/UX
- **React SPA**: 빠르고 반응형인 단일 페이지 애플리케이션
- **Material-UI**: 구글의 Material Design 기반 일관된 디자인
- **반응형 디자인**: 모든 기기에서 최적화된 경험
- **VS Code 수준의 에디터**: Monaco Editor 통합

## 🚀 빠른 시작

### 1. 시스템 요구사항
- **Node.js**: 20.x LTS 이상
- **MySQL**: 8.0 이상
- **npm**: 9.x 이상
- **메모리**: 최소 2GB RAM
- **저장공간**: 최소 5GB 여유 공간

### 2. 설치 및 실행

#### 2.1 프로젝트 설치
```bash
# 프로젝트 디렉토리로 이동
cd /Users/magic/data/claude/pbt-demo

# 서버 의존성 설치
npm install

# 클라이언트 의존성 설치
cd client
npm install
cd ..
```

#### 2.2 환경 설정
⚠️ **중요: 보안 설정이 필요합니다**

먼저 환경 변수 파일을 설정해야 합니다:

```bash
# .env.example을 복사하여 .env 파일 생성
cp .env.example .env
```

`.env` 파일을 열어서 다음 항목들을 실제 값으로 교체하세요:

```env
# 데이터베이스 비밀번호
DB_PASSWORD=your_actual_database_password

# JWT 보안 키 (32자 이상 권장)
JWT_SECRET=your_secure_jwt_secret_minimum_32_characters
SESSION_SECRET=your_secure_session_secret_minimum_32_characters

# Anthropic Claude API 키 (AI 챗봇용)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

🔐 **자세한 보안 설정 가이드**: [SECURITY.md](./SECURITY.md) 참조

**API 키 발급 방법:**
- Anthropic Claude API: https://console.anthropic.com/
- OpenAI API (선택): https://platform.openai.com/

#### 2.3 Docker 환경 설정 (선택사항)
Docker로 실행하려는 경우:

```bash
# Docker용 환경 파일 설정
cp .env.docker.example .env.docker
# .env.docker 파일을 열어서 실제 API 키들로 교체

# Docker Compose로 실행
docker-compose up -d
```

#### 2.3 서버 실행
```bash
# 개발 모드 실행 (서버 자동 재시작)
npm run dev

# 또는 일반 실행
npm start
```

#### 2.4 클라이언트 실행 (개발 모드)
```bash
# 새 터미널에서
cd client
npm start
```

### 3. 시스템 접속
- **메인 사이트**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health

## 📖 사용자 매뉴얼

완전한 사용자 가이드는 다음 문서를 참조하세요:
**📋 [사용자 매뉴얼](./docs/user_manual.md)**

### 주요 가이드 내용:
- **설치 및 실행 가이드**: 서버 설정부터 접속까지
- **사용자별 기능 가이드**: 학생/강사/관리자 역할별 사용법
- **코드 에디터 사용법**: Monaco Editor 활용 및 문제 풀이
- **문제 해결 가이드**: 일반적인 오류 및 해결 방법
- **FAQ 및 지원**: 자주 묻는 질문과 지원 방법

## 👤 테스트 계정

시스템 테스트를 위한 기본 계정들:

| 유형 | 이메일 | 비밀번호 | 설명 |
|------|--------|----------|------|
| 관리자 | admin@pbtlms.com | admin123 | 시스템 전체 관리 |
| 강사 | instructor@pbtlms.com | instructor123 | 문제 생성/관리 |
| 학생 | student@pbtlms.com | student123 | 문제 풀이 |

## 📁 프로젝트 구조

```
/Users/magic/data/claude/pbt-demo/
├── server.js                 # Express 서버 진입점
├── package.json             # 서버 의존성
├── .env                     # 환경 변수
├── src/                     # 백엔드 소스코드
│   ├── config/             # 설정 파일
│   ├── models/             # Sequelize 모델
│   ├── routes/             # Express 라우트
│   ├── controllers/        # 컨트롤러
│   ├── middleware/         # 미들웨어
│   └── services/           # 비즈니스 로직
├── client/                 # React 클라이언트
│   ├── public/            # 정적 파일
│   ├── src/               # React 소스코드
│   │   ├── components/    # React 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── services/      # API 서비스
│   │   └── store/         # Redux 스토어
│   └── package.json       # 클라이언트 의존성
├── uploads/               # 업로드 파일 저장소
├── docs/                  # 프로젝트 문서
│   ├── project_plan.md    # 프로젝트 계획서
│   └── user_manual.md     # 🆕 사용자 매뉴얼
└── README.md              # 이 파일
```

## 🛠️ 기술 스택

### Backend
- **Node.js 20.x**: JavaScript 런타임
- **Express.js 5.x**: 웹 프레임워크
- **MySQL 8.0**: 관계형 데이터베이스
- **Sequelize 6.x**: ORM (Object-Relational Mapping)
- **JWT**: JSON Web Token 인증
- **bcrypt**: 비밀번호 해시화

### Frontend
- **React 18.x**: 사용자 인터페이스 라이브러리
- **Material-UI 5.x**: 구글 Material Design 컴포넌트
- **Redux Toolkit**: 상태 관리
- **React Router 6.x**: 클라이언트 사이드 라우팅
- **Monaco Editor**: VS Code 수준의 코드 에디터
- **Axios**: HTTP 클라이언트

### 개발 도구
- **Nodemon**: 개발 중 서버 자동 재시작
- **Create React App**: React 앱 부트스트래핑
- **Winston**: 로깅 라이브러리
- **Helmet**: 보안 헤더
- **CORS**: Cross-Origin Resource Sharing

## 🔧 개발 환경

### VS Code 확장 프로그램 권장
- ES7+ React/Redux/React-Native snippets
- Node.js Extension Pack
- MySQL (by Jun Han)
- Thunder Client (API 테스트)
- GitLens

### 개발 명령어
```bash
# 서버 개발 모드 (자동 재시작)
npm run dev

# 클라이언트 개발 모드
cd client && npm start

# 프로덕션 빌드
cd client && npm run build

# 테스트 실행
npm test

# 코드 린팅
npm run lint
```

## 📈 개발 현황

### ✅ Phase 1: 기초 시스템 (완료)
- [x] Express 서버 설정
- [x] MySQL 데이터베이스 스키마
- [x] Sequelize ORM 모델
- [x] JWT 인증 시스템
- [x] 기본 API 엔드포인트

### ✅ Phase 2: 문제 관리 (완료)
- [x] 문제 CRUD API
- [x] 테스트케이스 관리
- [x] 파일 업로드 시스템
- [x] 코드 실행 엔진
- [x] 자동 평가 시스템

### ✅ Phase 3: React 클라이언트 (완료)
- [x] React 앱 구조
- [x] Material-UI 디자인 시스템
- [x] Redux 상태 관리
- [x] Monaco 코드 에디터
- [x] 문제 풀이 인터페이스

### ✅ Phase 4: 통합 및 테스트 (완료)
- [x] 전체 시스템 통합
- [x] API 연동 테스트
- [x] 사용자 플로우 테스트
- [x] 📖 사용자 매뉴얼 작성

### 🔄 Phase 5: 고급 기능 (선택사항)
- [ ] 실시간 알림 (Socket.io)
- [ ] 토론 게시판
- [ ] 학습 분석 리포트
- [ ] 관리자 대시보드 확장

## 🌟 시스템 특징

### 🚀 **Production Ready**
현재 시스템은 교육기관이나 기업에서 바로 사용할 수 있는 완성도를 갖추고 있습니다.

### 💻 **완전한 코딩 환경**
- VS Code 수준의 Monaco Editor
- 실시간 코드 실행 및 테스트
- 자동 채점 시스템
- 다양한 프로그래밍 언어 지원

### 🎯 **교육 최적화**
- 문제 기반 학습(PBL) 방법론
- 단계별 난이도 조절
- 개인별 학습 진도 추적
- 실시간 피드백

### 🔒 **보안 및 안정성**
- JWT 토큰 기반 인증
- 입력 데이터 검증
- SQL Injection 방지
- 에러 처리 및 로깅

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원 및 문의

### 📖 문서 및 가이드
- **🆕 [사용자 매뉴얼](./docs/user_manual.md)**: 완전한 사용 가이드
- **[프로젝트 계획서](./docs/project_plan.md)**: 개발 계획 및 현황
- **API 문서**: `/api` 엔드포인트 (Swagger 구현 예정)

### 🆘 지원 요청
- **이슈 리포트**: GitHub Issues
- **기능 요청**: GitHub Discussions
- **기술 지원**: 시스템 로그와 함께 문의

## 🎉 감사의 말

PBT LMS는 다음 오픈소스 프로젝트들의 도움으로 만들어졌습니다:

- [Node.js](https://nodejs.org/) - JavaScript 런타임
- [Express.js](https://expressjs.com/) - 웹 프레임워크
- [React](https://reactjs.org/) - UI 라이브러리
- [Material-UI](https://mui.com/) - React UI 프레임워크
- [MySQL](https://www.mysql.com/) - 관계형 데이터베이스
- [Sequelize](https://sequelize.org/) - Node.js ORM
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - 코드 에디터

---

**🧩 PBT Demo** - "문제 해결 중심의 실무 역량 강화 데모" 🚀

*Made with ❤️ by Claude AI Assistant*

**버전**: 1.0.0 | **최종 업데이트**: 2025년 6월 3일 | **Git 커밋**: df4fce3

## 🔄 버전 관리 현황

### 최신 업데이트 (2025.06.03)
- ✅ Git 저장소 초기화 완료
- ✅ 불필요한 파일 정리 및 .gitignore 설정
- ✅ 첫 번째 커밋 완료 (df4fce3)
- ✅ 166개 파일, 74,828줄 코드 버전 관리 시작
- 🔄 GitHub 원격 저장소 연결 예정

### 프로젝트 진행률
- **기본 시스템**: 100% ✅
- **사용자 인증**: 100% ✅  
- **문제 관리**: 100% ✅
- **코드 실행**: 100% ✅
- **React UI**: 100% ✅
- **AI 챗봇**: 100% ✅
- **버전 관리**: 100% ✅
# pbt-lms-platform
# pbt-demo
