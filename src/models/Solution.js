'use strict';

module.exports = (sequelize, DataTypes) => {
    const Solution = sequelize.define('Solution', {
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
        code: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        language: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'javascript'
        },
        output: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        executionTime: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'execution_time',
            comment: 'Execution time in milliseconds'
        },
        memoryUsed: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'memory_used',
            comment: 'Memory used in KB'
        },
        score: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true
        },
        feedback: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        submittedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'submitted_at'
        },
        evaluatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'evaluated_at'
        },
        status: {
            type: DataTypes.ENUM('pending', 'evaluating', 'evaluated', 'error'),
            defaultValue: 'pending'
        }
    }, {
        tableName: 'solutions',
        timestamps: true,
        underscored: true
    });

    Solution.associate = function(models) {
        Solution.belongsTo(models.Problem, {
            foreignKey: 'problem_id'
        });
        
        Solution.belongsTo(models.User, {
            foreignKey: 'user_id'
        });
    };

    return Solution;
};
