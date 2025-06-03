# PBT LMS 플랫폼 화면설계서

## 1. Overview

### 프로젝트 목적
PBT (Problem-Based Training) LMS는 문제 해결 중심의 실무 역량 강화를 목표로 하는 차세대 학습 관리 시스템입니다. AI 기술을 활용한 개인화된 학습 경험과 실시간 피드백을 제공합니다.

### 핵심 사용자 여정
1. **학습자**: 회원가입 → 과정 탐색 → 수강신청 → 문제 풀이 → AI 멘토 활용 → 진도 관리
2. **강사**: 로그인 → 과정 관리 → 강의 자료 업로드 → 강사 AI 활용 → 학생 관리
3. **관리자**: 시스템 관리 → 사용자 관리 → 통계 분석 → 컨텐츠 관리

## 2. 화면별 상세 설계

### 2.1 메인 페이지 (index.html)

**Screen ID**: HOME-001  
**화면명**: 랜딩 페이지

#### 목적 / 역할
- 서비스 소개 및 첫인상 제공
- 회원가입/로그인 유도
- 시스템 상태 및 기능 소개

#### 주요 레이아웃
- **Header**: 로고 + 제목 + 로그인/회원가입 버튼 (우상단)
- **Hero Section**: PBT 로고 + 메인 타이틀 + 설명
- **Main Content**: 4개 카드 그리드 (프로젝트 개요, 기술 스택, 개발 현황, 테스트 페이지)
- **Footer**: 저작권 정보

#### 핵심 UI 컴포넌트
- `AuthButtons`: 로그인/회원가입 버튼 (반응형)
- `FeatureCard`: 기능 소개 카드
- `StatusIndicator`: 실시간 시스템 상태
- `APITestButton`: API 상태 확인 버튼

#### 주요 인터랙션 & 엣지케이스
- 로그인/회원가입 버튼 클릭 → 해당 페이지 이동
- API 테스트 버튼 → 실시간 엔드포인트 상태 확인
- 반응형: 모바일에서 인증 버튼 중앙 정렬

#### 데이터 소스 & API
- `GET /api/health`: 시스템 상태 확인

#### 네비게이션
- **입구**: 직접 접근 (루트 URL)
- **출구**: `/login.html`, `/register.html`

#### 권한 / 가드
- 공개 접근 (인증 불필요)

---

### 2.2 인증 시스템

#### 2.2.1 로그인 페이지 (login.html)

**Screen ID**: AUTH-001  
**화면명**: 사용자 로그인

#### 목적 / 역할
JWT 기반 사용자 인증 및 대시보드 접근

#### 주요 레이아웃
- **Central Container**: 중앙 정렬된 로그인 폼
- **Logo Section**: PBT 로고 + 브랜딩
- **Form Section**: 사용자명/이메일 + 비밀번호 입력 필드
- **Footer Links**: 회원가입 링크, 메인 페이지 링크

#### 핵심 UI 컴포넌트
- `LoginForm`: 실시간 유효성 검사 폼
- `AlertContainer`: 성공/실패 메시지 표시
- `LoadingSpinner`: 로그인 처리 중 스피너
- `InputField`: 포커스 애니메이션 입력 필드

#### 주요 인터랙션 & 엣지케이스
- 폼 검증: 필수 필드 확인, 실시간 알림
- 로딩 상태: 버튼 비활성화, 스피너 표시
- 자동 리다이렉트: 성공 시 대시보드 이동
- 기존 세션 확인: 토큰 존재 시 대시보드 이동

#### 데이터 소스 & API
- `POST /api/auth/login`: 로그인 인증
- `GET /api/auth/verify`: 토큰 유효성 검증

#### 네비게이션
- **입구**: 메인 페이지, 인증 필요 페이지들
- **출구**: `/dashboard.html` (성공), `/register.html`

---

#### 2.2.2 회원가입 페이지 (register.html)

**Screen ID**: AUTH-002  
**화면명**: 사용자 회원가입

#### 목적 / 역할
신규 사용자 계정 생성 및 사용자 유형 선택

#### 주요 레이아웃
- **Form Container**: 회원가입 폼
- **User Type Selection**: 학생/강사/관리자 선택
- **Password Strength**: 비밀번호 강도 표시기
- **Terms Section**: 이용약관 동의

#### 핵심 UI 컴포넌트
- `RegistrationForm`: 다단계 유효성 검사
- `UserTypeSelector`: 라디오 버튼 그룹
- `PasswordStrengthMeter`: 실시간 비밀번호 강도
- `EmailValidator`: 실시간 이메일 중복 확인

---

### 2.3 대시보드 (dashboard.html)

**Screen ID**: DASH-001  
**화면명**: 사용자 대시보드

#### 목적 / 역할
사용자별 맞춤형 학습 현황 및 주요 기능 허브

#### 주요 레이아웃
- **Navbar**: 로고 + 사용자 정보 + 로그아웃 버튼
- **Welcome Section**: 개인화된 환영 메시지
- **Stats Grid**: 3개 통계 카드 (과정, 문제, 진도율)
- **Main Grid**: 9개 기능 카드 (3x3 반응형 그리드)

#### 핵심 UI 컴포넌트
- `UserGreeting`: 동적 사용자명 표시
- `StatCard`: 숫자 강조 통계 카드
- `FeatureCard`: 기능별 바로가기 카드
- `AdminCard`: 관리자 전용 카드 (조건부 표시)

#### 주요 인터랙션 & 엣지케이스
- 사용자 유형별 통계 데이터 표시
- 관리자 카드 동적 표시/숨김
- 토큰 만료 시 로그인 페이지 리다이렉트
- 데모 데이터 fallback 처리

#### 데이터 소스 & API
- `GET /api/auth/me`: 사용자 정보 조회
- `GET /api/users/{id}/courses`: 수강 과정 통계
- `GET /api/users/{id}/problems/solved`: 해결 문제 수
- `GET /api/users/{id}/progress`: 전체 진도율

#### 네비게이션
- **입구**: 로그인 성공, 모든 내부 페이지에서 'Home' 버튼
- **출구**: 모든 기능 페이지들 (`/courses.html`, `/problems.html` 등)

#### 권한 / 가드
- JWT 토큰 필수
- 사용자 유형별 기능 접근 제어

---

### 2.4 과정 관리 시스템

#### 2.4.1 내 과정 페이지 (courses.html)

**Screen ID**: COURSE-001  
**화면명**: 수강 중인 과정 목록

#### 목적 / 역할
사용자가 참여 중인 과정들의 진도 관리 및 학습 계속하기

#### 주요 레이아웃
- **Navbar**: 공통 네비게이션 (현재 페이지 하이라이트)
- **Page Header**: 제목 + 설명
- **Course Grid**: 반응형 카드 그리드 (350px 최소 너비)
- **Empty State**: 수강 과정 없을 때 표시

#### 핵심 UI 컴포넌트
- `CourseCard`: 과정 정보 + 진도바 + 액션 버튼
- `ProgressBar`: 시각적 진도 표시
- `StatusBadge`: 시작전/수강중/완료 상태 배지
- `LoadingSpinner`: 데이터 로딩 중 표시

#### 주요 인터랙션 & 엣지케이스
- 진도율별 상태 배지 색상 변경
- 사용자 유형별 다른 액션 버튼 (학생: 계속학습, 강사: 과정관리)
- API 실패 시 데모 데이터 표시
- 빈 목록 시 과정 둘러보기 유도

#### 데이터 소스 & API
- `GET /api/courses/my/enrolled`: 내 수강 과정 목록
- `GET /api/auth/me`: 사용자 정보 확인

#### 네비게이션
- **입구**: 대시보드, 네비게이션 메뉴
- **출구**: `/course-detail.html?id={courseId}`, `/course-materials.html?id={courseId}`, `/browse-courses.html`

---

#### 2.4.2 과정 상세 페이지 (course-detail.html)

**Screen ID**: COURSE-002  
**화면명**: 개별 과정 상세 정보

#### 목적 / 역할
특정 과정의 상세 정보, 강의 목록, 학습 통계 제공

#### 주요 레이아웃
- **Course Header**: 과정 제목 + 강사 정보 + 메타데이터
- **Progress Section**: 전체 진도 + 완료 강의 수
- **Lecture List**: 강의 목록 (체크리스트 형태)
- **Course Info**: 과정 설명 + 학습 목표

#### 핵심 UI 컴포넌트
- `CourseHeader`: 과정 메타정보 표시
- `ProgressChart`: 원형 또는 바 형태 진도 차트
- `LectureItem`: 개별 강의 항목 (완료 체크표시)
- `EnrollButton`: 수강신청/학습시작 버튼

---

#### 2.4.3 과정 둘러보기 (browse-courses.html)

**Screen ID**: COURSE-003  
**화면명**: 전체 과정 탐색 및 수강신청

#### 목적 / 역할
이용 가능한 모든 과정 탐색 및 수강신청 기능

#### 주요 레이아웃
- **Filter Section**: 검색바 + 카테고리/난이도/가격 필터
- **Sort Options**: 인기순/최신순/가격순 정렬
- **Course Grid**: 과정 카드 그리드
- **Pagination**: 페이지 네비게이션

#### 핵심 UI 컴포넌트
- `SearchBar`: 실시간 검색 기능
- `FilterGroup`: 다중 필터 선택
- `CourseCard`: 과정 정보 + 가격 + 수강신청 버튼
- `PaginationControls`: 페이지 네비게이션

#### 주요 인터랙션 & 엣지케이스
- 실시간 검색 및 필터링
- 수강신청 API 연동
- 로딩 상태 관리
- 빈 검색 결과 처리

#### 데이터 소스 & API
- `GET /api/courses`: 전체 과정 목록
- `POST /api/courses/{id}/enroll`: 수강신청

---

### 2.5 문제 풀이 시스템

#### 2.5.1 문제 목록 페이지 (problems.html)

**Screen ID**: PROBLEM-001  
**화면명**: 문제 풀이 목록

#### 목적 / 역할
다양한 문제들을 탐색하고 풀이 상태 관리

#### 주요 레이아웃
- **Filter Section**: 난이도/카테고리/상태별 필터
- **Problem List**: 세로 나열된 문제 카드
- **Problem Card**: 문제 정보 + 상태 아이콘 + 점수

#### 핵심 UI 컴포넌트
- `FilterControls`: 드롭다운 필터 그룹
- `ProblemCard`: 문제 정보 표시 카드
- `StatusIcon`: 해결/시도/미시도 상태 아이콘
- `DifficultyBadge`: 난이도별 색상 배지

#### 주요 인터랙션 & 엣지케이스
- 필터 조합에 따른 실시간 목록 업데이트
- 상태별 아이콘 및 색상 구분
- 빈 필터 결과 처리
- 문제 클릭 시 상세 페이지 이동

#### 데이터 소스 & API
- `GET /api/problems`: 문제 목록 조회

---

#### 2.5.2 문제 상세 페이지 (problem-detail.html)

**Screen ID**: PROBLEM-002  
**화면명**: 개별 문제 풀이 환경

#### 목적 / 역할
Monaco Editor 기반 코드 작성 및 실행/제출 환경

#### 주요 레이아웃
- **Problem Info**: 문제 제목 + 설명 + 예제
- **Code Editor**: Monaco Editor (Python/JavaScript/Java/C++ 지원)
- **Test Panel**: 테스트 케이스 실행 결과
- **Action Buttons**: 실행/제출/초기화 버튼

#### 핵심 UI 컴포넌트
- `MonacoEditor`: VS Code 수준의 코드 에디터
- `LanguageSelector`: 프로그래밍 언어 선택
- `TestResultPanel`: 테스트 케이스 결과 표시
- `ExecutionControls`: 실행/제출 버튼 그룹

#### 주요 인터랙션 & 엣지케이스
- 언어별 코드 자동완성 및 문법 강조
- 실시간 코드 실행 및 결과 표시
- 테스트 케이스 성공/실패 시각화
- 제출 전 확인 다이얼로그

#### 데이터 소스 & API
- `GET /api/problems/{id}`: 문제 상세 정보
- `POST /api/solutions/run`: 코드 실행
- `POST /api/solutions`: 솔루션 제출

---

### 2.6 AI 시스템

#### 2.6.1 멘토 AI 관리 (mentors.html)

**Screen ID**: AI-001  
**화면명**: AI 멘토 관리 허브

#### 목적 / 역할
개인화된 AI 멘토 생성 및 관리

#### 주요 레이아웃
- **Page Header**: 제목 + 설명 + 새 멘토 생성 버튼
- **Tab Navigation**: 내 멘토/공개 멘토/인기 멘토 탭
- **Mentor Grid**: 멘토 카드 그리드 (320px 최소 너비)
- **Mentor Card**: 아바타 + 정보 + 평점 + 액션 버튼

#### 핵심 UI 컴포넌트
- `MentorCard`: 멘토 정보 카드
- `TabNavigation`: 멘토 카테고리 탭
- `PrivacyBadge`: 공개/비공개 상태 배지
- `RatingDisplay`: 별점 평가 표시

#### 주요 인터랙션 & 엣지케이스
- 탭 전환에 따른 멘토 목록 변경
- 공개 멘토 복사 기능
- 멘토 편집/대화하기 액션
- 빈 멘토 목록 처리

#### 네비게이션
- **출구**: `/create-mentor.html`, `/mentor-chat.html?id={mentorId}`, `/edit-mentor.html?id={mentorId}`

---

#### 2.6.2 멘토 대화 페이지 (mentor-chat.html)

**Screen ID**: AI-002  
**화면명**: AI 멘토와의 실시간 대화

#### 목적 / 역할
선택된 멘토와의 1:1 지능형 대화 환경

#### 주요 레이아웃
- **Mentor Header**: 멘토 정보 + 전문분야 + 평점
- **Chat Messages**: 대화 메시지 목록
- **Quick Actions**: 빠른 질문 버튼들
- **Input Area**: 메시지 입력창 + 전송 버튼

#### 핵심 UI 컴포넌트
- `ChatBubble`: 사용자/AI 메시지 버블
- `TypingIndicator`: AI 응답 생성 중 표시
- `QuickActionButton`: 자주 사용하는 질문 버튼
- `MessageInput`: 자동 리사이즈 텍스트 입력

#### 주요 인터랙션 & 엣지케이스
- 실시간 타이핑 애니메이션
- 키워드 기반 지능형 응답
- 대화 이력 로드 및 표시
- 네트워크 오류 시 재시도

#### 데이터 소스 & API
- `GET /api/mentors/{id}`: 멘토 정보
- `POST /api/mentors/{id}/chat`: 대화 전송

---

#### 2.6.3 강사 AI 페이지 (instructor-ai.html)

**Screen ID**: AI-003  
**화면명**: 강의 자료 기반 AI 도우미

#### 목적 / 역할
업로드된 강의 자료를 분석하여 개념 설명 및 Q&A 제공

#### 주요 레이아웃
- **Two-Column Layout**: 사이드바 (자료 목록) + 메인 (채팅)
- **Upload Section**: 드래그 앤 드롭 파일 업로드
- **Material List**: 업로드된 자료 목록
- **Chat Interface**: 강사 AI와의 대화창

#### 핵심 UI 컴포넌트
- `FileUploadArea`: 드래그 앤 드롭 업로드 영역
- `MaterialItem`: 자료 목록 아이템 (분석 상태 포함)
- `ChatInterface`: AI와의 실시간 대화
- `QuickActionButton`: 빠른 질문 템플릿

#### 주요 인터랙션 & 엣지케이스
- PDF/PPT/DOC 파일 업로드 및 분석
- 자료 선택에 따른 컨텍스트 변경
- 파일 분석 진행 상태 표시
- 업로드 실패 시 오류 처리

#### 데이터 소스 & API
- `POST /api/instructor-ai/materials/upload`: 자료 업로드
- `GET /api/instructor-ai/materials`: 자료 목록
- `POST /api/instructor-ai/chat`: AI 질문 응답

---

### 2.7 기타 주요 페이지

#### 2.7.1 토론 게시판 (discussions.html)

**Screen ID**: COMM-001  
**화면명**: 커뮤니티 토론 게시판

#### 목적 / 역할
학습자 간 질문, 토론, 정보 공유 공간

#### 주요 레이아웃
- **Filter Section**: 카테고리/상태별 필터 + 검색
- **New Post Button**: 새 글 작성 버튼
- **Discussion List**: 토론 목록 카드
- **New Post Modal**: 글 작성 모달

#### 핵심 UI 컴포넌트
- `DiscussionCard`: 토론 정보 카드
- `FilterControls`: 카테고리/상태 필터
- `NewPostModal`: 글 작성 모달
- `TagSystem`: 해시태그 시스템

---

#### 2.7.2 과제 관리 (assignments.html)

**Screen ID**: TASK-001  
**화면명**: 과제 제출 및 관리

#### 목적 / 역할
과제 현황 확인 및 제출 관리

#### 주요 레이아웃
- **Stats Header**: 과제 상태별 통계
- **Assignment List**: 과제 목록 테이블
- **Status Filter**: 대기/제출/채점/마감 필터

#### 핵심 UI 컴포넌트
- `AssignmentCard`: 과제 정보 카드
- `StatusBadge`: 과제 상태 배지
- `DeadlineCounter`: 마감일 카운트다운
- `SubmitButton`: 제출 버튼

---

#### 2.7.3 프로필 설정 (profile.html)

**Screen ID**: USER-001  
**화면명**: 사용자 프로필 관리

#### 목적 / 역할
개인정보 수정, 보안 설정, 환경 설정

#### 주요 레이아웃
- **Tab Navigation**: 개인정보/보안/환경설정/활동내역 탭
- **Profile Form**: 사용자 정보 수정 폼
- **Security Settings**: 비밀번호 변경, 로그인 내역
- **Preferences**: 알림 설정, 언어 설정

#### 핵심 UI 컴포넌트
- `ProfileForm`: 실시간 유효성 검사 폼
- `PasswordStrength`: 비밀번호 강도 미터
- `NotificationSettings`: 알림 on/off 토글
- `ActivityLog`: 활동 내역 목록

---

### 2.8 관리자 시스템

#### 2.8.1 관리자 대시보드 (admin-dashboard.html)

**Screen ID**: ADMIN-001  
**화면명**: 시스템 관리 대시보드

#### 목적 / 역할
시스템 전체 현황 모니터링 및 관리

#### 주요 레이아웃
- **Stats Overview**: 핵심 지표 카드 4개
- **Chart Section**: 사용자/과정/활동 차트
- **Recent Activity**: 최근 활동 목록
- **Quick Actions**: 빠른 관리 작업 버튼

#### 핵심 UI 컴포넌트
- `StatCard`: 통계 수치 카드
- `ChartWidget`: 차트 위젯 (Chart.js)
- `ActivityFeed`: 실시간 활동 피드
- `QuickActionButton`: 관리 작업 버튼

#### 권한 / 가드
- 관리자 권한 필수 (`userType: 'admin'`)

---

## 3. Global Elements

### 3.1 공통 레이아웃 구성요소

#### Navbar Component
- **구성**: 로고 + 네비게이션 링크 + 사용자 정보
- **반응형**: 모바일에서 햄버거 메뉴로 변환
- **상태**: 현재 페이지 하이라이트

#### Loading States
- **Spinner**: 중앙 정렬된 로딩 스피너
- **Skeleton**: 콘텐츠 로딩 중 스켈레톤 UI
- **Progress Bar**: 업로드/처리 진행률 표시

#### Error Handling
- **Alert System**: 성공/실패/경고 메시지
- **404 State**: 페이지/데이터 없음 상태
- **Network Error**: 네트워크 오류 처리

### 3.2 테마 및 디자인 시스템

#### Color Palette
- **Primary**: `#667eea` (보라-파랑 그라데이션)
- **Secondary**: `#764ba2`
- **Success**: `#48bb78`
- **Warning**: `#ed8936`
- **Error**: `#e53e3e`
- **Gray Scale**: `#4a5568`, `#718096`, `#a0aec0`

#### Typography
- **Font Family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Headers**: 700 weight, 다양한 크기 (1.3rem - 2.5rem)
- **Body**: 400 weight, 1rem, line-height 1.6

#### Components
- **Cards**: 15px border-radius, 반투명 배경, 그림자 효과
- **Buttons**: 그라데이션 배경, hover 애니메이션
- **Inputs**: 12px border-radius, 포커스 애니메이션

### 3.3 반응형 디자인

#### Breakpoints
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

#### Grid System
- **Desktop**: 3-4 컬럼 그리드
- **Tablet**: 2 컬럼 그리드
- **Mobile**: 1 컬럼 스택

## 4. Open Questions / Ambiguities

### 4.1 기술적 미해결 사항

1. **AI 시스템 연동**: Claude API 연동 오류로 실제 AI 기능 일부 작동 안함
2. **실시간 기능**: Socket.io 기반 실시간 알림 시스템 미구현
3. **파일 처리**: PDF 파싱 및 동영상 스트리밍 최적화 필요
4. **성능 최적화**: 대용량 데이터 처리 시 페이지네이션 및 가상화 필요

### 4.2 UX/UI 개선 사항

1. **접근성**: WCAG 2.1 AA 표준 준수 필요
2. **다국어**: i18n 시스템 구축 필요
3. **오프라인 모드**: PWA 기반 오프라인 학습 지원
4. **모바일 최적화**: 터치 인터페이스 및 제스처 지원

### 4.3 비즈니스 로직 명확화

1. **평가 시스템**: 자동 채점 알고리즘 정확도 개선
2. **권한 관리**: 세분화된 권한 체계 설계
3. **데이터 분석**: 학습 패턴 분석 및 개인화 추천 시스템
4. **결제 시스템**: 유료 과정 결제 및 구독 모델

### 4.4 확장성 고려사항

1. **마이크로서비스**: 단일 서버에서 마이크로서비스 아키텍처로 확장
2. **CDN**: 정적 자원 및 동영상 콘텐츠 CDN 적용
3. **캐싱**: Redis 기반 세션 및 데이터 캐싱
4. **모니터링**: APM 도구 및 로그 시스템 구축

---

*이 화면설계서는 2025년 5월 27일 기준으로 작성되었으며, 실제 구현된 기능을 바탕으로 상세 분석한 결과입니다.*