'use strict';

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                len: [3, 50],
                isAlphanumeric: true
            }
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        userType: {
            type: DataTypes.ENUM('student', 'instructor', 'admin'),
            defaultValue: 'student',
            field: 'user_type'
        },
        fullName: {
            type: DataTypes.STRING(100),
            field: 'full_name'
        },
        profileImage: {
            type: DataTypes.STRING(255),
            field: 'profile_image'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        },
        lastLogin: {
            type: DataTypes.DATE,
            field: 'last_login'
        }
    }, {
        tableName: 'users',
        timestamps: true,
        underscored: true,
        hooks: {
            beforeCreate: async (user) => {
                const bcrypt = require('bcrypt');
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    const bcrypt = require('bcrypt');
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    });

    User.associate = function(models) {
        // 기존 Problem 관련 관계들
        User.hasMany(models.Problem, {
            as: 'createdProblems',
            foreignKey: 'instructor_id'
        });
        
        User.hasMany(models.Solution, {
            foreignKey: 'user_id'
        });
        
        User.hasMany(models.ProblemParticipant, {
            foreignKey: 'user_id'
        });
        
        User.hasMany(models.Discussion, {
            foreignKey: 'user_id'
        });
        
        User.hasMany(models.Comment, {
            foreignKey: 'user_id'
        });
        
        User.hasMany(models.Progress, {
            foreignKey: 'user_id'
        });

        // 새로운 강의 관련 관계들
        User.hasMany(models.Course, {
            as: 'instructedCourses',
            foreignKey: 'instructorId'
        });

        User.hasMany(models.CourseEnrollment, {
            as: 'enrollments',
            foreignKey: 'userId'
        });

        User.hasMany(models.Lecture, {
            as: 'uploadedLectures',
            foreignKey: 'uploadedBy'
        });

        User.hasMany(models.Assignment, {
            as: 'createdAssignments',
            foreignKey: 'createdBy'
        });

        User.hasMany(models.AssignmentSubmission, {
            as: 'submissions',
            foreignKey: 'userId'
        });

        User.hasMany(models.AssignmentSubmission, {
            as: 'gradedSubmissions',
            foreignKey: 'gradedBy'
        });

        User.hasMany(models.QnA, {
            as: 'qnaQuestions',
            foreignKey: 'userId'
        });

        User.hasMany(models.QnA, {
            as: 'resolvedQnAs',
            foreignKey: 'resolvedBy'
        });


    };

    // Instance methods
    User.prototype.validatePassword = async function(password) {
        const bcrypt = require('bcrypt');
        return await bcrypt.compare(password, this.password);
    };

    User.prototype.toJSON = function() {
        const values = Object.assign({}, this.get());
        delete values.password;
        return values;
    };

    return User;
};
