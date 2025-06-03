'use strict';

module.exports = (sequelize, DataTypes) => {
    const Progress = sequelize.define('Progress', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
        problemId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'problem_id',
            references: {
                model: 'problems',
                key: 'id'
            }
        },
        materialId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'material_id',
            references: {
                model: 'learning_materials',
                key: 'id'
            }
        },
        progressPercent: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'progress_percent',
            validate: {
                min: 0,
                max: 100
            }
        },
        lastAccessedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'last_accessed_at'
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'completed_at'
        }
    }, {
        tableName: 'progress',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'problem_id', 'material_id']
            }
        ]
    });

    Progress.associate = function(models) {
        Progress.belongsTo(models.User, {
            foreignKey: 'user_id'
        });
        
        Progress.belongsTo(models.Problem, {
            foreignKey: 'problem_id'
        });
        
        Progress.belongsTo(models.LearningMaterial, {
            foreignKey: 'material_id'
        });
    };

    return Progress;
};
