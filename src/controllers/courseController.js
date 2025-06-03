const { Course, CourseEnrollment, Lecture, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const courseController = {
    // 강의 목록 조회
    getCourses: async (req, res) => {
        try {
            const { 
                page = 1, 
                limit = 10, 
                category, 
                level, 
                status = 'published',
                search 
            } = req.query;

            const offset = (page - 1) * limit;
            const where = { status };

            if (category) where.category = category;
            if (level) where.level = level;
            if (search) {
                where[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ];
            }

            const courses = await Course.findAndCountAll({
                where,
                include: [
                    {
                        model: User,
                        as: 'instructor',
                        attributes: ['id', 'fullName', 'username', 'profileImage']
                    }
                ],
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            res.json({
                courses: courses.rows,
                total: courses.count,
                totalPages: Math.ceil(courses.count / limit),
                currentPage: parseInt(page)
            });
        } catch (error) {
            console.error('강의 목록 조회 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    },

    // 강의 상세 조회
    getCourse: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            const course = await Course.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'instructor',
                        attributes: ['id', 'fullName', 'username', 'profileImage', 'userType']
                    },
                    {
                        model: Lecture,
                        as: 'lectures',
                        where: { isPublished: true },
                        required: false,
                        order: [['order', 'ASC']]
                    }
                ]
            });

            if (!course) {
                return res.status(404).json({ message: '강의를 찾을 수 없습니다' });
            }

            // 수강 여부 확인
            let enrollment = null;
            if (userId) {
                enrollment = await CourseEnrollment.findOne({
                    where: { courseId: id, userId }
                });
            }

            res.json({
                course,
                isEnrolled: !!enrollment,
                enrollment
            });
        } catch (error) {
            console.error('강의 상세 조회 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    },

    // 강의 생성 (강사만)
    createCourse: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    message: '입력 데이터가 유효하지 않습니다',
                    errors: errors.array() 
                });
            }

            const userId = req.user.id;
            const userType = req.user.userType;

            // 강사 권한 확인
            if (userType !== 'instructor' && userType !== 'admin') {
                return res.status(403).json({ message: '강의 생성 권한이 없습니다' });
            }

            const courseData = {
                ...req.body,
                instructorId: userId
            };

            const course = await Course.create(courseData);

            const createdCourse = await Course.findByPk(course.id, {
                include: [
                    {
                        model: User,
                        as: 'instructor',
                        attributes: ['id', 'fullName', 'username']
                    }
                ]
            });

            res.status(201).json({
                message: '강의가 생성되었습니다',
                course: createdCourse
            });
        } catch (error) {
            console.error('강의 생성 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    },

    // 강의 수정 (강사/관리자만)
    updateCourse: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    message: '입력 데이터가 유효하지 않습니다',
                    errors: errors.array() 
                });
            }

            const { id } = req.params;
            const userId = req.user.id;
            const userType = req.user.userType;

            const course = await Course.findByPk(id);
            if (!course) {
                return res.status(404).json({ message: '강의를 찾을 수 없습니다' });
            }

            // 권한 확인
            if (userType !== 'admin' && course.instructorId !== userId) {
                return res.status(403).json({ message: '강의 수정 권한이 없습니다' });
            }

            await course.update(req.body);

            const updatedCourse = await Course.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'instructor',
                        attributes: ['id', 'fullName', 'username']
                    }
                ]
            });

            res.json({
                message: '강의가 수정되었습니다',
                course: updatedCourse
            });
        } catch (error) {
            console.error('강의 수정 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    },

    // 강의 삭제 (강사/관리자만)
    deleteCourse: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userType = req.user.userType;

            const course = await Course.findByPk(id);
            if (!course) {
                return res.status(404).json({ message: '강의를 찾을 수 없습니다' });
            }

            // 권한 확인
            if (userType !== 'admin' && course.instructorId !== userId) {
                return res.status(403).json({ message: '강의 삭제 권한이 없습니다' });
            }

            // 수강생이 있는지 확인
            const enrollmentCount = await CourseEnrollment.count({
                where: { courseId: id }
            });

            if (enrollmentCount > 0) {
                return res.status(400).json({ 
                    message: '수강생이 있는 강의는 삭제할 수 없습니다' 
                });
            }

            await course.destroy();

            res.json({ message: '강의가 삭제되었습니다' });
        } catch (error) {
            console.error('강의 삭제 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    },

    // 수강 신청
    enrollCourse: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const course = await Course.findByPk(id);
            if (!course) {
                return res.status(404).json({ message: '강의를 찾을 수 없습니다' });
            }

            if (course.status !== 'published') {
                return res.status(400).json({ message: '수강 신청할 수 없는 강의입니다' });
            }

            // 이미 수강 신청했는지 확인
            const existingEnrollment = await CourseEnrollment.findOne({
                where: { courseId: id, userId }
            });

            if (existingEnrollment) {
                return res.status(400).json({ message: '이미 수강 신청한 강의입니다' });
            }

            // 최대 수강생 수 확인
            if (course.maxStudents) {
                const currentEnrollments = await CourseEnrollment.count({
                    where: { courseId: id }
                });

                if (currentEnrollments >= course.maxStudents) {
                    return res.status(400).json({ message: '수강 정원이 초과되었습니다' });
                }
            }

            const enrollment = await CourseEnrollment.create({
                courseId: id,
                userId,
                status: 'enrolled'
            });

            // 강의 수강생 수 업데이트
            await course.increment('enrollmentCount');

            res.status(201).json({
                message: '수강 신청이 완료되었습니다',
                enrollment
            });
        } catch (error) {
            console.error('수강 신청 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    },

    // 수강 취소
    unenrollCourse: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const enrollment = await CourseEnrollment.findOne({
                where: { courseId: id, userId }
            });

            if (!enrollment) {
                return res.status(404).json({ message: '수강 정보를 찾을 수 없습니다' });
            }

            await enrollment.update({ status: 'dropped' });

            // 강의 수강생 수 업데이트
            const course = await Course.findByPk(id);
            if (course) {
                await course.decrement('enrollmentCount');
            }

            res.json({ message: '수강 취소가 완료되었습니다' });
        } catch (error) {
            console.error('수강 취소 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    },

    // 내 강의 목록 (강사용)
    getMyCourses: async (req, res) => {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const courses = await Course.findAndCountAll({
                where: { instructorId: userId },
                include: [
                    {
                        model: CourseEnrollment,
                        as: 'enrollments',
                        attributes: ['id', 'status'],
                        separate: true
                    }
                ],
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            res.json({
                courses: courses.rows,
                total: courses.count,
                totalPages: Math.ceil(courses.count / limit),
                currentPage: parseInt(page)
            });
        } catch (error) {
            console.error('내 강의 목록 조회 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    },

    // 수강 중인 강의 목록 (학생용)
    getEnrolledCourses: async (req, res) => {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const enrollments = await CourseEnrollment.findAndCountAll({
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
                limit: parseInt(limit),
                offset,
                order: [['enrolledAt', 'DESC']]
            });

            res.json({
                enrollments: enrollments.rows,
                total: enrollments.count,
                totalPages: Math.ceil(enrollments.count / limit),
                currentPage: parseInt(page)
            });
        } catch (error) {
            console.error('수강 중인 강의 목록 조회 오류:', error);
            res.status(500).json({ message: '서버 오류가 발생했습니다' });
        }
    }
};

module.exports = courseController;