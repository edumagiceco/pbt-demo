const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');

// 테스트용 간단한 라우트
router.get('/', (req, res) => {
    res.json({ message: '강의 라우트 테스트' });
});

router.get('/test', (req, res) => {
    res.json({ message: '강의 API 작동 중' });
});

module.exports = router;