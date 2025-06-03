'use strict';

module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        discussionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'discussion_id',
            references: {
                model: 'discussions',
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
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'parent_id',
            references: {
                model: 'comments',
                key: 'id'
            }
        },
        isAnswer: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_answer'
        }
    }, {
        tableName: 'comments',
        timestamps: true,
        underscored: true
    });

    Comment.associate = function(models) {
        Comment.belongsTo(models.Discussion, {
            foreignKey: 'discussion_id'
        });
        
        Comment.belongsTo(models.User, {
            foreignKey: 'user_id'
        });
        
        Comment.hasMany(models.Comment, {
            as: 'replies',
            foreignKey: 'parent_id'
        });
        
        Comment.belongsTo(models.Comment, {
            as: 'parent',
            foreignKey: 'parent_id'
        });
    };

    return Comment;
};
