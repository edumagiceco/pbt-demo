# PBT LMS Docker 배포 가이드

## 📋 개요

이 가이드는 PBT(Problem-Based Training) LMS 플랫폼을 Docker Compose를 사용하여 배포하는 방법을 설명합니다.

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────┐
│     Nginx       │───▶│   Node.js    │───▶│   MySQL     │
│  (리버스 프록시)  │    │   Express    │    │ (데이터베이스) │
└─────────────────┘    └──────────────┘    └─────────────┘
                              │
                       ┌──────────────┐
                       │    Redis     │
                       │   (캐시)     │
                       └──────────────┘
```

## 🚀 빠른 시작

### 1. 개발 환경 실행

```bash
# 관리 스크립트 사용 (권장)
./scripts/docker-manager.sh dev -d

# 또는 직접 실행
docker-compose -f docker-compose.dev.yml up -d
```

### 2. 프로덕션 환경 실행

```bash
# 관리 스크립트 사용 (권장)
./scripts/docker-manager.sh prod -d

# 또는 직접 실행
docker-compose -f docker-compose.prod.yml up -d
```

### 3. 서비스 접속

- **메인 애플리케이션**: http://localhost:3000
- **데이터베이스 관리(Adminer)**: http://localhost:8080
- **메일 서버(MailHog, 개발용)**: http://localhost:8025

## 📦 포함된 서비스

### 개발 환경 (docker-compose.dev.yml)
- **app**: Node.js 애플리케이션 (포트 3000, 9229)
- **mysql**: MySQL 8.0 데이터베이스 (포트 3306)
- **redis**: Redis 캐시 서버 (포트 6379)
- **adminer**: 데이터베이스 관리 도구 (포트 8080)
- **mailhog**: 개발용 메일 서버 (포트 1025, 8025)

### 프로덕션 환경 (docker-compose.prod.yml)
- **app**: Node.js 애플리케이션 (내부 포트 3000)
- **mysql**: MySQL 8.0 데이터베이스 (로컬호스트만 접근)
- **redis**: Redis 캐시 서버 (로컬호스트만 접근)
- **nginx**: 리버스 프록시 및 로드 밸런서 (포트 80, 443)
- **filebeat**: 로그 수집기
- **node-exporter**: 시스템 모니터링

## 🛠️ 관리 명령어

### Docker Manager 스크립트 사용

```bash
# 도움말 보기
./scripts/docker-manager.sh help

# 개발 환경 시작
./scripts/docker-manager.sh dev -d

# 프로덕션 환경 시작
./scripts/docker-manager.sh prod -d

# 서비스 중지
./scripts/docker-manager.sh stop

# 서비스 재시작
./scripts/docker-manager.sh restart

# 로그 보기
./scripts/docker-manager.sh logs
./scripts/docker-manager.sh logs app  # 특정 서비스 로그

# 애플리케이션 쉘 접속
./scripts/docker-manager.sh shell

# 데이터베이스 접속
./scripts/docker-manager.sh db

# 데이터베이스 백업
./scripts/docker-manager.sh backup

# 데이터베이스 복원
./scripts/docker-manager.sh restore backup_20250528_140000.sql

# 서비스 상태 확인
./scripts/docker-manager.sh status

# 이미지 재빌드
./scripts/docker-manager.sh build

# 사용하지 않는 리소스 정리
./scripts/docker-manager.sh clean
```

### 직접 Docker Compose 명령어 사용

```bash
# 개발 환경
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml logs -f

# 프로덕션 환경
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml logs -f

# 이미지 빌드
docker-compose -f docker-compose.dev.yml build --no-cache

# 서비스 스케일링
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

## 🔧 설정 파일

### 환경 변수
- `.env`: 로컬 개발용
- `.env.docker`: Docker 환경용

### Docker 설정
- `Dockerfile`: Node.js 애플리케이션 이미지 빌드
- `.dockerignore`: Docker 빌드 시 제외할 파일

### 서비스별 설정
- `nginx/`: Nginx 설정 파일
- `mysql/`: MySQL 설정 파일
- `redis/`: Redis 설정 파일

## 💾 데이터 볼륨

### 개발 환경
- `mysql_data_dev`: MySQL 데이터
- `redis_data_dev`: Redis 데이터

### 프로덕션 환경
- `mysql_data_prod`: MySQL 데이터 (/var/lib/pbt-lms/mysql)
- `redis_data_prod`: Redis 데이터 (/var/lib/pbt-lms/redis)
- `nginx_cache`: Nginx 캐시

## 🔐 보안 설정

### 프로덕션 환경 보안 강화
- MySQL, Redis는 외부 접근 차단 (127.0.0.1만 허용)
- Nginx를 통한 리버스 프록시
- Rate limiting 적용
- 보안 헤더 설정
- SSL/TLS 인증서 지원

### 변경해야 할 보안 설정
1. **MySQL 루트 비밀번호 변경**
   ```yaml
   MYSQL_ROOT_PASSWORD: "새로운_강력한_비밀번호"
   ```

2. **JWT 시크릿 변경**
   ```yaml
   JWT_SECRET: "새로운_JWT_시크릿_키"
   ```

3. **Redis 비밀번호 설정** (선택사항)
   ```conf
   requirepass your_redis_password_here
   ```

## 📊 모니터링

### 헬스체크
모든 서비스에 헬스체크가 구성되어 있습니다:
```bash
# 서비스 상태 확인
docker-compose ps
```

### 로그 관리
```bash
# 실시간 로그 보기
docker-compose logs -f app

# 로그 파일 위치
./logs/app.log
```

### 메트릭스 (프로덕션)
- **Node Exporter**: http://localhost:9100/metrics
- **애플리케이션 메트릭스**: http://localhost:3000/metrics

## 🔄 백업 및 복원

### 자동 백업
```bash
# 데이터베이스 백업
./scripts/docker-manager.sh backup
```

### 수동 백업
```bash
# MySQL 백업
docker exec pbt-lms-mysql-prod mysqldump -u magic7 -p magic7 > backup.sql

# Redis 백업
docker exec pbt-lms-redis-prod redis-cli BGSAVE
```

### 복원
```bash
# 데이터베이스 복원
./scripts/docker-manager.sh restore backup_20250528_140000.sql
```

## 🚨 문제 해결

### 일반적인 문제

1. **포트 충돌**
   ```bash
   # 사용 중인 포트 확인
   lsof -i :3000
   ```

2. **권한 문제**
   ```bash
   # uploads 디렉터리 권한 설정
   chmod -R 755 uploads tmp
   ```

3. **메모리 부족**
   ```bash
   # Docker 메모리 사용량 확인
   docker stats
   ```

4. **데이터베이스 연결 실패**
   ```bash
   # MySQL 로그 확인
   docker-compose logs mysql
   ```

### 로그 확인
```bash
# 모든 서비스 로그
./scripts/docker-manager.sh logs

# 특정 서비스 로그
./scripts/docker-manager.sh logs app
./scripts/docker-manager.sh logs mysql
```

## 🚀 배포 체크리스트

### 프로덕션 배포 전 확인사항
- [ ] 환경 변수 설정 완료
- [ ] 보안 설정 변경 (비밀번호, 시크릿 키)
- [ ] SSL 인증서 설정 (HTTPS 사용 시)
- [ ] 도메인 및 DNS 설정
- [ ] 방화벽 설정
- [ ] 백업 시스템 구성
- [ ] 모니터링 시스템 연동
- [ ] 로그 수집 시스템 설정

### 성능 최적화
- [ ] MySQL 설정 튜닝
- [ ] Redis 메모리 설정
- [ ] Nginx 캐싱 설정
- [ ] 애플리케이션 리소스 제한 설정

## 📞 지원

문제가 발생하거나 추가 도움이 필요한 경우:
1. 로그를 확인하여 오류 메시지를 찾으세요
2. 서비스 상태를 확인하세요: `./scripts/docker-manager.sh status`
3. 시스템 리소스 사용량을 확인하세요: `docker stats`

---

**PBT LMS** - Problem-Based Training Learning Management System
