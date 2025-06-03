const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Assignment = sequelize.define('Assignment', {
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
      allowNull: false
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('file', 'text', 'code', 'quiz', 'project'),
      defaultValue: 'file'
    },
    maxScore: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    passingScore: {
      type: DataTypes.INTEGER,
      defaultValue: 60
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    allowedFileTypes: {
      type: DataTypes.TEXT, // JSON array of file extensions
      allowNull: true
    },
    maxFileSize: {
      type: DataTypes.INTEGER, // in bytes
      defaultValue: 10485760 // 10MB
    },
    maxSubmissions: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    allowLateSubmission: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lateSubmissionPenalty: {
      type: DataTypes.INTEGER, // percentage penalty per day
      defaultValue: 0
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    autoGrade: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    rubric: {
      type: DataTypes.TEXT, // JSON string
      allowNull: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'assignments',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['course_id']
      },
      {
        fields: ['due_date']
      },
      {
        fields: ['is_published']
      },
      {
        fields: ['type']
      }
    ]
  });

  Assignment.associate = function(models) {
    Assignment.belongsTo(models.Course, {
      foreignKey: 'courseId'
    });

    Assignment.belongsTo(models.User, {
      as: 'creator',
      foreignKey: 'createdBy'
    });

    Assignment.hasMany(models.AssignmentSubmission, {
      as: 'submissions',
      foreignKey: 'assignmentId'
    });
  };

  return Assignment;
};