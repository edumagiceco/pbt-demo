const express = require('express');
const { body, validationResult } = require('express-validator');
const { Course, User, CourseEnrollment, Lecture, Assignment } = require('../models');
const router = express.Router();

// Auth 미들웨어
const jwt = require('jsonwebtoken');
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: '인증이 필요합니다' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pbt-lms-jwt-secret-2025');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다' });
    }
};

// 과정 목록 조회 (공개)
const getCourses = async (req, res) => {
    try {
        const courses = await Course.findAll({
            include: [
                {
                    model: User,
                    as: 'instructor',
                    attributes: ['id', 'fullName', 'username']
                }
            ],
            where: { status: 'published' },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: courses,
            message: '과정 목록을 가져왔습니다'
        });
    } catch (error) {
        console.error('과정 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '과정 목록을 가져오는 중 오류가 발생했습니다'
        });
    }
};

// 과정 상세 조회
const getCourse = async (req, res) => {
    try {
        const { id } = req.params;
        
        const course = await Course.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'instructor',
                    attributes: ['id', 'fullName', 'username']
                },
                {
                    model: Lecture,
                    as: 'lectures',
                    attributes: ['id', 'title', 'type', 'duration', 'order'],
                    order: [['order', 'ASC']]
                }
            ]
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: '과정을 찾을 수 없습니다'
            });
        }

        // 수강생 수 계산
        const enrollmentCount = await CourseEnrollment.count({
            where: { courseId: id, status: ['enrolled', 'in_progress', 'completed'] }
        });

        res.json({
            success: true,
            data: {
                ...course.toJSON(),
                enrollmentCount
            },
            message: '과정 정보를 가져왔습니다'
        });
    } catch (error) {
        console.error('과정 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '과정 정보를 가져오는 중 오류가 발생했습니다'
        });
    }
};

// 사용자의 수강 중인 과정 목록
const getUserCourses = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const enrollments = await CourseEnrollment.findAll({
            where: { 
                userId,
                status: ['enrolled', 'in_progress', 'completed']
            },
            include: [
                {
                    model: Course,
                    include: [
                        {
                            model: User,
                            as: 'instructor',
                            attributes: ['id', 'fullName', 'username']
                        }
                    ]
                }
            ],
            order: [['lastAccessedAt', 'DESC']]
        });

        const courses = enrollments.map(enrollment => ({
            ...enrollment.Course.toJSON(),
            instructorName: enrollment.Course.instructor.fullName,
            progress: enrollment.progress,
            status: enrollment.status,
            enrolledAt: enrollment.enrolledAt,
            lastAccessedAt: enrollment.lastAccessedAt
        }));

        res.json({
            success: true,
            data: courses,
            message: '수강 중인 과정 목록을 가져왔습니다'
        });
    } catch (error) {
        console.error('사용자 과정 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '과정 목록을 가져오는 중 오류가 발생했습니다'
        });
    }
};

// 과정 수강 신청
const enrollCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // 과정 존재 확인
        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: '과정을 찾을 수 없습니다'
            });
        }

        // 이미 수강 중인지 확인
        const existingEnrollment = await CourseEnrollment.findOne({
            where: { courseId: id, userId }
        });

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: '이미 수강 중인 과정입니다'
            });
        }

        // 수강 신청
        await CourseEnrollment.create({
            courseId: id,
            userId,
            enrolledAt: new Date(),
            status: 'enrolled',
            progress: 0
        });

        // 수강생 수 업데이트
        await course.increment('enrollmentCount');

        res.json({
            success: true,
            message: '수강 신청이 완료되었습니다'
        });
    } catch (error) {
        console.error('수강 신청 오류:', error);
        res.status(500).json({
            success: false,
            message: '수강 신청 중 오류가 발생했습니다'
        });
    }
};

// 과정 수강 취소
const unenrollCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const enrollment = await CourseEnrollment.findOne({
            where: { courseId: id, userId }
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: '수강 정보를 찾을 수 없습니다'
            });
        }

        await enrollment.destroy();

        // 수강생 수 업데이트
        const course = await Course.findByPk(id);
        if (course) {
            await course.decrement('enrollmentCount');
        }

        res.json({
            success: true,
            message: '수강 취소가 완료되었습니다'
        });
    } catch (error) {
        console.error('수강 취소 오류:', error);
        res.status(500).json({
            success: false,
            message: '수강 취소 중 오류가 발생했습니다'
        });
    }
};

// 과정의 강의 목록 조회
const getCourseLectures = async (req, res) => {
    try {
        const { id } = req.params;
        
        const lectures = await Lecture.findAll({
            where: { courseId: id, isPublished: true },
            order: [['order', 'ASC']],
            attributes: ['id', 'title', 'description', 'type', 'duration', 'order', 'isPublished', 'isFree']
        });

        res.json({
            success: true,
            data: lectures,
            message: '강의 목록을 가져왔습니다'
        });
    } catch (error) {
        console.error('강의 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '강의 목록을 가져오는 중 오류가 발생했습니다'
        });
    }
};

// 과정의 과제 목록 조회
const getCourseAssignments = async (req, res) => {
    try {
        const { id } = req.params;
        
        const assignments = await Assignment.findAll({
            where: { courseId: id, isPublished: true },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'title', 'description', 'type', 'maxScore', 'dueDate', 'createdAt']
        });

        res.json({
            success: true,
            data: assignments,
            message: '과제 목록을 가져왔습니다'
        });
    } catch (error) {
        console.error('과제 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '과제 목록을 가져오는 중 오류가 발생했습니다'
        });
    }
};

// 라우트 정의
router.get('/', getCourses);                              // 과정 목록 조회
router.get('/:id', getCourse);                           // 과정 상세 조회
router.get('/:id/lectures', getCourseLectures);          // 과정의 강의 목록
router.get('/:id/assignments', getCourseAssignments);    // 과정의 과제 목록

// 인증이 필요한 라우트
router.get('/my/enrolled', auth, getUserCourses);        // 내 수강 과정 목록
router.post('/:id/enroll', auth, enrollCourse);          // 수강 신청
router.delete('/:id/enroll', auth, unenrollCourse);      // 수강 취소

module.exports = router;