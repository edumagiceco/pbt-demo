const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

// 모든 진도 관련 라우트는 인증 필요
router.use(auth);

// 사용자 학습 진도 조회
router.get('/user', progressController.getUserProgress);

// 학습 통계 조회
router.get('/stats', progressController.getLearningStats);

module.exports = router;
