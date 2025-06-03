#!/bin/bash

# PBT LMS Docker 관리 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로고 출력
print_logo() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                         PBT LMS Docker Manager                               ║"
    echo "║                    Problem-Based Training LMS Platform                       ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 도움말 출력
print_help() {
    echo -e "${YELLOW}사용법:${NC}"
    echo "  $0 [COMMAND] [OPTIONS]"
    echo ""
    echo -e "${YELLOW}COMMANDS:${NC}"
    echo "  dev         개발 환경 시작"
    echo "  prod        프로덕션 환경 시작"
    echo "  stop        모든 서비스 중지"
    echo "  restart     서비스 재시작"
    echo "  logs        로그 보기"
    echo "  shell       애플리케이션 컨테이너 쉘 접속"
    echo "  db          데이터베이스 접속"
    echo "  backup      데이터베이스 백업"
    echo "  restore     데이터베이스 복원"
    echo "  clean       사용하지 않는 리소스 정리"
    echo "  status      서비스 상태 확인"
    echo "  build       이미지 빌드"
    echo "  help        도움말 출력"
    echo ""
    echo -e "${YELLOW}OPTIONS:${NC}"
    echo "  -d          백그라운드에서 실행"
    echo "  -v          상세한 출력"
    echo ""
    echo -e "${YELLOW}예시:${NC}"
    echo "  $0 dev -d      # 개발 환경을 백그라운드에서 시작"
    echo "  $0 logs app    # 애플리케이션 로그 보기"
    echo "  $0 backup      # 데이터베이스 백업"
}

# 서비스 시작
start_dev() {
    echo -e "${GREEN}🚀 개발 환경을 시작합니다...${NC}"
    docker-compose -f docker-compose.dev.yml up $1
}

start_prod() {
    echo -e "${GREEN}🚀 프로덕션 환경을 시작합니다...${NC}"
    docker-compose -f docker-compose.yml up $1
}

# 서비스 중지
stop_services() {
    echo -e "${YELLOW}⏹️  서비스를 중지합니다...${NC}"
    docker-compose -f docker-compose.yml down
    docker-compose -f docker-compose.dev.yml down
}

# 서비스 재시작
restart_services() {
    echo -e "${YELLOW}🔄 서비스를 재시작합니다...${NC}"
    stop_services
    if [ "$1" == "prod" ]; then
        start_prod "-d"
    else
        start_dev "-d"
    fi
}

# 로그 보기
show_logs() {
    if [ -n "$1" ]; then
        docker-compose -f docker-compose.dev.yml logs -f $1
    else
        docker-compose -f docker-compose.dev.yml logs -f
    fi
}

# 쉘 접속
shell_access() {
    docker exec -it pbt-lms-app-dev /bin/sh
}

# 데이터베이스 접속
db_access() {
    docker exec -it pbt-lms-mysql-dev mysql -u magic7 -p magic7
}

# 데이터베이스 백업
backup_db() {
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    echo -e "${GREEN}📦 데이터베이스를 백업합니다: $backup_file${NC}"
    docker exec pbt-lms-mysql-dev mysqldump -u magic7 -pZAvEjgkEzu8K** magic7 > ./backups/$backup_file
    echo -e "${GREEN}✅ 백업 완료: ./backups/$backup_file${NC}"
}

# 데이터베이스 복원
restore_db() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ 백업 파일을 지정해주세요${NC}"
        echo "사용법: $0 restore [backup_file.sql]"
        return 1
    fi
    
    echo -e "${YELLOW}🔄 데이터베이스를 복원합니다: $1${NC}"
    docker exec -i pbt-lms-mysql-dev mysql -u magic7 -pZAvEjgkEzu8K** magic7 < ./backups/$1
    echo -e "${GREEN}✅ 복원 완료${NC}"
}

# 리소스 정리
clean_resources() {
    echo -e "${YELLOW}🧹 사용하지 않는 Docker 리소스를 정리합니다...${NC}"
    docker system prune -f
    docker volume prune -f
    docker network prune -f
    echo -e "${GREEN}✅ 정리 완료${NC}"
}

# 서비스 상태 확인
check_status() {
    echo -e "${BLUE}📊 서비스 상태:${NC}"
    docker-compose -f docker-compose.dev.yml ps
    echo ""
    echo -e "${BLUE}📊 시스템 리소스:${NC}"
    docker stats --no-stream
}

# 이미지 빌드
build_image() {
    echo -e "${GREEN}🔨 Docker 이미지를 빌드합니다...${NC}"
    docker-compose -f docker-compose.dev.yml build --no-cache
}

# 백업 디렉터리 생성
create_backup_dir() {
    if [ ! -d "./backups" ]; then
        mkdir -p ./backups
        echo -e "${GREEN}📁 백업 디렉터리를 생성했습니다: ./backups${NC}"
    fi
}

# 메인 실행부
main() {
    print_logo
    create_backup_dir
    
    case $1 in
        "dev")
            start_dev "$2"
            ;;
        "prod")
            start_prod "$2"
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services "$2"
            ;;
        "logs")
            show_logs "$2"
            ;;
        "shell")
            shell_access
            ;;
        "db")
            db_access
            ;;
        "backup")
            backup_db
            ;;
        "restore")
            restore_db "$2"
            ;;
        "clean")
            clean_resources
            ;;
        "status")
            check_status
            ;;
        "build")
            build_image
            ;;
        "help"|"")
            print_help
            ;;
        *)
            echo -e "${RED}❌ 알수없는 명령어: $1${NC}"
            print_help
            exit 1
            ;;
    esac
}

# 스크립트 실행
main "$@"
