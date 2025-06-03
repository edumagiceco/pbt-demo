const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { Discussion, Comment, User, Problem } = require('../models');

const router = express.Router();

// 특정 문제의 토론 목록 조회
router.get('/problem/:problemId', async (req, res) => {
    try {
        const { problemId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 문제 존재 확인
        const problem = await Problem.findByPk(problemId);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: '문제를 찾을 수 없습니다'
            });
        }

        const { count, rows: discussions } = await Discussion.findAndCountAll({
            where: { problemId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'fullName']
                },
                {
                    model: Comment,
                    include: [{
                        model: User,
                        attributes: ['id', 'username', 'fullName']
                    }]
                }
            ],
            order: [
                ['isPinned', 'DESC'],
                ['createdAt', 'DESC']
            ],
            limit,
            offset
        });

        res.json({
            success: true,
            data: {
                discussions,
                pagination: {
                    total: count,
                    page,
                    pages: Math.ceil(count / limit),
                    limit
                }
            }
        });

    } catch (error) {
        console.error('토론 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 전체 토론 목록 조회 (모든 문제)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: discussions } = await Discussion.findAndCountAll({
            order: [
                ['isPinned', 'DESC'],
                ['createdAt', 'DESC']
            ],
            limit,
            offset
        });

        res.json({
            success: true,
            data: {
                discussions,
                pagination: {
                    total: count,
                    page,
                    pages: Math.ceil(count / limit),
                    limit
                }
            }
        });

    } catch (error) {
        console.error('전체 토론 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다',
            error: error.message
        });
    }
});

// 토론 상세 조회
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const discussion = await Discussion.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'fullName']
                },
                {
                    model: Problem,
                    attributes: ['id', 'title']
                },
                {
                    model: Comment,
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'username', 'fullName']
                        },
                        {
                            model: Comment,
                            as: 'replies',
                            include: [{
                                model: User,
                                attributes: ['id', 'username', 'fullName']
                            }]
                        }
                    ],
                    where: { parentId: null },
                    order: [['createdAt', 'ASC']],
                    required: false
                }
            ]
        });

        if (!discussion) {
            return res.status(404).json({
                success: false,
                message: '토론을 찾을 수 없습니다'
            });
        }

        // 조회수 증가
        await discussion.increment('viewCount');

        res.json({
            success: true,
            data: discussion
        });

    } catch (error) {
        console.error('토론 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 토론 생성
router.post('/', [
    auth,
    body('problemId')
        .isInt({ min: 1 })
        .withMessage('유효한 문제 ID를 입력해주세요'),
    body('title')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('제목은 2-200자 사이여야 합니다'),
    body('content')
        .trim()
        .isLength({ min: 10 })
        .withMessage('내용은 최소 10자 이상이어야 합니다')
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

        const { problemId, title, content } = req.body;

        // 문제 존재 확인
        const problem = await Problem.findByPk(problemId);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: '문제를 찾을 수 없습니다'
            });
        }

        const discussion = await Discussion.create({
            problemId,
            userId: req.user.userId,
            title,
            content
        });

        // 생성된 토론을 관련 정보와 함께 조회
        const createdDiscussion = await Discussion.findByPk(discussion.id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'fullName']
                },
                {
                    model: Problem,
                    attributes: ['id', 'title']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: '토론이 생성되었습니다',
            data: createdDiscussion
        });

    } catch (error) {
        console.error('토론 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 댓글 생성
router.post('/:discussionId/comments', [
    auth,
    body('content')
        .trim()
        .isLength({ min: 1 })
        .withMessage('댓글 내용을 입력해주세요'),
    body('parentId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('유효한 부모 댓글 ID를 입력해주세요')
], async (req, res) => {
    try {
        const { discussionId } = req.params;
        const { content, parentId } = req.body;

        // 유효성 검사
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 데이터가 유효하지 않습니다',
                errors: errors.array()
            });
        }

        // 토론 존재 확인
        const discussion = await Discussion.findByPk(discussionId);
        if (!discussion) {
            return res.status(404).json({
                success: false,
                message: '토론을 찾을 수 없습니다'
            });
        }

        // 부모 댓글 존재 확인 (대댓글인 경우)
        if (parentId) {
            const parentComment = await Comment.findByPk(parentId);
            if (!parentComment || parentComment.discussionId !== parseInt(discussionId)) {
                return res.status(404).json({
                    success: false,
                    message: '유효하지 않은 부모 댓글입니다'
                });
            }
        }

        const comment = await Comment.create({
            discussionId,
            userId: req.user.userId,
            content,
            parentId: parentId || null
        });

        // 생성된 댓글을 관련 정보와 함께 조회
        const createdComment = await Comment.findByPk(comment.id, {
            include: [{
                model: User,
                attributes: ['id', 'username', 'fullName']
            }]
        });

        res.status(201).json({
            success: true,
            message: '댓글이 작성되었습니다',
            data: createdComment
        });

    } catch (error) {
        console.error('댓글 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 토론 수정 (작성자만 가능)
router.put('/:id', [
    auth,
    body('title')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('제목은 2-200자 사이여야 합니다'),
    body('content')
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage('내용은 최소 10자 이상이어야 합니다')
], async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        const discussion = await Discussion.findByPk(id);
        if (!discussion) {
            return res.status(404).json({
                success: false,
                message: '토론을 찾을 수 없습니다'
            });
        }

        // 작성자 또는 관리자만 수정 가능
        if (discussion.userId !== req.user.userId && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '토론 수정 권한이 없습니다'
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

        const updateData = {};
        if (title) updateData.title = title;
        if (content) updateData.content = content;

        await discussion.update(updateData);

        res.json({
            success: true,
            message: '토론이 수정되었습니다',
            data: discussion
        });

    } catch (error) {
        console.error('토론 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 토론 삭제 (작성자 또는 관리자만 가능)
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const discussion = await Discussion.findByPk(id);
        if (!discussion) {
            return res.status(404).json({
                success: false,
                message: '토론을 찾을 수 없습니다'
            });
        }

        // 작성자 또는 관리자만 삭제 가능
        if (discussion.userId !== req.user.userId && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '토론 삭제 권한이 없습니다'
            });
        }

        // 관련 댓글도 함께 삭제 (cascade)
        await Comment.destroy({ where: { discussionId: id } });
        await discussion.destroy();

        res.json({
            success: true,
            message: '토론이 삭제되었습니다'
        });

    } catch (error) {
        console.error('토론 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

module.exports = router;
