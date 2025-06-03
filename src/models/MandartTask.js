const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MandartTask = sequelize.define('MandartTask', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        goalId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'goal_id',  // 데이터베이스 컬럼명 명시
            references: {
                model: 'mandart_goals',
                key: 'id'
            },
            comment: '목표 ID'
        },
        mandartId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'mandart_id',  // 데이터베이스 컬럼명 명시
            references: {
                model: 'mandarts',
                key: 'id'
            },
            comment: '만다라트 ID'
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
            comment: '과제 제목'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '과제 설명'
        },
        position: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '과제 위치 (1-8, 중심은 목표)'
        },
        type: {
            type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'one_time', 'habit'),
            defaultValue: 'one_time',
            comment: '과제 유형'
        },
        frequency: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: '반복 빈도 설정 (JSON 형태)'
        },
        estimatedTime: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: '예상 소요 시간 (분)'
        },
        difficulty: {
            type: DataTypes.INTEGER,
            defaultValue: 3,
            comment: '난이도 (1-5)'
        },
        priority: {
            type: DataTypes.INTEGER,
            defaultValue: 3,
            comment: '우선순위 (1-5)'
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: '시작일'
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: '마감일'
        },
        completedDate: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: '완료일'
        },
        status: {
            type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'cancelled', 'on_hold'),
            defaultValue: 'not_started',
            comment: '과제 상태'
        },
        progressPercent: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '과제 진행률 (0-100)'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '과제 메모'
        },
        resources: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: '필요 자원 (링크, 파일 등)'
        },
        checklistItems: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: '체크리스트 아이템들'
        },
        tags: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: '태그 목록'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: '생성일시'
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: '수정일시'
        }
    }, {
        tableName: 'mandart_tasks',
        timestamps: true,
        indexes: [
            {
                fields: ['goal_id']  // 데이터베이스 컬럼명 사용
            },
            {
                fields: ['mandart_id']  // 데이터베이스 컬럼명 사용
            },
            {
                fields: ['status']
            },
            {
                fields: ['due_date']  // 데이터베이스 컬럼명 사용
            },
            {
                unique: true,
                fields: ['goal_id', 'position']  // 데이터베이스 컬럼명 사용
            }
        ]
    });

    // 모델 관계 설정
    MandartTask.associate = function(models) {
        // MandartGoal과의 관계
        MandartTask.belongsTo(models.MandartGoal, {
            foreignKey: 'goalId',
            as: 'goal'
        });
        
        // Mandart와의 관계
        MandartTask.belongsTo(models.Mandart, {
            foreignKey: 'mandartId',
            as: 'mandart'
        });
    };

    return MandartTask;
};
