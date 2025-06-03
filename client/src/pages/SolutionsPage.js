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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Code,
  Visibility,
  Timer,
  TrendingUp,
  CheckCircle,
  Error,
  Warning,
  PlayArrow,
  Assignment,
  CalendarToday,
  Person
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import apiClient from '../services/apiClient';

const SolutionsPage = () => {
  const [solutions, setSolutions] = useState([]);
  const [filteredSolutions, setFilteredSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    evaluated: 0,
    pending: 0,
    avgScore: 0
  });

  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSolutions();
  }, []);

  useEffect(() => {
    filterSolutions();
  }, [solutions, statusFilter]);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/solutions/my');
      setSolutions(response.data.solutions || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('솔루션 목록 로드 실패:', error);
      // 데모 데이터 사용
      const demoSolutions = [
        {
          id: 1,
          problemId: 1,
          problemTitle: '두 수의 합',
          code: 'function solution(a, b) {\n  return a + b;\n}',
          language: 'javascript',
          score: 95,
          executionTime: 10,
          memoryUsed: 1024,
          status: 'evaluated',
          submittedAt: '2025-05-25T10:30:00Z',
          evaluatedAt: '2025-05-25T10:31:00Z',
          feedback: '완벽한 해결책입니다!'
        },
        {
          id: 2,
          problemId: 2,
          problemTitle: '피보나치 수열',
          code: 'function fib(n) {\n  if (n <= 1) return n;\n  return fib(n-1) + fib(n-2);\n}',
          language: 'javascript',
          score: 75,
          executionTime: 1500,
          memoryUsed: 2048,
          status: 'evaluated',
          submittedAt: '2025-05-24T15:20:00Z',
          evaluatedAt: '2025-05-24T15:25:00Z',
          feedback: '정답이지만 시간 복잡도를 개선할 수 있습니다.'
        },
        {
          id: 3,
          problemId: 3,
          problemTitle: '이진 탐색 트리',
          code: 'class TreeNode {\n  constructor(val) {\n    this.val = val;\n    this.left = null;\n    this.right = null;\n  }\n}',
          language: 'javascript',
          score: null,
          executionTime: null,
          memoryUsed: null,
          status: 'pending',
          submittedAt: '2025-05-25T14:00:00Z',
          evaluatedAt: null,
          feedback: null
        }
      ];
      setSolutions(demoSolutions);
      setStats({
        total: 3,
        evaluated: 2,
        pending: 1,
        avgScore: 85
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSolutions = () => {
    let filtered = solutions;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(solution => solution.status === statusFilter);
    }

    setFilteredSolutions(filtered);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'evaluated': return 'success';
      case 'pending': return 'warning';
      case 'evaluating': return 'info';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'evaluated': return '평가완료';
      case 'pending': return '평가대기';
      case 'evaluating': return '평가중';
      case 'error': return '오류';
      default: return status;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    if (score >= 50) return 'info';
    return 'error';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const handleViewSolution = (solutionId) => {
    navigate(`/solutions/${solutionId}`);
  };

  const handleViewProblem = (problemId) => {
    navigate(`/problems/${problemId}`);
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main` }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const SolutionCard = ({ solution }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="h3" gutterBottom>
              {solution.problemTitle}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip 
                label={getStatusLabel(solution.status)} 
                color={getStatusColor(solution.status)}
                size="small"
              />
              <Chip 
                label={solution.language} 
                variant="outlined"
                size="small"
              />
              {solution.score !== null && (
                <Chip 
                  label={`${solution.score}점`} 
                  color={getScoreColor(solution.score)}
                  size="small"
                />
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {formatDate(solution.submittedAt)}
            </Typography>
          </Box>
        </Box>

        {solution.status === 'evaluated' && (
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Timer fontSize="small" color="action" />
                  <Typography variant="body2">
                    {solution.executionTime}ms
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp fontSize="small" color="action" />
                  <Typography variant="body2">
                    {solution.memoryUsed}KB
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle fontSize="small" color="success" />
                  <Typography variant="body2">
                    평가완료
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {solution.feedback && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>피드백:</strong> {solution.feedback}
            </Typography>
          </Alert>
        )}
      </CardContent>

      <CardActions>
        <Button
          size="small"
          startIcon={<Visibility />}
          onClick={() => handleViewSolution(solution.id)}
        >
          솔루션 보기
        </Button>
        <Button
          size="small"
          startIcon={<Assignment />}
          onClick={() => handleViewProblem(solution.problemId)}
        >
          문제 보기
        </Button>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        내 솔루션
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        제출한 솔루션들을 확인하고 관리하세요.
      </Typography>

      {/* 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="총 제출"
            value={stats.total}
            icon={<Code />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="평가완료"
            value={stats.evaluated}
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="평가대기"
            value={stats.pending}
            icon={<Warning />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="평균점수"
            value={`${stats.avgScore}점`}
            icon={<TrendingUp />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* 필터 및 탭 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="카드 뷰" />
          <Tab label="테이블 뷰" />
        </Tabs>
      </Box>

      {/* 상태 필터 */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>상태 필터</InputLabel>
          <Select
            value={statusFilter}
            label="상태 필터"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="evaluated">평가완료</MenuItem>
            <MenuItem value="pending">평가대기</MenuItem>
            <MenuItem value="evaluating">평가중</MenuItem>
            <MenuItem value="error">오류</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 컨텐츠 */}
      {activeTab === 0 ? (
        // 카드 뷰
        <Box>
          {filteredSolutions.map((solution) => (
            <SolutionCard key={solution.id} solution={solution} />
          ))}
        </Box>
      ) : (
        // 테이블 뷰
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>문제</TableCell>
                <TableCell>언어</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="right">점수</TableCell>
                <TableCell align="right">실행시간</TableCell>
                <TableCell align="right">메모리</TableCell>
                <TableCell>제출일시</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSolutions.map((solution) => (
                <TableRow key={solution.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {solution.problemTitle}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={solution.language} variant="outlined" size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(solution.status)} 
                      color={getStatusColor(solution.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {solution.score !== null ? (
                      <Chip 
                        label={`${solution.score}점`} 
                        color={getScoreColor(solution.score)}
                        size="small"
                      />
                    ) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {solution.executionTime ? `${solution.executionTime}ms` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {solution.memoryUsed ? `${solution.memoryUsed}KB` : '-'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(solution.submittedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="솔루션 보기">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewSolution(solution.id)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="문제 보기">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewProblem(solution.problemId)}
                      >
                        <Assignment />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 빈 상태 */}
      {filteredSolutions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Code sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            제출한 솔루션이 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            문제를 풀고 솔루션을 제출해보세요.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Assignment />}
            onClick={() => navigate('/problems')}
          >
            문제 풀기
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SolutionsPage;