import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Assignment,
  Timer,
  TrendingUp,
  Person,
  Code,
  PlayArrow,
  Save,
  Send
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import apiClient from '../services/apiClient';

// Monaco Editor는 동적으로 import
const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));

const ProblemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [code, setCode] = useState('// 여기에 코드를 작성하세요\n\n');
  const [language, setLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/problems/${id}`);
      setProblem(response.data);
    } catch (error) {
      console.error('문제 로드 실패:', error);
      // 데모 데이터 사용
      setProblem({
        id: 1,
        title: '두 수의 합',
        description: `## 문제 설명

두 정수 a와 b가 주어졌을 때, a + b를 출력하세요.

## 입력
첫 번째 줄에 두 정수 a, b가 공백으로 구분되어 주어집니다.
(-1000 ≤ a, b ≤ 1000)

## 출력
첫 번째 줄에 a + b를 출력합니다.

## 예제 입력 1
\`\`\`
1 2
\`\`\`

## 예제 출력 1
\`\`\`
3
\`\`\`

## 예제 입력 2
\`\`\`
-1 1
\`\`\`

## 예제 출력 2
\`\`\`
0
\`\`\``,
        difficulty: 'beginner',
        category: 'Math',
        maxScore: 100,
        timeLimit: 1000,
        status: 'active',
        instructor: { fullName: '김강사', username: 'instructor1' },
        createdAt: '2025-05-25',
        participantCount: 45,
        avgScore: 85.5,
        testCases: [
          { id: 1, input: '1 2', expectedOutput: '3', isHidden: false, points: 25 },
          { id: 2, input: '-1 1', expectedOutput: '0', isHidden: false, points: 25 },
          { id: 3, input: '100 200', expectedOutput: '300', isHidden: true, points: 25 },
          { id: 4, input: '-500 -300', expectedOutput: '-800', isHidden: true, points: 25 }
        ],
        materials: [],
        discussions: [
          {
            id: 1,
            title: '이 문제 어떻게 풀어야 하나요?',
            content: '입력을 어떻게 받아야 할지 모르겠습니다.',
            user: { fullName: '학생1' },
            createdAt: '2025-05-25',
            commentCount: 3
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleRunCode = async () => {
    try {
      setRunning(true);
      const response = await apiClient.post(`/solutions/run`, {
        problemId: id,
        code,
        language
      });
      setTestResults(response.data.results || []);
    } catch (error) {
      console.error('코드 실행 실패:', error);
      // 데모 결과
      setTestResults([
        { testCaseId: 1, passed: true, output: '3', executionTime: 10, memoryUsed: 1024 },
        { testCaseId: 2, passed: true, output: '0', executionTime: 8, memoryUsed: 1024 },
        { testCaseId: 3, passed: false, output: '299', executionTime: 12, memoryUsed: 1024 },
        { testCaseId: 4, passed: true, output: '-800', executionTime: 9, memoryUsed: 1024 }
      ]);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitSolution = async () => {
    try {
      setSubmitting(true);
      const response = await apiClient.post('/solutions', {
        problemId: id,
        code,
        language
      });
      alert('솔루션이 제출되었습니다!');
      navigate('/solutions');
    } catch (error) {
      console.error('솔루션 제출 실패:', error);
      alert('솔루션 제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  if (!problem) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">문제를 찾을 수 없습니다.</Typography>
        <Button onClick={() => navigate('/problems')} sx={{ mt: 2 }}>
          문제 목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Assignment color="primary" sx={{ fontSize: 30 }} />
          <Typography variant="h4" component="h1">
            {problem.title}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip 
            label={getDifficultyLabel(problem.difficulty)} 
            color={getDifficultyColor(problem.difficulty)}
          />
          <Chip label={problem.category} variant="outlined" />
          <Chip 
            icon={<Timer />} 
            label={problem.timeLimit ? `${problem.timeLimit}ms` : '제한없음'} 
            variant="outlined" 
          />
          <Chip 
            icon={<TrendingUp />} 
            label={`${problem.maxScore}점`} 
            variant="outlined" 
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {problem.instructor?.fullName?.charAt(0) || 'T'}
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            {problem.instructor?.fullName} • {problem.participantCount}명 참여 • 평균 {problem.avgScore}점
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 좌측: 문제 설명 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 'calc(100vh - 300px)' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="문제" />
                <Tab label="테스트 케이스" />
                <Tab label="토론" />
              </Tabs>
            </Box>

            <Box sx={{ p: 3, height: 'calc(100% - 48px)', overflow: 'auto' }}>
              {activeTab === 0 && (
                <Box>
                  <Typography 
                    variant="body1" 
                    sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
                  >
                    {problem.description}
                  </Typography>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    테스트 케이스
                  </Typography>
                  <List>
                    {problem.testCases?.filter(tc => !tc.isHidden).map((testCase, index) => (
                      <React.Fragment key={testCase.id}>
                        <ListItem>
                          <ListItemText
                            primary={`예제 ${index + 1}`}
                            secondary={
                              <Box>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  <strong>입력:</strong> {testCase.input}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  <strong>출력:</strong> {testCase.expectedOutput}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  배점: {testCase.points}점
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < problem.testCases.filter(tc => !tc.isHidden).length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    토론
                  </Typography>
                  <List>
                    {problem.discussions?.map((discussion) => (
                      <ListItem key={discussion.id} sx={{ alignItems: 'flex-start' }}>
                        <ListItemText
                          primary={discussion.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {discussion.content}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {discussion.user.fullName} • {discussion.createdAt} • {discussion.commentCount}개 댓글
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        {/* 우측: 코드 에디터 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 'calc(100vh - 300px)' }}>
            <CardContent sx={{ p: 0, height: '100%' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    <Code sx={{ mr: 1, verticalAlign: 'middle' }} />
                    코드 에디터
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<PlayArrow />}
                      onClick={handleRunCode}
                      disabled={running}
                      size="small"
                    >
                      {running ? '실행 중...' : '실행'}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Send />}
                      onClick={handleSubmitSolution}
                      disabled={submitting}
                      size="small"
                    >
                      {submitting ? '제출 중...' : '제출'}
                    </Button>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ height: 'calc(100% - 80px)' }}>
                <React.Suspense fallback={<Typography>에디터 로딩 중...</Typography>}>
                  <MonacoEditor
                    height="100%"
                    language={language}
                    theme="vs-light"
                    value={code}
                    onChange={handleCodeChange}
                    options={{
                      selectOnLineNumbers: true,
                      roundedSelection: false,
                      readOnly: false,
                      cursorStyle: 'line',
                      automaticLayout: true,
                    }}
                  />
                </React.Suspense>
              </Box>

              {/* 테스트 결과 */}
              {testResults.length > 0 && (
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', maxHeight: 200, overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    테스트 결과
                  </Typography>
                  {testResults.map((result, index) => (
                    <Alert 
                      key={index} 
                      severity={result.passed ? 'success' : 'error'} 
                      sx={{ mb: 1 }}
                      variant="outlined"
                    >
                      <Typography variant="body2">
                        테스트 케이스 {index + 1}: {result.passed ? '통과' : '실패'}
                        {!result.passed && ` (출력: ${result.output})`}
                        <br />
                        실행시간: {result.executionTime}ms, 메모리: {result.memoryUsed}KB
                      </Typography>
                    </Alert>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProblemDetailPage;