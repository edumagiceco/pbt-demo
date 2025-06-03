const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const User = require('../models').User;

const router = express.Router();

// 회원가입
router.post('/register', [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('사용자명은 3-50자 사이여야 합니다')
        .isAlphanumeric()
        .withMessage('사용자명은 영문과 숫자만 포함할 수 있습니다'),
    body('email')
        .isEmail()
        .withMessage('유효한 이메일 주소를 입력해주세요'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('비밀번호는 최소 6자 이상이어야 합니다'),
    body('fullName')
        .trim()
        .isLength({ min: 2 })
        .withMessage('이름을 입력해주세요')
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

        const { username, email, password, fullName, userType } = req.body;

        // 중복 확인
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '이미 사용 중인 사용자명 또는 이메일입니다'
            });
        }

        // 새 사용자 생성
        const user = await User.create({
            username,
            email,
            password,
            fullName,
            userType: userType || 'student'
        });

        // JWT 토큰 생성
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username,
                userType: user.userType 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                userType: user.userType
            }
        });

    } catch (error) {
        console.error('회원가입 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 로그인
router.post('/login', [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('이메일 또는 사용자명을 입력해주세요'),
    body('password')
        .notEmpty()
        .withMessage('비밀번호를 입력해주세요')
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

        const { email, password } = req.body;

        // 사용자 찾기 (username 또는 email로 검색)
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: email },
                    { email: email }
                ]
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '사용자명 또는 비밀번호가 일치하지 않습니다'
            });
        }

        // 비밀번호 확인
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: '사용자명 또는 비밀번호가 일치하지 않습니다'
            });
        }

        // 비활성 사용자 체크
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: '비활성화된 계정입니다'
            });
        }

        // 마지막 로그인 시간 업데이트
        await user.update({ lastLogin: new Date() });

        // JWT 토큰 생성
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username,
                userType: user.userType 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: '로그인 성공',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                userType: user.userType,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 현재 사용자 정보 조회
router.get('/me', async (req, res) => {
    try {
        // JWT 미들웨어에서 토큰을 검증하고 userId를 req.user에 설정한다고 가정
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: '인증 토큰이 필요합니다'
            });
        }

        const token = authHeader.substring(7);
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 토큰입니다'
            });
        }

        const user = await User.findByPk(decoded.userId);
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: '사용자를 찾을 수 없습니다'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                userType: user.userType,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

module.exports = router;
