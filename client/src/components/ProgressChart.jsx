import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const ProgressChart = ({ userProgress }) => {
  // 원형 차트 데이터 (전체 진도)
  const doughnutData = {
    labels: ['완료', '진행중', '미시작'],
    datasets: [
      {
        data: [
          userProgress?.completed || 0,
          userProgress?.inProgress || 0,
          userProgress?.notStarted || 0
        ],
        backgroundColor: [
          '#4caf50', // 완료 - 초록색
          '#ff9800', // 진행중 - 주황색
          '#f5f5f5', // 미시작 - 회색
        ],
        borderWidth: 0,
      },
    ],
  };

  // 막대 차트 데이터 (주간 진도)
  const barData = {
    labels: ['월', '화', '수', '목', '금', '토', '일'],
    datasets: [
      {
        label: '문제 해결 수',
        data: userProgress?.weeklyProgress || [2, 3, 1, 4, 2, 0, 1],
        backgroundColor: '#2196f3',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Grid container spacing={3}>
      {/* 전체 진도 원형 차트 */}
      <Grid item xs={12} md={6}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              📊 전체 학습 진도
            </Typography>
            <Box display="flex" justifyContent="center" mb={2}>
              <Box width={250} height={250}>
                <Doughnut data={doughnutData} options={chartOptions} />
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-around" mt={2}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {userProgress?.completed || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  완료
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">
                  {userProgress?.inProgress || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  진행중
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" color="text.secondary">
                  {userProgress?.notStarted || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  미시작
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 주간 활동 막대 차트 */}
      <Grid item xs={12} md={6}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              📈 주간 학습 활동
            </Typography>
            <Box height={300}>
              <Bar data={barData} options={barOptions} />
            </Box>
            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                이번 주 총 {(userProgress?.weeklyProgress || [0]).reduce((a, b) => a + b, 0)}개 문제 해결
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 성취 배지 */}
      <Grid item xs={12}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              🏆 성취 배지
            </Typography>
            <Grid container spacing={2}>
              {userProgress?.badges?.map((badge, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Box 
                    p={2} 
                    textAlign="center" 
                    bgcolor="background.paper" 
                    borderRadius={2}
                    border={1}
                    borderColor="divider"
                  >
                    <Typography variant="h4">{badge.icon}</Typography>
                    <Typography variant="body2" mt={1}>
                      {badge.name}
                    </Typography>
                  </Box>
                </Grid>
              )) || (
                // 기본 배지들
                <>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box p={2} textAlign="center" bgcolor="background.paper" borderRadius={2} border={1} borderColor="divider">
                      <Typography variant="h4">🥇</Typography>
                      <Typography variant="body2" mt={1}>첫 문제 해결</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box p={2} textAlign="center" bgcolor="background.paper" borderRadius={2} border={1} borderColor="divider">
                      <Typography variant="h4">🔥</Typography>
                      <Typography variant="body2" mt={1}>연속 7일 학습</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box p={2} textAlign="center" bgcolor="background.paper" borderRadius={2} border={1} borderColor="divider">
                      <Typography variant="h4">💯</Typography>
                      <Typography variant="body2" mt={1}>완벽한 점수</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box p={2} textAlign="center" bgcolor="background.paper" borderRadius={2} border={1} borderColor="divider">
                      <Typography variant="h4">🎯</Typography>
                      <Typography variant="body2" mt={1}>10문제 달성</Typography>
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProgressChart;
