const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Mentor = sequelize.define('Mentor', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 100]
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        expertise: {
            type: DataTypes.STRING(200),
            allowNull: true,
            comment: '전문 분야 (예: AI, 프로그래밍, 디자인)'
        },
        personality: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {
                tone: 'friendly',
                style: 'professional',
                characteristics: []
            },
            comment: '성격 특성 (예: {tone: "friendly", style: "professional"})'
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            field: 'is_public',
            defaultValue: false,
            comment: '공개 여부 (true: 다른 사용자와 공유 가능)'
        },
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'owner_id',
            references: {
                model: 'users',
                key: 'id'
            },
            comment: '멘토 생성자 ID'
        },
        avatar: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '프로필 이미지 경로'
        },
        rating: {
            type: DataTypes.DECIMAL(3, 2),
            defaultValue: 0.00,
            validate: {
                min: 0,
                max: 5
            },
            comment: '평균 평점 (0-5)'
        },
        usageCount: {
            type: DataTypes.INTEGER,
            field: 'usage_count',
            defaultValue: 0,
            comment: '사용 횟수'
        },
        lastUsedAt: {
            type: DataTypes.DATE,
            field: 'last_used_at',
            allowNull: true,
            comment: '마지막 사용 시간'
        }
    }, {
        tableName: 'mentors',
        timestamps: true
    });

    Mentor.associate = (models) => {
        // 멘토 소유자 관계
        Mentor.belongsTo(models.User, {
            foreignKey: 'ownerId',
            as: 'owner'
        });

        // 멘토 지식 관계
        Mentor.hasMany(models.MentorKnowledge, {
            foreignKey: 'mentorId',
            as: 'knowledge',
            onDelete: 'CASCADE'
        });

        // 멘토 대화 관계
        Mentor.hasMany(models.MentorConversation, {
            foreignKey: 'mentorId',
            as: 'conversations',
            onDelete: 'CASCADE'
        });

        // 멘토 평가 관계
        Mentor.hasMany(models.MentorRating, {
            foreignKey: 'mentorId',
            as: 'ratings',
            onDelete: 'CASCADE'
        });
    };

    return Mentor;
};
