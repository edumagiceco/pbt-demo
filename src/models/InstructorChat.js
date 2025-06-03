'use strict';

module.exports = (sequelize, DataTypes) => {
  const InstructorChat = sequelize.define('InstructorChat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '대화한 사용자 ID'
  },
  lectureId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '연관된 강의 ID'
  },
  materialId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '연관된 자료 ID'
  },
  sessionId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '대화 세션 ID'
  },
  messages: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: '대화 메시지 배열 [{role: "user"|"assistant", content: "...", timestamp: "..."}]'
  },
  context: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '대화 컨텍스트 (분석된 자료 정보, 강의 내용 등)'
  },
  totalMessages: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.messages ? this.messages.length : 0;
    }
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '마지막 메시지 시간'
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '대화 만족도 (1-5)'
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '사용자 피드백'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '활성 상태'
  }
}, {
  tableName: 'instructor_chats',
  timestamps: true,
  underscored: true,
  comment: '강사 AI 대화 기록 테이블'
});

// 관계 설정
InstructorChat.associate = function(models) {
  // User와의 관계
  InstructorChat.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // LectureMaterial과의 관계
  InstructorChat.belongsTo(models.LectureMaterial, {
    foreignKey: 'materialId',
    as: 'material',
    constraints: false
  });

  // Lecture와의 관계 (선택적)
  InstructorChat.belongsTo(models.Lecture, {
    foreignKey: 'lectureId',
    as: 'lecture',
    constraints: false
  });
};

return InstructorChat;
};
