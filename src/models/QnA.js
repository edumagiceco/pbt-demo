const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QnA = sequelize.define('QnA', {
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
    lectureId: {
      type: DataTypes.INTEGER,
      allowNull: true, // null if general course question
      references: {
        model: 'lectures',
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
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true, // null for questions, set for answers
      references: {
        model: 'qnas',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: true // only for questions, not for answers
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('question', 'answer'),
      allowNull: false
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isAccepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false // for answers
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    answerCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0 // for questions
    },
    tags: {
      type: DataTypes.TEXT, // JSON array
      allowNull: true
    },
    attachmentPath: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    isResolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'qnas',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['course_id']
      },
      {
        fields: ['lecture_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['parent_id']
      },
      {
        fields: ['type']
      },
      {
        fields: ['is_resolved']
      },
      {
        fields: ['is_pinned']
      }
    ]
  });

  QnA.associate = function(models) {
    QnA.belongsTo(models.Course, {
      foreignKey: 'courseId'
    });

    QnA.belongsTo(models.Lecture, {
      foreignKey: 'lectureId'
    });

    QnA.belongsTo(models.User, {
      as: 'author',
      foreignKey: 'userId'
    });

    QnA.belongsTo(models.User, {
      as: 'resolver',
      foreignKey: 'resolvedBy'
    });

    // Self-referencing relationship for questions and answers
    QnA.hasMany(models.QnA, {
      as: 'answers',
      foreignKey: 'parentId'
    });

    QnA.belongsTo(models.QnA, {
      as: 'question',
      foreignKey: 'parentId'
    });
  };

  return QnA;
};