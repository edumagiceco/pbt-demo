const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const User = require('../models').User;

const router = express.Router();

// 사용자 프로필 조회
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다'
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('프로필 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 사용자 목록 조회 (관리자만 가능)
router.get('/', auth, async (req, res) => {
    try {
        // 권한 확인
        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '관리자만 사용자 목록을 조회할 수 있습니다'
            });
        }

        const { page = 1, limit = 10, userType, isActive } = req.query;
        
        const offset = (page - 1) * limit;
        const where = {};
        
        // 필터링 조건
        if (userType) where.userType = userType;
        if (isActive !== undefined) where.isActive = isActive === 'true';

        const users = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                users: users.rows,
                pagination: {
                    total: users.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(users.count / limit)
                }
            }
        });

    } catch (error) {
        console.error('사용자 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 사용자 정보 수정
router.put('/profile', [
    auth,
    body('email')
        .optional()
        .isEmail()
        .withMessage('유효한 이메일 주소를 입력해주세요'),
    body('fullName')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('이름은 최소 2자 이상이어야 합니다')
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

        const { email, fullName, profileImage } = req.body;
        const updateData = {};

        if (email) {
            // 이메일 중복 확인
            const existingUser = await User.findOne({
                where: { 
                    email,
                    id: { [Op.ne]: req.user.id }
                }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: '이미 사용 중인 이메일입니다'
                });
            }
            updateData.email = email;
        }

        if (fullName) updateData.fullName = fullName;
        if (profileImage) updateData.profileImage = profileImage;

        const user = await User.findByPk(req.user.id);
        await user.update(updateData);

        // 업데이트된 사용자 정보 반환 (비밀번호 제외)
        const updatedUser = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.json({
            success: true,
            message: '프로필이 수정되었습니다',
            data: updatedUser
        });

    } catch (error) {
        console.error('프로필 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 비밀번호 변경
router.put('/password', [
    auth,
    body('currentPassword')
        .notEmpty()
        .withMessage('현재 비밀번호를 입력해주세요'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('새 비밀번호는 최소 6자 이상이어야 합니다'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('새 비밀번호와 확인 비밀번호가 일치하지 않습니다');
            }
            return true;
        })
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

        const { currentPassword, newPassword } = req.body;

        const user = await User.findByPk(req.user.id);
        
        // 현재 비밀번호 확인
        const isValidPassword = await user.validatePassword(currentPassword);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: '현재 비밀번호가 일치하지 않습니다'
            });
        }

        // 새 비밀번호로 업데이트
        await user.update({ password: newPassword });

        res.json({
            success: true,
            message: '비밀번호가 변경되었습니다'
        });

    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 사용자 상태 변경 (관리자만 가능)
router.put('/:id/status', [
    auth,
    body('isActive')
        .isBoolean()
        .withMessage('활성 상태는 true 또는 false여야 합니다')
], async (req, res) => {
    try {
        // 권한 확인
        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '관리자만 사용자 상태를 변경할 수 있습니다'
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
        const { isActive } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다'
            });
        }

        await user.update({ isActive });

        res.json({
            success: true,
            message: `사용자가 ${isActive ? '활성화' : '비활성화'}되었습니다`,
            data: { id: user.id, isActive: user.isActive }
        });

    } catch (error) {
        console.error('사용자 상태 변경 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

module.exports = router;
