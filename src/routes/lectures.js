const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const router = express.Router({ mergeParams: true }); // courseId를 상위 라우터에서 받기 위해
const lectureController = require('../controllers/lectureController');
const auth = require('../middleware/auth');

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/lectures');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `lecture-${uniqueSuffix}${extension}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'video/webm',
            'video/ogg'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('지원되지 않는 파일 형식입니다'), false);
        }
    }
});

// 강의 자료 생성/수정 유효성 검사
const lectureValidation = [
    body('title')
        .notEmpty()
        .withMessage('자료 제목은 필수입니다')
        .isLength({ min: 1, max: 200 })
        .withMessage('자료 제목은 1-200자 사이여야 합니다'),
    body('description')
        .optional()
        .isLength({ max: 5000 })
        .withMessage('자료 설명은 5000자를 초과할 수 없습니다'),
    body('type')
        .isIn(['video', 'document', 'quiz', 'assignment', 'live'])
        .withMessage('자료 유형은 video, document, quiz, assignment, live 중 하나여야 합니다'),
    body('videoUrl')
        .optional()
        .isURL()
        .withMessage('유효한 URL을 입력해주세요'),
    body('order')
        .optional()
        .isInt({ min: 0 })
        .withMessage('순서는 0 이상의 정수여야 합니다'),
    body('duration')
        .optional()
        .isInt({ min: 1 })
        .withMessage('예상 소요시간은 1분 이상이어야 합니다'),
    body('isPublished')
        .optional()
        .isBoolean()
        .withMessage('공개 여부는 true 또는 false여야 합니다'),
    body('isFree')
        .optional()
        .isBoolean()
        .withMessage('무료 여부는 true 또는 false여야 합니다'),
    body('requiredForCompletion')
        .optional()
        .isBoolean()
        .withMessage('수료 필수 여부는 true 또는 false여야 합니다')
];

// 순서 변경 유효성 검사
const reorderValidation = [
    body('lectureOrders')
        .isArray({ min: 1 })
        .withMessage('강의 자료 순서 정보가 필요합니다'),
    body('lectureOrders.*.id')
        .isInt({ min: 1 })
        .withMessage('유효한 강의 자료 ID가 필요합니다'),
    body('lectureOrders.*.order')
        .isInt({ min: 0 })
        .withMessage('순서는 0 이상의 정수여야 합니다')
];

// 강의 자료 라우트 (모든 라우트에 개별적으로 auth 적용)
router.get('/', auth, lectureController.getLectures);                                    // 강의 자료 목록
router.get('/:lectureId', auth, lectureController.getLecture);                          // 강의 자료 상세
router.post('/', [auth, ...lectureValidation], lectureController.createLecture);             // 강의 자료 생성
router.put('/:lectureId', [auth, ...lectureValidation], lectureController.updateLecture);    // 강의 자료 수정
router.delete('/:lectureId', auth, lectureController.deleteLecture);                    // 강의 자료 삭제

// 파일 업로드
router.post('/upload', auth, upload.single('file'), lectureController.uploadFile);      // 파일 업로드

// 순서 변경
router.put('/reorder', [auth, ...reorderValidation], lectureController.reorderLectures);     // 자료 순서 변경

module.exports = router;