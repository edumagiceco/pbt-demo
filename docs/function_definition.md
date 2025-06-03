# PBT LMS 플랫폼 기능정의서 (Function Definition Document)

## 📋 Document Overview

### 🎯 Product Mission
"문제 해결 중심의 실무 역량 강화를 통한 개인화된 학습 경험 제공"

### 🏗️ Functional Domains
| 도메인 | 기능 수 | 설명 |
|-------|--------|------|
| **Authentication** | 6 | 사용자 인증 및 계정 관리 |
| **User Management** | 8 | 사용자 프로필 및 권한 관리 |
| **Course Management** | 12 | 강의/과정 생성, 관리, 수강 |
| **Problem Solving** | 10 | 문제 출제, 풀이, 평가 시스템 |
| **Assignment System** | 8 | 과제 관리 및 제출 시스템 |
| **Discussion Forum** | 6 | 토론 게시판 및 Q&A |
| **Progress Tracking** | 5 | 학습 진도 추적 및 분석 |
| **AI Systems** | 15 | 운영 AI, 멘토 AI, 강사 AI |
| **Mandart System** | 9 | 목표 설정 및 관리 도구 |
| **Administration** | 12 | 관리자 도구 및 시스템 관리 |

### 📊 Domain Summary
- **총 기능 수**: 91개
- **핵심 도메인**: 10개
- **데이터 모델**: 25개
- **프론트엔드 페이지**: 40+개

---

## 🔐 Authentication Domain

### FN-001: 사용자 회원가입
• **Purpose**: 새로운 사용자 계정 생성 및 초기 설정  
• **Scope**: `/src/routes/auth.js`, `/public/register.html`  
• **Primary Actor**: 신규 사용자  
• **Triggers**: 회원가입 페이지 접속 및 폼 제출  
• **Inputs**: username (string), email (string), password (string), fullName (string), userType (enum)  
• **Processing Logic**:  
  1. 입력 데이터 유효성 검증 (express-validator)
  2. 중복 사용자명/이메일 확인
  3. 비밀번호 해시화 (bcrypt)
  4. 데이터베이스 사용자 생성
  5. JWT 토큰 생성 및 반환
• **Outputs**: JWT token, 사용자 기본 정보  
• **Business Rules**: 사용자명 3-50자, 이메일 형식 검증, 비밀번호 최소 6자  
• **Error Handling**: 중복 계정 오류, 유효성 검사 실패 처리  
• **Data Model Touchpoints**: User (CREATE)  
• **API Endpoints**: POST `/api/auth/register`  
• **Permissions**: 공개 접근  
• **Code Pointers**: `src/routes/auth.js:register`, `src/models/User.js`

### FN-002: 사용자 로그인
• **Purpose**: 기존 사용자 인증 및 세션 시작  
• **Scope**: `/src/routes/auth.js`, `/public/login.html`  
• **Primary Actor**: 등록된 사용자  
• **Triggers**: 로그인 폼 제출  
• **Inputs**: email/username (string), password (string)  
• **Processing Logic**:  
  1. 사용자명/이메일로 계정 조회
  2. 비밀번호 검증 (bcrypt.compare)
  3. 계정 활성 상태 확인
  4. 마지막 로그인 시간 업데이트
  5. JWT 토큰 생성
• **Outputs**: JWT token, 사용자 세션 정보  
• **Business Rules**: 비활성 계정 로그인 차단  
• **Error Handling**: 인증 실패, 비활성 계정 처리  
• **Data Model Touchpoints**: User (READ, UPDATE)  
• **API Endpoints**: POST `/api/auth/login`  
• **Permissions**: 공개 접근  
• **Code Pointers**: `src/routes/auth.js:login`, `src/models/User.js:validatePassword`

### FN-003: 현재 사용자 정보 조회
• **Purpose**: 로그인된 사용자의 프로필 정보 조회  
• **Scope**: `/src/routes/auth.js`  
• **Primary Actor**: 인증된 사용자  
• **Triggers**: 대시보드 로드, 프로필 페이지 접근  
• **Inputs**: JWT token (Authorization header)  
• **Processing Logic**:  
  1. JWT 토큰 검증 및 디코딩
  2. 사용자 ID로 프로필 조회
  3. 비밀번호 필드 제외한 정보 반환
• **Outputs**: 사용자 프로필 데이터 (비밀번호 제외)  
• **Business Rules**: 활성 사용자만 조회 가능  
• **Error Handling**: 토큰 무효화, 사용자 미존재 처리  
• **Data Model Touchpoints**: User (READ)  
• **API Endpoints**: GET `/api/auth/me`  
• **Permissions**: 인증 필요  
• **Code Pointers**: `src/routes/auth.js:me`

### FN-004: 자동 테스트 사용자 생성
• **Purpose**: 시스템 시작 시 개발/테스트용 사용자 자동 생성  
• **Scope**: `server.js:createTestUsers`  
• **Primary Actor**: 시스템  
• **Triggers**: 서버 시작 시 자동 실행  
• **Inputs**: 미리 정의된 테스트 계정 정보  
• **Processing Logic**:  
  1. 기존 테스트 계정 존재 여부 확인
  2. 없는 경우에만 새 계정 생성
  3. admin, instructor, student 유형별 계정 생성
• **Outputs**: 콘솔 로그 메시지  
• **Business Rules**: 중복 생성 방지  
• **Data Model Touchpoints**: User (FIND_OR_CREATE)  
• **Code Pointers**: `server.js:createTestUsers`

### FN-005: JWT 토큰 검증 미들웨어
• **Purpose**: API 요청 시 사용자 인증 상태 확인  
• **Scope**: `/src/middleware/auth.js`  
• **Primary Actor**: 시스템  
• **Triggers**: 보호된 API 엔드포인트 호출  
• **Inputs**: Authorization Bearer token  
• **Processing Logic**:  
  1. 헤더에서 토큰 추출
  2. JWT 서명 검증
  3. 토큰에서 사용자 정보 추출
  4. req.user에 사용자 정보 설정
• **Outputs**: req.user 객체 설정  
• **Error Handling**: 토큰 누락, 만료, 무효화 처리  
• **Code Pointers**: `src/middleware/auth.js`

### FN-006: 세션 관리
• **Purpose**: Express 세션 기반 상태 관리  
• **Scope**: `server.js:session`  
• **Primary Actor**: 시스템  
• **Triggers**: 클라이언트 요청 시 세션 확인  
• **Processing Logic**:  
  1. 세션 쿠키 확인 및 생성
  2. 24시간 만료 시간 설정
  3. 프로덕션 환경에서 secure 쿠키 사용
• **Business Rules**: 24시간 세션 유지, HttpOnly 쿠키  
• **Code Pointers**: `server.js:session configuration`

---

## 👥 User Management Domain

### FN-007: 사용자 프로필 조회
• **Purpose**: 개인 프로필 정보 상세 조회  
• **Scope**: `/src/routes/users.js`, `/public/profile.html`  
• **Primary Actor**: 인증된 사용자  
• **Triggers**: 프로필 페이지 접근  
• **Inputs**: 인증 토큰  
• **Processing Logic**:  
  1. 토큰에서 사용자 ID 추출
  2. 데이터베이스에서 프로필 정보 조회
  3. 비밀번호 필드 제외하고 반환
• **Outputs**: 사용자 프로필 전체 정보  
• **Data Model Touchpoints**: User (READ)  
• **API Endpoints**: GET `/api/users/profile`  
• **Permissions**: 본인 계정만 접근  
• **Code Pointers**: `src/routes/users.js:profile`

### FN-008: 사용자 프로필 수정
• **Purpose**: 개인 정보 업데이트 (이름, 이메일, 프로필 이미지)  
• **Scope**: `/src/routes/users.js`, `/public/profile.html`  
• **Primary Actor**: 인증된 사용자  
• **Triggers**: 프로필 수정 폼 제출  
• **Inputs**: email (string), fullName (string), profileImage (string)  
• **Processing Logic**:  
  1. 입력 데이터 유효성 검증
  2. 이메일 중복 확인 (본인 제외)
  3. 사용자 정보 업데이트
  4. 업데이트된 정보 반환
• **Outputs**: 수정된 사용자 정보  
• **Business Rules**: 이메일 중복 불가, 이름 최소 2자  
• **Error Handling**: 중복 이메일, 유효성 검사 실패  
• **Data Model Touchpoints**: User (UPDATE)  
• **API Endpoints**: PUT `/api/users/profile`  
• **Permissions**: 본인 계정만 수정  
• **Code Pointers**: `src/routes/users.js:updateProfile`

### FN-009: 비밀번호 변경
• **Purpose**: 사용자 계정 비밀번호 보안 업데이트  
• **Scope**: `/src/routes/users.js`  
• **Primary Actor**: 인증된 사용자  
• **Triggers**: 비밀번호 변경 폼 제출  
• **Inputs**: currentPassword (string), newPassword (string), confirmPassword (string)  
• **Processing Logic**:  
  1. 현재 비밀번호 확인
  2. 새 비밀번호 확인 검증
  3. 새 비밀번호 해시화
  4. 데이터베이스 업데이트
• **Outputs**: 성공 메시지  
• **Business Rules**: 새 비밀번호 최소 6자, 확인 비밀번호 일치  
• **Error Handling**: 현재 비밀번호 불일치, 유효성 검사 실패  
• **Data Model Touchpoints**: User (UPDATE)  
• **API Endpoints**: PUT `/api/users/password`  
• **Permissions**: 본인 계정만 수정  
• **Code Pointers**: `src/routes/users.js:changePassword`

### FN-010: 사용자 목록 조회 (관리자)
• **Purpose**: 시스템 관리자용 전체 사용자 목록 및 검색  
• **Scope**: `/src/routes/users.js`, `/public/admin-users.html`  
• **Primary Actor**: 관리자  
• **Triggers**: 관리자 대시보드에서 사용자 관리 접근  
• **Inputs**: page (number), limit (number), userType (enum), isActive (boolean)  
• **Processing Logic**:  
  1. 관리자 권한 확인
  2. 필터링 조건 적용 (유형, 활성 상태)
  3. 페이지네이션 처리
  4. 비밀번호 제외한 사용자 목록 조회
• **Outputs**: 사용자 목록, 페이지네이션 정보  
• **Business Rules**: 관리자만 접근 가능  
• **Error Handling**: 권한 부족 오류 처리  
• **Data Model Touchpoints**: User (READ)  
• **API Endpoints**: GET `/api/users`  
• **Permissions**: admin 권한 필수  
• **Code Pointers**: `src/routes/users.js:getUsers`

### FN-011: 사용자 상태 관리 (관리자)
• **Purpose**: 관리자가 사용자 계정 활성화/비활성화 제어  
• **Scope**: `/src/routes/users.js`  
• **Primary Actor**: 관리자  
• **Triggers**: 관리자 페이지에서 사용자 상태 변경  
• **Inputs**: userId (number), isActive (boolean)  
• **Processing Logic**:  
  1. 관리자 권한 확인
  2. 대상 사용자 존재 확인
  3. 활성 상태 업데이트
• **Outputs**: 상태 변경 확인 메시지  
• **Business Rules**: 관리자만 타인 계정 상태 변경 가능  
• **Error Handling**: 권한 부족, 사용자 미존재  
• **Data Model Touchpoints**: User (UPDATE)  
• **API Endpoints**: PUT `/api/users/:id/status`  
• **Permissions**: admin 권한 필수  
• **Code Pointers**: `src/routes/users.js:updateUserStatus`

### FN-012: 사용자 유형별 권한 관리
• **Purpose**: student, instructor, admin 권한 차등 적용  
• **Scope**: 전역 미들웨어, 각 라우트  
• **Primary Actor**: 시스템  
• **Triggers**: API 요청 시 권한 확인  
• **Processing Logic**:  
  1. JWT 토큰에서 userType 추출
  2. 요청 리소스별 필요 권한 확인
  3. 권한 부족 시 403 에러 반환
• **Business Rules**: admin > instructor > student 권한 계층  
• **Error Handling**: 권한 부족 시 접근 거부  
• **Code Pointers**: `src/middleware/auth.js`, 각 라우트 파일

### FN-013: 사용자 프로필 이미지 관리
• **Purpose**: 프로필 사진 업로드 및 관리  
• **Scope**: `/uploads/profiles/` 디렉터리  
• **Primary Actor**: 인증된 사용자  
• **Triggers**: 프로필 수정 시 이미지 업로드  
• **Processing Logic**:  
  1. 멀터 미들웨어로 파일 업로드 처리
  2. 이미지 파일 형식 검증
  3. 파일 경로 데이터베이스 저장
• **Business Rules**: 이미지 파일만 허용, 파일 크기 제한  
• **Data Model Touchpoints**: User (UPDATE)  
• **Code Pointers**: `src/middleware/upload.js`

### FN-014: 사용자 활동 이력 추적
• **Purpose**: 마지막 로그인, 가입일 등 활동 데이터 관리  
• **Scope**: User 모델  
• **Primary Actor**: 시스템  
• **Triggers**: 로그인, 주요 활동 시 자동 기록  
• **Processing Logic**:  
  1. 로그인 시 lastLogin 업데이트
  2. 계정 생성 시 createdAt 기록
• **Data Model Touchpoints**: User (UPDATE)  
• **Code Pointers**: `src/models/User.js`, `src/routes/auth.js`

---

## 📚 Course Management Domain

### FN-015: 과정 목록 조회
• **Purpose**: 사용자별 수강 과정 및 전체 과정 목록 제공  
• **Scope**: `/public/courses.html`, `/public/browse-courses.html`  
• **Primary Actor**: 학습자, 강사  
• **Triggers**: 대시보드에서 과정 메뉴 클릭  
• **Inputs**: 필터링 조건 (category, level, status)  
• **Processing Logic**:  
  1. 사용자 유형별 접근 권한 확인
  2. 수강 중인 과정 vs 전체 과정 구분
  3. 카테고리/난이도별 필터링 적용
  4. 진도율 계산 및 표시
• **Outputs**: 과정 목록, 진도 정보, 강사 정보  
• **Business Rules**: 공개 과정만 일반 사용자 조회 가능  
• **Data Model Touchpoints**: Course (READ), CourseEnrollment (READ)  
• **UX References**: `courses.html`, `browse-courses.html`  
• **Code Pointers**: Course 모델, CourseEnrollment 관계

### FN-016: 과정 상세 정보 조회
• **Purpose**: 개별 과정의 상세 정보, 강의 목록, 학습 통계 제공  
• **Scope**: `/public/course-detail.html`  
• **Primary Actor**: 학습자, 강사  
• **Triggers**: 과정 목록에서 특정 과정 클릭  
• **Inputs**: courseId (number)  
• **Processing Logic**:  
  1. 과정 기본 정보 조회
  2. 강의 목록 및 학습 자료 조회
  3. 수강 현황 및 진도율 계산
  4. 강사 정보 및 평점 표시
• **Outputs**: 과정 정보, 강의 목록, 진도 통계  
• **Business Rules**: 수강 신청한 과정만 상세 내용 접근  
• **Data Model Touchpoints**: Course (READ), Lecture (READ), CourseEnrollment (READ)  
• **UX References**: `course-detail.html`  
• **Acceptance Criteria**: 과정 정보 표시, 강의 목록 정렬, 진도율 시각화  

### FN-017: 과정 수강 신청
• **Purpose**: 학습자가 관심 있는 과정에 등록  
• **Scope**: `/public/browse-courses.html`  
• **Primary Actor**: 학습자  
• **Triggers**: 과정 둘러보기에서 수강신청 버튼 클릭  
• **Inputs**: courseId (number), userId (JWT에서 추출)  
• **Processing Logic**:  
  1. 사용자 인증 상태 확인
  2. 중복 수강신청 방지 확인
  3. 과정 최대 수강인원 확인
  4. CourseEnrollment 레코드 생성
  5. 과정의 enrollmentCount 증가
• **Outputs**: 수강신청 완료 메시지  
• **Business Rules**: 중복 신청 불가, 최대 인원 제한  
• **Error Handling**: 중복 신청, 인원 초과 처리  
• **Data Model Touchpoints**: CourseEnrollment (CREATE), Course (UPDATE)  
• **API Endpoints**: POST `/api/courses/:id/enroll`  
• **Permissions**: student, instructor 권한  
• **Code Pointers**: CourseEnrollment 모델

### FN-018: 과정 생성 및 관리 (강사)
• **Purpose**: 강사가 새로운 과정을 생성하고 관리  
• **Scope**: 강사 전용 과정 관리 페이지  
• **Primary Actor**: 강사, 관리자  
• **Triggers**: 강사 대시보드에서 과정 생성 메뉴  
• **Inputs**: title, description, category, level, price, requirements  
• **Processing Logic**:  
  1. 강사/관리자 권한 확인
  2. 과정 기본 정보 검증
  3. 커버 이미지 업로드 처리
  4. Course 레코드 생성
• **Outputs**: 생성된 과정 ID 및 정보  
• **Business Rules**: 강사만 자신의 과정 관리 가능  
• **Data Model Touchpoints**: Course (CREATE)  
• **Permissions**: instructor, admin 권한  
• **Code Pointers**: Course 모델

### FN-019: 강의 콘텐츠 관리
• **Purpose**: 과정 내 개별 강의 및 학습 자료 관리  
• **Scope**: `/public/lecture.html`, `/public/course-materials.html`  
• **Primary Actor**: 강사  
• **Triggers**: 과정 상세에서 강의 추가/편집  
• **Inputs**: title, content, videoUrl, materials, duration  
• **Processing Logic**:  
  1. 강의 기본 정보 저장
  2. 동영상 파일 업로드 처리
  3. 학습 자료 파일 업로드
  4. 강의 순서 및 구조 관리
• **Outputs**: 강의 목록, 학습 자료 목록  
• **Data Model Touchpoints**: Lecture (CRUD), CourseMaterial (CRUD)  
• **UX References**: `lecture.html`, `course-materials.html`  
• **Code Pointers**: Lecture 모델, CourseMaterial 모델

### FN-020: 수강생 진도 추적
• **Purpose**: 강사가 수강생들의 학습 진행 상황 모니터링  
• **Scope**: 강사 대시보드  
• **Primary Actor**: 강사  
• **Triggers**: 강사가 진도 관리 메뉴 접근  
• **Processing Logic**:  
  1. 과정별 수강생 목록 조회
  2. 개별 학습자 진도율 계산
  3. 완료/미완료 강의 통계
  4. 학습 시간 및 참여도 분석
• **Outputs**: 수강생별 진도 보고서  
• **Data Model Touchpoints**: CourseEnrollment (READ), Progress (READ)  
• **Code Pointers**: Progress 모델

### FN-021: 과정 평가 및 리뷰
• **Purpose**: 수강생이 완료한 과정에 대한 평가 제공  
• **Scope**: 과정 상세 페이지  
• **Primary Actor**: 수강 완료한 학습자  
• **Triggers**: 과정 완료 후 평가 요청  
• **Inputs**: rating (1-5), review (text)  
• **Processing Logic**:  
  1. 과정 완료 여부 확인
  2. 중복 평가 방지
  3. 평점 및 리뷰 저장
  4. 과정 평균 평점 재계산
• **Outputs**: 평가 완료 확인  
• **Business Rules**: 완료한 과정만 평가 가능  
• **Data Model Touchpoints**: Course (UPDATE)  

### FN-022: 과정 카테고리 관리
• **Purpose**: 과정 분류를 위한 카테고리 시스템 관리  
• **Scope**: 관리자 도구  
• **Primary Actor**: 관리자  
• **Processing Logic**:  
  1. 카테고리 생성/수정/삭제
  2. 계층적 카테고리 구조 지원
  3. 카테고리별 과정 수 통계
• **Data Model Touchpoints**: Course (READ/UPDATE)  
• **Code Pointers**: Course 모델의 category 필드

### FN-023: 과정 검색 및 필터링
• **Purpose**: 학습자가 원하는 과정을 쉽게 찾을 수 있도록 지원  
• **Scope**: `/public/browse-courses.html`  
• **Primary Actor**: 학습자  
• **Triggers**: 과정 둘러보기에서 검색/필터 사용  
• **Inputs**: keyword, category, level, price range  
• **Processing Logic**:  
  1. 제목/설명에서 키워드 검색
  2. 카테고리별 필터링
  3. 난이도별 필터링
  4. 가격 범위 필터링
  5. 정렬 옵션 적용 (인기순, 최신순, 평점순)
• **Outputs**: 필터링된 과정 목록  
• **UX References**: `browse-courses.html`  

### FN-024: 과정 통계 및 분석
• **Purpose**: 강사와 관리자를 위한 과정 성과 분석  
• **Scope**: `/public/admin-analytics.html`  
• **Primary Actor**: 강사, 관리자  
• **Processing Logic**:  
  1. 수강신청 추이 분석
  2. 완료율 통계
  3. 평균 학습 시간 계산
  4. 수익 분석 (유료 과정)
• **Outputs**: 통계 차트, 성과 지표  
• **UX References**: `admin-analytics.html`  

### FN-025: 과정 복사 및 템플릿
• **Purpose**: 기존 과정을 복사하여 새 과정 생성 효율화  
• **Scope**: 강사 도구  
• **Primary Actor**: 강사  
• **Processing Logic**:  
  1. 원본 과정 구조 복사
  2. 강의 내용 및 자료 복사
  3. 새 과정으로 ID 및 메타데이터 업데이트
• **Business Rules**: 본인 과정만 복사 가능  
• **Data Model Touchpoints**: Course (CREATE), Lecture (CREATE)

### FN-026: 과정 아카이브 및 백업
• **Purpose**: 완료되거나 비활성 과정의 보관 관리  
• **Scope**: 시스템 관리  
• **Primary Actor**: 관리자  
• **Processing Logic**:  
  1. 비활성 과정 식별
  2. 아카이브 상태로 변경
  3. 학습 데이터 보존
• **Data Model Touchpoints**: Course (UPDATE)  
• **Code Pointers**: Course 모델의 status 필드

---

## 🧩 Problem Solving Domain

### FN-027: 문제 목록 조회
• **Purpose**: 학습자가 풀 수 있는 프로그래밍 문제 목록 제공  
• **Scope**: `/public/problems.html`  
• **Primary Actor**: 학습자, 강사  
• **Triggers**: 대시보드에서 문제 풀이 메뉴 클릭  
• **Inputs**: 필터링 조건 (difficulty, category, status)  
• **Processing Logic**:  
  1. 활성 상태 문제만 표시
  2. 난이도별/카테고리별 필터링
  3. 사용자별 풀이 상태 확인
  4. 페이지네이션 적용
• **Outputs**: 문제 목록, 풀이 상태, 통계  
• **Business Rules**: 활성 문제만 학습자에게 표시  
• **Data Model Touchpoints**: Problem (READ), Solution (READ)  
• **UX References**: `problems.html`  
• **Code Pointers**: Problem 모델

### FN-028: 문제 상세 정보 및 풀이 환경
• **Purpose**: 개별 문제의 상세 정보와 코드 작성 환경 제공  
• **Scope**: `/public/problem-detail.html`  
• **Primary Actor**: 학습자  
• **Triggers**: 문제 목록에서 특정 문제 클릭  
• **Inputs**: problemId (number)  
• **Processing Logic**:  
  1. 문제 설명, 입출력 예제 조회
  2. Monaco Editor 코드 편집기 로드
  3. 언어별 템플릿 코드 제공
  4. 테스트케이스 실행 환경 준비
• **Outputs**: 문제 정보, 코드 편집기, 실행 결과  
• **Data Model Touchpoints**: Problem (READ), TestCase (READ)  
• **UX References**: `problem-detail.html`  
• **Dependencies**: Monaco Editor 라이브러리  
• **Code Pointers**: Problem 모델, TestCase 모델

### FN-029: 코드 실행 및 테스트
• **Purpose**: 사용자가 작성한 코드를 실시간으로 실행하고 테스트  
• **Scope**: `/public/problem-detail.html`  
• **Primary Actor**: 학습자  
• **Triggers**: 코드 에디터에서 실행 버튼 클릭  
• **Inputs**: code (string), language (string), input (string)  
• **Processing Logic**:  
  1. 지원 언어 확인 (Python, JavaScript, Java, C++)
  2. 코드 보안 검사 및 샌드박스 실행
  3. 테스트케이스 자동 실행
  4. 실행 시간 및 메모리 사용량 측정
  5. 결과 비교 및 점수 계산
• **Outputs**: 실행 결과, 통과/실패 테스트케이스, 성능 지표  
• **Business Rules**: 실행 시간 제한, 메모리 사용량 제한  
• **Error Handling**: 컴파일 오류, 런타임 오류, 시간 초과  
• **Performance Notes**: 샌드박스 환경에서 5초 내 실행 완료  
• **Code Pointers**: 코드 실행 서비스

### FN-030: 솔루션 제출 및 평가
• **Purpose**: 완성된 코드를 제출하고 자동 채점 받기  
• **Scope**: `/public/problem-detail.html`  
• **Primary Actor**: 학습자  
• **Triggers**: 문제 풀이 완료 후 제출 버튼 클릭  
• **Inputs**: problemId, code, language  
• **Processing Logic**:  
  1. 모든 테스트케이스 실행
  2. 히든 테스트케이스 포함 종합 평가
  3. 점수 계산 (정확성, 효율성)
  4. Solution 레코드 생성
  5. 사용자 통계 업데이트
• **Outputs**: 채점 결과, 획득 점수, 순위 정보  
• **Business Rules**: 제출 횟수 제한 없음, 최고 점수 기록  
• **Data Model Touchpoints**: Solution (CREATE), ProblemParticipant (UPDATE)  
• **Code Pointers**: Solution 모델

### FN-031: 문제 생성 및 관리 (강사)
• **Purpose**: 강사가 새로운 프로그래밍 문제를 출제하고 관리  
• **Scope**: 강사 전용 문제 관리 도구  
• **Primary Actor**: 강사, 관리자  
• **Triggers**: 강사 대시보드에서 문제 생성 메뉴  
• **Inputs**: title, description, difficulty, category, timeLimit  
• **Processing Logic**:  
  1. 문제 기본 정보 입력
  2. 입출력 예제 작성
  3. 테스트케이스 생성 (공개/히든)
  4. 정답 코드 검증
• **Outputs**: 생성된 문제 ID  
• **Business Rules**: 강사만 문제 출제 가능  
• **Data Model Touchpoints**: Problem (CREATE), TestCase (CREATE)  
• **Permissions**: instructor, admin 권한  
• **Code Pointers**: Problem 모델

### FN-032: 테스트케이스 관리
• **Purpose**: 문제별 입출력 테스트케이스 생성 및 관리  
• **Scope**: 문제 관리 도구  
• **Primary Actor**: 강사  
• **Triggers**: 문제 생성/편집 시 테스트케이스 설정  
• **Inputs**: input, expectedOutput, isHidden, points  
• **Processing Logic**:  
  1. 공개 테스트케이스 (예제용)
  2. 히든 테스트케이스 (채점용)
  3. 각 케이스별 배점 설정
  4. 정답 코드로 검증
• **Outputs**: 테스트케이스 목록  
• **Business Rules**: 최소 1개 공개, 5개 이상 히든 케이스  
• **Data Model Touchpoints**: TestCase (CRUD)  
• **Code Pointers**: TestCase 모델

### FN-033: 문제 풀이 통계 및 리더보드
• **Purpose**: 문제별 풀이 현황 및 사용자 순위 제공  
• **Scope**: `/public/problems.html`  
• **Primary Actor**: 학습자, 강사  
• **Triggers**: 문제 목록 조회 시 통계 표시  
• **Processing Logic**:  
  1. 문제별 해결률 계산
  2. 평균 시도 횟수 통계
  3. 상위 솔루션 순위
  4. 언어별 통계
• **Outputs**: 통계 차트, 리더보드  
• **Data Model Touchpoints**: Solution (READ), ProblemParticipant (READ)  
• **Code Pointers**: Solution 모델

### FN-034: 솔루션 히스토리 관리
• **Purpose**: 사용자별 문제 풀이 이력 및 진행 상황 추적  
• **Scope**: 개인 대시보드  
• **Primary Actor**: 학습자  
• **Processing Logic**:  
  1. 제출한 솔루션 이력 조회
  2. 문제별 최고 점수 기록
  3. 풀이 진행 상황 시각화
  4. 개선 필요 문제 식별
• **Outputs**: 풀이 이력, 성과 분석  
• **Data Model Touchpoints**: Solution (READ)  
• **Code Pointers**: Solution 모델

### FN-035: 문제 토론 및 힌트
• **Purpose**: 문제별 토론 게시판 및 힌트 제공  
• **Scope**: `/public/problem-detail.html`  
• **Primary Actor**: 학습자, 강사  
• **Processing Logic**:  
  1. 문제별 토론 스레드 생성
  2. 힌트 요청 및 제공
  3. 솔루션 아이디어 공유
• **Data Model Touchpoints**: Discussion (READ/CREATE)  
• **Code Pointers**: Discussion 모델

### FN-036: 문제 카테고리 및 태그 시스템
• **Purpose**: 문제 분류 및 검색 효율성 향상  
• **Scope**: 문제 관리 시스템  
• **Primary Actor**: 강사, 시스템  
• **Processing Logic**:  
  1. 알고리즘 유형별 카테고리
  2. 난이도별 분류
  3. 태그 기반 검색
• **Data Model Touchpoints**: Problem (READ/UPDATE)  
• **Code Pointers**: Problem 모델의 category 필드

---

## 🤖 AI Systems Domain

### FN-037: 운영 AI 챗봇 (PBT LMS 도우미)
• **Purpose**: PBT LMS 시스템 사용법 및 운영 관련 질문 답변  
• **Scope**: `/src/routes/chatbot.js`, 대시보드 AI 위젯  
• **Primary Actor**: 모든 사용자  
• **Triggers**: 대시보드에서 AI 도우미 아이콘 클릭  
• **Inputs**: message (string), conversation history (array)  
• **Processing Logic**:  
  1. Claude 3.5 Haiku 모델 사용
  2. PBT LMS 특화 지식베이스 참조
  3. 시스템 사용법, FAQ 기반 답변
  4. 이전 대화 컨텍스트 유지 (최근 10개)
  5. 한국어 친화적 응답 생성
• **Outputs**: AI 응답 메시지, 타임스탬프  
• **Business Rules**: 시스템 관련 질문만 처리  
• **Error Handling**: API 오류 시 대체 메시지 제공  
• **Data Model Touchpoints**: 없음 (상태비저장)  
• **API Endpoints**: POST `/api/chatbot/message`  
• **Permissions**: 공개 접근  
• **Performance Notes**: 3초 내 응답, 1024 토큰 제한  
• **Dependencies**: Anthropic Claude API  
• **Code Pointers**: `src/routes/chatbot.js`

### FN-038: 강사 AI 자료 분석 시스템
• **Purpose**: 업로드된 강의 자료 분석 및 개념 추출  
• **Scope**: `/src/routes/instructorAI.js`, `/public/instructor-ai.html`  
• **Primary Actor**: 강사  
• **Triggers**: 강의 자료 업로드 시 자동 분석  
• **Inputs**: 파일 (PDF, 문서), 자료 메타데이터  
• **Processing Logic**:  
  1. PDF 텍스트 추출 (pdf-parse)
  2. Claude 3.5 Sonnet으로 내용 분석
  3. 핵심 개념 및 키워드 추출
  4. 난이도 수준 판단
  5. 요약문 생성
  6. 분석 결과 데이터베이스 저장
• **Outputs**: 분석된 개념 목록, 요약, 난이도  
• **Business Rules**: 강사만 접근 가능  
• **Error Handling**: 파일 형식 오류, 분석 실패 처리  
• **Data Model Touchpoints**: LectureMaterial (CREATE/UPDATE), ConceptExplanation (CREATE)  
• **API Endpoints**: POST `/api/instructor-ai/materials/upload`  
• **Permissions**: instructor, admin 권한  
• **Performance Notes**: 분석 시간 30초 내  
• **Dependencies**: pdf-parse, Anthropic Claude API  
• **Code Pointers**: `src/controllers/instructorAiController.js`

### FN-039: 강사 AI 채팅 시스템
• **Purpose**: 강의 자료 기반 맞춤형 교육 설명 제공  
• **Scope**: `/public/instructor-ai.html`  
• **Primary Actor**: 강사, 학습자  
• **Triggers**: 강사 AI 채팅 인터페이스에서 질문 입력  
• **Inputs**: 질문 메시지, 관련 자료 ID, 세션 ID  
• **Processing Logic**:  
  1. 관련 강의 자료 내용 조회
  2. 자료 기반 컨텍스트 구성
  3. Claude 3.5 Sonnet으로 교육적 설명 생성
  4. 예제 및 실습 제안
  5. 대화 이력 저장
• **Outputs**: 교육적 설명, 예제, 추천 학습 방법  
• **Business Rules**: 분석된 자료가 있어야 상세 답변 가능  
• **Data Model Touchpoints**: InstructorChat (CREATE/UPDATE), LectureMaterial (READ)  
• **API Endpoints**: POST `/api/instructor-ai/chat`  
• **Permissions**: 인증 필요  
• **Code Pointers**: `src/controllers/instructorAiController.js:chat`

### FN-040: 강사 AI 개념 설명 기능
• **Purpose**: 특정 개념에 대한 상세하고 체계적인 설명 제공  
• **Scope**: `/src/routes/instructorAI.js`  
• **Primary Actor**: 강사, 학습자  
• **Triggers**: 개념 설명 요청 API 호출  
• **Inputs**: concept (string), difficulty (enum), context  
• **Processing Logic**:  
  1. 요청된 개념의 기본 정의
  2. 난이도별 설명 수준 조정
  3. 실제 예제 및 활용 사례
  4. 관련 개념 연결
  5. 학습 단계별 가이드
• **Outputs**: 구조화된 개념 설명, 예제  
• **Data Model Touchpoints**: ConceptExplanation (READ/CREATE)  
• **API Endpoints**: POST `/api/instructor-ai/explain`  
• **Code Pointers**: `src/controllers/instructorAiController.js:explainConcept`

### FN-041: 멘토 AI 생성 및 관리
• **Purpose**: 사용자가 맞춤형 AI 멘토를 생성하고 관리  
• **Scope**: `/public/create-mentor.html`, `/public/edit-mentor.html`  
• **Primary Actor**: 모든 사용자  
• **Triggers**: 멘토 생성/편집 페이지 접근  
• **Inputs**: 멘토 이름, 전문분야, 성격 설정, 지식 소스  
• **Processing Logic**:  
  1. 멘토 기본 정보 설정
  2. 지식 소스 업로드 (텍스트, PDF, 유튜브, 웹사이트)
  3. 멘토 성격 및 대화 스타일 설정
  4. 공개/비공개 설정
  5. 아바타 이미지 설정
• **Outputs**: 생성된 멘토 ID, 설정 확인  
• **Business Rules**: 사용자당 멘토 수 제한, 지식 용량 제한  
• **Data Model Touchpoints**: Mentor (CREATE/UPDATE), MentorKnowledge (CREATE)  
• **UX References**: `create-mentor.html`, `edit-mentor.html`  
• **Code Pointers**: Mentor 모델, MentorKnowledge 모델

### FN-042: 멘토 AI 채팅 시스템
• **Purpose**: 개인화된 멘토와 1:1 대화 및 상담  
• **Scope**: `/public/mentor-chat.html`  
• **Primary Actor**: 모든 사용자  
• **Triggers**: 멘토 목록에서 특정 멘토와 채팅 시작  
• **Inputs**: 멘토 ID, 사용자 메시지  
• **Processing Logic**:  
  1. 멘토 지식베이스 및 성격 설정 로드
  2. 사용자 질문 분석
  3. 멘토 특성에 맞는 답변 생성
  4. 대화 히스토리 관리
  5. 키워드 기반 지능형 응답
• **Outputs**: 멘토 응답, 관련 조언, 후속 질문 제안  
• **Business Rules**: 멘토별 대화 세션 분리 관리  
• **Data Model Touchpoints**: MentorConversation (CREATE/UPDATE), Mentor (READ)  
• **UX References**: `mentor-chat.html`  
• **Dependencies**: 멘토별 지식베이스  
• **Code Pointers**: MentorConversation 모델

### FN-043: 멘토 지식베이스 관리
• **Purpose**: 멘토 AI의 답변 품질을 위한 지식 데이터 관리  
• **Scope**: `/public/create-mentor.html`  
• **Primary Actor**: 멘토 생성자  
• **Triggers**: 멘토 생성/편집 시 지식 추가  
• **Inputs**: 지식 유형 (텍스트, PDF, 유튜브, 웹사이트), 소스 데이터  
• **Processing Logic**:  
  1. 텍스트: 직접 입력 및 저장
  2. PDF: 텍스트 추출 후 구조화
  3. 유튜브: 트랜스크립트 추출
  4. 웹사이트: 콘텐츠 크롤링
  5. 지식 중복 제거 및 품질 검증
• **Outputs**: 구조화된 지식 데이터  
• **Data Model Touchpoints**: MentorKnowledge (CREATE/UPDATE)  
• **Dependencies**: pdf-parse, youtube-transcript-api, cheerio  
• **Code Pointers**: MentorKnowledge 모델

### FN-044: 공개 멘토 시스템
• **Purpose**: 우수한 멘토를 커뮤니티와 공유하여 지식 확산  
• **Scope**: `/public/mentors.html`  
• **Primary Actor**: 모든 사용자  
• **Triggers**: 멘토 목록에서 공개 멘토 탭 클릭  
• **Processing Logic**:  
  1. 공개 설정된 멘토 목록 조회
  2. 평점 및 사용 통계 표시
  3. 카테고리별 필터링
  4. 인기도 기반 정렬
• **Outputs**: 공개 멘토 목록, 평점, 리뷰  
• **Data Model Touchpoints**: Mentor (READ), MentorRating (READ)  
• **UX References**: `mentors.html`  
• **Code Pointers**: Mentor 모델

### FN-045: 멘토 평가 및 리뷰 시스템
• **Purpose**: 멘토 AI의 품질 관리 및 사용자 피드백 수집  
• **Scope**: 멘토 채팅 완료 후 평가  
• **Primary Actor**: 멘토 사용자  
• **Triggers**: 멘토 대화 종료 후 평가 요청  
• **Inputs**: rating (1-5), review (text), 대화 품질 평가  
• **Processing Logic**:  
  1. 대화 만족도 평가
  2. 답변 정확성 및 유용성 측정
  3. 멘토 전체 평점 업데이트
  4. 리뷰 저장 및 관리
• **Outputs**: 평가 완료 확인  
• **Data Model Touchpoints**: MentorRating (CREATE), MentorConversation (UPDATE)  
• **Code Pointers**: MentorRating 모델

### FN-046: AI 시스템 모니터링 및 관리
• **Purpose**: AI 기능들의 성능 모니터링 및 시스템 관리  
• **Scope**: 관리자 도구  
• **Primary Actor**: 관리자  
• **Processing Logic**:  
  1. API 호출 통계 및 성능 측정
  2. 응답 품질 모니터링
  3. 토큰 사용량 추적
  4. 오류율 및 장애 대응
• **Outputs**: AI 시스템 대시보드, 성능 리포트  
• **Performance Notes**: 실시간 모니터링, 알림 시스템  

### FN-047: AI 프롬프트 최적화 시스템
• **Purpose**: AI 응답 품질 향상을 위한 프롬프트 관리  
• **Scope**: 시스템 설정  
• **Primary Actor**: 관리자, 시스템  
• **Processing Logic**:  
  1. 도메인별 프롬프트 템플릿 관리
  2. A/B 테스트를 통한 최적화
  3. 사용자 피드백 기반 개선
  4. 다국어 프롬프트 지원
• **Business Rules**: 프롬프트 버전 관리 및 롤백 지원  

### FN-048: AI 콘텐츠 필터링 및 안전성
• **Purpose**: AI 생성 컨텐츠의 안전성 및 품질 보장  
• **Scope**: 모든 AI 기능  
• **Primary Actor**: 시스템  
• **Processing Logic**:  
  1. 부적절한 콘텐츠 탐지
  2. 교육적 적절성 검증
  3. 편향성 및 차별 요소 제거
  4. 사실 검증 및 정확성 확인
• **Business Rules**: 교육 환경에 적합한 콘텐츠만 제공  

### FN-049: AI 학습 데이터 관리
• **Purpose**: AI 시스템 개선을 위한 학습 데이터 수집 및 관리  
• **Scope**: 데이터 관리 시스템  
• **Primary Actor**: 시스템, 관리자  
• **Processing Logic**:  
  1. 사용자 상호작용 데이터 수집
  2. 익명화 및 개인정보 보호
  3. 품질 좋은 대화 데이터 선별
  4. 모델 재학습용 데이터셋 구성
• **Business Rules**: 개인정보보호법 준수, 동의 기반 수집  

### FN-050: AI 기능 사용량 통계
• **Purpose**: AI 서비스별 사용 패턴 분석 및 최적화  
• **Scope**: 관리자 분석 도구  
• **Primary Actor**: 관리자  
• **Processing Logic**:  
  1. 기능별 사용 빈도 분석
  2. 사용자별 AI 활용 패턴
  3. 시간대별 부하 분석
  4. 비용 대비 효과 측정
• **Outputs**: 사용량 대시보드, 최적화 제안  

### FN-051: AI 응답 개인화 시스템
• **Purpose**: 사용자별 학습 이력 기반 맞춤형 AI 응답  
• **Scope**: 모든 AI 기능  
• **Primary Actor**: 시스템  
• **Processing Logic**:  
  1. 사용자 학습 수준 분석
  2. 선호 학습 스타일 파악
  3. 과거 질문 패턴 분석
  4. 개인화된 설명 방식 적용
• **Data Model Touchpoints**: User (READ), Progress (READ)  
• **Business Rules**: 개인정보 보호 하에서 개인화 제공

---

## 📝 Assignment System Domain

### FN-052: 과제 목록 조회
• **Purpose**: 학습자가 수강 중인 과정의 과제 목록 확인  
• **Scope**: `/public/assignments.html`  
• **Primary Actor**: 학습자  
• **Triggers**: 대시보드에서 과제 메뉴 클릭  
• **Inputs**: 필터링 조건 (status, dueDate, course)  
• **Processing Logic**:  
  1. 사용자 수강 과정별 과제 조회
  2. 과제 상태별 분류 (대기, 진행중, 완료, 지연)
  3. 마감일 기준 정렬
  4. 제출 현황 및 점수 표시
• **Outputs**: 과제 목록, 상태별 통계, 마감일 정보  
• **Data Model Touchpoints**: Assignment (READ), AssignmentSubmission (READ)  
• **UX References**: `assignments.html`  
• **Code Pointers**: Assignment 모델

### FN-053: 과제 상세 정보 조회
• **Purpose**: 개별 과제의 요구사항 및 제출 가이드 제공  
• **Scope**: `/public/assignment.html`  
• **Primary Actor**: 학습자  
• **Triggers**: 과제 목록에서 특정 과제 클릭  
• **Inputs**: assignmentId (number)  
• **Processing Logic**:  
  1. 과제 상세 요구사항 표시
  2. 제출 형식 및 마감일 안내
  3. 첨부 자료 다운로드 링크
  4. 이전 제출 이력 조회
• **Outputs**: 과제 상세 정보, 제출 가이드  
• **Data Model Touchpoints**: Assignment (READ), AssignmentSubmission (READ)  
• **UX References**: `assignment.html`  
• **Code Pointers**: Assignment 모델

### FN-054: 과제 제출 시스템
• **Purpose**: 학습자가 완성한 과제를 온라인으로 제출  
• **Scope**: `/public/assignment-submit.html`  
• **Primary Actor**: 학습자  
• **Triggers**: 과제 상세에서 제출 버튼 클릭  
• **Inputs**: 텍스트 내용, 첨부 파일, 제출 메모  
• **Processing Logic**:  
  1. 마감일 확인 및 제출 가능 여부 체크
  2. 파일 형식 및 크기 검증
  3. 제출 내용 저장
  4. 제출 확인 이메일 발송
  5. 제출 횟수 및 최종 제출 여부 관리
• **Outputs**: 제출 완료 확인, 제출번호  
• **Business Rules**: 마감일 이후 제출 불가, 파일 크기 제한  
• **Error Handling**: 파일 형식 오류, 마감일 초과  
• **Data Model Touchpoints**: AssignmentSubmission (CREATE)  
• **UX References**: `assignment-submit.html`  
• **Code Pointers**: AssignmentSubmission 모델

### FN-055: 과제 채점 및 피드백 (강사)
• **Purpose**: 강사가 제출된 과제를 채점하고 피드백 제공  
• **Scope**: 강사 전용 채점 도구  
• **Primary Actor**: 강사, 조교  
• **Triggers**: 과제 제출 완료 후 채점 대기열 확인  
• **Inputs**: 채점 기준, 점수, 피드백 내용  
• **Processing Logic**:  
  1. 제출된 과제 내용 검토
  2. 루브릭 기반 채점
  3. 상세 피드백 작성
  4. 점수 입력 및 저장
  5. 학습자에게 결과 알림
• **Outputs**: 채점 결과, 피드백 내용  
• **Business Rules**: 강사만 자신 과정 과제 채점 가능  
• **Data Model Touchpoints**: AssignmentSubmission (UPDATE)  
• **Permissions**: instructor, admin 권한  
• **Code Pointers**: AssignmentSubmission 모델

### FN-056: 과제 생성 및 관리 (강사)
• **Purpose**: 강사가 새로운 과제를 생성하고 관리  
• **Scope**: 강사 과제 관리 도구  
• **Primary Actor**: 강사  
• **Triggers**: 강사 대시보드에서 과제 생성 메뉴  
• **Inputs**: 과제명, 설명, 마감일, 배점, 제출 형식  
• **Processing Logic**:  
  1. 과제 기본 정보 설정
  2. 제출 요구사항 명시
  3. 채점 기준 및 루브릭 설정
  4. 마감일 및 알림 설정
  5. 첨부 자료 업로드
• **Outputs**: 생성된 과제 ID  
• **Data Model Touchpoints**: Assignment (CREATE)  
• **Permissions**: instructor, admin 권한  
• **Code Pointers**: Assignment 모델

### FN-057: 과제 제출 현황 모니터링
• **Purpose**: 강사가 과제별 제출 현황 및 통계 확인  
• **Scope**: 강사 대시보드  
• **Primary Actor**: 강사  
• **Processing Logic**:  
  1. 과제별 제출률 통계
  2. 미제출 학생 목록
  3. 채점 진행 현황
  4. 평균 점수 및 분포도
• **Outputs**: 제출 현황 대시보드, 통계 차트  
• **Data Model Touchpoints**: AssignmentSubmission (READ)  
• **Code Pointers**: AssignmentSubmission 모델

### FN-058: 과제 재제출 시스템
• **Purpose**: 학습자가 피드백 후 과제를 재제출할 수 있는 기능  
• **Scope**: `/public/assignment-submit.html`  
• **Primary Actor**: 학습자  
• **Processing Logic**:  
  1. 재제출 허용 여부 확인
  2. 이전 제출 내용 참조
  3. 개선된 내용으로 재제출
  4. 재제출 이력 관리
• **Business Rules**: 강사 설정에 따라 재제출 허용/불허  
• **Data Model Touchpoints**: AssignmentSubmission (CREATE)  
• **Code Pointers**: AssignmentSubmission 모델

### FN-059: 과제 템플릿 관리
• **Purpose**: 자주 사용하는 과제 유형을 템플릿으로 관리  
• **Scope**: 강사 도구  
• **Primary Actor**: 강사  
• **Processing Logic**:  
  1. 과제 템플릿 생성 및 저장
  2. 템플릿 기반 신규 과제 생성
  3. 템플릿 라이브러리 관리
• **Business Rules**: 강사별 개인 템플릿 관리  
• **Code Pointers**: Assignment 모델

---

## 💬 Discussion Forum Domain

### FN-060: 토론 게시판 목록 조회
• **Purpose**: 과정별/전체 토론 주제 목록 및 검색 기능  
• **Scope**: `/public/discussions.html`  
• **Primary Actor**: 모든 사용자  
• **Triggers**: 대시보드에서 토론 게시판 메뉴 클릭  
• **Inputs**: 검색어, 카테고리, 정렬 옵션  
• **Processing Logic**:  
  1. 카테고리별 토론 목록 조회 (질문, 토론, 공지, 팁)
  2. 제목/내용 기반 검색
  3. 최신순/인기순/댓글순 정렬
  4. 핀고정 글 우선 표시
• **Outputs**: 토론 목록, 메타정보 (조회수, 댓글수, 좋아요)  
• **Data Model Touchpoints**: Discussion (READ), Comment (COUNT)  
• **UX References**: `discussions.html`  
• **Code Pointers**: Discussion 모델

### FN-061: 새 토론 주제 작성
• **Purpose**: 사용자가 새로운 토론 주제나 질문을 게시  
• **Scope**: `/public/discussions.html` 내 작성 모달  
• **Primary Actor**: 인증된 사용자  
• **Triggers**: 토론 게시판에서 새 글 작성 버튼 클릭  
• **Inputs**: 제목, 카테고리, 내용, 태그  
• **Processing Logic**:  
  1. 입력 내용 유효성 검증
  2. 카테고리 분류 (질문/토론/공지/팁 공유)
  3. 태그 파싱 및 저장
  4. 마크다운 지원
  5. 작성자 정보 자동 설정
• **Outputs**: 생성된 토론 ID, 목록 페이지로 리다이렉트  
• **Business Rules**: 로그인 사용자만 작성 가능  
• **Data Model Touchpoints**: Discussion (CREATE)  
• **UX References**: `discussions.html`  
• **Code Pointers**: Discussion 모델

### FN-062: 토론 상세 내용 조회
• **Purpose**: 개별 토론의 상세 내용 및 댓글 스레드 표시  
• **Scope**: `/public/discussion-detail.html`  
• **Primary Actor**: 모든 사용자  
• **Triggers**: 토론 목록에서 특정 토론 클릭  
• **Inputs**: discussionId (number)  
• **Processing Logic**:  
  1. 토론 상세 정보 조회
  2. 조회수 자동 증가
  3. 댓글 목록 시간순 정렬
  4. 좋아요/싫어요 상태 표시
  5. 작성자 권한 확인 (수정/삭제 버튼)
• **Outputs**: 토론 상세 내용, 댓글 목록, 메타정보  
• **Data Model Touchpoints**: Discussion (READ/UPDATE), Comment (READ)  
• **UX References**: `discussion-detail.html`  
• **Code Pointers**: Discussion 모델, Comment 모델

### FN-063: 댓글 작성 및 관리
• **Purpose**: 토론에 대한 댓글 작성 및 답글 시스템  
• **Scope**: `/public/discussion-detail.html`  
• **Primary Actor**: 인증된 사용자  
• **Triggers**: 토론 상세에서 댓글 작성 폼 제출  
• **Inputs**: 댓글 내용, 부모 댓글 ID (답글인 경우)  
• **Processing Logic**:  
  1. 댓글 내용 검증 및 저장
  2. 계층형 답글 구조 지원
  3. 댓글 작성 시간 기록
  4. 토론 댓글 수 자동 증가
  5. 실시간 댓글 업데이트
• **Outputs**: 새 댓글 표시, 댓글 수 업데이트  
• **Business Rules**: 로그인 사용자만 댓글 작성  
• **Data Model Touchpoints**: Comment (CREATE), Discussion (UPDATE)  
• **UX References**: `discussion-detail.html`  
• **Code Pointers**: Comment 모델

### FN-064: 토론 좋아요/추천 시스템
• **Purpose**: 유용한 토론이나 댓글에 대한 추천 기능  
• **Scope**: `/public/discussion-detail.html`  
• **Primary Actor**: 인증된 사용자  
• **Triggers**: 좋아요 버튼 클릭  
• **Processing Logic**:  
  1. 사용자별 좋아요 중복 방지
  2. 좋아요 수 실시간 업데이트
  3. 취소 기능 지원
  4. 애니메이션 효과
• **Outputs**: 좋아요 수 변경, 버튼 상태 업데이트  
• **Data Model Touchpoints**: Discussion (UPDATE), Comment (UPDATE)  
• **UX References**: `discussion-detail.html`  
• **Code Pointers**: Discussion 모델

### FN-065: 토론 검색 및 필터링
• **Purpose**: 원하는 토론을 빠르게 찾을 수 있는 검색 기능  
• **Scope**: `/public/discussions.html`  
• **Primary Actor**: 모든 사용자  
• **Triggers**: 검색창에 키워드 입력  
• **Inputs**: 검색어, 카테고리 필터, 상태 필터  
• **Processing Logic**:  
  1. 제목/내용/태그에서 키워드 검색
  2. 정확한 매칭 및 유사 검색 지원
  3. 카테고리별 필터링
  4. 해결됨/미해결 상태 필터
• **Outputs**: 필터링된 토론 목록  
• **Code Pointers**: Discussion 모델

---

## 🎯 Mandart System Domain

### FN-066: 만다라트 목록 조회
• **Purpose**: 사용자가 생성한 만다라트 목표 관리 보드 목록  
• **Scope**: `/public/mandarts.html`  
• **Primary Actor**: 인증된 사용자  
• **Triggers**: 대시보드에서 만다라트 메뉴 클릭  
• **Processing Logic**:  
  1. 사용자별 만다라트 목록 조회
  2. 상태별 분류 (초안, 활성, 완료, 보관)
  3. 진행률 계산 및 표시
  4. 최근 수정일 기준 정렬
• **Outputs**: 만다라트 목록, 진행률, 상태 정보  
• **Data Model Touchpoints**: Mandart (READ)  
• **UX References**: `mandarts.html`  
• **Code Pointers**: Mandart 모델

### FN-067: 만다라트 생성 및 편집
• **Purpose**: 9x9 매트릭스 기반 목표 설정 도구 생성  
• **Scope**: `/public/mandart-editor.html`  
• **Primary Actor**: 인증된 사용자  
• **Triggers**: 만다라트 목록에서 새 만다라트 생성  
• **Inputs**: 중심 목표, 8개 세부 목표, 각 목표별 8개 실행 과제  
• **Processing Logic**:  
  1. 9x9 매트릭스 인터페이스 제공
  2. 중심 목표 설정 (중앙 셀)
  3. 8개 주변 목표 입력
  4. 각 목표별 8개 실행 과제 작성
  5. 실시간 저장 및 자동 백업
• **Outputs**: 완성된 만다라트 보드  
• **Data Model Touchpoints**: Mandart (CREATE/UPDATE), MandartGoal (CREATE), MandartTask (CREATE)  
• **UX References**: `mandart-editor.html`  
• **Code Pointers**: Mandart 모델, MandartGoal 모델, MandartTask 모델

### FN-068: 만다라트 상세 보기
• **Purpose**: 완성된 만다라트의 상세 내용 및 진행 상황 표시  
• **Scope**: `/public/mandart-detail.html`  
• **Primary Actor**: 만다라트 작성자  
• **Triggers**: 만다라트 목록에서 특정 항목 클릭  
• **Processing Logic**:  
  1. 9x9 매트릭스 시각화
  2. 목표별 완료 상태 표시
  3. 전체 진행률 계산
  4. 실행 과제별 체크리스트
• **Outputs**: 시각화된 만다라트, 진행률 차트  
• **Data Model Touchpoints**: Mandart (READ), MandartGoal (READ), MandartTask (READ)  
• **UX References**: `mandart-detail.html`  
• **Code Pointers**: Mandart 모델 관계

### FN-069: 만다라트 자동 생성 (AI 기반)
• **Purpose**: PDF 또는 유튜브 콘텐츠 기반 자동 만다라트 생성  
• **Scope**: `/public/mandart-generator.html`  
• **Primary Actor**: 인증된 사용자  
• **Triggers**: 만다라트 생성에서 AI 자동 생성 선택  
• **Inputs**: PDF 파일 또는 유튜브 URL  
• **Processing Logic**:  
  1. PDF 텍스트 추출 또는 유튜브 트랜스크립트 분석
  2. Claude AI로 핵심 목표 및 세부 목표 추출
  3. 실행 가능한 과제 자동 생성
  4. 9x9 매트릭스 자동 배치
  5. 사용자 검토 및 수정 기능
• **Outputs**: AI 생성 만다라트 초안  
• **Dependencies**: Claude AI API, pdf-parse, youtube-transcript  
• **Data Model Touchpoints**: Mandart (CREATE)  
• **UX References**: `mandart-generator.html`  
• **Code Pointers**: Mandart 모델

### FN-070: 만다라트 진행 추적
• **Purpose**: 목표별 실행 과제 완료 상태 관리 및 진행률 계산  
• **Scope**: `/public/mandart-detail.html`  
• **Primary Actor**: 만다라트 작성자  
• **Processing Logic**:  
  1. 실행 과제별 완료 체크
  2. 목표별 진행률 자동 계산
  3. 전체 만다라트 진행률 업데이트
  4. 진행 이력 기록
  5. 목표 달성 알림
• **Outputs**: 업데이트된 진행률, 완료 알림  
• **Data Model Touchpoints**: MandartTask (UPDATE), Mandart (UPDATE)  
• **Code Pointers**: MandartTask 모델

### FN-071: 만다라트 템플릿 시스템
• **Purpose**: 다양한 목적별 만다라트 템플릿 제공  
• **Scope**: `/public/mandart-editor.html`  
• **Primary Actor**: 인증된 사용자  
• **Processing Logic**:  
  1. 카테고리별 템플릿 제공 (학습, 사업, 건강, 취미)
  2. 템플릿 기반 빠른 만다라트 생성
  3. 커스터마이징 지원
  4. 사용자 정의 템플릿 저장
• **Outputs**: 템플릿 기반 만다라트 초안  
• **Data Model Touchpoints**: Mandart (CREATE)  
• **Code Pointers**: Mandart 모델

### FN-072: 만다라트 공유 및 협업
• **Purpose**: 만다라트를 다른 사용자와 공유하고 협업  
• **Scope**: 만다라트 상세 페이지  
• **Primary Actor**: 만다라트 작성자  
• **Processing Logic**:  
  1. 공개/비공개 설정
  2. 특정 사용자와 공유
  3. 공동 편집 권한 관리
  4. 댓글 및 피드백 기능
• **Business Rules**: 작성자만 공유 설정 변경 가능  
• **Data Model Touchpoints**: Mandart (UPDATE)  
• **Code Pointers**: Mandart 모델

### FN-073: 만다라트 통계 및 분석
• **Purpose**: 사용자의 목표 달성 패턴 및 성과 분석  
• **Scope**: 개인 대시보드  
• **Primary Actor**: 인증된 사용자  
• **Processing Logic**:  
  1. 완료율 통계 분석
  2. 목표 유형별 성과 비교
  3. 시간대별 진행 패턴
  4. 개선 제안 및 인사이트
• **Outputs**: 성과 대시보드, 분석 리포트  
• **Data Model Touchpoints**: Mandart (READ), MandartTask (READ)  
• **Code Pointers**: Mandart 모델

### FN-074: 만다라트 내보내기 및 백업
• **Purpose**: 만다라트를 다양한 형식으로 내보내기  
• **Scope**: 만다라트 상세 페이지  
• **Primary Actor**: 만다라트 작성자  
• **Processing Logic**:  
  1. PDF 형식 내보내기
  2. 이미지 형식 내보내기
  3. Excel 형식 내보내기
  4. JSON 백업 파일 생성
• **Outputs**: 내보내기 파일  
• **Code Pointers**: Mandart 모델

---

## 📊 Progress Tracking Domain

### FN-075: 개인 학습 진도 대시보드
• **Purpose**: 사용자별 전체 학습 현황 및 성과 시각화  
• **Scope**: `/public/progress.html`, `/public/dashboard.html`  
• **Primary Actor**: 학습자  
• **Triggers**: 대시보드 접속, 학습 진도 메뉴 클릭  
• **Processing Logic**:  
  1. 수강 과정별 진도율 계산
  2. 완료한 문제 수 및 해결률 통계
  3. 제출한 과제 현황
  4. 학습 시간 추적
  5. 성취 배지 및 마일스톤 표시
• **Outputs**: 진도 차트, 통계 카드, 성취 배지  
• **Data Model Touchpoints**: Progress (READ), CourseEnrollment (READ), Solution (READ)  
• **UX References**: `progress.html`, `dashboard.html`  
• **Code Pointers**: Progress 모델

### FN-076: 과정별 상세 진도 추적
• **Purpose**: 특정 과정 내 강의별 세부 진행 상황 관리  
• **Scope**: `/public/course-detail.html`  
• **Primary Actor**: 학습자  
• **Processing Logic**:  
  1. 강의별 시청 완료 상태
  2. 학습 자료 다운로드 이력
  3. 퀴즈 및 실습 완료 현황
  4. 예상 완료 시간 계산
• **Outputs**: 강의별 진도 표시, 다음 학습 추천  
• **Data Model Touchpoints**: Progress (READ/UPDATE), Lecture (READ)  
• **Code Pointers**: Progress 모델

### FN-077: 학습 시간 자동 추적
• **Purpose**: 사용자의 실제 학습 시간 측정 및 기록  
• **Scope**: 모든 학습 페이지  
• **Primary Actor**: 시스템  
• **Triggers**: 학습 페이지 접속/이탈 시 자동 기록  
• **Processing Logic**:  
  1. 페이지 활성 시간 측정
  2. 비활성 시간 제외 (10분 이상 미활동)
  3. 강의별/과정별 학습 시간 누적
  4. 일일/주간/월간 통계 생성
• **Outputs**: 학습 시간 통계, 패턴 분석  
• **Data Model Touchpoints**: Progress (UPDATE)  
• **Code Pointers**: Progress 모델

### FN-078: 성취도 분석 및 추천
• **Purpose**: 학습 패턴 분석을 통한 개인화된 학습 추천  
• **Scope**: 개인 대시보드  
• **Primary Actor**: 학습자  
• **Processing Logic**:  
  1. 강점/약점 영역 분석
  2. 학습 속도 및 패턴 파악
  3. 맞춤형 과정 추천
  4. 학습 목표 제안
• **Outputs**: 분석 리포트, 추천 과정 목록  
• **Data Model Touchpoints**: Progress (READ), Solution (READ)  
• **Code Pointers**: Progress 모델

### FN-079: 학습 목표 설정 및 관리
• **Purpose**: 개인별 학습 목표 설정 및 달성도 추적  
• **Scope**: 설정 페이지  
• **Primary Actor**: 학습자  
• **Processing Logic**:  
  1. 단기/장기 학습 목표 설정
  2. 목표 달성도 자동 계산
  3. 진행 상황 알림
  4. 목표 수정 및 관리
• **Outputs**: 목표 달성도, 진행 알림  
• **Data Model Touchpoints**: Progress (UPDATE)  
• **Code Pointers**: Progress 모델

---

## ⚙️ Administration Domain

### FN-080: 관리자 대시보드
• **Purpose**: 시스템 전체 현황 및 주요 지표 모니터링  
• **Scope**: `/public/admin-dashboard.html`  
• **Primary Actor**: 관리자  
• **Triggers**: 관리자 계정으로 로그인 후 대시보드 접근  
• **Processing Logic**:  
  1. 전체 사용자 수 및 활성 사용자 통계
  2. 과정 및 강의 현황
  3. 시스템 사용량 지표
  4. 최근 활동 로그
  5. 서버 상태 및 성능 지표
• **Outputs**: 관리자 대시보드, 실시간 통계  
• **Data Model Touchpoints**: User (READ), Course (READ), 시스템 로그  
• **UX References**: `admin-dashboard.html`  
• **Permissions**: admin 권한 필수  
• **Code Pointers**: 관리자 컨트롤러

### FN-081: 시스템 사용자 관리
• **Purpose**: 전체 사용자 계정 조회, 수정, 권한 관리  
• **Scope**: `/public/admin-users.html`  
• **Primary Actor**: 관리자  
• **Triggers**: 관리자 대시보드에서 사용자 관리 메뉴  
• **Processing Logic**:  
  1. 전체 사용자 목록 페이지네이션
  2. 사용자 유형별 필터링
  3. 계정 활성화/비활성화
  4. 권한 변경 (student ↔ instructor)
  5. 사용자 활동 이력 조회
• **Outputs**: 사용자 목록, 권한 변경 확인  
• **Data Model Touchpoints**: User (READ/UPDATE)  
• **UX References**: `admin-users.html`  
• **Permissions**: admin 권한 필수  
• **Code Pointers**: `src/routes/users.js`

### FN-082: 과정 및 콘텐츠 관리
• **Purpose**: 시스템 내 모든 과정 및 콘텐츠 통합 관리  
• **Scope**: `/public/admin-courses.html`  
• **Primary Actor**: 관리자  
• **Processing Logic**:  
  1. 전체 과정 목록 및 상태 관리
  2. 과정 승인/거부 처리
  3. 콘텐츠 품질 검토
  4. 강사별 과정 현황
  5. 인기 과정 및 성과 분석
• **Outputs**: 과정 목록, 승인 처리 결과  
• **Data Model Touchpoints**: Course (READ/UPDATE), Lecture (READ)  
• **UX References**: `admin-courses.html`  
• **Permissions**: admin 권한 필수  
• **Code Pointers**: Course 모델

### FN-083: 공지사항 관리
• **Purpose**: 시스템 공지사항 작성, 편집, 예약 게시 관리  
• **Scope**: `/public/admin-announcements.html`  
• **Primary Actor**: 관리자  
• **Processing Logic**:  
  1. 공지사항 작성 및 편집
  2. 예약 게시 설정
  3. 사용자 그룹별 타겟팅
  4. 긴급 공지 푸시 알림
  5. 공지사항 통계 및 효과 분석
• **Outputs**: 게시된 공지사항, 전송 결과  
• **Data Model Touchpoints**: Announcement (CRUD)  
• **UX References**: `admin-announcements.html`  
• **Permissions**: admin 권한 필수  

### FN-084: 시스템 분석 및 리포팅
• **Purpose**: 상세한 시스템 사용 통계 및 성과 분석 리포트  
• **Scope**: `/public/admin-analytics.html`  
• **Primary Actor**: 관리자  
• **Processing Logic**:  
  1. 사용자 활동 패턴 분석
  2. 과정별 수강 현황 및 완료율
  3. 문제 풀이 통계 및 난이도 분석
  4. 시스템 성능 및 응답 시간 분석
  5. 월간/분기별 성과 리포트 생성
• **Outputs**: 통계 대시보드, 분석 리포트, 차트  
• **Data Model Touchpoints**: 모든 모델 (READ)  
• **UX References**: `admin-analytics.html`  
• **Permissions**: admin 권한 필수  
• **Code Pointers**: 분석 서비스

### FN-085: 시스템 설정 관리
• **Purpose**: 시스템 전역 설정 및 환경 변수 관리  
• **Scope**: 관리자 도구  
• **Primary Actor**: 관리자  
• **Processing Logic**:  
  1. 시스템 설정값 조회/수정
  2. 기능 활성화/비활성화 토글
  3. 이메일 서버 설정
  4. 파일 업로드 제한 설정
  5. API 키 및 보안 설정
• **Outputs**: 설정 변경 확인  
• **Permissions**: admin 권한 필수  

### FN-086: 백업 및 복구 관리
• **Purpose**: 시스템 데이터 백업 및 복구 관리  
• **Scope**: 시스템 관리 도구  
• **Primary Actor**: 관리자  
• **Processing Logic**:  
  1. 자동 백업 스케줄 설정
  2. 수동 백업 실행
  3. 백업 파일 관리
  4. 복구 작업 실행
• **Outputs**: 백업 성공/실패 알림  
• **Permissions**: admin 권한 필수  

### FN-087: 로그 모니터링 및 감사
• **Purpose**: 시스템 로그 조회 및 보안 감사 기능  
• **Scope**: 관리자 도구  
• **Primary Actor**: 관리자  
• **Processing Logic**:  
  1. 시스템 오류 로그 조회
  2. 사용자 활동 로그 추적
  3. 보안 이벤트 모니터링
  4. 로그 분석 및 알림
• **Outputs**: 로그 대시보드, 보안 알림  
• **Permissions**: admin 권한 필수  

### FN-088: 사용자 지원 및 문의 관리
• **Purpose**: 사용자 문의 사항 및 지원 요청 관리  
• **Scope**: 관리자 도구  
• **Primary Actor**: 관리자  
• **Processing Logic**:  
  1. 사용자 문의 접수 및 관리
  2. 문의 유형별 분류
  3. 담당자 배정
  4. 응답 시간 추적
• **Outputs**: 문의 처리 현황, 응답 완료  
• **Permissions**: admin 권한 필수  

### FN-089: 시스템 상태 모니터링
• **Purpose**: 서버 및 데이터베이스 상태 실시간 모니터링  
• **Scope**: 관리자 대시보드  
• **Primary Actor**: 시스템, 관리자  
• **Processing Logic**:  
  1. 서버 CPU/메모리 사용률 모니터링
  2. 데이터베이스 연결 상태 확인
  3. API 응답 시간 측정
  4. 오류율 및 장애 감지
• **Outputs**: 시스템 상태 대시보드, 알림  
• **Performance Notes**: 5분 간격 헬스체크  

### FN-090: 권한 및 역할 관리
• **Purpose**: 세분화된 권한 체계 및 역할 기반 접근 제어  
• **Scope**: 전역 권한 시스템  
• **Primary Actor**: 관리자  
• **Processing Logic**:  
  1. 역할별 권한 매트릭스 관리
  2. 사용자별 역할 할당
  3. 기능별 접근 권한 제어
  4. 임시 권한 부여/회수
• **Outputs**: 권한 변경 확인, 접근 제어  
• **Business Rules**: 최소 권한 원칙 적용  
• **Code Pointers**: 권한 미들웨어

### FN-091: 데이터 내보내기 및 리포팅
• **Purpose**: 시스템 데이터 다양한 형식으로 내보내기  
• **Scope**: 관리자 도구  
• **Primary Actor**: 관리자  
• **Processing Logic**:  
  1. 사용자 데이터 CSV/Excel 내보내기
  2. 학습 통계 리포트 생성
  3. 과정 성과 분석 리포트
  4. 커스텀 쿼리 실행 및 결과 내보내기
• **Outputs**: 내보내기 파일, 분석 리포트  
• **Permissions**: admin 권한 필수

---

## 🔄 Cross-Cutting Features

### 전역 오류 처리 시스템
• **범위**: 모든 API 엔드포인트 및 프론트엔드  
• **기능**: 일관된 오류 응답 형식, 사용자 친화적 오류 메시지, 개발 환경에서 스택 트레이스 제공  
• **구현**: Express 오류 처리 미들웨어, 프론트엔드 전역 오류 핸들러  
• **Code Pointers**: `server.js:error handling middleware`

### 로깅 및 모니터링
• **범위**: 서버 전체  
• **기능**: 요청/응답 로깅(Morgan), 애플리케이션 로그(Winston), 성능 메트릭 수집  
• **구현**: `server.js`의 미들웨어 설정  
• **Code Pointers**: `server.js:morgan middleware`

### 보안 헤더 및 CORS
• **범위**: 모든 HTTP 응답  
• **기능**: Helmet.js를 통한 보안 헤더 설정, CORS 정책 관리, CSP 설정  
• **구현**: `server.js`의 helmet 및 cors 미들웨어  
• **Code Pointers**: `server.js:helmet configuration`

### 파일 업로드 관리
• **범위**: 모든 파일 업로드 기능  
• **기능**: Multer 기반 파일 처리, 파일 형식 검증, 저장소 관리  
• **구현**: `/uploads` 디렉터리, 업로드 미들웨어  
• **Code Pointers**: `src/middleware/upload.js`

### 세션 및 토큰 관리
• **범위**: 인증이 필요한 모든 기능  
• **기능**: JWT 토큰 생성/검증, Express 세션 관리, 토큰 갱신  
• **구현**: `src/middleware/auth.js`, 세션 설정  
• **Code Pointers**: `server.js:session configuration`

### 데이터 유효성 검증
• **범위**: 모든 입력 데이터  
• **기능**: express-validator 기반 서버사이드 검증, 프론트엔드 실시간 검증  
• **구현**: 각 라우트의 validation 미들웨어  
• **Code Pointers**: `src/routes/*.js:validation`

### 자동 테스트 사용자 생성
• **범위**: 시스템 초기화  
• **기능**: 개발/테스트 환경에서 기본 사용자 계정 자동 생성  
• **구현**: 서버 시작 시 자동 실행  
• **Code Pointers**: `server.js:createTestUsers`

---

## 📈 Data Flow Map (Textual)

### 사용자 인증 데이터 플로우
**클라이언트 인증 요청** → **라우터(auth.js)** → **사용자 검증** → **JWT 토큰 생성** → **응답 반환** → **클라이언트 토큰 저장** → **후속 API 요청 시 토큰 첨부** → **auth 미들웨어 검증** → **권한 기반 접근 제어**

### 학습 콘텐츠 데이터 플로우
**강사 과정 생성** → **Course 모델 저장** → **강의 업로드** → **Lecture 모델 저장** → **학습자 수강신청** → **CourseEnrollment 모델 저장** → **학습 진행** → **Progress 모델 업데이트** → **완료 처리**

### 문제 풀이 데이터 플로우
**강사 문제 출제** → **Problem 모델 저장** → **TestCase 모델 저장** → **학습자 문제 접근** → **코드 작성** → **실행 요청** → **코드 실행 엔진** → **결과 비교** → **Solution 모델 저장** → **점수 계산**

### AI 상호작용 데이터 플로우
**사용자 AI 질문** → **챗봇 라우터** → **컨텍스트 구성** → **Claude API 호출** → **응답 생성** → **응답 반환** → **클라이언트 표시** → **대화 이력 저장(선택적)**

### 파일 업로드 데이터 플로우
**클라이언트 파일 선택** → **Multer 미들웨어** → **파일 검증** → **로컬 저장소 저장** → **파일 경로 데이터베이스 저장** → **클라이언트 업로드 완료 응답**

### 관리자 모니터링 데이터 플로우
**시스템 활동 발생** → **로그 기록** → **통계 데이터 수집** → **관리자 대시보드 요청** → **집계 쿼리 실행** → **차트 데이터 생성** → **관리자 대시보드 표시**

---

## 📚 Glossary of Terms & Abbreviations

**PBT**: Problem-Based Training, 문제 해결 중심 훈련 방법론  
**LMS**: Learning Management System, 학습 관리 시스템  
**CRUD**: Create, Read, Update, Delete - 기본 데이터 조작 연산  
**JWT**: JSON Web Token, 웹 표준 인증 토큰  
**API**: Application Programming Interface, 응용 프로그램 인터페이스  
**CORS**: Cross-Origin Resource Sharing, 교차 출처 리소스 공유  
**CSP**: Content Security Policy, 콘텐츠 보안 정책  
**ORM**: Object-Relational Mapping, 객체-관계 매핑  
**WCAG**: Web Content Accessibility Guidelines, 웹 콘텐츠 접근성 지침  

**Claude**: Anthropic에서 개발한 대화형 AI 모델  
**Monaco Editor**: Microsoft의 VS Code 기반 웹 코드 에디터  
**Sequelize**: Node.js용 Promise 기반 ORM 라이브러리  
**Express**: Node.js 웹 애플리케이션 프레임워크  
**Multer**: Express용 multipart/form-data 처리 미들웨어  
**Helmet**: Express 보안 미들웨어  
**Morgan**: HTTP 요청 로거 미들웨어  
**bcrypt**: 비밀번호 해싱 라이브러리  

**Mandart**: 만다라트, 9x9 매트릭스 기반 목표 설정 및 관리 도구  
**멘토 AI**: 개인화된 학습 멘토 역할을 하는 AI 시스템  
**강사 AI**: 강의 자료 기반 교육적 설명을 제공하는 AI 시스템  
**운영 AI**: PBT LMS 시스템 사용법 및 운영 관련 질문에 답하는 AI 도우미  

**Route Handler**: 특정 HTTP 요청을 처리하는 함수  
**Middleware**: 요청-응답 사이클에서 실행되는 중간 처리 함수  
**Schema**: 데이터베이스 테이블 구조 정의  
**Migration**: 데이터베이스 스키마 변경 관리  
**Seed**: 초기 데이터 삽입  
**Validation**: 입력 데이터 유효성 검증  
**Sanitization**: 입력 데이터 정제  
**Rate Limiting**: API 요청 빈도 제한  

---

## ❓ Open Questions / Ambiguities

### 기술적 미해결 사항
1. **Claude AI API 연동 문제**: 
   - 강사 AI 시스템에서 응답 생성 실패 현상 발생
   - 원인: API 키 설정 오류 또는 프롬프트 최적화 필요
   - 해결방안: API 키 재설정, 프롬프트 엔지니어링 개선

2. **PDF 파싱 성능 이슈**:
   - 대용량 PDF 파일 처리 시 메모리 사용량 급증
   - 현재 동기식 처리로 인한 서버 블로킹 문제
   - 해결방안: 비동기 처리, 스트림 기반 파싱, 워커 스레드 활용

3. **실시간 채팅 확장성**:
   - 현재 폴링 방식으로 구현되어 서버 부하 증가
   - Socket.io 미구현으로 실시간성 부족
   - 해결방안: WebSocket 기반 실시간 통신 구현

4. **코드 실행 환경 보안**:
   - 사용자 코드 실행 시 보안 샌드박스 미완성
   - Docker 컨테이너 격리 환경 구축 필요
   - 해결방안: Docker 기반 코드 실행 환경 구축

### 사용자 경험 개선 필요사항
1. **모바일 최적화 부족**:
   - 현재 데스크톱 중심 UI로 모바일 사용성 저하
   - 터치 인터페이스 최적화 미흡
   - 해결방안: 반응형 디자인 강화, PWA 구현

2. **다국어 지원 미비**:
   - 한국어 중심 구현으로 글로벌 사용자 접근성 제한
   - i18n 시스템 미구현
   - 해결방안: react-i18next 도입, 다국어 콘텐츠 관리 시스템

3. **접근성 표준 준수**:
   - WCAG 2.1 AA 표준 준수 수준 미확인
   - 스크린 리더 지원 부족
   - 해결방안: 접근성 감사 도구 활용, ARIA 속성 보완

### 비즈니스 로직 명확화 필요
1. **과정 가격 정책**:
   - 무료/유료 과정 구분 기준 모호
   - 결제 시스템 연동 방안 미정의
   - 해결방안: 가격 정책 수립, 결제 게이트웨이 연동

2. **사용자 권한 체계**:
   - instructor와 admin 권한의 세부 차이점 불명확
   - 세분화된 권한 관리 시스템 필요
   - 해결방안: 역할 기반 접근 제어(RBAC) 구현

3. **콘텐츠 저작권 관리**:
   - 업로드된 강의 자료의 저작권 관리 정책 부재
   - 무단 복제 방지 메커니즘 필요
   - 해결방안: 저작권 정책 수립, DRM 시스템 검토

### 성능 및 확장성 고려사항
1. **데이터베이스 최적화**:
   - 대용량 데이터 처리를 위한 인덱싱 전략 필요
   - 쿼리 성능 최적화 미흡
   - 해결방안: 인덱스 전략 수립, 쿼리 최적화, 파티셔닝

2. **파일 저장소 확장성**:
   - 현재 로컬 파일 시스템 사용으로 확장성 제한
   - CDN 미사용으로 콘텐츠 전송 속도 저하
   - 해결방안: AWS S3 등 클라우드 스토리지 마이그레이션

3. **캐싱 전략**:
   - Redis 등 캐싱 시스템 미도입
   - API 응답 캐싱 부재
   - 해결방안: Redis 도입, API 응답 캐싱 구현

### 보안 강화 필요사항
1. **Rate Limiting**:
   - API 남용 방지를 위한 요청 제한 미구현
   - DDoS 공격 대응 방안 부족
   - 해결방안: express-rate-limit 도입, 계층별 제한 설정

2. **입력 검증 강화**:
   - XSS, SQL Injection 등 보안 취약점 점검 필요
   - 파일 업로드 보안 검증 미흡
   - 해결방안: 보안 감사 도구 활용, 입력 검증 강화

3. **로그 보안**:
   - 민감한 정보 로깅 방지 정책 필요
   - 로그 접근 권한 관리 미흡
   - 해결방안: 로그 마스킹 정책 수립, 보안 로그 관리

### 운영 및 유지보수 고려사항
1. **모니터링 시스템**:
   - 실시간 시스템 모니터링 도구 부족
   - 성능 지표 수집 및 분석 시스템 필요
   - 해결방안: Prometheus, Grafana 도입

2. **백업 및 복구**:
   - 자동화된 백업 시스템 미구현
   - 재해 복구 계획 부재
   - 해결방안: 자동 백업 스케줄링, DR 계획 수립

3. **CI/CD 파이프라인**:
   - 자동화된 배포 시스템 부재
   - 테스트 자동화 미흡
   - 해결방안: GitHub Actions 등 CI/CD 구축

---

**📝 문서 메타데이터**
- **문서 작성일**: 2025년 5월 27일
- **작성자**: PBT LMS 개발팀
- **문서 버전**: 1.0.0
- **마지막 업데이트**: 2025년 5월 27일
- **검토 상태**: 초안 완료
- **승인자**: 프로젝트 매니저 검토 대기

**📊 문서 통계**
- **총 기능 수**: 91개
- **도메인 수**: 10개
- **데이터 모델**: 25개
- **API 엔드포인트**: 50+개
- **프론트엔드 페이지**: 40+개
- **미해결 이슈**: 15개

**🔗 관련 문서**
- `docs/project_plan.md`: 프로젝트 전체 계획서
- `docs/user_manual.md`: 사용자 매뉴얼
- `docs/lms_analysis_improvement.md`: LMS 분석 및 개선방안
- `README.md`: 프로젝트 개요 및 설치 가이드

---

*이 문서는 PBT LMS 플랫폼의 모든 기능을 체계적으로 정의하여 개발팀, 기획팀, QA팀이 공통된 이해를 바탕으로 협업할 수 있도록 작성되었습니다.*
