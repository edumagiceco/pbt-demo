const { Mandart, MandartGoal, MandartTask, User } = require('../models');
const { Op } = require('sequelize');

// 만다라트 목록 조회
exports.getMandarts = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const userId = req.user.id;
        const offset = (page - 1) * limit;

        const whereClause = { userId };
        
        if (status) {
            whereClause.status = status;
        }
        
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { centerGoal: { [Op.like]: `%${search}%` } }
            ];
        }

        const mandarts = await Mandart.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'fullName', 'profileImage']
                },
                {
                    model: MandartGoal,
                    as: 'goals',
                    attributes: ['id', 'title', 'status', 'progressPercent', 'position']
                }
            ],
            order: [['updatedAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                mandarts: mandarts.rows,
                totalCount: mandarts.count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(mandarts.count / limit)
            }
        });
    } catch (error) {
        console.error('만다라트 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '만다라트 목록을 불러오는 중 오류가 발생했습니다.'
        });
    }
};

// 만다라트 상세 조회
exports.getMandartById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const mandart = await Mandart.findOne({
            where: { 
                id,
                [Op.or]: [
                    { userId },
                    { isPublic: true }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'fullName', 'profileImage']
                },
                {
                    model: MandartGoal,
                    as: 'goals',
                    include: [
                        {
                            model: MandartTask,
                            as: 'tasks',
                            order: [['position', 'ASC']]
                        }
                    ],
                    order: [['position', 'ASC']]
                }
            ]
        });

        if (!mandart) {
            return res.status(404).json({
                success: false,
                message: '만다라트를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            data: mandart
        });
    } catch (error) {
        console.error('만다라트 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '만다라트를 불러오는 중 오류가 발생했습니다.'
        });
    }
};

// 만다라트 생성
exports.createMandart = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            title,
            description,
            centerGoal,
            coverImage,
            template,
            isPublic,
            targetDate,
            sourceType = 'manual',
            sourceData
        } = req.body;

        const mandart = await Mandart.create({
            title,
            description,
            centerGoal,
            userId,
            coverImage,
            template,
            isPublic: isPublic || false,
            targetDate,
            sourceType,
            sourceData,
            status: 'draft'
        });

        // 중심 목표 생성 (position 5)
        await MandartGoal.create({
            mandartId: mandart.id,
            title: centerGoal,
            description: description,
            position: 5,
            isCenter: true,
            status: 'not_started'
        });

        res.status(201).json({
            success: true,
            data: mandart,
            message: '만다라트가 성공적으로 생성되었습니다.'
        });
    } catch (error) {
        console.error('만다라트 생성 오류:', error);
        console.error('오류 스택:', error.stack);
        console.error('오류 메시지:', error.message);
        res.status(500).json({
            success: false,
            message: '만다라트 생성 중 오류가 발생했습니다.',
            error: process.env.NODE_ENV === 'development' ? error.message : '서버 오류'
        });
    }
};

// 만다라트 수정
exports.updateMandart = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updateData = req.body;

        const mandart = await Mandart.findOne({
            where: { id, userId }
        });

        if (!mandart) {
            return res.status(404).json({
                success: false,
                message: '만다라트를 찾을 수 없거나 수정 권한이 없습니다.'
            });
        }

        await mandart.update(updateData);

        res.json({
            success: true,
            data: mandart,
            message: '만다라트가 성공적으로 수정되었습니다.'
        });
    } catch (error) {
        console.error('만다라트 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '만다라트 수정 중 오류가 발생했습니다.'
        });
    }
};

// 만다라트 삭제
exports.deleteMandart = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const mandart = await Mandart.findOne({
            where: { id, userId }
        });

        if (!mandart) {
            return res.status(404).json({
                success: false,
                message: '만다라트를 찾을 수 없거나 삭제 권한이 없습니다.'
            });
        }

        await mandart.destroy();

        res.json({
            success: true,
            message: '만다라트가 성공적으로 삭제되었습니다.'
        });
    } catch (error) {
        console.error('만다라트 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '만다라트 삭제 중 오류가 발생했습니다.'
        });
    }
};

// 만다라트 진행률 계산
exports.calculateProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const mandart = await Mandart.findOne({
            where: { id, userId },
            include: [
                {
                    model: MandartGoal,
                    as: 'goals',
                    include: [
                        {
                            model: MandartTask,
                            as: 'tasks'
                        }
                    ]
                }
            ]
        });

        if (!mandart) {
            return res.status(404).json({
                success: false,
                message: '만다라트를 찾을 수 없습니다.'
            });
        }

        // 전체 진행률 계산
        let totalTasks = 0;
        let completedTasks = 0;
        
        for (const goal of mandart.goals) {
            for (const task of goal.tasks) {
                totalTasks++;
                if (task.status === 'completed') {
                    completedTasks++;
                }
            }
            
            // 목표별 진행률 업데이트
            const goalProgress = goal.tasks.length > 0 
                ? Math.round((goal.tasks.filter(t => t.status === 'completed').length / goal.tasks.length) * 100)
                : 0;
            
            await goal.update({ progressPercent: goalProgress });
        }

        // 전체 만다라트 진행률 업데이트
        const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        await mandart.update({ progressPercent: overallProgress });

        res.json({
            success: true,
            data: {
                overallProgress,
                totalTasks,
                completedTasks,
                goalProgress: mandart.goals.map(g => ({
                    goalId: g.id,
                    progress: g.progressPercent
                }))
            }
        });
    } catch (error) {
        console.error('진행률 계산 오류:', error);
        res.status(500).json({
            success: false,
            message: '진행률 계산 중 오류가 발생했습니다.'
        });
    }
};

// 공개 만다라트 목록 조회
exports.getPublicMandarts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = { 
            isPublic: true,
            status: 'active'
        };
        
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const mandarts = await Mandart.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'fullName', 'profileImage']
                }
            ],
            attributes: ['id', 'title', 'description', 'centerGoal', 'coverImage', 'progressPercent', 'createdAt', 'updatedAt'],
            order: [['progressPercent', 'DESC'], ['updatedAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                mandarts: mandarts.rows,
                totalCount: mandarts.count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(mandarts.count / limit)
            }
        });
    } catch (error) {
        console.error('공개 만다라트 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '공개 만다라트 목록을 불러오는 중 오류가 발생했습니다.'
        });
    }
};
