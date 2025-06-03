const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Problem = require('../models').Problem;
const User = require('../models').User;

const router = express.Router();

// 문제 목록 조회
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, difficulty, status } = req.query;
        
        const offset = (page - 1) * limit;
        const where = {};
        
        // 필터링 조건
        if (category) where.category = category;
        if (difficulty) where.difficulty = difficulty;
        if (status) where.status = status;

        const problems = await Problem.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'instructor',
                attributes: ['id', 'username', 'fullName']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            problems: problems.rows,
            total: problems.count,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(problems.count / limit)
            }
        });

    } catch (error) {
        console.error('문제 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 문제 상세 조회
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const problem = await Problem.findByPk(id, {
            include: [{
                model: User,
                as: 'instructor',
                attributes: ['id', 'username', 'fullName']
            }]
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: '문제를 찾을 수 없습니다'
            });
        }

        res.json({
            success: true,
            ...problem.toJSON()
        });

    } catch (error) {
        console.error('문제 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 문제 생성 (강사만 가능)
router.post('/', [
    auth,
    body('title')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('제목은 5-200자 사이여야 합니다'),
    body('description')
        .trim()
        .isLength({ min: 10 })
        .withMessage('설명은 최소 10자 이상이어야 합니다'),
    body('difficulty')
        .isIn(['beginner', 'intermediate', 'advanced'])
        .withMessage('유효한 난이도를 선택해주세요'),
    body('category')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('카테고리는 2-50자 사이여야 합니다')
], async (req, res) => {
    try {
        // 권한 확인
        if (req.user.userType !== 'instructor' && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '문제 생성 권한이 없습니다'
            });
        }

        // 유효성 검사
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 데이터가 유효하지 않습니다',
                errors: errors.array()
            });
        }

        const {
            title,
            description,
            difficulty,
            category,
            maxScore,
            timeLimit,
            startDate,
            endDate
        } = req.body;

        const problem = await Problem.create({
            title,
            description,
            difficulty,
            category,
            instructorId: req.user.userId,
            maxScore: maxScore || 100,
            timeLimit,
            startDate,
            endDate,
            status: 'draft'
        });

        res.status(201).json({
            success: true,
            message: '문제가 생성되었습니다',
            data: problem
        });

    } catch (error) {
        console.error('문제 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 문제 수정 (작성자만 가능)
router.put('/:id', [
    auth,
    body('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('제목은 5-200자 사이여야 합니다'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage('설명은 최소 10자 이상이어야 합니다')
], async (req, res) => {
    try {
        const { id } = req.params;

        const problem = await Problem.findByPk(id);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: '문제를 찾을 수 없습니다'
            });
        }

        // 작성자 또는 관리자만 수정 가능
        if (problem.instructorId !== req.user.userId && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '문제 수정 권한이 없습니다'
            });
        }

        // 유효성 검사
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 데이터가 유효하지 않습니다',
                errors: errors.array()
            });
        }

        await problem.update(req.body);

        res.json({
            success: true,
            message: '문제가 수정되었습니다',
            data: problem
        });

    } catch (error) {
        console.error('문제 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 문제 삭제 (작성자만 가능)
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const problem = await Problem.findByPk(id);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: '문제를 찾을 수 없습니다'
            });
        }

        // 작성자 또는 관리자만 삭제 가능
        if (problem.instructorId !== req.user.userId && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '문제 삭제 권한이 없습니다'
            });
        }

        await problem.destroy();

        res.json({
            success: true,
            message: '문제가 삭제되었습니다'
        });

    } catch (error) {
        console.error('문제 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

module.exports = router;
