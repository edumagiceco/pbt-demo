const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 컨트롤러 임포트
const mentorController = require('../controllers/mentorController');
const knowledgeController = require('../controllers/knowledgeController');
const chatController = require('../controllers/chatController');

// 인증 미들웨어 (기존 인증 시스템 활용)
const auth = require('../middleware/auth');

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads/mentors');
        
        // 디렉토리가 없으면 생성
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB 제한
    },
    fileFilter: function (req, file, cb) {
        // PDF 파일만 허용
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('PDF 파일만 업로드 가능합니다.'));
        }
    }
});

// ==================== 멘토 관리 라우트 ====================

// 멘토 목록 조회 (내 멘토 + 공개 멘토)
router.get('/', auth, mentorController.getMentors);

// 인기 멘토 조회
router.get('/popular', auth, mentorController.getPopularMentors);

// 멘토 상세 조회
router.get('/:id', auth, mentorController.getMentor);

// 멘토 생성
router.post('/', auth, mentorController.createMentor);

// 멘토 수정
router.put('/:id', auth, mentorController.updateMentor);

// 멘토 삭제
router.delete('/:id', auth, mentorController.deleteMentor);

// ==================== 멘토 지식 관리 라우트 ====================

// 멘토 지식 목록 조회
router.get('/:mentorId/knowledge', auth, knowledgeController.getKnowledge);

// 텍스트 지식 추가
router.post('/:mentorId/knowledge/text', auth, knowledgeController.addTextKnowledge);

// PDF 지식 추가
router.post('/:mentorId/knowledge/pdf', auth, upload.single('pdf'), knowledgeController.addPdfKnowledge);

// 유튜브 지식 추가
router.post('/:mentorId/knowledge/youtube', auth, knowledgeController.addYoutubeKnowledge);

// 웹사이트 지식 추가
router.post('/:mentorId/knowledge/website', auth, knowledgeController.addWebsiteKnowledge);

// 지식 삭제
router.delete('/:mentorId/knowledge/:knowledgeId', auth, knowledgeController.deleteKnowledge);

// ==================== 멘토 채팅 라우트 ====================

// 새 대화 시작
router.post('/:mentorId/chat/start', auth, chatController.startConversation);

// 메시지 전송
router.post('/:mentorId/chat/message', auth, chatController.sendMessage);

// 대화 이력 조회
router.get('/:mentorId/conversations', auth, chatController.getConversations);

// 특정 대화 상세 조회
router.get('/conversations/:sessionId', auth, chatController.getConversation);

// 대화 평가
router.post('/conversations/:sessionId/rate', auth, chatController.rateConversation);

// ==================== 오류 처리 미들웨어 ====================

// 파일 업로드 오류 처리
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: '파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.'
            });
        }
    }
    
    if (error.message === 'PDF 파일만 업로드 가능합니다.') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
});

module.exports = router;
