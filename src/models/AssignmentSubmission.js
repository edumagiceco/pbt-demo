const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    assignmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'assignments',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    submissionText: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    fileName: {
      type: DataTypes.STRING(255),
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
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    isLate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    gradedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    gradedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('submitted', 'graded', 'returned', 'resubmitted'),
      defaultValue: 'submitted'
    },
    attempt: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    plagiarismScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    metadata: {
      type: DataTypes.TEXT, // JSON string for additional data
      allowNull: true
    }
  }, {
    tableName: 'assignment_submissions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['assignment_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['submitted_at']
      },
      {
        fields: ['status']
      },
      {
        fields: ['assignment_id', 'user_id', 'attempt']
      }
    ]
  });

  AssignmentSubmission.associate = function(models) {
    AssignmentSubmission.belongsTo(models.Assignment, {
      foreignKey: 'assignmentId'
    });

    AssignmentSubmission.belongsTo(models.User, {
      as: 'student',
      foreignKey: 'userId'
    });

    AssignmentSubmission.belongsTo(models.User, {
      as: 'grader',
      foreignKey: 'gradedBy'
    });
  };

  return AssignmentSubmission;
};