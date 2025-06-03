const express = require('express');
const { body, validationResult } = require('express-validator');
const { Assignment, Course, User, AssignmentSubmission } = require('../models');
const router = express.Router();

// Auth 미들웨어 (임시)
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: '인증이 필요합니다' });
    }
    
    // 임시 사용자 정보 설정 (실제로는 JWT 검증)
    req.user = { id: 6, userType: 'student' };
    next();
};

// 과제 상세 조회
const getAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const assignment = await Assignment.findByPk(id, {
            include: [
                {
                    model: Course,
                    attributes: ['id', 'title']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'fullName', 'username']
                }
            ]
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: '과제를 찾을 수 없습니다'
            });
        }

        // 사용자의 제출 내역 조회
        let userSubmissions = [];
        if (req.user) {
            userSubmissions = await AssignmentSubmission.findAll({
                where: { 
                    assignmentId: id, 
                    userId: req.user.id 
                },
                order: [['submittedAt', 'DESC']]
            });
        }

        res.json({
            success: true,
            data: {
                ...assignment.toJSON(),
                userSubmissions
            },
            message: '과제 정보를 가져왔습니다'
        });
    } catch (error) {
        console.error('과제 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '과제 정보를 가져오는 중 오류가 발생했습니다'
        });
    }
};

// 과제 제출
const submitAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { submissionText, files } = req.body;
        const userId = req.user.id;

        // 과제 존재 확인
        const assignment = await Assignment.findByPk(id);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: '과제를 찾을 수 없습니다'
            });
        }

        // 마감일 확인
        if (assignment.dueDate && new Date() > assignment.dueDate) {
            return res.status(400).json({
                success: false,
                message: '과제 제출 기한이 지났습니다'
            });
        }

        // 제출 횟수 확인
        const submissionCount = await AssignmentSubmission.count({
            where: { assignmentId: id, userId }
        });

        if (assignment.maxSubmissions && submissionCount >= assignment.maxSubmissions) {
            return res.status(400).json({
                success: false,
                message: '최대 제출 횟수를 초과했습니다'
            });
        }

        // 과제 제출 생성
        const submission = await AssignmentSubmission.create({
            assignmentId: id,
            userId,
            submissionText,
            submittedAt: new Date(),
            status: 'submitted',
            attempt: submissionCount + 1,
            isLate: assignment.dueDate && new Date() > assignment.dueDate
        });

        res.json({
            success: true,
            data: submission,
            message: '과제가 성공적으로 제출되었습니다'
        });
    } catch (error) {
        console.error('과제 제출 오류:', error);
        res.status(500).json({
            success: false,
            message: '과제 제출 중 오류가 발생했습니다'
        });
    }
};

// 과제 제출 내역 조회
const getSubmissions = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const submissions = await AssignmentSubmission.findAll({
            where: { assignmentId: id, userId },
            order: [['submittedAt', 'DESC']]
        });

        res.json({
            success: true,
            data: submissions,
            message: '제출 내역을 가져왔습니다'
        });
    } catch (error) {
        console.error('제출 내역 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '제출 내역을 가져오는 중 오류가 발생했습니다'
        });
    }
};

// 사용자의 모든 과제 목록 조회
const getUserAssignments = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 사용자가 수강 중인 과정들의 과제 조회
        const assignments = await Assignment.findAll({
            include: [
                {
                    model: Course,
                    attributes: ['id', 'title'],
                    include: [
                        {
                            model: CourseEnrollment,
                            where: { userId },
                            attributes: []
                        }
                    ]
                }
            ],
            where: { isPublished: true },
            order: [['dueDate', 'ASC']]
        });

        // 각 과제별 제출 상태 확인
        const assignmentsWithStatus = await Promise.all(
            assignments.map(async (assignment) => {
                const submission = await AssignmentSubmission.findOne({
                    where: { assignmentId: assignment.id, userId },
                    order: [['submittedAt', 'DESC']]
                });

                return {
                    ...assignment.toJSON(),
                    submissionStatus: submission ? submission.status : 'pending',
                    lastSubmission: submission,
                    isOverdue: assignment.dueDate && new Date() > assignment.dueDate
                };
            })
        );

        res.json({
            success: true,
            data: assignmentsWithStatus,
            message: '과제 목록을 가져왔습니다'
        });
    } catch (error) {
        console.error('사용자 과제 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '과제 목록을 가져오는 중 오류가 발생했습니다'
        });
    }
};

// 제출 검증 미들웨어
const validateSubmission = [
    body('submissionText')
        .optional()
        .isLength({ max: 10000 })
        .withMessage('제출 내용은 10000자를 초과할 수 없습니다'),
    body('files')
        .optional()
        .isArray()
        .withMessage('파일 목록은 배열이어야 합니다')
];

// 라우트 정의
router.get('/:id', auth, getAssignment);                           // 과제 상세 조회
router.post('/:id/submit', [auth, ...validateSubmission], submitAssignment); // 과제 제출
router.get('/:id/submissions', auth, getSubmissions);             // 과제 제출 내역 조회
router.get('/my/assignments', auth, getUserAssignments);          // 내 과제 목록

module.exports = router;