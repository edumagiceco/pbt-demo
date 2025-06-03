# 🔐 보안 설정 가이드

## 환경 변수 설정

PBT Demo 프로젝트는 보안을 위해 모든 민감한 정보를 환경 변수로 관리합니다.

### 1. 환경 파일 설정

1. `.env.example` 파일을 복사하여 `.env` 파일 생성:
```bash
cp .env.example .env
```

2. `.env` 파일을 열어서 실제 값들로 교체:

#### 필수 설정 항목:

**데이터베이스 설정:**
```env
DB_PASSWORD=your_actual_database_password
```

**JWT 보안 키:**
```env
JWT_SECRET=your_secure_jwt_secret_minimum_32_characters
SESSION_SECRET=your_secure_session_secret_minimum_32_characters
```

**Anthropic Claude API 키:**
```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 2. API 키 발급 방법

#### Anthropic Claude API
1. [Anthropic Console](https://console.anthropic.com/) 접속
2. 계정 생성 또는 로그인
3. API Keys 메뉴에서 새 키 생성
4. 생성된 키를 `.env` 파일의 `ANTHROPIC_API_KEY`에 입력

#### OpenAI API (선택사항)
1. [OpenAI Platform](https://platform.openai.com/) 접속
2. API Keys 메뉴에서 새 키 생성
3. 생성된 키를 `.env` 파일의 `OPENAI_API_KEY`에 입력

### 3. 보안 키 생성

#### JWT Secret 생성 (Node.js):
```javascript
require('crypto').randomBytes(64).toString('hex')
```

#### 터미널에서 생성:
```bash
openssl rand -base64 32
```

### 4. 중요 보안 규칙

🚨 **절대 하지 말 것:**
- API 키를 소스코드에 하드코딩
- .env 파일을 Git에 커밋
- API 키를 공개 저장소에 업로드
- API 키를 로그에 출력

✅ **반드시 지킬 것:**
- .env 파일은 .gitignore에 포함 (이미 설정됨)
- 프로덕션 환경에서는 환경 변수나 시크릿 매니저 사용
- API 키는 최소 권한만 부여
- 정기적으로 API 키 회전

### 5. GitHub 업로드 전 체크리스트

GitHub에 코드를 업로드하기 전 다음 사항을 확인하세요:

- [ ] `.env` 파일이 .gitignore에 포함되어 있는가?
- [ ] `.env` 파일에 실제 API 키가 없는가?
- [ ] `.env.example` 파일이 템플릿으로 포함되어 있는가?
- [ ] 소스코드에 하드코딩된 API 키가 없는가?

### 6. 실수로 API 키가 업로드된 경우 대처법

1. **즉시 API 키 무효화**:
   - Anthropic Console에서 해당 키 삭제
   - OpenAI Dashboard에서 해당 키 삭제

2. **Git 히스토리에서 제거**:
```bash
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all
git push origin --force --all
```

3. **새 API 키 발급** 및 로컬 .env 파일 업데이트

### 7. 프로덕션 환경 설정

프로덕션 환경에서는 다음과 같은 방법으로 환경 변수를 설정하세요:

#### Docker 환경:
```dockerfile
ENV ANTHROPIC_API_KEY=your_key_here
```

#### PM2 환경:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'pbt-demo',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
    }
  }]
}
```

#### 클라우드 환경:
- AWS: Systems Manager Parameter Store, Secrets Manager
- Google Cloud: Secret Manager
- Azure: Key Vault
- Heroku: Config Vars

### 8. 추가 보안 권장사항

1. **API 키 권한 최소화**: 필요한 권한만 부여
2. **IP 제한**: 가능한 경우 IP 화이트리스트 설정
3. **사용량 모니터링**: API 키 사용량 정기 모니터링
4. **키 회전**: 정기적으로 API 키 교체 (3-6개월)
5. **로깅 주의**: 로그에 민감한 정보 포함 금지

---

**📞 문의사항이 있으시면 프로젝트 이슈로 등록해 주세요.**
