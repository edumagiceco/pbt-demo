# GitHub 저장소 설정 가이드

## 🎯 목표 저장소 정보

- **조직**: MagicecoleAI
- **저장소명**: pbt-lms-platform
- **전체 URL**: https://github.com/MagicecoleAI/pbt-lms-platform
- **타입**: Public (오픈소스 프로젝트)
- **설명**: PBT (Problem-Based Training) LMS Platform - AI 인재 커리어 플랫폼

## 📋 수동 저장소 생성 단계

### 1단계: GitHub 웹사이트에서 새 저장소 생성

1. https://github.com/MagicecoleAI 접속
2. "New repository" 클릭
3. 저장소 설정:
   - **Repository name**: `pbt-lms-platform`
   - **Description**: `PBT (Problem-Based Training) LMS Platform - AI 인재 커리어 플랫폼`
   - **Visibility**: Public
   - **Initialize**: README 체크 안함 (기존 파일 사용)
   - **Add .gitignore**: 선택 안함 (기존 파일 사용)
   - **Choose a license**: 선택 안함 (기존 MIT 라이센스 사용)

### 2단계: 로컬 저장소와 연결

```bash
# 프로젝트 디렉토리로 이동
cd /Users/magic/data/claude/pbt-demo

# 새 원격 저장소 추가
git remote add origin https://github.com/MagicecoleAI/pbt-lms-platform.git

# 기본 브랜치를 main으로 설정 (필요시)
git branch -M main

# 첫 번째 푸시
git push -u origin main
```

### 3단계: 브랜치 푸시 (현재 pbt-lms-platform 브랜치)

```bash
# 현재 브랜치 확인
git branch

# 현재 브랜치를 원격으로 푸시
git push -u origin pbt-lms-platform
```

## 🚀 프로젝트 현황

### 완성된 기능들
- ✅ **완전한 PBT LMS 시스템**: 학습 관리, 문제 풀이, AI 멘토, 만다라트 등
- ✅ **AI 챗봇 시스템**: Claude 3.5 Sonnet 기반 운영 도우미
- ✅ **멘토 AI 시스템**: 개인화된 AI 멘토 생성 및 관리
- ✅ **만다라트 관리 시스템**: 목표 설정 및 진도 관리
- ✅ **토론 시스템**: 실시간 토론 및 댓글 기능
- ✅ **과제 관리**: 과제 제출 및 평가 시스템
- ✅ **사용자 관리**: 인증, 권한, 프로필 관리

### 기술 스택
- **Backend**: Node.js, Express.js, MySQL, Sequelize
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap
- **AI**: Claude 3.5 Sonnet API
- **Docker**: 개발 및 배포 환경
- **기타**: JWT 인증, RESTful API, 반응형 디자인

### 프로젝트 통계
- **총 파일 수**: 812개
- **총 코드 라인**: 75,000+ 줄
- **커밋 수**: 7개
- **마지막 업데이트**: 2025년 6월 3일

## 📂 주요 디렉토리 구조

```
pbt-demo/
├── 📁 public/          # 프론트엔드 파일 (HTML, CSS, JS)
├── 📁 src/             # 백엔드 소스 코드
├── 📁 docs/            # 프로젝트 문서
├── 📁 database/        # 데이터베이스 설정
├── 📁 assets/          # 이미지 및 정적 파일
├── 📁 .github/         # GitHub 템플릿
├── 📄 README.md        # 프로젝트 소개
├── 📄 LICENSE          # MIT 라이센스
├── 📄 package.json     # Node.js 의존성
├── 📄 docker-compose.yml # Docker 설정
└── 📄 server.js        # 메인 서버 파일
```

## 🔧 개발 환경 설정

### 로컬 개발 환경
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 또는 Docker 환경
docker-compose up -d
```

### 접속 정보
- **웹사이트**: http://localhost:3000
- **데이터베이스**: MySQL (포트 3307)
- **Redis**: 포트 6380

## 🌟 오픈소스 기여

이 프로젝트는 오픈소스 프로젝트입니다. 기여를 환영합니다!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이나 제안이 있으시면 GitHub Issues를 통해 연락해 주세요.

---

**PBT LMS Platform** - AI 인재 커리어 플랫폼으로 미래를 만들어가세요! 🚀
