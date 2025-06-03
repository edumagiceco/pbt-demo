const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { LearningMaterial, Problem, User } = require('../models');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/materials');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|webm|doc|docx|ppt|pptx|xls|xlsx|zip|rar|txt|md/i;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('지원되지 않는 파일 형식입니다. 허용된 형식: 이미지, PDF, 비디오, 문서, 압축파일'));
};

// Upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// 특정 문제의 학습 자료 목록 조회
router.get('/problem/:problemId', async (req, res) => {
    try {
        const { problemId } = req.params;

        // 문제 존재 확인
        const problem = await Problem.findByPk(problemId);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: '문제를 찾을 수 없습니다'
            });
        }

        const materials = await LearningMaterial.findAll({
            where: { problemId },
            include: [{
                model: User,
                as: 'uploader',
                attributes: ['id', 'username', 'fullName']
            }],
            order: [['createdAt', 'ASC']]
        });

        res.json({
            success: true,
            data: materials
        });

    } catch (error) {
        console.error('학습 자료 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 학습 자료 상세 조회
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const material = await LearningMaterial.findByPk(id, {
            include: [{
                model: User,
                as: 'uploader',
                attributes: ['id', 'username', 'fullName']
            }, {
                model: Problem,
                attributes: ['id', 'title', 'instructorId']
            }]
        });

        if (!material) {
            return res.status(404).json({
                success: false,
                message: '학습 자료를 찾을 수 없습니다'
            });
        }

        res.json({
            success: true,
            data: material
        });

    } catch (error) {
        console.error('학습 자료 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 학습 자료 업로드 (강사/관리자만 가능)
router.post('/', [
    auth,
    upload.single('file'),
    body('problemId')
        .isInt({ min: 1 })
        .withMessage('유효한 문제 ID를 입력해주세요'),
    body('title')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('제목은 2-200자 사이여야 합니다'),
    body('type')
        .isIn(['video', 'document', 'link', 'code'])
        .withMessage('유효한 자료 타입을 선택해주세요'),
    body('url')
        .optional()
        .isURL()
        .withMessage('유효한 URL을 입력해주세요')
], async (req, res) => {
    try {
        // 권한 확인
        if (req.user.userType !== 'instructor' && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '학습 자료 업로드 권한이 없습니다'
            });
        }

        // 유효성 검사
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // 업로드된 파일이 있으면 삭제
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(400).json({
                success: false,
                message: '입력 데이터가 유효하지 않습니다',
                errors: errors.array()
            });
        }

        const { problemId, title, type, url } = req.body;

        // 문제 존재 확인
        const problem = await Problem.findByPk(problemId);
        if (!problem) {
            // 업로드된 파일이 있으면 삭제
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(404).json({
                success: false,
                message: '문제를 찾을 수 없습니다'
            });
        }

        // 파일 타입이지만 파일이 없는 경우
        if ((type === 'video' || type === 'document') && !req.file) {
            return res.status(400).json({
                success: false,
                message: '파일 업로드가 필요합니다'
            });
        }

        // 링크 타입이지만 URL이 없는 경우
        if (type === 'link' && !url) {
            return res.status(400).json({
                success: false,
                message: 'URL을 입력해주세요'
            });
        }

        const material = await LearningMaterial.create({
            problemId,
            title,
            type,
            filePath: req.file ? `/uploads/materials/${req.file.filename}` : null,
            url: url || null,
            uploadedBy: req.user.userId,
            fileSize: req.file ? req.file.size : null,
            // 동영상 길이는 별도 처리 필요 (multer로는 불가능)
        });

        res.status(201).json({
            success: true,
            message: '학습 자료가 업로드되었습니다',
            data: material
        });

    } catch (error) {
        console.error('학습 자료 업로드 오류:', error);
        
        // 업로드된 파일이 있으면 삭제
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 학습 자료 수정 (업로더 또는 관리자만 가능)
router.put('/:id', [
    auth,
    body('title')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('제목은 2-200자 사이여야 합니다'),
    body('url')
        .optional()
        .isURL()
        .withMessage('유효한 URL을 입력해주세요')
], async (req, res) => {
    try {
        const { id } = req.params;

        const material = await LearningMaterial.findByPk(id);
        if (!material) {
            return res.status(404).json({
                success: false,
                message: '학습 자료를 찾을 수 없습니다'
            });
        }

        // 업로더 또는 관리자만 수정 가능
        if (material.uploadedBy !== req.user.userId && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '학습 자료 수정 권한이 없습니다'
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

        // 수정 가능한 필드만 추출
        const { title, url } = req.body;
        const updateData = {};
        
        if (title) updateData.title = title;
        if (url && material.type === 'link') updateData.url = url;

        await material.update(updateData);

        res.json({
            success: true,
            message: '학습 자료가 수정되었습니다',
            data: material
        });

    } catch (error) {
        console.error('학습 자료 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 학습 자료 삭제 (업로더 또는 관리자만 가능)
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const material = await LearningMaterial.findByPk(id);
        if (!material) {
            return res.status(404).json({
                success: false,
                message: '학습 자료를 찾을 수 없습니다'
            });
        }

        // 업로더 또는 관리자만 삭제 가능
        if (material.uploadedBy !== req.user.userId && req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '학습 자료 삭제 권한이 없습니다'
            });
        }

        // 파일이 있는 경우 삭제
        if (material.filePath) {
            const filePath = path.join(__dirname, '../../', material.filePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await material.destroy();

        res.json({
            success: true,
            message: '학습 자료가 삭제되었습니다'
        });

    } catch (error) {
        console.error('학습 자료 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

// 파일 다운로드
router.get('/download/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const material = await LearningMaterial.findByPk(id);
        if (!material) {
            return res.status(404).json({
                success: false,
                message: '학습 자료를 찾을 수 없습니다'
            });
        }

        // 파일 경로가 없는 경우
        if (!material.filePath) {
            return res.status(400).json({
                success: false,
                message: '다운로드할 파일이 없습니다'
            });
        }

        const filePath = path.join(__dirname, '../../', material.filePath);
        
        // 파일 존재 확인
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: '파일을 찾을 수 없습니다'
            });
        }

        // 파일 다운로드
        res.download(filePath, `${material.title}${path.extname(material.filePath)}`);

    } catch (error) {
        console.error('파일 다운로드 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
        });
    }
});

module.exports = router;