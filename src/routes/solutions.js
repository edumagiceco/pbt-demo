const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Solution = require('../models').Solution;
const Problem = require('../models').Problem;
const User = require('../models').User;
const TestCase = require('../models').TestCase;
const { executeCode, evaluateSolution, supportedLanguages } = require('../services/codeExecutor');

const router = express.Router();

// 솔루션 목록 조회
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, problemId, userId } = req.query;
        
        const offset = (page - 1) * limit;
        const where = {};
        
        // 필터링 조건
        if (problemId) where.problemId = problemId;
        if (userId) where.userId = userId;
        
        // 학생은 자신의 솔루션만 볼 수 있음
        if (req.user.userType === 'student') {
            where.userId = req.user.userId;
        }

        const solutions = await Solution.findAndCountAll({
            where,
            include: [
                {
                    model: Problem,
                    attributes: ['id', 'title']
                },
                {
                    model: User,
                    attributes: ['id', 'username', 'fullName']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['submittedAt', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                solutions: solutions.rows,
                pagination: {
                    total: solutions.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(solutions.count / limit)
                }
            }
        });

    } catch (error) {
        console.error('솔루션 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 솔루션 상세 조회
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const solution = await Solution.findByPk(id, {
            include: [
                {
                    model: Problem,
                    attributes: ['id', 'title', 'instructorId']
                },
                {
                    model: User,
                    attributes: ['id', 'username', 'fullName']
                }
            ]
        });

        if (!solution) {
            return res.status(404).json({
                success: false,
                message: '솔루션을 찾을 수 없습니다'
            });
        }

        // 권한 확인: 작성자, 문제 작성자, 관리자만 볼 수 있음
        const canView = 
            solution.userId === req.user.userId ||
            solution.Problem.instructorId === req.user.userId ||
            req.user.userType === 'admin';

        if (!canView) {
            return res.status(403).json({
                success: false,
                message: '솔루션 조회 권한이 없습니다'
            });
        }

        res.json({
            success: true,
            data: solution
        });

    } catch (error) {
        console.error('솔루션 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 솔루션 제출
router.post('/', [
    auth,
    body('problemId')
        .isInt({ min: 1 })
        .withMessage('유효한 문제 ID를 입력해주세요'),
    body('code')
        .trim()
        .isLength({ min: 1 })
        .withMessage('코드를 입력해주세요'),
    body('language')
        .trim()
        .isLength({ min: 1 })
        .withMessage('프로그래밍 언어를 선택해주세요')
], async (req, res) => {
    try {
        // 유효성 검사
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 데이터가 유효하지 않습니다',
                errors: errors.array()
            });
        }

        const { problemId, code, language } = req.body;

        // 문제 존재 확인
        const problem = await Problem.findByPk(problemId);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: '문제를 찾을 수 없습니다'
            });
        }

        // 문제 상태 확인
        if (problem.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: '현재 제출할 수 없는 문제입니다'
            });
        }

        // 제출 기한 확인
        if (problem.endDate && new Date() > new Date(problem.endDate)) {
            return res.status(400).json({
                success: false,
                message: '제출 기한이 지난 문제입니다'
            });
        }

        const solution = await Solution.create({
            problemId,
            userId: req.user.userId,
            code,
            language,
            submittedAt: new Date(),
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: '솔루션이 제출되었습니다',
            data: solution
        });

    } catch (error) {
        console.error('솔루션 제출 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 코드 실행 (테스트 실행)
router.post('/run', [
    auth,
    body('code')
        .trim()
        .isLength({ min: 1 })
        .withMessage('코드를 입력해주세요'),
    body('language')
        .isIn(Object.keys(supportedLanguages))
        .withMessage('지원하지 않는 프로그래밍 언어입니다'),
    body('input')
        .optional()
        .trim()
], async (req, res) => {
    try {
        // 유효성 검사
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 데이터가 유효하지 않습니다',
                errors: errors.array()
            });
        }

        const { code, language, input } = req.body;

        const result = await executeCode(code, language, input || '');

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('코드 실행 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다: ' + error.message
        });
    }
});

// 솔루션 자동 평가 (학생 제출 후 자동 평가)
router.post('/:id/auto-evaluate', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const solution = await Solution.findByPk(id, {
            include: [{
                model: Problem,
                attributes: ['id', 'title', 'instructorId', 'maxScore']
            }]
        });

        if (!solution) {
            return res.status(404).json({
                success: false,
                message: '솔루션을 찾을 수 없습니다'
            });
        }

        // 권한 확인: 자신의 솔루션이거나 문제 작성자 또는 관리자만 평가 가능
        const canEvaluate = 
            solution.userId === req.user.userId ||
            solution.Problem.instructorId === req.user.userId ||
            req.user.userType === 'admin';

        if (!canEvaluate) {
            return res.status(403).json({
                success: false,
                message: '이 솔루션을 평가할 권한이 없습니다'
            });
        }

        // 해당 문제의 테스트 케이스 가져오기
        const testCases = await TestCase.findAll({
            where: { problemId: solution.problemId },
            order: [['isHidden', 'ASC'], ['id', 'ASC']]
        });

        if (testCases.length === 0) {
            return res.status(404).json({
                success: false,
                message: '이 문제에 대한 테스트 케이스가 없습니다'
            });
        }

        // 솔루션 평가
        const evaluationResult = await evaluateSolution(
            solution.code,
            solution.language,
            testCases
        );

        // 평가 결과 저장
        const score = (evaluationResult.percentageScore / 100) * solution.Problem.maxScore;
        
        await solution.update({
            output: JSON.stringify(evaluationResult),
            score,
            executionTime: evaluationResult.executionTime,
            status: 'evaluated',
            evaluatedAt: new Date()
        });

        res.json({
            success: true,
            message: '솔루션 자동 평가가 완료되었습니다',
            data: {
                solution: {
                    id: solution.id,
                    score,
                    status: 'evaluated'
                },
                evaluationResult
            }
        });

    } catch (error) {
        console.error('솔루션 자동 평가 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다: ' + error.message
        });
    }
});

// 솔루션 평가 (강사만 가능)
router.put('/:id/evaluate', [
    auth,
    body('score')
        .isFloat({ min: 0, max: 100 })
        .withMessage('점수는 0-100 사이의 값이어야 합니다'),
    body('feedback')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('피드백은 1000자 이하여야 합니다')
], async (req, res) => {
    try {
        // 권한 확인
        if (req.user.userType !== 'instructor' && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '평가 권한이 없습니다'
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

        const { id } = req.params;
        const { score, feedback } = req.body;

        const solution = await Solution.findByPk(id, {
            include: [{
                model: Problem,
                attributes: ['id', 'title', 'instructorId']
            }]
        });

        if (!solution) {
            return res.status(404).json({
                success: false,
                message: '솔루션을 찾을 수 없습니다'
            });
        }

        // 문제 작성자 또는 관리자만 평가 가능
        if (solution.Problem.instructorId !== req.user.userId && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '이 솔루션을 평가할 권한이 없습니다'
            });
        }

        await solution.update({
            score,
            feedback,
            evaluatedAt: new Date(),
            status: 'evaluated'
        });

        res.json({
            success: true,
            message: '솔루션 평가가 완료되었습니다',
            data: solution
        });

    } catch (error) {
        console.error('솔루션 평가 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

module.exports = router;
