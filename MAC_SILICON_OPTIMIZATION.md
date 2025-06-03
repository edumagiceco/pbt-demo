# Mac Silicon (ARM64) 최적화 가이드

## 🍎 Mac Silicon Docker 최적화

Mac Silicon(Apple M1/M2/M3) 환경에서 Docker를 최적하게 실행하기 위한 설정입니다.

### 🔧 Docker 설정 최적화

1. **Docker Desktop 설정**
   - Docker Desktop > Settings > Features in development
   - "Use Rosetta for x86/amd64 emulation on Apple Silicon" 체크

2. **플랫폼 명시적 지정**
   ```yaml
   platform: linux/amd64  # x86 이미지 강제 사용
   ```

### 🚀 성능 최적화 팁

1. **볼륨 마운트 최적화**
   ```yaml
   volumes:
     - .:/app:cached  # 캐시 모드 사용
   ```

2. **빌드 캐시 활용**
   ```bash
   docker buildx build --platform linux/amd64 --cache-from=type=local,src=/tmp/.buildx-cache
   ```

### 📊 성능 모니터링

- CPU 사용률: `docker stats`
- 메모리 사용량: Activity Monitor에서 Docker 프로세스 확인
- 디스크 I/O: `iostat -d 1`

### 🐛 문제 해결

**문제 1: 플랫폼 경고**
```
The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8)
```
**해결**: docker-compose.yml에 `platform: linux/amd64` 추가

**문제 2: 느린 빌드 시간**
**해결**: Docker Desktop에서 Rosetta 에뮬레이션 활성화

**문제 3: 메모리 부족**
**해결**: Docker Desktop 메모리 할당 증가 (8GB 이상 권장)

### 🔄 권장 실행 순서

1. Docker Desktop 최신 버전 업데이트
2. Rosetta 에뮬레이션 활성화
3. 메모리 할당 증가 (최소 6GB)
4. 개발 환경 실행:
   ```bash
   ./scripts/docker-manager.sh dev -d
   ```

### 📈 성능 벤치마크

- **빌드 시간**: 3-5분 (초기), 1-2분 (캐시 후)
- **메모리 사용량**: 약 2-3GB
- **CPU 사용률**: 빌드 시 50-70%, 실행 시 10-20%
