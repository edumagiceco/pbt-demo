const { User, Problem, Solution, ProblemParticipant } = require('../models');
const { Op } = require('sequelize');

const progressController = {
  // 사용자 학습 진도 조회
  async getUserProgress(req, res) {
    try {
      const userId = req.user.id;
      
      // 전체 문제 수 조회
      const totalProblems = await Problem.count({
        where: { status: 'active' }
      });

      // 사용자가 참여한 문제들
      const participations = await ProblemParticipant.findAll({
        where: { userId },
        include: [{
          model: Problem,
          where: { status: 'active' }
        }]
      });

      // 완료된 문제들
      const completedProblems = participations.filter(p => p.status === 'completed').length;
      
      // 진행 중인 문제들
      const inProgressProblems = participations.filter(p => p.status === 'in_progress').length;
      
      // 미시작 문제들
      const notStartedProblems = totalProblems - participations.length;

      // 주간 활동 데이터 (최근 7일)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const recentSolutions = await Solution.findAll({
        where: {
          userId,
          submittedAt: {
            [Op.gte]: weekAgo
          }
        },
        order: [['submittedAt', 'ASC']]
      });

      // 요일별 활동 계산
      const weeklyProgress = [0, 0, 0, 0, 0, 0, 0]; // 월~일
      recentSolutions.forEach(solution => {
        const dayOfWeek = new Date(solution.submittedAt).getDay();
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 월요일을 0으로 조정
        weeklyProgress[adjustedDay]++;
      });

      // 성취 배지 계산
      const badges = [];
      
      // 첫 문제 해결 배지
      if (completedProblems > 0) {
        badges.push({ icon: '🥇', name: '첫 문제 해결' });
      }
      
      // 10문제 달성 배지
      if (completedProblems >= 10) {
        badges.push({ icon: '🎯', name: '10문제 달성' });
      }
      
      // 완벽한 점수 배지
      const perfectSolutions = await Solution.count({
        where: { userId, score: 100 }
      });
      if (perfectSolutions > 0) {
        badges.push({ icon: '💯', name: '완벽한 점수' });
      }
      
      // 연속 학습 배지 (간단 버전)
      const todaySolutions = await Solution.count({
        where: {
          userId,
          submittedAt: {
            [Op.gte]: new Date().setHours(0, 0, 0, 0)
          }
        }
      });
      
      if (todaySolutions > 0) {
        badges.push({ icon: '🔥', name: '오늘도 학습' });
      }

      // 전체 점수 및 순위 계산
      const userSolutions = await Solution.findAll({
        where: { userId },
        attributes: ['score']
      });
      
      const totalScore = userSolutions.reduce((sum, sol) => sum + (sol.score || 0), 0);
      const averageScore = userSolutions.length > 0 ? totalScore / userSolutions.length : 0;

      res.json({
        success: true,
        data: {
          completed: completedProblems,
          inProgress: inProgressProblems,
          notStarted: notStartedProblems,
          totalProblems,
          weeklyProgress,
          badges,
          stats: {
            totalScore: Math.round(totalScore),
            averageScore: Math.round(averageScore * 100) / 100,
            totalSolutions: userSolutions.length,
            completionRate: Math.round((completedProblems / totalProblems) * 100)
          }
        }
      });

    } catch (error) {
      console.error('Progress fetch error:', error);
      res.status(500).json({
        success: false,
        message: '진도 정보를 불러오는 중 오류가 발생했습니다.'
      });
    }
  },

  // 학습 통계 조회
  async getLearningStats(req, res) {
    try {
      const userId = req.user.id;
      
      // 최근 30일 활동
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const monthlyActivity = await Solution.findAll({
        where: {
          userId,
          submittedAt: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        order: [['submittedAt', 'ASC']]
      });

      // 일별 활동 집계
      const dailyStats = {};
      monthlyActivity.forEach(solution => {
        const date = new Date(solution.submittedAt).toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { submissions: 0, totalScore: 0 };
        }
        dailyStats[date].submissions++;
        dailyStats[date].totalScore += solution.score || 0;
      });

      // 최근 성과
      const recentAchievements = await Solution.findAll({
        where: { userId },
        include: [{
          model: Problem,
          attributes: ['title', 'difficulty']
        }],
        order: [['submittedAt', 'DESC']],
        limit: 5
      });

      res.json({
        success: true,
        data: {
          monthlyActivity: Object.entries(dailyStats).map(([date, stats]) => ({
            date,
            ...stats,
            averageScore: stats.submissions > 0 ? Math.round(stats.totalScore / stats.submissions) : 0
          })),
          recentAchievements: recentAchievements.map(sol => ({
            id: sol.id,
            problemTitle: sol.Problem?.title || '제목 없음',
            difficulty: sol.Problem?.difficulty || 'unknown',
            score: sol.score,
            submittedAt: sol.submittedAt
          }))
        }
      });

    } catch (error) {
      console.error('Learning stats error:', error);
      res.status(500).json({
        success: false,
        message: '학습 통계를 불러오는 중 오류가 발생했습니다.'
      });
    }
  }
};

module.exports = progressController;
