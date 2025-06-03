'use strict';

module.exports = (sequelize, DataTypes) => {
    const Problem = sequelize.define('Problem', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        difficulty: {
            type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
            defaultValue: 'beginner'
        },
        category: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        instructorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'instructor_id',
            references: {
                model: 'users',
                key: 'id'
            }
        },
        maxScore: {
            type: DataTypes.INTEGER,
            defaultValue: 100,
            field: 'max_score'
        },
        timeLimit: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'time_limit',
            comment: 'Time limit in minutes'
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'start_date'
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'end_date'
        },
        status: {
            type: DataTypes.ENUM('draft', 'active', 'completed'),
            defaultValue: 'draft'
        }
    }, {
        tableName: 'problems',
        timestamps: true,
        underscored: true
    });

    Problem.associate = function(models) {
        Problem.belongsTo(models.User, {
            as: 'instructor',
            foreignKey: 'instructor_id'
        });
        
        Problem.hasMany(models.ProblemParticipant, {
            foreignKey: 'problem_id'
        });
        
        Problem.hasMany(models.Solution, {
            foreignKey: 'problem_id'
        });
        
        Problem.hasMany(models.TestCase, {
            foreignKey: 'problem_id'
        });
        
        Problem.hasMany(models.LearningMaterial, {
            foreignKey: 'problem_id'
        });
        
        Problem.hasMany(models.Discussion, {
            foreignKey: 'problem_id'
        });
        
        Problem.hasMany(models.Progress, {
            foreignKey: 'problem_id'
        });
    };

    return Problem;
};
