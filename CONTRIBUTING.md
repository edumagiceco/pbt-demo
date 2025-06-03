# 🤝 기여 가이드라인

PBT LMS 프로젝트에 기여해주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 설명합니다.

## 📋 기여 방법

### 1. 이슈 리포트
버그나 개선 사항을 발견하셨다면:
1. GitHub Issues에서 기존 이슈를 검색해보세요
2. 새로운 이슈를 생성하고 다음 정보를 포함해주세요:
   - 문제에 대한 명확한 설명
   - 재현 단계
   - 예상 결과와 실제 결과
   - 환경 정보 (OS, Node.js 버전 등)

### 2. 기능 제안
새로운 기능을 제안하고 싶으시다면:
1. GitHub Discussions에서 아이디어를 공유해주세요
2. 기능의 필요성과 구현 방법을 설명해주세요
3. 커뮤니티 피드백을 받은 후 이슈로 전환할 수 있습니다

### 3. 코드 기여

#### 개발 환경 설정
```bash
# 저장소 포크 및 클론
git clone https://github.com/YOUR_USERNAME/pbt-demo.git
cd pbt-demo

# 의존성 설치
npm install
cd client && npm install && cd ..

# 개발 서버 실행
npm run dev
```

#### 브랜치 전략
- `main`: 안정적인 릴리즈 버전
- `develop`: 개발 중인 기능들
- `feature/*`: 새로운 기능 개발
- `bugfix/*`: 버그 수정
- `hotfix/*`: 긴급 버그 수정

#### 커밋 컨벤션
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경 (포매팅, 세미콜론 등)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가 또는 수정
- `chore`: 빌드 과정 또는 도구 변경

**예시:**
```
feat(auth): add JWT token refresh functionality
fix(ui): resolve mobile navigation menu issue
docs(readme): update installation instructions
```

#### Pull Request 프로세스
1. 새로운 브랜치 생성: `git checkout -b feature/amazing-feature`
2. 변경사항 커밋: `git commit -m 'feat: add amazing feature'`
3. 브랜치 푸시: `git push origin feature/amazing-feature`
4. Pull Request 생성
5. 코드 리뷰 및 토론 진행
6. 승인 후 main 브랜치에 병합

## 📝 코딩 스타일

### JavaScript/Node.js
- ES6+ 문법 사용
- 2 spaces 들여쓰기
- 세미콜론 사용
- 의미있는 변수명 사용
- JSDoc 주석 권장

### React
- 함수형 컴포넌트 사용
- Hooks 적극 활용
- PropTypes 또는 TypeScript 타입 정의
- 컴포넌트는 PascalCase로 명명

### CSS/Styling
- Material-UI 우선 사용
- CSS-in-JS 방식 권장
- 반응형 디자인 고려

## 🧪 테스트

### 테스트 작성
- 새로운 기능에는 테스트 작성 필수
- Jest 및 React Testing Library 사용
- API 엔드포인트는 통합 테스트 작성

### 테스트 실행
```bash
# 전체 테스트 실행
npm test

# 특정 파일 테스트
npm test -- --testPathPattern=user.test.js

# 커버리지 확인
npm run test:coverage
```

## 📚 문서화

### 코드 문서화
- 공개 API는 JSDoc 주석 필수
- 복잡한 로직에는 인라인 주석 추가
- README.md 업데이트 필요 시 함께 수정

### API 문서화
- 새로운 API 엔드포인트는 Swagger 문서 업데이트
- 요청/응답 예시 포함
- 에러 케이스 문서화

## 🔍 코드 리뷰

### 리뷰어를 위한 가이드라인
- 기능적 정확성 확인
- 코드 스타일 및 컨벤션 준수 확인
- 성능 및 보안 고려사항 검토
- 테스트 커버리지 확인

### 기여자를 위한 가이드라인
- 작은 단위로 PR 분리
- 변경사항에 대한 명확한 설명
- 스크린샷이나 GIF 첨부 (UI 변경 시)
- 리뷰어 피드백에 적극적으로 응답

## 🐛 버그 리포트

### 버그 리포트 템플릿
```markdown
## 버그 설명
간결하고 명확한 버그 설명

## 재현 단계
1. 이동 '...'
2. 클릭 '....'
3. 스크롤 다운 '....'
4. 오류 확인

## 예상 결과
예상했던 결과 설명

## 실제 결과
실제로 발생한 결과 설명

## 스크린샷
해당되는 경우 스크린샷 첨부

## 환경
- OS: [예: macOS 12.0]
- Browser: [예: Chrome 95.0]
- Node.js: [예: 18.17.0]
- PBT LMS 버전: [예: 1.0.0]
```

## 💡 기능 요청

### 기능 요청 템플릿
```markdown
## 기능 설명
원하는 기능에 대한 명확하고 간결한 설명

## 문제 해결
이 기능이 해결하는 문제나 필요성 설명

## 제안하는 해결책
원하는 기능의 작동 방식 설명

## 대안
고려해본 다른 해결책이나 기능

## 추가 컨텍스트
기능 요청에 대한 추가 정보나 스크린샷
```

## 🏆 기여자 인정

- 모든 기여자는 README.md의 기여자 섹션에 추가됩니다
- 주요 기여자는 릴리즈 노트에서 특별히 감사 표시됩니다
- 정기적인 기여자는 프로젝트 메인테이너로 초대될 수 있습니다

## 📞 질문이나 도움이 필요하시다면

- GitHub Discussions에서 질문해주세요
- Issues에서 `question` 라벨을 사용해주세요
- 프로젝트 메인테이너에게 직접 연락하지 마시고 공개 채널을 이용해주세요

---

**감사합니다!** 🎉

여러분의 기여가 PBT LMS를 더 나은 교육 플랫폼으로 만들어갑니다.
