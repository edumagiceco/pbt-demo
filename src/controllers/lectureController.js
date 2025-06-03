const { Lecture, Course, User, CourseEnrollment } = require('../models');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// 유튜브 URL에서 비디오 ID 추출 함수
const extractYouTubeVideoId = (url) => {
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
};

const lectureController = {
    // 강의 자료 목록 조회
    getLectures: async (req, res) => {
        try {
            const { courseId } = req.params;
            const userId = req.user?.id;

            // 강의 존재 확인
            const course = await Course.findByPk(courseId);
            if (!course) {
                return res.status(404).json({ message: '강의를 찾을 수 없습니다' });
            }

            // 권한 확인 (강사이거나 수강생이어야 함)
            const isInstructor = course.instructorId === userId;
            const isEnrolled = userId ? await CourseEnrollment.findOne({
                where: { courseId, userId }
            }) : null;

            if (!isInstructor && !isEnrolled) {
                return res.status(403).json({ message: '강의 자료 접근 권한이 없습니다' });
            }

            const where = { courseId };
            
            // 학생은 발행된 자료만 볼 수 있음
            if (!isInstructor) {
                where.isPublished = true;
            }

            const lectures = await Lecture.findAll({
                where,
                include: [
                    {
                        model: User,
                        as: 'uploader',
                        attributes: ['id', 'fullName', 'username']
                    }
                ],
                order: [['order', 'ASC'], ['createdAt', 'ASC']]
            });

            res.json({ lectures });
        } catch (error) {
            console.error('강의 자료 목록 조회 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    },

    // 강의 자료 상세 조회
    getLecture: async (req, res) => {
        try {
            const { courseId, lectureId } = req.params;
            const userId = req.user?.id;

            const lecture = await Lecture.findOne({
                where: { id: lectureId, courseId },
                include: [
                    {
                        model: Course
                    },
                    {
                        model: User,
                        as: 'uploader',
                        attributes: ['id', 'fullName', 'username']
                    }
                ]
            });

            if (!lecture) {
                return res.status(404).json({ message: '강의 자료를 찾을 수 없습니다' });
            }

            // 권한 확인
            const isInstructor = lecture.Course.instructorId === userId;
            const isEnrolled = userId ? await CourseEnrollment.findOne({
                where: { courseId, userId }
            }) : null;

            if (!isInstructor && !isEnrolled) {
                return res.status(403).json({ message: '강의 자료 접근 권한이 없습니다' });
            }

            // 학생은 발행된 자료만 볼 수 있음
            if (!isInstructor && !lecture.isPublished) {
                return res.status(403).json({ message: '아직 공개되지 않은 자료입니다' });
            }

            res.json({ lecture });
        } catch (error) {
            console.error('강의 자료 상세 조회 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    },

    // 강의 자료 생성 (강사만)
    createLecture: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    message: '입력 데이터가 유효하지 않습니다',
                    errors: errors.array() 
                });
            }

            const { courseId } = req.params;
            const userId = req.user.id;

            // 강의 존재 및 권한 확인
            const course = await Course.findByPk(courseId);
            if (!course) {
                return res.status(404).json({ message: '강의를 찾을 수 없습니다' });
            }

            if (course.instructorId !== userId && req.user.userType !== 'admin') {
                return res.status(403).json({ message: '강의 자료 생성 권한이 없습니다' });
            }

            const lectureData = {
                ...req.body,
                courseId,
                uploadedBy: userId
            };

            // 유튜브 URL 처리
            if (lectureData.type === 'video' && lectureData.videoUrl) {
                const videoId = extractYouTubeVideoId(lectureData.videoUrl);
                if (videoId) {
                    lectureData.videoId = videoId;
                } else {
                    return res.status(400).json({ message: '유효하지 않은 유튜브 URL입니다' });
                }
            }

            const lecture = await Lecture.create(lectureData);

            const createdLecture = await Lecture.findByPk(lecture.id, {
                include: [
                    {
                        model: User,
                        as: 'uploader',
                        attributes: ['id', 'fullName', 'username']
                    }
                ]
            });

            res.status(201).json({
                message: '강의 자료가 생성되었습니다',
                lecture: createdLecture
            });
        } catch (error) {
            console.error('강의 자료 생성 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    },

    // 강의 자료 수정 (강사만)
    updateLecture: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    message: '입력 데이터가 유효하지 않습니다',
                    errors: errors.array() 
                });
            }

            const { courseId, lectureId } = req.params;
            const userId = req.user.id;

            const lecture = await Lecture.findOne({
                where: { id: lectureId, courseId },
                include: [{ model: Course }]
            });

            if (!lecture) {
                return res.status(404).json({ message: '강의 자료를 찾을 수 없습니다' });
            }

            // 권한 확인
            if (lecture.Course.instructorId !== userId && req.user.userType !== 'admin') {
                return res.status(403).json({ message: '강의 자료 수정 권한이 없습니다' });
            }

            const updateData = { ...req.body };

            // 유튜브 URL 처리
            if (updateData.type === 'video' && updateData.videoUrl) {
                const videoId = extractYouTubeVideoId(updateData.videoUrl);
                if (videoId) {
                    updateData.videoId = videoId;
                } else {
                    return res.status(400).json({ message: '유효하지 않은 유튜브 URL입니다' });
                }
            }

            await lecture.update(updateData);

            const updatedLecture = await Lecture.findByPk(lectureId, {
                include: [
                    {
                        model: User,
                        as: 'uploader',
                        attributes: ['id', 'fullName', 'username']
                    }
                ]
            });

            res.json({
                message: '강의 자료가 수정되었습니다',
                lecture: updatedLecture
            });
        } catch (error) {
            console.error('강의 자료 수정 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    },

    // 강의 자료 삭제 (강사만)
    deleteLecture: async (req, res) => {
        try {
            const { courseId, lectureId } = req.params;
            const userId = req.user.id;

            const lecture = await Lecture.findOne({
                where: { id: lectureId, courseId },
                include: [{ model: Course }]
            });

            if (!lecture) {
                return res.status(404).json({ message: '강의 자료를 찾을 수 없습니다' });
            }

            // 권한 확인
            if (lecture.Course.instructorId !== userId && req.user.userType !== 'admin') {
                return res.status(403).json({ message: '강의 자료 삭제 권한이 없습니다' });
            }

            // 파일이 있다면 삭제
            if (lecture.filePath) {
                try {
                    await fs.unlink(lecture.filePath);
                } catch (fileError) {
                    console.error('파일 삭제 오류:', fileError);
                }
            }

            await lecture.destroy();

            res.json({ message: '강의 자료가 삭제되었습니다' });
        } catch (error) {
            console.error('강의 자료 삭제 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    },

    // 자료 순서 변경 (강사만)
    reorderLectures: async (req, res) => {
        try {
            const { courseId } = req.params;
            const { lectureOrders } = req.body; // [{ id, order }, ...]
            const userId = req.user.id;

            // 강의 권한 확인
            const course = await Course.findByPk(courseId);
            if (!course) {
                return res.status(404).json({ message: '강의를 찾을 수 없습니다' });
            }

            if (course.instructorId !== userId && req.user.userType !== 'admin') {
                return res.status(403).json({ message: '강의 자료 순서 변경 권한이 없습니다' });
            }

            // 순서 업데이트
            for (const { id, order } of lectureOrders) {
                await Lecture.update(
                    { order },
                    { where: { id, courseId } }
                );
            }

            res.json({ message: '강의 자료 순서가 변경되었습니다' });
        } catch (error) {
            console.error('강의 자료 순서 변경 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    },

    // 파일 업로드 처리
    uploadFile: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: '파일이 업로드되지 않았습니다' });
            }

            const { courseId } = req.params;
            const userId = req.user.id;

            // 강의 권한 확인
            const course = await Course.findByPk(courseId);
            if (!course) {
                return res.status(404).json({ message: '강의를 찾을 수 없습니다' });
            }

            if (course.instructorId !== userId && req.user.userType !== 'admin') {
                return res.status(403).json({ message: '파일 업로드 권한이 없습니다' });
            }

            const fileInfo = {
                filePath: req.file.path,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype
            };

            res.json({
                message: '파일이 업로드되었습니다',
                file: fileInfo
            });
        } catch (error) {
            console.error('파일 업로드 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    }
};

module.exports = lectureController;