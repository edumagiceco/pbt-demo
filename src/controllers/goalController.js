const { MandartGoal, MandartTask, Mandart } = require('../models');

// 목표 목록 조회
exports.getGoals = async (req, res) => {
    try {
        const { mandartId } = req.params;
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

        const goals = await MandartGoal.findAll({
            where: { mandartId },
            include: [
                {
                    model: MandartTask,
                    as: 'tasks',
                    order: [['position', 'ASC']]
                }
            ],
            order: [['position', 'ASC']]
        });

        res.json({
            success: true,
            data: goals
        });
    } catch (error) {
        console.error('목표 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '목표 목록을 불러오는 중 오류가 발생했습니다.'
        });
    }
};

// 목표 생성
exports.createGoal = async (req, res) => {
    try {
        const { mandartId } = req.params;
        const userId = req.user.id;
        const {
            title,
            description,
            position,
            color,
            icon,
            priority,
            deadline,
            category
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

        // 해당 위치에 이미 목표가 있는지 확인
        const existingGoal = await MandartGoal.findOne({
            where: { mandartId, position }
        });

        if (existingGoal) {
            return res.status(400).json({
                success: false,
                message: '해당 위치에 이미 목표가 존재합니다.'
            });
        }

        const goal = await MandartGoal.create({
            mandartId,
            title,
            description,
            position,
            color: color || '#3498db',
            icon,
            priority: priority || 1,
            deadline,
            category,
            status: 'not_started',
            isCenter: position === 5
        });

        res.status(201).json({
            success: true,
            data: goal,
            message: '목표가 성공적으로 생성되었습니다.'
        });
    } catch (error) {
        console.error('목표 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '목표 생성 중 오류가 발생했습니다.'
        });
    }
};

// 목표 수정
exports.updateGoal = async (req, res) => {
    try {
        const { mandartId, goalId } = req.params;
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

        const goal = await MandartGoal.findOne({
            where: { id: goalId, mandartId }
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: '목표를 찾을 수 없습니다.'
            });
        }

        await goal.update(updateData);

        res.json({
            success: true,
            data: goal,
            message: '목표가 성공적으로 수정되었습니다.'
        });
    } catch (error) {
        console.error('목표 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '목표 수정 중 오류가 발생했습니다.'
        });
    }
};

// 목표 삭제
exports.deleteGoal = async (req, res) => {
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

        const goal = await MandartGoal.findOne({
            where: { id: goalId, mandartId }
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: '목표를 찾을 수 없습니다.'
            });
        }

        // 중심 목표는 삭제할 수 없음
        if (goal.isCenter) {
            return res.status(400).json({
                success: false,
                message: '중심 목표는 삭제할 수 없습니다.'
            });
        }

        await goal.destroy();

        res.json({
            success: true,
            message: '목표가 성공적으로 삭제되었습니다.'
        });
    } catch (error) {
        console.error('목표 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '목표 삭제 중 오류가 발생했습니다.'
        });
    }
};

// 목표 상태 변경
exports.updateGoalStatus = async (req, res) => {
    try {
        const { mandartId, goalId } = req.params;
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

        const goal = await MandartGoal.findOne({
            where: { id: goalId, mandartId },
            include: [
                {
                    model: MandartTask,
                    as: 'tasks'
                }
            ]
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: '목표를 찾을 수 없습니다.'
            });
        }

        await goal.update({ status });

        // 진행률 자동 계산
        const completedTasks = goal.tasks.filter(task => task.status === 'completed').length;
        const totalTasks = goal.tasks.length;
        const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        await goal.update({ progressPercent });

        res.json({
            success: true,
            data: goal,
            message: '목표 상태가 성공적으로 변경되었습니다.'
        });
    } catch (error) {
        console.error('목표 상태 변경 오류:', error);
        res.status(500).json({
            success: false,
            message: '목표 상태 변경 중 오류가 발생했습니다.'
        });
    }
};

// 목표별 통계 조회
exports.getGoalStats = async (req, res) => {
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

        const goal = await MandartGoal.findOne({
            where: { id: goalId, mandartId },
            include: [
                {
                    model: MandartTask,
                    as: 'tasks'
                }
            ]
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: '목표를 찾을 수 없습니다.'
            });
        }

        const taskStats = {
            total: goal.tasks.length,
            notStarted: goal.tasks.filter(t => t.status === 'not_started').length,
            inProgress: goal.tasks.filter(t => t.status === 'in_progress').length,
            completed: goal.tasks.filter(t => t.status === 'completed').length,
            cancelled: goal.tasks.filter(t => t.status === 'cancelled').length,
            onHold: goal.tasks.filter(t => t.status === 'on_hold').length
        };

        const completionRate = taskStats.total > 0 
            ? Math.round((taskStats.completed / taskStats.total) * 100)
            : 0;

        // 예상 완료일 계산 (진행 중인 과제들의 마감일 기준)
        const inProgressTasks = goal.tasks.filter(t => t.status === 'in_progress' && t.dueDate);
        const estimatedCompletion = inProgressTasks.length > 0
            ? new Date(Math.max(...inProgressTasks.map(t => new Date(t.dueDate))))
            : null;

        res.json({
            success: true,
            data: {
                goal: {
                    id: goal.id,
                    title: goal.title,
                    status: goal.status,
                    progressPercent: goal.progressPercent
                },
                taskStats,
                completionRate,
                estimatedCompletion
            }
        });
    } catch (error) {
        console.error('목표 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '목표 통계를 불러오는 중 오류가 발생했습니다.'
        });
    }
};
