const express = require('express');
const router = express.Router();
const mandartController = require('../controllers/mandartController');
const goalController = require('../controllers/goalController');
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

// 인증 미들웨어 적용
router.use(auth);

// 만다라트 관련 라우트
router.get('/', mandartController.getMandarts);                    // 만다라트 목록 조회
router.post('/', mandartController.createMandart);                 // 만다라트 생성
router.get('/public', mandartController.getPublicMandarts);        // 공개 만다라트 목록
router.get('/:id', mandartController.getMandartById);              // 만다라트 상세 조회
router.put('/:id', mandartController.updateMandart);               // 만다라트 수정
router.delete('/:id', mandartController.deleteMandart);            // 만다라트 삭제
router.post('/:id/calculate-progress', mandartController.calculateProgress); // 진행률 계산

// 목표 관련 라우트
router.get('/:mandartId/goals', goalController.getGoals);          // 목표 목록 조회
router.post('/:mandartId/goals', goalController.createGoal);       // 목표 생성
router.put('/:mandartId/goals/:goalId', goalController.updateGoal); // 목표 수정
router.delete('/:mandartId/goals/:goalId', goalController.deleteGoal); // 목표 삭제
router.patch('/:mandartId/goals/:goalId/status', goalController.updateGoalStatus); // 목표 상태 변경
router.get('/:mandartId/goals/:goalId/stats', goalController.getGoalStats); // 목표 통계

// 과제 관련 라우트
router.get('/:mandartId/tasks', taskController.getTasks);          // 과제 목록 조회
router.get('/:mandartId/goals/:goalId/tasks', taskController.getTasks); // 특정 목표의 과제 목록
router.post('/:mandartId/goals/:goalId/tasks', taskController.createTask); // 과제 생성
router.put('/:mandartId/tasks/:taskId', taskController.updateTask); // 과제 수정
router.delete('/:mandartId/tasks/:taskId', taskController.deleteTask); // 과제 삭제
router.patch('/:mandartId/tasks/:taskId/status', taskController.updateTaskStatus); // 과제 상태 변경
router.patch('/:mandartId/tasks/:taskId/progress', taskController.updateTaskProgress); // 과제 진행률 업데이트
router.get('/:mandartId/tasks/upcoming', taskController.getUpcomingTasks); // 임박한 과제 조회
router.patch('/:mandartId/tasks/:taskId/checklist', taskController.toggleChecklistItem); // 체크리스트 토글

module.exports = router;
