const express = require('express');
const { InstructorAiController, upload } = require('../controllers/instructorAiController');
const auth = require('../middleware/auth');

const router = express.Router();
const instructorAiController = new InstructorAiController();

// 모든 라우트에 인증 미들웨어 적용
router.use(auth);

// 강의 자료 관련 라우트
router.get('/materials', instructorAiController.getMaterials.bind(instructorAiController));
router.get('/materials/:id', instructorAiController.getMaterialDetail.bind(instructorAiController));
router.post('/materials/upload', 
    upload.single('file'), 
    instructorAiController.uploadAndAnalyzeMaterial.bind(instructorAiController)
);

// 강사 AI 채팅 라우트
router.post('/chat', instructorAiController.chat.bind(instructorAiController));

// 개념 설명 라우트
router.post('/explain', instructorAiController.explainConcept.bind(instructorAiController));

// 자료 분석 상태 확인 라우트
router.get('/materials/:id/analysis-status', async (req, res) => {
    try {
        const { id } = req.params;
        const db = require('../models');
        
        const material = await db.LectureMaterial.findByPk(id, {
            attributes: ['id', 'title', 'analyzedAt', 'summary', 'concepts']
        });
        
        if (!material) {
            return res.status(404).json({
                success: false,
                message: '자료를 찾을 수 없습니다.'
            });
        }
        
        const isAnalyzed = !!material.analyzedAt;
        
        res.json({
            success: true,
            data: {
                isAnalyzed,
                analyzedAt: material.analyzedAt,
                hasSummary: !!material.summary,
                conceptCount: material.concepts ? material.concepts.length : 0
            }
        });
        
    } catch (error) {
        console.error('분석 상태 확인 오류:', error);
        res.status(500).json({
            success: false,
            message: '분석 상태를 확인하는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 채팅 히스토리 조회 라우트
router.get('/chat/:sessionId/history', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const db = require('../models');
        
        const chat = await db.InstructorChat.findOne({
            where: { sessionId, userId },
            include: [{
                model: db.LectureMaterial,
                as: 'material',
                attributes: ['id', 'title', 'type']
            }]
        });
        
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: '채팅 히스토리를 찾을 수 없습니다.'
            });
        }
        
        res.json({
            success: true,
            data: {
                sessionId: chat.sessionId,
                messages: chat.messages,
                totalMessages: chat.messages ? chat.messages.length : 0,
                lastMessageAt: chat.lastMessageAt,
                material: chat.material
            }
        });
        
    } catch (error) {
        console.error('채팅 히스토리 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '채팅 히스토리를 불러오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 사용자의 최근 채팅 세션 목록 조회
router.get('/chat/sessions', async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        const db = require('../models');
        
        const sessions = await db.InstructorChat.findAndCountAll({
            where: { userId },
            include: [{
                model: db.LectureMaterial,
                as: 'material',
                attributes: ['id', 'title', 'type']
            }],
            attributes: ['sessionId', 'messages', 'lastMessageAt', 'createdAt'],
            order: [['lastMessageAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        res.json({
            success: true,
            data: {
                sessions: sessions.rows,
                pagination: {
                    total: sessions.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(sessions.count / limit)
                }
            }
        });
        
    } catch (error) {
        console.error('채팅 세션 목록 조회 오료:', error);
        res.status(500).json({
            success: false,
            message: '채팅 세션 목록을 불러오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 채팅 평가 라우트
router.post('/chat/:sessionId/rate', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { rating, feedback } = req.body;
        const userId = req.user.id;
        const db = require('../models');
        
        const chat = await db.InstructorChat.findOne({
            where: { sessionId, userId }
        });
        
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: '채팅 세션을 찾을 수 없습니다.'
            });
        }
        
        await chat.update({
            rating: parseInt(rating),
            feedback: feedback || null
        });
        
        res.json({
            success: true,
            message: '평가가 저장되었습니다.'
        });
        
    } catch (error) {
        console.error('채팅 평가 오류:', error);
        res.status(500).json({
            success: false,
            message: '평가 저장 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 개념 검색 라우트
router.get('/concepts/search', async (req, res) => {
    try {
        const { q, materialId, difficulty } = req.query;
        const db = require('../models');
        
        const whereClause = {};
        
        if (q) {
            whereClause[db.Sequelize.Op.or] = [
                { concept: { [db.Sequelize.Op.like]: `%${q}%` } },
                { definition: { [db.Sequelize.Op.like]: `%${q}%` } }
            ];
        }
        
        if (materialId) {
            whereClause.materialId = materialId;
        }
        
        if (difficulty) {
            whereClause.difficulty = difficulty;
        }
        
        const concepts = await db.ConceptExplanation.findAll({
            where: whereClause,
            include: [{
                model: db.LectureMaterial,
                as: 'material',
                attributes: ['id', 'title', 'type']
            }],
            order: [['rating', 'DESC'], ['createdAt', 'DESC']],
            limit: 20
        });
        
        res.json({
            success: true,
            data: concepts
        });
        
    } catch (error) {
        console.error('개념 검색 오류:', error);
        res.status(500).json({
            success: false,
            message: '개념 검색 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

module.exports = router;
