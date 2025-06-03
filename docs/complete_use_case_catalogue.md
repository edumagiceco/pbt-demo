# Complete Use-Case Catalogue
## PBT (Problem-Based Training) LMS Platform

### Project Mission
**문제 해결 중심의 실무 역량 강화를 위한 통합 학습 관리 시스템**  
**AI 기반 개인화 학습과 협업 기능을 통한 차세대 교육 플랫폼 구현**

---

## 📊 Catalogue Overview

### Functional Domains Detected
| Domain | Use Cases Count | Core Functions |
|--------|----------------|----------------|
| **Authentication & User Management** | 12 | 로그인, 회원가입, 프로필 관리, 권한 제어 |
| **Course Management** | 15 | 과정 생성/관리, 수강신청, 진도 추적 |
| **Problem Solving System** | 11 | 문제 출제, 코드 실행, 자동 채점 |
| **Assignment Management** | 8 | 과제 관리, 제출, 채점, 피드백 |
| **AI-Powered Learning** | 18 | 멘토 AI, 강사 AI, 운영 챗봇 |
| **Mandart Goal Setting** | 9 | 만다라트 생성, 목표 관리, 진도 추적 |
| **Discussion & Community** | 7 | 토론 게시판, 댓글, Q&A |
| **Content Management** | 10 | 강의 자료, 학습 콘텐츠, 파일 관리 |
| **Progress Tracking** | 6 | 학습 진도, 통계, 분석 |
| **Administration** | 14 | 시스템 관리, 사용자 관리, 분석 |

**Total Functional Units**: **110 Use Cases**

---

## 🔐 Authentication & User Management Domain

### UC-001: User Registration
• **Primary Actor(s)** – Prospective students, instructors, administrators  
• **Goal / Summary** – Create new user account with role-based access permissions  
• **Scope** – Authentication System / User Management Module  
• **Trigger** – User clicks "회원가입" button on main page or login page  
• **Pre-conditions** – Valid email address, unique username, secure password  
• **Main Success Scenario** –  
  1. User navigates to `/register.html`  
  2. System displays registration form with validation  
  3. User fills required fields (username, email, password, fullName, userType)  
  4. System validates input data using express-validator  
  5. System checks for duplicate username/email in database  
  6. System creates new User record with bcrypt-hashed password  
  7. System generates JWT token for automatic login  
  8. System redirects to dashboard based on user type  
• **Alternate / Exceptional Flows** –  
  - Username/email already exists → Show error message  
  - Invalid email format → Show validation error  
  - Password too weak → Show strength requirements  
• **Post-conditions** – User account created, JWT token issued, login session established  
• **Business Rules & Validations** –  
  - Username: 3-50 alphanumeric characters, unique  
  - Password: minimum 6 characters  
  - Email: valid format, unique  
  - UserType: enum (student, instructor, admin)  
• **Data Touched** – User table (CREATE)  
• **Permissions / Security** – Open access, rate limiting applied  
• **Non-Functional Notes** – bcrypt salt rounds=10, JWT expires per env config  
• **Related Screens & Components** – register.html, login.html  
• **Code Pointers** – `/src/routes/auth.js:router.post('/register')`, `/src/models/User.js`

### UC-002: User Login
• **Primary Actor(s)** – Registered users (students, instructors, administrators)  
• **Goal / Summary** – Authenticate user credentials and establish session  
• **Scope** – Authentication System  
• **Trigger** – User clicks "로그인" button or accesses protected resource  
• **Pre-conditions** – Valid user account exists, correct credentials  
• **Main Success Scenario** –  
  1. User navigates to `/login.html`  
  2. System displays login form  
  3. User enters email/username and password  
  4. System validates input format  
  5. System queries User table for matching account  
  6. System verifies password using bcrypt.compare()  
  7. System checks isActive status  
  8. System updates lastLogin timestamp  
  9. System generates JWT token with user info  
  10. System redirects to role-appropriate dashboard  
• **Alternate / Exceptional Flows** –  
  - Invalid credentials → Show generic error message  
  - Account deactivated → Show account status message  
  - Network error → Show retry option  
• **Post-conditions** – User authenticated, JWT token issued, session established  
• **Business Rules & Validations** –  
  - Accept either username or email for login  
  - Account must be active (isActive=true)  
  - Password verification required  
• **Data Touched** – User table (READ, UPDATE lastLogin)  
• **Permissions / Security** – Open access, rate limiting, password complexity  
• **Non-Functional Notes** – JWT expiration configurable, secure session handling  
• **Related Screens & Components** – login.html, dashboard.html  
• **Code Pointers** – `/src/routes/auth.js:router.post('/login')`, `/src/models/User.js:validatePassword`

### UC-003: User Profile Management
• **Primary Actor(s)** – Authenticated users  
• **Goal / Summary** – View and update personal profile information  
• **Scope** – User Management Module  
• **Trigger** – User clicks profile menu or navigates to `/profile.html`  
• **Pre-conditions** – User must be logged in with valid JWT token  
• **Main Success Scenario** –  
  1. User accesses profile page  
  2. System validates JWT token  
  3. System retrieves current user data  
  4. System displays profile form with existing data  
  5. User modifies allowed fields (fullName, profileImage, etc.)  
  6. System validates updated information  
  7. System updates User record  
  8. System shows success confirmation  
• **Alternate / Exceptional Flows** –  
  - Invalid token → Redirect to login  
  - Validation errors → Show field-specific messages  
  - Profile image upload fails → Show error, keep other changes  
• **Post-conditions** – User profile updated, changes reflected across system  
• **Business Rules & Validations** –  
  - Cannot change username, email, userType after creation  
  - Profile image size/format restrictions apply  
  - Full name minimum 2 characters  
• **Data Touched** – User table (READ, UPDATE)  
• **Permissions / Security** – User can only edit own profile  
• **Non-Functional Notes** – Image upload handling, file size limits  
• **Related Screens & Components** – profile.html, dashboard header  
• **Code Pointers** – `/src/routes/users.js`, `/src/middleware/auth.js`

### UC-004: Current User Info Retrieval
• **Primary Actor(s)** – Authenticated frontend applications  
• **Goal / Summary** – Get current user's profile information for UI display  
• **Scope** – User Management API  
• **Trigger** – Frontend needs user info for navigation, profile display  
• **Pre-conditions** – Valid JWT token, active user account  
• **Main Success Scenario** –  
  1. Frontend makes GET request to `/api/auth/me`  
  2. System validates JWT token  
  3. System retrieves user record by ID from token  
  4. System returns user data (excludes password)  
  5. Frontend updates UI with user information  
• **Alternate / Exceptional Flows** –  
  - Invalid token → Return 401 error  
  - User not found → Return 401 error  
  - User inactive → Return 401 error  
• **Post-conditions** – User information displayed in frontend  
• **Business Rules & Validations** –  
  - Password field excluded from response  
  - Only active users can retrieve info  
  - Token must be valid and current  
• **Data Touched** – User table (READ by primary key)  
• **Permissions / Security** – User can only access own information  
• **Non-Functional Notes** – Frequently called, consider caching  
• **Related Screens & Components** – Dashboard header, navigation bar  
• **Code Pointers** – `/src/routes/auth.js:router.get('/me')`

---

