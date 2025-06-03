// PBT LMS 메인 JavaScript

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    
    // 네비게이션 스크롤 효과
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // 스무스 스크롤 효과
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 플래시 메시지 자동 닫기
    setTimeout(() => {
        const alerts = document.querySelectorAll('.alert.auto-close');
        alerts.forEach(alert => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);
    
    // 폼 검증
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
    
    // 툴팁 초기화
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // 모달 초기화
    const modalTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="modal"]'));
    modalTriggerList.forEach(function (modalTriggerEl) {
        modalTriggerEl.addEventListener('click', function() {
            const target = this.getAttribute('data-bs-target');
            const modal = new bootstrap.Modal(document.querySelector(target));
            modal.show();
        });
    });
});

// 유틸리티 함수들
const PBTUtils = {
    
    // AJAX 요청 헬퍼
    ajax: async function(url, options = {}) {
        try {
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: options.data ? JSON.stringify(options.data) : null
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('AJAX 요청 실패:', error);
            throw error;
        }
    },
    
    // 성공 메시지 표시
    showSuccess: function(message) {
        this.showAlert(message, 'success');
    },
    
    // 에러 메시지 표시
    showError: function(message) {
        this.showAlert(message, 'danger');
    },
    
    // 경고 메시지 표시
    showWarning: function(message) {
        this.showAlert(message, 'warning');
    },
    
    // 알림 메시지 표시
    showAlert: function(message, type = 'info') {
        const alertContainer = document.getElementById('alert-container');
        if (!alertContainer) {
            const container = document.createElement('div');
            container.id = 'alert-container';
            container.className = 'flash-message';
            document.body.appendChild(container);
        }
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show auto-close`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.getElementById('alert-container').appendChild(alert);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    },
    
    // 로딩 스피너 표시
    showLoading: function(element) {
        const spinner = document.createElement('div');
        spinner.className = 'spinner mx-auto';
        spinner.id = 'loading-spinner';
        
        if (typeof element === 'string') {
            document.querySelector(element).appendChild(spinner);
        } else {
            element.appendChild(spinner);
        }
    },
    
    // 로딩 스피너 숨기기
    hideLoading: function() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    },
    
    // 날짜 포맷팅
    formatDate: function(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        switch(format) {
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            default:
                return `${year}-${month}-${day}`;
        }
    },
    
    // 파일 크기 포맷팅
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // 확인 대화상자
    confirm: function(message, callback) {
        if (confirm(message)) {
            callback();
        }
    },
    
    // 폼 데이터를 객체로 변환
    formToObject: function(form) {
        const formData = new FormData(form);
        const obj = {};
        
        for (let [key, value] of formData.entries()) {
            if (obj[key]) {
                if (Array.isArray(obj[key])) {
                    obj[key].push(value);
                } else {
                    obj[key] = [obj[key], value];
                }
            } else {
                obj[key] = value;
            }
        }
        
        return obj;
    }
};

// 전역으로 사용할 수 있도록 window 객체에 추가
window.PBTUtils = PBTUtils;

// 페이지별 기능
const PageSpecific = {
    
    // 대시보드 기능
    dashboard: {
        init: function() {
            this.loadStats();
            this.loadRecentProjects();
        },
        
        loadStats: async function() {
            try {
                PBTUtils.showLoading('#stats-container');
                const stats = await PBTUtils.ajax('/api/dashboard/stats.php');
                this.renderStats(stats);
                PBTUtils.hideLoading();
            } catch (error) {
                PBTUtils.showError('통계 데이터를 불러오는데 실패했습니다.');
                PBTUtils.hideLoading();
            }
        },
        
        renderStats: function(stats) {
            // 통계 데이터 렌더링 로직
        },
        
        loadRecentProjects: async function() {
            try {
                const projects = await PBTUtils.ajax('/api/projects/recent.php');
                this.renderRecentProjects(projects);
            } catch (error) {
                PBTUtils.showError('최근 프로젝트를 불러오는데 실패했습니다.');
            }
        },
        
        renderRecentProjects: function(projects) {
            // 최근 프로젝트 렌더링 로직
        }
    },
    
    // 프로젝트 목록 기능
    projectList: {
        init: function() {
            this.bindEvents();
            this.loadProjects();
        },
        
        bindEvents: function() {
            // 검색 폼 이벤트
            const searchForm = document.getElementById('search-form');
            if (searchForm) {
                searchForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.loadProjects();
                });
            }
            
            // 필터 변경 이벤트
            const filters = document.querySelectorAll('.project-filter');
            filters.forEach(filter => {
                filter.addEventListener('change', () => {
                    this.loadProjects();
                });
            });
        },
        
        loadProjects: async function() {
            try {
                PBTUtils.showLoading('#project-list');
                const formData = PBTUtils.formToObject(document.getElementById('search-form'));
                const projects = await PBTUtils.ajax('/api/projects/list.php', {
                    method: 'POST',
                    data: formData
                });
                this.renderProjects(projects);
                PBTUtils.hideLoading();
            } catch (error) {
                PBTUtils.showError('프로젝트 목록을 불러오는데 실패했습니다.');
                PBTUtils.hideLoading();
            }
        },
        
        renderProjects: function(projects) {
            // 프로젝트 목록 렌더링 로직
        }
    }
};

// 페이지별 초기화
window.PageSpecific = PageSpecific;
