const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MentorConversation = sequelize.define('MentorConversation', {
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
        sessionId: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            field: 'session_id',
            comment: '대화 세션 고유 ID'
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: true,
            comment: '대화 제목 (첫 번째 질문에서 자동 생성)'
        },
        messages: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: '대화 메시지 배열 [{role: "user/assistant", content: "...", timestamp: "..."}]'
        },
        messageCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'message_count',
            comment: '총 메시지 수'
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 5
            },
            comment: '대화 만족도 (1-5)'
        },
        feedback: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '사용자 피드백'
        },
        status: {
            type: DataTypes.ENUM('active', 'completed', 'archived'),
            defaultValue: 'active',
            comment: '대화 상태'
        },
        lastMessageAt: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: '마지막 메시지 시간'
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: '대화 지속 시간 (분)'
        }
    }, {
        tableName: 'mentor_conversations',
        timestamps: true,
        indexes: [
            {
                fields: ['mentor_id']
            },
            {
                fields: ['user_id']
            },
            {
                fields: ['session_id']
            },
            {
                fields: ['status', 'last_message_at']
            }
        ]
    });

    MentorConversation.associate = (models) => {
        // 멘토와의 관계
        MentorConversation.belongsTo(models.Mentor, {
            foreignKey: 'mentorId',
            as: 'mentor'
        });

        // 사용자와의 관계
        MentorConversation.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    };

    return MentorConversation;
};
