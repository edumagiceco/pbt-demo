const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CourseEnrollment = sequelize.define('CourseEnrollment', {
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    enrolledAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // 0-100%
      validate: {
        min: 0,
        max: 100
      }
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('enrolled', 'in_progress', 'completed', 'dropped'),
      defaultValue: 'enrolled'
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    certificateIssued: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'course_enrollments',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['course_id', 'user_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['status']
      }
    ]
  });

  CourseEnrollment.associate = function(models) {
    CourseEnrollment.belongsTo(models.Course, {
      foreignKey: 'courseId'
    });

    CourseEnrollment.belongsTo(models.User, {
      foreignKey: 'userId'
    });
  };

  return CourseEnrollment;
};