import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Code,
  Timer,
  TrendingUp,
  Memory,
  CheckCircle,
  Error,
  Assignment,
  ArrowBack,
  PlayArrow,
  Refresh,
  Share
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import apiClient from '../services/apiClient';

// Monaco Editor는 동적으로 import
const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));

const SolutionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    fetchSolution();
  }, [id]);

  const fetchSolution = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/solutions/${id}`);
      setSolution(response.data);
      setTestResults(response.data.testResults || []);
    } catch (error) {
      console.error('솔루션 로드 실패:', error);
      // 데모 데이터 사용
      setSolution({
        id: 1,
        problemId: 1,
        problemTitle: '두 수의 합',
        problem: {
          title: '두 수의 합',
          difficulty: 'beginner',
          category: 'Math',
          maxScore: 100
        },
        code: `// 두 수의 합을 구하는 함수
function solution(input) {
    const [a, b] = input.trim().split(' ').map(Number);
    return a + b;
}

// 테스트
console.log(solution("1 2")); // 3
console.log(solution("-1 1")); // 0`,
        language: 'javascript',
        score: 95,
        executionTime: 10,
        memoryUsed: 1024,
        status: 'evaluated',
        submittedAt: '2025-05-25T10:30:00Z',
        evaluatedAt: '2025-05-25T10:31:00Z',
        feedback: '완벽한 해결책입니다! 코드가 깔끔하고 효율적입니다.',
        user: {
          id: 1,
          fullName: '김테스트',
          username: 'testuser'
        }
      });
      
      setTestResults([
        { 
          testCaseId: 1, 
          input: '1 2', 
          expectedOutput: '3', 
          actualOutput: '3',
          passed: true, 
          executionTime: 8, 
          memoryUsed: 1024,
          points: 25
        },
        { 
          testCaseId: 2, 
          input: '-1 1', 
          expectedOutput: '0', 
          actualOutput: '0',
          passed: true, 
          executionTime: 9, 
          memoryUsed: 1024,
          points: 25
        },
        { 
          testCaseId: 3, 
          input: '100 200', 
          expectedOutput: '300', 
          actualOutput: '300',
          passed: true, 
          executionTime: 10, 
          memoryUsed: 1024,
          points: 25
        },
        { 
          testCaseId: 4, 
          input: '-500 -300', 
          expectedOutput: '-800', 
          actualOutput: '-800',
          passed: true, 
          executionTime: 12, 
          memoryUsed: 1024,
          points: 25
        }
      ]);
    } finally {
      setLoading(false);
    }
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

  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    if (score >= 50) return 'info';
    return 'error';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const handleRunAgain = () => {
    navigate(`/problems/${solution.problemId}`);
  };

  const handleShareSolution = () => {
    // 솔루션 공유 기능 (추후 구현)
    alert('솔루션 공유 기능은 곧 제공될 예정입니다.');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  if (!solution) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">솔루션을 찾을 수 없습니다.</Typography>
        <Button onClick={() => navigate('/solutions')} sx={{ mt: 2 }}>
          솔루션 목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  const passedTests = testResults.filter(test => test.passed).length;
  const totalTests = testResults.length;

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate('/solutions')}>
            <ArrowBack />
          </IconButton>
          <Code color="primary" sx={{ fontSize: 30 }} />
          <Typography variant="h4" component="h1">
            솔루션 상세
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip 
            label={getStatusLabel(solution.status)} 
            color={getStatusColor(solution.status)}
          />
          <Chip label={solution.language} variant="outlined" />
          {solution.score !== null && (
            <Chip 
              label={`${solution.score}점`} 
              color={getScoreColor(solution.score)}
            />
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 좌측: 솔루션 정보 */}
        <Grid item xs={12} md={4}>
          {/* 문제 정보 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📝 문제 정보
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" fontWeight="medium">
                  {solution.problemTitle}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip 
                    label={getDifficultyLabel(solution.problem?.difficulty)} 
                    color={getDifficultyColor(solution.problem?.difficulty)}
                    size="small"
                  />
                  <Chip 
                    label={solution.problem?.category} 
                    variant="outlined" 
                    size="small"
                  />
                </Box>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Assignment />}
                onClick={() => navigate(`/problems/${solution.problemId}`)}
                fullWidth
              >
                문제 보기
              </Button>
            </CardContent>
          </Card>

          {/* 제출 정보 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 제출 정보
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  제출자
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                    {solution.user?.fullName?.charAt(0) || 'U'}
                  </Avatar>
                  <Typography variant="body2">
                    {solution.user?.fullName || '사용자'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  제출일시
                </Typography>
                <Typography variant="body2">
                  {formatDate(solution.submittedAt)}
                </Typography>
              </Box>

              {solution.evaluatedAt && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    평가일시
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(solution.evaluatedAt)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrow />}
                  onClick={handleRunAgain}
                  size="small"
                >
                  다시 풀기
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={handleShareSolution}
                  size="small"
                >
                  공유
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* 성능 정보 */}
          {solution.status === 'evaluated' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ⚡ 성능 정보
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Timer color="action" />
                    <Typography variant="body2">
                      실행시간: {solution.executionTime}ms
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Memory color="action" />
                    <Typography variant="body2">
                      메모리: {solution.memoryUsed}KB
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" />
                    <Typography variant="body2">
                      테스트: {passedTests}/{totalTests} 통과
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* 우측: 코드 및 결과 */}
        <Grid item xs={12} md={8}>
          {/* 코드 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💻 제출한 코드
              </Typography>
              <Box sx={{ height: 400, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <React.Suspense fallback={<Typography>에디터 로딩 중...</Typography>}>
                  <MonacoEditor
                    height="100%"
                    language={solution.language}
                    theme="vs-light"
                    value={solution.code}
                    options={{
                      readOnly: true,
                      selectOnLineNumbers: true,
                      roundedSelection: false,
                      cursorStyle: 'line',
                      automaticLayout: true,
                      minimap: { enabled: false }
                    }}
                  />
                </React.Suspense>
              </Box>
            </CardContent>
          </Card>

          {/* 피드백 */}
          {solution.feedback && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💬 피드백
                </Typography>
                <Alert severity="info">
                  {solution.feedback}
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* 테스트 결과 */}
          {testResults.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🧪 테스트 결과
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {passedTests}/{totalTests} 테스트 통과
                </Typography>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>테스트</TableCell>
                        <TableCell>입력</TableCell>
                        <TableCell>예상 출력</TableCell>
                        <TableCell>실제 출력</TableCell>
                        <TableCell align="center">결과</TableCell>
                        <TableCell align="right">시간</TableCell>
                        <TableCell align="right">메모리</TableCell>
                        <TableCell align="right">점수</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {testResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell>#{index + 1}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            {result.input}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            {result.expectedOutput}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            {result.actualOutput}
                          </TableCell>
                          <TableCell align="center">
                            {result.passed ? (
                              <CheckCircle color="success" fontSize="small" />
                            ) : (
                              <Error color="error" fontSize="small" />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {result.executionTime}ms
                          </TableCell>
                          <TableCell align="right">
                            {result.memoryUsed}KB
                          </TableCell>
                          <TableCell align="right">
                            {result.passed ? result.points || 0 : 0}점
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default SolutionDetailPage;