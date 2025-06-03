const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MentorRating = sequelize.define('MentorRating', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        mentorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'mentor_id',
            references: {
                model: 'mentors',
                key: 'id'
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
            references: {
                model: 'users',
                key: 'id'
            }
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            },
            comment: '평점 (1-5)'
        },
        review: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '리뷰 내용'
        },
        helpful: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: '도움이 되었는지 여부'
        },
        wouldRecommend: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: '추천 여부'
        },
        conversationId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'conversation_id',
            references: {
                model: 'mentor_conversations',
                key: 'id'
            },
            comment: '관련 대화 ID'
        }
    }, {
        tableName: 'mentor_ratings',
        timestamps: true,
        indexes: [
            {
                fields: ['mentor_id']
            },
            {
                fields: ['user_id']
            },
            {
                fields: ['rating']
            },
            {
                unique: true,
                fields: ['mentor_id', 'user_id', 'conversation_id'],
                name: 'unique_mentor_user_conversation_rating'
            }
        ]
    });

    MentorRating.associate = (models) => {
        // 멘토와의 관계
        MentorRating.belongsTo(models.Mentor, {
            foreignKey: 'mentorId',
            as: 'mentor'
        });

        // 사용자와의 관계
        MentorRating.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });

        // 대화와의 관계
        MentorRating.belongsTo(models.MentorConversation, {
            foreignKey: 'conversationId',
            as: 'conversation'
        });
    };

    return MentorRating;
};
