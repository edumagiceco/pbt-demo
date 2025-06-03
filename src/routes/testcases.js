const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { TestCase, Problem } = require('../models');

const router = express.Router();

// 특정 문제의 테스트케이스 목록 조회
router.get('/problem/:problemId', async (req, res) => {
    try {
        const { problemId } = req.params;
        const { includeHidden = 'false' } = req.query;

        // 문제 존재 확인
        const problem = await Problem.findByPk(problemId);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: '문제를 찾을 수 없습니다'
            });
        }

        const where = { problemId };
        
        // 일반 사용자는 히든 테스트케이스 제외
        if (includeHidden !== 'true') {
            where.isHidden = false;
        }

        const testcases = await TestCase.findAll({
            where,
            order: [['createdAt', 'ASC']]
        });

        res.json({
            success: true,
            data: testcases
        });

    } catch (error) {
        console.error('테스트케이스 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 테스트케이스 상세 조회
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const testcase = await TestCase.findByPk(id, {
            include: [{
                model: Problem,
                attributes: ['id', 'title', 'instructorId']
            }]
        });

        if (!testcase) {
            return res.status(404).json({
                success: false,
                message: '테스트케이스를 찾을 수 없습니다'
            });
        }

        res.json({
            success: true,
            data: testcase
        });

    } catch (error) {
        console.error('테스트케이스 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 테스트케이스 생성 (강사만 가능)
router.post('/', [
    auth,
    body('problemId')
        .isInt({ min: 1 })
        .withMessage('유효한 문제 ID를 입력해주세요'),
    body('input')
        .trim()
        .isLength({ min: 0 })
        .withMessage('입력값은 필수입니다'),
    body('expectedOutput')
        .trim()
        .isLength({ min: 0 })
        .withMessage('예상 출력값은 필수입니다'),
    body('points')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('점수는 1-100 사이의 정수여야 합니다')
], async (req, res) => {
    try {
        // 권한 확인
        if (req.user.userType !== 'instructor' && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '테스트케이스 생성 권한이 없습니다'
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

        const { problemId, input, expectedOutput, isHidden, points } = req.body;

        // 문제 존재 확인 및 작성자 권한 확인
        const problem = await Problem.findByPk(problemId);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: '문제를 찾을 수 없습니다'
            });
        }

        // 문제 작성자 또는 관리자만 테스트케이스 생성 가능
        if (problem.instructorId !== req.user.userId && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '이 문제의 테스트케이스를 생성할 권한이 없습니다'
            });
        }

        const testcase = await TestCase.create({
            problemId,
            input,
            expectedOutput,
            isHidden: isHidden || false,
            points: points || 10
        });

        res.status(201).json({
            success: true,
            message: '테스트케이스가 생성되었습니다',
            data: testcase
        });

    } catch (error) {
        console.error('테스트케이스 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 테스트케이스 수정 (문제 작성자만 가능)
router.put('/:id', [
    auth,
    body('input')
        .optional()
        .trim()
        .isLength({ min: 0 })
        .withMessage('입력값은 필수입니다'),
    body('expectedOutput')
        .optional()
        .trim()
        .isLength({ min: 0 })
        .withMessage('예상 출력값은 필수입니다'),
    body('points')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('점수는 1-100 사이의 정수여야 합니다')
], async (req, res) => {
    try {
        const { id } = req.params;

        const testcase = await TestCase.findByPk(id, {
            include: [{
                model: Problem,
                attributes: ['id', 'instructorId']
            }]
        });

        if (!testcase) {
            return res.status(404).json({
                success: false,
                message: '테스트케이스를 찾을 수 없습니다'
            });
        }

        // 문제 작성자 또는 관리자만 수정 가능
        if (testcase.Problem.instructorId !== req.user.userId && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '테스트케이스 수정 권한이 없습니다'
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

        await testcase.update(req.body);

        res.json({
            success: true,
            message: '테스트케이스가 수정되었습니다',
            data: testcase
        });

    } catch (error) {
        console.error('테스트케이스 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 테스트케이스 삭제 (문제 작성자만 가능)
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const testcase = await TestCase.findByPk(id, {
            include: [{
                model: Problem,
                attributes: ['id', 'instructorId']
            }]
        });

        if (!testcase) {
            return res.status(404).json({
                success: false,
                message: '테스트케이스를 찾을 수 없습니다'
            });
        }

        // 문제 작성자 또는 관리자만 삭제 가능
        if (testcase.Problem.instructorId !== req.user.userId && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '테스트케이스 삭제 권한이 없습니다'
            });
        }

        await testcase.destroy();

        res.json({
            success: true,
            message: '테스트케이스가 삭제되었습니다'
        });

    } catch (error) {
        console.error('테스트케이스 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

module.exports = router;
