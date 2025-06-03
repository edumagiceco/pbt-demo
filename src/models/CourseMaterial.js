'use strict';

module.exports = (sequelize, DataTypes) => {
  const CourseMaterial = sequelize.define('CourseMaterial', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'course_id',
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    lectureId: {
      type: DataTypes.INTEGER,
      allowNull: true, // 특정 강의와 연결될 수도 있음
      field: 'lecture_id',
      references: {
        model: 'lectures',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('document', 'presentation', 'code', 'image', 'audio', 'archive', 'link', 'other'),
      defaultValue: 'document'
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'file_path'
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'file_name'
    },
    fileSize: {
      type: DataTypes.BIGINT, // 파일 크기 (bytes)
      allowNull: true,
      field: 'file_size'
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'mime_type'
    },
    url: {
      type: DataTypes.STRING(500), // 외부 링크인 경우
      allowNull: true
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'download_count'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // 수강생에게 공개 여부
      field: 'is_public'
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'order_index'
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
    version: {
      type: DataTypes.STRING(20),
      defaultValue: '1.0'
    },
    tags: {
      type: DataTypes.TEXT, // JSON 형태로 태그 저장
      allowNull: true
    }
  }, {
    tableName: 'course_materials',
    timestamps: true,
    underscored: true
  });

  CourseMaterial.associate = function(models) {
    CourseMaterial.belongsTo(models.Course, {
      foreignKey: 'course_id'
    });
    
    CourseMaterial.belongsTo(models.Lecture, {
      foreignKey: 'lecture_id'
    });
    
    CourseMaterial.belongsTo(models.User, {
      as: 'uploader',
      foreignKey: 'uploaded_by'
    });
  };

  return CourseMaterial;
};