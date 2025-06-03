'use strict';

module.exports = (sequelize, DataTypes) => {
    const Discussion = sequelize.define('Discussion', {
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
        title: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        isPinned: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_pinned'
        },
        viewCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'view_count'
        }
    }, {
        tableName: 'discussions',
        timestamps: true,
        underscored: true
    });

    Discussion.associate = function(models) {
        Discussion.belongsTo(models.Problem, {
            foreignKey: 'problem_id'
        });
        
        Discussion.belongsTo(models.User, {
            foreignKey: 'user_id'
        });
        
        Discussion.hasMany(models.Comment, {
            foreignKey: 'discussion_id'
        });
    };

    return Discussion;
};
