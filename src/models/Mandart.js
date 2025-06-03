const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Mandart = sequelize.define('Mandart', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
            comment: '만다라트 제목'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '만다라트 설명'
        },
        centerGoal: {
            type: DataTypes.STRING(500),
            allowNull: false,
            comment: '중심 목표 (9x9 매트릭스의 중앙)'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',  // 데이터베이스 컬럼명 명시
            references: {
                model: 'users',
                key: 'id'
            },
            comment: '작성자 ID'
        },
        coverImage: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: '커버 이미지 URL'
        },
        template: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: '사용된 템플릿 종류'
        },
        status: {
            type: DataTypes.ENUM('draft', 'active', 'completed', 'archived'),
            defaultValue: 'draft',
            comment: '만다라트 상태'
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: '공개 여부'
        },
        targetDate: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: '목표 달성 날짜'
        },
        progressPercent: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '전체 진행률 (0-100)'
        },
        sourceType: {
            type: DataTypes.ENUM('manual', 'pdf', 'youtube', 'template'),
            defaultValue: 'manual',
            comment: '생성 방식'
        },
        sourceData: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: '원본 데이터 (PDF 경로, 유튜브 URL 등)'
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
        tableName: 'mandarts',
        timestamps: true,
        indexes: [
            {
                fields: ['user_id']  // 데이터베이스 컬럼명 사용
            },
            {
                fields: ['status']
            },
            {
                fields: ['is_public']  // 데이터베이스 컬럼명 사용
            }
        ]
    });

    // 모델 관계 설정
    Mandart.associate = function(models) {
        // User와의 관계
        Mandart.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'author'
        });
        
        // MandartGoal과의 관계 (1:9)
        Mandart.hasMany(models.MandartGoal, {
            foreignKey: 'mandartId',
            as: 'goals',
            onDelete: 'CASCADE'
        });
        
        // MandartTask와의 관계 (1:72, 9개 목표 x 8개 과제)
        Mandart.hasMany(models.MandartTask, {
            foreignKey: 'mandartId',
            as: 'tasks',
            onDelete: 'CASCADE'
        });
    };

    return Mandart;
};
