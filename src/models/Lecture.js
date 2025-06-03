const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Lecture = sequelize.define('Lecture', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
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
      type: DataTypes.ENUM('video', 'document', 'quiz', 'assignment', 'live'),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT, // JSON string for flexible content
      allowNull: true
    },
    videoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true // YouTube URL or other video platform
    },
    videoId: {
      type: DataTypes.STRING(100),
      allowNull: true // YouTube video ID
    },
    videoDuration: {
      type: DataTypes.INTEGER, // seconds
      allowNull: true
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    duration: {
      type: DataTypes.INTEGER, // estimated duration in minutes
      allowNull: true
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isFree: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    requiredForCompletion: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'lectures',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['course_id']
      },
      {
        fields: ['type']
      },
      {
        fields: ['order']
      },
      {
        fields: ['is_published']
      }
    ]
  });

  Lecture.associate = function(models) {
    Lecture.belongsTo(models.Course, {
      foreignKey: 'courseId'
    });

    Lecture.belongsTo(models.User, {
      as: 'uploader',
      foreignKey: 'uploadedBy'
    });

    Lecture.hasMany(models.QnA, {
      as: 'qnas',
      foreignKey: 'lectureId'
    });
  };

  return Lecture;
};