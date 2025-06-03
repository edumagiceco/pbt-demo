import { useTheme, useMediaQuery } from '@mui/material';

// 반응형 브레이크포인트 훅
export const useResponsive = () => {
  const theme = useTheme();
  
  return {
    // 모바일 (320px ~ 768px)
    isMobile: useMediaQuery(theme.breakpoints.down('md')),
    isSmallMobile: useMediaQuery(theme.breakpoints.down('sm')),
    
    // 태블릿 (768px ~ 1024px)
    isTablet: useMediaQuery(theme.breakpoints.between('md', 'lg')),
    
    // 데스크톱 (1024px+)
    isDesktop: useMediaQuery(theme.breakpoints.up('lg')),
    isLargeDesktop: useMediaQuery(theme.breakpoints.up('xl')),
    
    // 터치 디바이스
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    
    // 세로/가로 방향
    isPortrait: useMediaQuery('(orientation: portrait)'),
    isLandscape: useMediaQuery('(orientation: landscape)'),
    
    // 다크 모드 선호도
    prefersDarkMode: useMediaQuery('(prefers-color-scheme: dark)'),
    
    // 고해상도 디스플레이
    isHighDensity: useMediaQuery('(min-resolution: 2dppx)'),
  };
};

// 반응형 스타일 생성 헬퍼
export const responsive = {
  // 모바일 우선 스타일
  mobile: (styles) => ({
    [useTheme().breakpoints.down('md')]: styles
  }),
  
  // 태블릿 스타일
  tablet: (styles) => ({
    [useTheme().breakpoints.between('md', 'lg')]: styles
  }),
  
  // 데스크톱 스타일
  desktop: (styles) => ({
    [useTheme().breakpoints.up('lg')]: styles
  }),
  
  // 모바일 + 태블릿
  mobileTablet: (styles) => ({
    [useTheme().breakpoints.down('lg')]: styles
  }),
  
  // 태블릿 + 데스크톱
  tabletDesktop: (styles) => ({
    [useTheme().breakpoints.up('md')]: styles
  }),
};

// 반응형 그리드 설정
export const responsiveGrid = {
  // 기본 그리드 (모바일 우선)
  default: {
    xs: 12,  // 모바일: 전체 너비
    sm: 12,  // 작은 태블릿: 전체 너비
    md: 6,   // 태블릿: 반 너비
    lg: 4,   // 데스크톱: 1/3 너비
    xl: 3    // 큰 데스크톱: 1/4 너비
  },
  
  // 카드형 콘텐츠
  card: {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 3,
    xl: 2
  },
  
  // 사이드바가 있는 메인 콘텐츠
  mainContent: {
    xs: 12,
    md: 8,
    lg: 9
  },
  
  // 사이드바
  sidebar: {
    xs: 12,
    md: 4,
    lg: 3
  },
  
  // 통계 카드
  statCard: {
    xs: 6,   // 모바일: 2개씩
    sm: 6,   // 작은 태블릿: 2개씩
    md: 3,   // 태블릿: 4개씩
    lg: 3    // 데스크톱: 4개씩
  },
  
  // 문제 카드
  problemCard: {
    xs: 12,  // 모바일: 1개씩
    sm: 12,  // 작은 태블릿: 1개씩
    md: 6,   // 태블릿: 2개씩
    lg: 4,   // 데스크톱: 3개씩
    xl: 3    // 큰 데스크톱: 4개씩
  }
};

// 반응형 타이포그래피
export const responsiveTypography = {
  // 페이지 제목
  pageTitle: {
    fontSize: {
      xs: '1.5rem',  // 24px (모바일)
      sm: '1.75rem', // 28px (작은 태블릿)
      md: '2rem',    // 32px (태블릿)
      lg: '2.25rem', // 36px (데스크톱)
      xl: '2.5rem'   // 40px (큰 데스크톱)
    },
    lineHeight: {
      xs: 1.3,
      md: 1.2
    }
  },
  
  // 섹션 제목
  sectionTitle: {
    fontSize: {
      xs: '1.25rem', // 20px
      sm: '1.375rem', // 22px
      md: '1.5rem',  // 24px
      lg: '1.625rem' // 26px
    }
  },
  
  // 카드 제목
  cardTitle: {
    fontSize: {
      xs: '1rem',    // 16px
      md: '1.125rem' // 18px
    }
  },
  
  // 본문 텍스트
  body: {
    fontSize: {
      xs: '0.875rem', // 14px
      md: '1rem'      // 16px
    }
  }
};

// 반응형 스페이싱
export const responsiveSpacing = {
  // 섹션 간격
  section: {
    xs: 2,  // 16px
    sm: 3,  // 24px
    md: 4,  // 32px
    lg: 5   // 40px
  },
  
  // 카드 간격
  card: {
    xs: 1,  // 8px
    sm: 2,  // 16px
    md: 3   // 24px
  },
  
  // 컨테이너 패딩
  container: {
    xs: 2,  // 16px
    sm: 3,  // 24px
    md: 4   // 32px
  }
};

// 터치 친화적 설정
export const touchFriendly = {
  // 최소 터치 영역 크기 (44px)
  minTouchSize: 44,
  
  // 터치 요소 스타일
  touchElement: {
    minHeight: 44,
    minWidth: 44,
    cursor: 'pointer',
    userSelect: 'none',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none'
  },
  
  // 버튼 스타일
  button: {
    height: {
      xs: 48,  // 모바일: 더 큰 터치 영역
      md: 42   // 데스크톱: 표준 크기
    },
    fontSize: {
      xs: '1rem',
      md: '0.875rem'
    }
  }
};

// 모바일 네비게이션 설정
export const mobileNavigation = {
  // 모바일 헤더 높이
  headerHeight: {
    xs: 56,  // 모바일
    sm: 64   // 태블릿+
  },
  
  // 모바일 사이드바 너비
  sidebarWidth: {
    xs: 280,
    sm: 320
  },
  
  // 바텀 네비게이션 높이
  bottomNavHeight: 60
};

// 반응형 이미지 설정
export const responsiveImage = {
  // 기본 이미지 크기
  default: {
    width: '100%',
    height: 'auto',
    objectFit: 'cover'
  },
  
  // 아바타 크기
  avatar: {
    width: {
      xs: 32,
      md: 40
    },
    height: {
      xs: 32,
      md: 40
    }
  },
  
  // 로고 크기
  logo: {
    height: {
      xs: 24,
      md: 32
    }
  }
};

// 반응형 애니메이션 설정
export const responsiveAnimation = {
  // 모바일에서는 애니메이션 간소화
  transition: (isMobile) => ({
    transition: isMobile 
      ? 'all 0.2s ease-out'  // 빠른 애니메이션
      : 'all 0.3s ease-out'  // 표준 애니메이션
  }),
  
  // 호버 효과 (터치 디바이스에서는 비활성화)
  hover: (isTouchDevice) => 
    isTouchDevice ? {} : {
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.12)'
      }
    }
};

export default {
  useResponsive,
  responsive,
  responsiveGrid,
  responsiveTypography,
  responsiveSpacing,
  touchFriendly,
  mobileNavigation,
  responsiveImage,
  responsiveAnimation
};
