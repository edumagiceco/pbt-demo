const { MandartTask, MandartGoal, Mandart } = require('../models');

// 과제 목록 조회
exports.getTasks = async (req, res) => {
    try {
        const { mandartId, goalId } = req.params;
        const userId = req.user.id;

        // 만다라트 소유권 확인
        const mandart = await Mandart.findOne({
            where: { id: mandartId, userId }
        });

        if (!mandart) {
            return res.status(404).json({
                success: false,
                message: '만다라트를 찾을 수 없거나 접근 권한이 없습니다.'
            });
        }

        const whereClause = { mandartId };
        if (goalId) {
            whereClause.goalId = goalId;
        }

        const tasks = await MandartTask.findAll({
            where: whereClause,
            include: [
                {
                    model: MandartGoal,
                    as: 'goal',
                    attributes: ['id', 'title', 'position', 'color']
                }
            ],
            order: [['goalId', 'ASC'], ['position', 'ASC']]
        });

        res.json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.error('과제 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '과제 목록을 불러오는 중 오류가 발생했습니다.'
        });
    }
};

// 과제 생성
exports.createTask = async (req, res) => {
    try {
        const { mandartId, goalId } = req.params;
        const userId = req.user.id;
        const {
            title,
            description,
            position,
            type,
            frequency,
            estimatedTime,
            difficulty,
            priority,
            startDate,
            dueDate,
            notes,
            resources,
            checklistItems,
            tags
        } = req.body;

        // 만다라트 소유권 확인
        const mandart = await Mandart.findOne({
            where: { id: mandartId, userId }
        });

        if (!mandart) {
            return res.status(404).json({
                success: false,
                message: '만다라트를 찾을 수 없거나 접근 권한이 없습니다.'
            });
        }

        // 목표 존재 확인
        const goal = await MandartGoal.findOne({
            where: { id: goalId, mandartId }
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: '목표를 찾을 수 없습니다.'
            });
        }

        // 해당 위치에 이미 과제가 있는지 확인
        const existingTask = await MandartTask.findOne({
            where: { goalId, position }
        });

        if (existingTask) {
            return res.status(400).json({
                success: false,
                message: '해당 위치에 이미 과제가 존재합니다.'
            });
        }

        const task = await MandartTask.create({
            goalId,
            mandartId,
            title,
            description,
            position,
            type: type || 'one_time',
            frequency,
            estimatedTime,
            difficulty: difficulty || 3,
            priority: priority || 3,
            startDate,
            dueDate,
            notes,
            resources,
            checklistItems,
            tags,
            status: 'not_started'
        });

        res.status(201).json({
            success: true,
            data: task,
            message: '과제가 성공적으로 생성되었습니다.'
        });
    } catch (error) {
        console.error('과제 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '과제 생성 중 오류가 발생했습니다.'
        });
    }
};

// 과제 수정
exports.updateTask = async (req, res) => {
    try {
        const { mandartId, taskId } = req.params;
        const userId = req.user.id;
        const updateData = req.body;

        // 만다라트 소유권 확인
        const mandart = await Mandart.findOne({
            where: { id: mandartId, userId }
        });

        if (!mandart) {
            return res.status(404).json({
                success: false,
                message: '만다라트를 찾을 수 없거나 접근 권한이 없습니다.'
            });
        }

        const task = await MandartTask.findOne({
            where: { id: taskId, mandartId }
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: '과제를 찾을 수 없습니다.'
            });
        }

        await task.update(updateData);

        res.json({
            success: true,
            data: task,
            message: '과제가 성공적으로 수정되었습니다.'
        });
    } catch (error) {
        console.error('과제 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '과제 수정 중 오류가 발생했습니다.'
        });
    }
};

// 과제 삭제
exports.deleteTask = async (req, res) => {
    try {
        const { mandartId, taskId } = req.params;
        const userId = req.user.id;

        // 만다라트 소유권 확인
        const mandart = await Mandart.findOne({
            where: { id: mandartId, userId }
        });

        if (!mandart) {
            return res.status(404).json({
                success: false,
                message: '만다라트를 찾을 수 없거나 접근 권한이 없습니다.'
            });
        }

        const task = await MandartTask.findOne({
            where: { id: taskId, mandartId }
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: '과제를 찾을 수 없습니다.'
            });
        }

        await task.destroy();

        res.json({
            success: true,
            message: '과제가 성공적으로 삭제되었습니다.'
        });
    } catch (error) {
        console.error('과제 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '과제 삭제 중 오류가 발생했습니다.'
        });
    }
};

// 과제 상태 변경
exports.updateTaskStatus = async (req, res) => {
    try {
        const { mandartId, taskId } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        // 만다라트 소유권 확인
        const mandart = await Mandart.findOne({
            where: { id: mandartId, userId }
        });

        if (!mandart) {
            return res.status(404).json({
                success: false,
                message: '만다라트를 찾을 수 없거나 접근 권한이 없습니다.'
            });
        }

        const task = await MandartTask.findOne({
            where: { id: taskId, mandartId }
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: '과제를 찾을 수 없습니다.'
            });
        }

        const updateData = { status };
        
        // 완료 상태로 변경시 완료일 설정
        if (status === 'completed') {
            updateData.completedDate = new Date();
            updateData.progressPercent = 100;
        } else if (status === 'in_progress') {
            updateData.progressPercent = 50; // 기본값
        } else {
            updateData.progressPercent = 0;
            updateData.completedDate = null;
        }

        await task.update(updateData);

        res.json({
            success: true,
            data: task,
            message: '과제 상태가 성공적으로 변경되었습니다.'
        });
    } catch (error) {
        console.error('과제 상태 변경 오류:', error);
        res.status(500).json({
            success: false,
            message: '과제 상태 변경 중 오류가 발생했습니다.'
        });
    }
};

// 과제 진행률 업데이트
exports.updateTaskProgress = async (req, res) => {
    try {
        const { mandartId, taskId } = req.params;
        const { progressPercent } = req.body;
        const userId = req.user.id;

        // 만다라트 소유권 확인
        const mandart = await Mandart.findOne({
            where: { id: mandartId, userId }
        });

        if (!mandart) {
            return res.status(404).json({
                success: false,
                message: '만다라트를 찾을 수 없거나 접근 권한이 없습니다.'
            });
        }

        const task = await MandartTask.findOne({
            where: { id: taskId, mandartId }
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: '과제를 찾을 수 없습니다.'
            });
        }

        const updateData = { progressPercent };

        // 진행률에 따른 상태 자동 설정
        if (progressPercent === 0) {
            updateData.status = 'not_started';
        } else if (progressPercent === 100) {
            updateData.status = 'completed';
            updateData.completedDate = new Date();
        } else {
            updateData.status = 'in_progress';
        }

        await task.update(updateData);

        res.json({
            success: true,
            data: task,
            message: '과제 진행률이 성공적으로 업데이트되었습니다.'
        });
    } catch (error) {
        console.error('과제 진행률 업데이트 오류:', error);
        res.status(500).json({
            success: false,
            message: '과제 진행률 업데이트 중 오류가 발생했습니다.'
        });
    }
};

// 마감일이 임박한 과제 조회
exports.getUpcomingTasks = async (req, res) => {
    try {
        const { mandartId } = req.params;
        const { days = 7 } = req.query;
        const userId = req.user.id;

        // 만다라트 소유권 확인
        const mandart = await Mandart.findOne({
            where: { id: mandartId, userId }
        });

        if (!mandart) {
            return res.status(404).json({
                success: false,
                message: '만다라트를 찾을 수 없거나 접근 권한이 없습니다.'
            });
        }

        const upcomingDate = new Date();
        upcomingDate.setDate(upcomingDate.getDate() + parseInt(days));

        const tasks = await MandartTask.findAll({
            where: {
                mandartId,
                dueDate: {
                    [require('sequelize').Op.between]: [new Date(), upcomingDate]
                },
                status: {
                    [require('sequelize').Op.not]: 'completed'
                }
            },
            include: [
                {
                    model: MandartGoal,
                    as: 'goal',
                    attributes: ['id', 'title', 'position', 'color']
                }
            ],
            order: [['dueDate', 'ASC'], ['priority', 'DESC']]
        });

        res.json({
            success: true,
            data: tasks
        });
    } catch (error) {
        console.error('임박한 과제 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '임박한 과제를 불러오는 중 오류가 발생했습니다.'
        });
    }
};

// 체크리스트 아이템 토글
exports.toggleChecklistItem = async (req, res) => {
    try {
        const { mandartId, taskId } = req.params;
        const { itemIndex, completed } = req.body;
        const userId = req.user.id;

        // 만다라트 소유권 확인
        const mandart = await Mandart.findOne({
            where: { id: mandartId, userId }
        });

        if (!mandart) {
            return res.status(404).json({
                success: false,
                message: '만다라트를 찾을 수 없거나 접근 권한이 없습니다.'
            });
        }

        const task = await MandartTask.findOne({
            where: { id: taskId, mandartId }
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: '과제를 찾을 수 없습니다.'
            });
        }

        const checklistItems = task.checklistItems || [];
        if (itemIndex >= 0 && itemIndex < checklistItems.length) {
            checklistItems[itemIndex].completed = completed;
            
            // 전체 체크리스트 진행률 계산
            const completedItems = checklistItems.filter(item => item.completed).length;
            const totalItems = checklistItems.length;
            const checklistProgress = totalItems > 0 
                ? Math.round((completedItems / totalItems) * 100)
                : 0;

            await task.update({
                checklistItems,
                progressPercent: checklistProgress
            });
        }

        res.json({
            success: true,
            data: task,
            message: '체크리스트가 업데이트되었습니다.'
        });
    } catch (error) {
        console.error('체크리스트 토글 오류:', error);
        res.status(500).json({
            success: false,
            message: '체크리스트 업데이트 중 오류가 발생했습니다.'
        });
    }
};
