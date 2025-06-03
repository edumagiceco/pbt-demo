const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MandartGoal = sequelize.define('MandartGoal', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
            comment: '목표 제목'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '목표 설명'
        },
        position: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '목표 위치 (1-9, 5번이 중심 목표)'
        },
        color: {
            type: DataTypes.STRING(7),
            defaultValue: '#3498db',
            comment: '목표 색상 (HEX 코드)'
        },
        icon: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: '목표 아이콘'
        },
        priority: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            comment: '우선순위 (1-5)'
        },
        deadline: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: '목표 마감일'
        },
        status: {
            type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'on_hold'),
            defaultValue: 'not_started',
            comment: '목표 상태'
        },
        progressPercent: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '목표 진행률 (0-100)'
        },
        category: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: '목표 카테고리 (건강, 재정, 인간관계 등)'
        },
        isCenter: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: '중심 목표 여부'
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
        tableName: 'mandart_goals',
        timestamps: true,
        indexes: [
            {
                fields: ['mandart_id']  // 데이터베이스 컬럼명 사용
            },
            {
                fields: ['position']
            },
            {
                fields: ['status']
            },
            {
                unique: true,
                fields: ['mandart_id', 'position']  // 데이터베이스 컬럼명 사용
            }
        ]
    });

    // 모델 관계 설정
    MandartGoal.associate = function(models) {
        // Mandart와의 관계
        MandartGoal.belongsTo(models.Mandart, {
            foreignKey: 'mandartId',
            as: 'mandart'
        });
        
        // MandartTask와의 관계 (1:8)
        MandartGoal.hasMany(models.MandartTask, {
            foreignKey: 'goalId',
            as: 'tasks',
            onDelete: 'CASCADE'
        });
    };

    return MandartGoal;
};
