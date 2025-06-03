const { Mentor, MentorKnowledge, MentorConversation, MentorRating, User } = require('../models');
const { Op } = require('sequelize');

const mentorController = {
    // 멘토 목록 조회
    async getMentors(req, res) {
        try {
            const { page = 1, limit = 10, isPublic, search, expertise } = req.query;
            const userId = req.user.id;
            
            const offset = (page - 1) * limit;
            
            // 검색 조건 구성
            const whereClause = {
                [Op.or]: [
                    { ownerId: userId }, // 내 멘토
                    { isPublic: true }   // 공개 멘토
                ]
            };
            
            if (isPublic === 'true') {
                whereClause.isPublic = true;
                delete whereClause[Op.or];
            } else if (isPublic === 'false') {
                whereClause.ownerId = userId;
                delete whereClause[Op.or];
            }
            
            if (search) {
                whereClause[Op.and] = whereClause[Op.and] || [];
                whereClause[Op.and].push({
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } },
                        { expertise: { [Op.like]: `%${search}%` } }
                    ]
                });
            }
            
            if (expertise) {
                whereClause.expertise = { [Op.like]: `%${expertise}%` };
            }
            
            const mentors = await Mentor.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'owner',
                        attributes: ['id', 'username', 'fullName']
                    }
                ],
                order: [['rating', 'DESC'], ['usageCount', 'DESC'], ['updatedAt', 'DESC']],
                limit: parseInt(limit),
                offset: offset
            });
            
            res.json({
                success: true,
                data: {
                    mentors: mentors.rows,
                    pagination: {
                        total: mentors.count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(mentors.count / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching mentors:', error);
            res.status(500).json({
                success: false,
                message: '멘토 목록을 가져오는 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    },

    // 멘토 상세 조회
    async getMentor(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            const mentor = await Mentor.findOne({
                where: {
                    id,
                    [Op.or]: [
                        { ownerId: userId },
                        { isPublic: true }
                    ]
                },
                include: [
                    {
                        model: User,
                        as: 'owner',
                        attributes: ['id', 'username', 'fullName']
                    },
                    {
                        model: MentorKnowledge,
                        as: 'knowledge',
                        attributes: ['id', 'type', 'title', 'wordCount', 'createdAt']
                    },
                    {
                        model: MentorRating,
                        as: 'ratings',
                        include: [
                            {
                                model: User,
                                as: 'user',
                                attributes: ['username']
                            }
                        ],
                        order: [['createdAt', 'DESC']],
                        limit: 5
                    }
                ]
            });
            
            if (!mentor) {
                return res.status(404).json({
                    success: false,
                    message: '멘토를 찾을 수 없습니다.'
                });
            }
            
            res.json({
                success: true,
                data: mentor
            });
        } catch (error) {
            console.error('Error fetching mentor:', error);
            res.status(500).json({
                success: false,
                message: '멘토 정보를 가져오는 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    },

    // 멘토 생성
    async createMentor(req, res) {
        try {
            const { name, description, expertise, personality, isPublic } = req.body;
            const userId = req.user.id;
            
            const mentor = await Mentor.create({
                name,
                description,
                expertise,
                personality: personality || { tone: 'friendly', style: 'professional' },
                isPublic: isPublic || false,
                ownerId: userId
            });
            
            res.status(201).json({
                success: true,
                message: '멘토가 성공적으로 생성되었습니다.',
                data: mentor
            });
        } catch (error) {
            console.error('Error creating mentor:', error);
            res.status(500).json({
                success: false,
                message: '멘토 생성 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    },

    // 멘토 수정
    async updateMentor(req, res) {
        try {
            const { id } = req.params;
            const { name, description, expertise, personality, isPublic } = req.body;
            const userId = req.user.id;
            
            const mentor = await Mentor.findOne({
                where: { id, ownerId: userId }
            });
            
            if (!mentor) {
                return res.status(404).json({
                    success: false,
                    message: '멘토를 찾을 수 없거나 수정 권한이 없습니다.'
                });
            }
            
            await mentor.update({
                name: name || mentor.name,
                description: description !== undefined ? description : mentor.description,
                expertise: expertise !== undefined ? expertise : mentor.expertise,
                personality: personality || mentor.personality,
                isPublic: isPublic !== undefined ? isPublic : mentor.isPublic
            });
            
            res.json({
                success: true,
                message: '멘토 정보가 성공적으로 수정되었습니다.',
                data: mentor
            });
        } catch (error) {
            console.error('Error updating mentor:', error);
            res.status(500).json({
                success: false,
                message: '멘토 수정 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    },

    // 멘토 삭제
    async deleteMentor(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            const mentor = await Mentor.findOne({
                where: { id, ownerId: userId }
            });
            
            if (!mentor) {
                return res.status(404).json({
                    success: false,
                    message: '멘토를 찾을 수 없거나 삭제 권한이 없습니다.'
                });
            }
            
            await mentor.destroy();
            
            res.json({
                success: true,
                message: '멘토가 성공적으로 삭제되었습니다.'
            });
        } catch (error) {
            console.error('Error deleting mentor:', error);
            res.status(500).json({
                success: false,
                message: '멘토 삭제 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    },

    // 인기 멘토 조회
    async getPopularMentors(req, res) {
        try {
            const { limit = 10 } = req.query;
            
            const mentors = await Mentor.findAll({
                where: { isPublic: true },
                include: [
                    {
                        model: User,
                        as: 'owner',
                        attributes: ['username', 'fullName']
                    }
                ],
                order: [
                    ['rating', 'DESC'],
                    ['usageCount', 'DESC']
                ],
                limit: parseInt(limit)
            });
            
            res.json({
                success: true,
                data: mentors
            });
        } catch (error) {
            console.error('Error fetching popular mentors:', error);
            res.status(500).json({
                success: false,
                message: '인기 멘토 목록을 가져오는 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }
};

module.exports = mentorController;
