const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    thumbnail: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      defaultValue: 'beginner'
    },
    instructorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    duration: {
      type: DataTypes.INTEGER, // 총 시간 (분)
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'closed', 'archived'),
      defaultValue: 'draft'
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    learningObjectives: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: DataTypes.TEXT, // JSON string
      allowNull: true
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    enrollmentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00
    },
    ratingCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'courses',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['instructor_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['category']
      },
      {
        fields: ['level']
      }
    ]
  });

  Course.associate = function(models) {
    Course.belongsTo(models.User, {
      as: 'instructor',
      foreignKey: 'instructorId'
    });

    Course.hasMany(models.CourseEnrollment, {
      as: 'enrollments',
      foreignKey: 'courseId'
    });

    Course.hasMany(models.Lecture, {
      as: 'lectures',
      foreignKey: 'courseId'
    });

    Course.hasMany(models.Assignment, {
      as: 'assignments',
      foreignKey: 'courseId'
    });

    Course.hasMany(models.QnA, {
      as: 'qnas',
      foreignKey: 'courseId'
    });

    Course.belongsToMany(models.User, {
      through: models.CourseEnrollment,
      as: 'students',
      foreignKey: 'courseId',
      otherKey: 'userId'
    });
  };

  return Course;
};