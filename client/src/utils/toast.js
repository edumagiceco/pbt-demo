import toast from 'react-hot-toast';

// 기본 토스트 설정
const defaultOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#363636',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500'
  }
};

// 성공 알림
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    ...defaultOptions,
    ...options,
    icon: '✅',
    style: {
      ...defaultOptions.style,
      background: '#4caf50',
      ...options.style
    }
  });
};

// 에러 알림
export const showError = (message, options = {}) => {
  return toast.error(message, {
    ...defaultOptions,
    duration: 6000, // 에러는 좀 더 오래 표시
    ...options,
    icon: '❌',
    style: {
      ...defaultOptions.style,
      background: '#f44336',
      ...options.style
    }
  });
};

// 경고 알림
export const showWarning = (message, options = {}) => {
  return toast(message, {
    ...defaultOptions,
    ...options,
    icon: '⚠️',
    style: {
      ...defaultOptions.style,
      background: '#ff9800',
      ...options.style
    }
  });
};

// 정보 알림
export const showInfo = (message, options = {}) => {
  return toast(message, {
    ...defaultOptions,
    ...options,
    icon: 'ℹ️',
    style: {
      ...defaultOptions.style,
      background: '#2196f3',
      ...options.style
    }
  });
};

// 로딩 알림 (Promise 기반)
export const showLoading = (message = '처리 중...', options = {}) => {
  return toast.loading(message, {
    ...defaultOptions,
    ...options,
    style: {
      ...defaultOptions.style,
      background: '#6c757d',
      ...options.style
    }
  });
};

// Promise 기반 알림 (로딩 → 성공/실패)
export const showPromise = (promise, messages, options = {}) => {
  const defaultMessages = {
    loading: '처리 중...',
    success: '완료되었습니다!',
    error: '오류가 발생했습니다.'
  };

  return toast.promise(
    promise,
    {
      ...defaultMessages,
      ...messages
    },
    {
      ...defaultOptions,
      ...options,
      success: {
        style: {
          ...defaultOptions.style,
          background: '#4caf50'
        }
      },
      error: {
        style: {
          ...defaultOptions.style,
          background: '#f44336'
        }
      }
    }
  );
};

// 커스텀 알림 (React 컴포넌트 포함 가능)
export const showCustom = (component, options = {}) => {
  return toast.custom(component, {
    ...defaultOptions,
    ...options
  });
};

// 특정 알림 제거
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// 모든 알림 제거
export const dismissAllToasts = () => {
  toast.dismiss();
};

// 코드 실행 관련 특화 알림들
export const codeToasts = {
  // 코드 실행 시작
  executing: (language = 'JavaScript') => 
    showLoading(`${language} 코드를 실행 중입니다...`),
  
  // 컴파일 성공
  compiled: () => 
    showSuccess('코드가 성공적으로 컴파일되었습니다!'),
  
  // 실행 성공
  executed: (executionTime) => 
    showSuccess(`코드 실행 완료! (${executionTime}ms)`),
  
  // 테스트 케이스 통과
  testPassed: (passedCount, totalCount) => 
    showSuccess(`테스트 ${passedCount}/${totalCount}개 통과!`),
  
  // 컴파일 에러
  compileError: (error) => 
    showError(`컴파일 에러: ${error}`),
  
  // 런타임 에러
  runtimeError: (error) => 
    showError(`실행 에러: ${error}`),
  
  // 시간 초과
  timeout: () => 
    showWarning('실행 시간이 초과되었습니다.'),
  
  // 메모리 초과
  memoryLimit: () => 
    showWarning('메모리 제한을 초과했습니다.')
};

// 문제 관련 특화 알림들
export const problemToasts = {
  // 문제 저장
  saved: () => 
    showSuccess('문제가 저장되었습니다!'),
  
  // 솔루션 제출
  submitted: () => 
    showSuccess('솔루션이 제출되었습니다!'),
  
  // 즐겨찾기 추가
  bookmarked: () => 
    showInfo('즐겨찾기에 추가되었습니다!'),
  
  // 즐겨찾기 제거
  unbookmarked: () => 
    showInfo('즐겨찾기에서 제거되었습니다!'),
  
  // 토론 등록
  discussionPosted: () => 
    showSuccess('토론이 등록되었습니다!'),
  
  // 댓글 등록
  commentPosted: () => 
    showSuccess('댓글이 등록되었습니다!')
};

// 인증 관련 특화 알림들
export const authToasts = {
  // 로그인 성공
  loginSuccess: (username) => 
    showSuccess(`환영합니다, ${username}님!`),
  
  // 로그아웃
  logout: () => 
    showInfo('로그아웃되었습니다.'),
  
  // 회원가입 성공
  registerSuccess: () => 
    showSuccess('회원가입이 완료되었습니다!'),
  
  // 비밀번호 변경
  passwordChanged: () => 
    showSuccess('비밀번호가 변경되었습니다!'),
  
  // 인증 에러
  authError: () => 
    showError('인증에 실패했습니다. 다시 로그인해주세요.'),
  
  // 권한 없음
  unauthorized: () => 
    showWarning('접근 권한이 없습니다.')
};

export default {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  promise: showPromise,
  custom: showCustom,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
  code: codeToasts,
  problem: problemToasts,
  auth: authToasts
};
