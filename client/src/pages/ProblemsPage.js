import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Stack,
  IconButton,
  Tooltip,
  Container,
  Paper
} from '@mui/material';
import {
  Assignment,
  Timer,
  TrendingUp,
  Person,
  Search,
  FilterList,
  Star,
  StarBorder
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import apiClient from '../services/apiClient';
import { useResponsive, responsiveGrid, responsiveTypography, responsiveSpacing } from '../utils/responsive';
import toast from '../utils/toast';

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState(new Set());

  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  // 반응형 훅 사용
  const { isMobile, isTablet, isTouchDevice } = useResponsive();

  useEffect(() => {
    fetchProblems();
  }, [page]);

  useEffect(() => {
    filterProblems();
  }, [problems, searchTerm, difficulty, category]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/problems?page=${page}&limit=12`);
      setProblems(response.data.problems || []);
      setTotalPages(Math.ceil((response.data.total || 0) / 12));
    } catch (error) {
      console.error('문제 목록 로드 실패:', error);
      // 데모 데이터 사용
      setProblems([
        {
          id: 1,
          title: '두 수의 합',
          description: '두 정수 a와 b가 주어졌을 때, a + b를 출력하세요.',
          difficulty: 'beginner',
          category: 'Math',
          maxScore: 100,
          timeLimit: 1000,
          status: 'active',
          instructor: { fullName: '김강사' },
          createdAt: '2025-05-25',
          participantCount: 45,
          avgScore: 85.5
        },
        {
          id: 2,
          title: '피보나치 수열',
          description: 'n번째 피보나치 수를 구하는 프로그램을 작성하세요.',
          difficulty: 'intermediate',
          category: 'Algorithm',
          maxScore: 100,
          timeLimit: 2000,
          status: 'active',
          instructor: { fullName: '이강사' },
          createdAt: '2025-05-24',
          participantCount: 32,
          avgScore: 72.3
        },
        {
          id: 3,
          title: '이진 탐색 트리',
          description: '이진 탐색 트리를 구현하고 검색 기능을 추가하세요.',
          difficulty: 'advanced',
          category: 'Data Structure',
          maxScore: 150,
          timeLimit: 3600,
          status: 'active',
          instructor: { fullName: '박강사' },
          createdAt: '2025-05-23',
          participantCount: 18,
          avgScore: 68.7
        }
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const filterProblems = () => {
    let filtered = problems;

    if (searchTerm) {
      filtered = filtered.filter(problem => 
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (difficulty !== 'all') {
      filtered = filtered.filter(problem => problem.difficulty === difficulty);
    }

    if (category !== 'all') {
      filtered = filtered.filter(problem => problem.category === category);
    }

    setFilteredProblems(filtered);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return difficulty;
    }
  };

  const handleProblemClick = (problemId) => {
    navigate(`/problems/${problemId}`);
  };

  const toggleFavorite = (problemId) => {
    const newFavorites = new Set(favorites);
    const isCurrentlyFavorite = newFavorites.has(problemId);
    
    if (isCurrentlyFavorite) {
      newFavorites.delete(problemId);
      toast.problem.unbookmarked();
    } else {
      newFavorites.add(problemId);
      toast.problem.bookmarked();
    }
    setFavorites(newFavorites);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        문제 목록
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        다양한 난이도의 프로그래밍 문제를 해결해보세요.
      </Typography>

      {/* 검색 및 필터 */}
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="문제 제목이나 내용으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>난이도</InputLabel>
              <Select
                value={difficulty}
                label="난이도"
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="beginner">초급</MenuItem>
                <MenuItem value="intermediate">중급</MenuItem>
                <MenuItem value="advanced">고급</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={category}
                label="카테고리"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="Math">수학</MenuItem>
                <MenuItem value="Algorithm">알고리즘</MenuItem>
                <MenuItem value="Data Structure">자료구조</MenuItem>
                <MenuItem value="String">문자열</MenuItem>
                <MenuItem value="Graph">그래프</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              <Typography variant="body2" color="text.secondary">
                {filteredProblems.length}개의 문제
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* 문제 카드 리스트 */}
      <Grid container spacing={3}>
        {filteredProblems.map((problem) => (
          <Grid item xs={12} sm={6} md={4} key={problem.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}
              onClick={() => handleProblemClick(problem.id)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* 헤더 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment color="primary" />
                    <Typography variant="h6" component="h2" noWrap>
                      {problem.title}
                    </Typography>
                  </Box>
                  <Tooltip title={favorites.has(problem.id) ? "즐겨찾기 해제" : "즐겨찾기 추가"}>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(problem.id);
                      }}
                    >
                      {favorites.has(problem.id) ? 
                        <Star color="warning" /> : 
                        <StarBorder />
                      }
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* 난이도 및 카테고리 */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    label={getDifficultyLabel(problem.difficulty)} 
                    color={getDifficultyColor(problem.difficulty)}
                    size="small"
                  />
                  <Chip 
                    label={problem.category} 
                    variant="outlined"
                    size="small"
                  />
                </Box>

                {/* 설명 */}
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2
                  }}
                >
                  {problem.description}
                </Typography>

                {/* 메타 정보 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Timer fontSize="small" color="action" />
                    <Typography variant="caption">
                      {problem.timeLimit ? `${problem.timeLimit}ms` : '제한없음'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUp fontSize="small" color="action" />
                    <Typography variant="caption">
                      {problem.maxScore}점
                    </Typography>
                  </Box>
                </Box>

                {/* 통계 정보 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="caption">
                      {problem.participantCount || 0}명 참여
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    평균: {problem.avgScore?.toFixed(1) || 0}점
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                    {problem.instructor?.fullName?.charAt(0) || 'T'}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    {problem.instructor?.fullName || '강사'}
                  </Typography>
                </Box>
                <Button 
                  size="small" 
                  variant="contained" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProblemClick(problem.id);
                  }}
                >
                  문제 풀기
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* 빈 상태 */}
      {filteredProblems.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Assignment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            조건에 맞는 문제가 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary">
            검색 조건을 변경하거나 새로운 문제가 추가될 때까지 기다려주세요.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProblemsPage;