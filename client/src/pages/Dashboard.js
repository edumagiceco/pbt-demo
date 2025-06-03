import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Avatar,
  Paper,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Assignment,
  Code,
  TrendingUp,
  School,
  Timer,
  CheckCircle
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProgressChart from '../components/ProgressChart';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProgress, setUserProgress] = useState(null);
  const [stats, setStats] = useState({
    totalProblems: 0,
    solvedProblems: 0,
    inProgressProblems: 0,
    averageScore: 0,
    recentActivities: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 진도 데이터 가져오기
      const progressResponse = await axios.get('/api/progress/user', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (progressResponse.data.success) {
        const progressData = progressResponse.data.data;
        setUserProgress(progressData);
        
        // 기존 stats 형식으로 변환
        setStats({
          totalProblems: progressData.totalProblems,
          solvedProblems: progressData.completed,
          inProgressProblems: progressData.inProgress,
          averageScore: progressData.stats.averageScore,
          recentActivities: [] // 추후 구현
        });
      }

      setError('');
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
      
      // 에러 시 기본값 사용
      setStats({
        totalProblems: 25,
        solvedProblems: 18,
        inProgressProblems: 3,
        averageScore: 85,
        recentActivities: [
          { id: 1, type: 'solution', title: '알고리즘 문제 해결', date: '2025-05-25', score: 95 },
          { id: 2, type: 'problem', title: '새로운 문제 등록', date: '2025-05-24', score: null },
          { id: 3, type: 'discussion', title: '토론 참여', date: '2025-05-23', score: null }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ProgressCard = () => {
    const progress = (stats.solvedProblems / stats.totalProblems) * 100;
    
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            학습 진도
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              해결한 문제: {stats.solvedProblems}/{stats.totalProblems}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ mt: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary">
              {progress.toFixed(1)}% 완료
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`진행 중 ${stats.inProgressProblems}개`} 
              color="warning" 
              size="small" 
            />
            <Chip 
              label={`평균 점수 ${stats.averageScore}점`} 
              color="success" 
              size="small" 
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  const RecentActivities = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          최근 활동
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {stats.recentActivities.map((activity) => (
            <Paper key={activity.id} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  {activity.type === 'solution' && <Code sx={{ fontSize: 16 }} />}
                  {activity.type === 'problem' && <Assignment sx={{ fontSize: 16 }} />}
                  {activity.type === 'discussion' && <School sx={{ fontSize: 16 }} />}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {activity.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.date}
                  </Typography>
                </Box>
                {activity.score && (
                  <Chip 
                    label={`${activity.score}점`} 
                    color="success" 
                    size="small" 
                  />
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const QuickActions = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          빠른 실행
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Assignment />}
            onClick={() => navigate('/problems')}
            fullWidth
          >
            문제 풀기
          </Button>
          <Button
            variant="outlined"
            startIcon={<Code />}
            onClick={() => navigate('/solutions')}
            fullWidth
          >
            내 솔루션 보기
          </Button>
          <Button
            variant="outlined"
            startIcon={<School />}
            onClick={() => navigate('/materials')}
            fullWidth
          >
            학습 자료
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        안녕하세요, {user?.fullName || user?.username}님! 👋
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        오늘도 문제 해결에 도전해보세요.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Statistics Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="전체 문제"
              value={stats.totalProblems}
              icon={<Assignment />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="해결한 문제"
              value={stats.solvedProblems}
              icon={<CheckCircle />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="진행 중"
              value={stats.inProgressProblems}
              icon={<Timer />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="평균 점수"
              value={`${stats.averageScore}점`}
              icon={<TrendingUp />}
              color="info"
              subtitle={userProgress?.stats?.completionRate ? `완료율 ${userProgress.stats.completionRate}%` : ''}
            />
          </Grid>

          {/* 새로운 진도 시각화 차트 */}
          {userProgress && (
            <Grid item xs={12}>
              <ProgressChart userProgress={userProgress} />
            </Grid>
          )}

          {/* 기존 Progress Card (간단 버전) */}
          <Grid item xs={12} md={6}>
            <ProgressCard />
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <QuickActions />
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12}>
            <RecentActivities />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;