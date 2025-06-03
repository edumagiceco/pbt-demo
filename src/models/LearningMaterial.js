'use strict';

module.exports = (sequelize, DataTypes) => {
    const LearningMaterial = sequelize.define('LearningMaterial', {
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
        title: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('video', 'document', 'link', 'code'),
            allowNull: false
        },
        filePath: {
            type: DataTypes.STRING(500),
            allowNull: true,
            field: 'file_path'
        },
        url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        uploadedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'uploaded_by',
            references: {
                model: 'users',
                key: 'id'
            }
        },
        fileSize: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'file_size',
            comment: 'File size in bytes'
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Duration in seconds for videos'
        }
    }, {
        tableName: 'learning_materials',
        timestamps: true,
        underscored: true
    });

    LearningMaterial.associate = function(models) {
        LearningMaterial.belongsTo(models.Problem, {
            foreignKey: 'problem_id'
        });
        
        LearningMaterial.belongsTo(models.User, {
            as: 'uploader',
            foreignKey: 'uploaded_by'
        });
        
        LearningMaterial.hasMany(models.Progress, {
            foreignKey: 'material_id'
        });
    };

    return LearningMaterial;
};
