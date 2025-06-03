# Node.js 애플리케이션을 위한 Dockerfile
FROM node:20-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필수 도구 설치
RUN apk update && apk add --no-cache \
    git \
    curl \
    python3 \
    make \
    g++

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (개발 의존성 포함)
RUN npm ci

# 소스 코드 복사
COPY . .

# uploads, tmp 디렉토리 생성 및 권한 설정
RUN mkdir -p uploads/materials uploads/solutions tmp && \
    chmod -R 755 uploads tmp

# 애플리케이션 실행을 위한 사용자 생성
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 파일 소유권 변경
RUN chown -R nodejs:nodejs /app
USER nodejs

# 포트 노출
EXPOSE 3000

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# 애플리케이션 실행
CMD ["npm", "start"]
