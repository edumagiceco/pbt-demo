'use strict';

module.exports = (sequelize, DataTypes) => {
    const ProblemParticipant = sequelize.define('ProblemParticipant', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        problemId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'problem_id',
            references: {
                model: 'problems',
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
        enrolledAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'enrolled_at'
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'completed_at'
        },
        finalScore: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            field: 'final_score'
        },
        status: {
            type: DataTypes.ENUM('enrolled', 'in_progress', 'completed', 'dropped'),
            defaultValue: 'enrolled'
        }
    }, {
        tableName: 'problem_participants',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['problem_id', 'user_id']
            }
        ]
    });

    ProblemParticipant.associate = function(models) {
        ProblemParticipant.belongsTo(models.Problem, {
            foreignKey: 'problem_id'
        });
        
        ProblemParticipant.belongsTo(models.User, {
            foreignKey: 'user_id'
        });
    };

    return ProblemParticipant;
};
