'use strict';

module.exports = (sequelize, DataTypes) => {
  const LectureMaterial = sequelize.define('LectureMaterial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  lectureId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '연관된 강의 ID (선택사항)'
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '연관된 과정 ID'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '자료 제목'
  },
  type: {
    type: DataTypes.ENUM('pdf', 'video', 'document', 'image', 'code', 'website'),
    allowNull: false,
    comment: '자료 유형'
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '파일 경로 (업로드된 파일의 경우)'
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '외부 URL (링크의 경우)'
  },
  extractedContent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '자료에서 추출된 텍스트 내용'
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'AI가 생성한 자료 요약'
  },
  concepts: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '핵심 개념들 [{name, definition, examples}]'
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner',
    comment: '자료 난이도'
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '업로드한 사용자 ID'
  },
  analyzedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '자료 분석 완료 시간'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '파일 크기 (bytes)'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '비디오 길이 (초) 또는 예상 읽기 시간'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '활성 상태'
  }
}, {
  tableName: 'lecture_materials',
  timestamps: true,
  underscored: true,
  comment: '강의 자료 테이블'
});

// 관계 설정
LectureMaterial.associate = function(models) {
  // User와의 관계 - 업로드한 사용자
  LectureMaterial.belongsTo(models.User, {
    foreignKey: 'uploadedBy',
    as: 'uploader'
  });

  // Course와의 관계 (선택적)
  LectureMaterial.belongsTo(models.Course, {
    foreignKey: 'courseId',
    as: 'course',
    constraints: false
  });

  // Lecture와의 관계 (선택적)
  LectureMaterial.belongsTo(models.Lecture, {
    foreignKey: 'lectureId',
    as: 'lecture',
    constraints: false
  });

  // InstructorChat과의 관계
  LectureMaterial.hasMany(models.InstructorChat, {
    foreignKey: 'materialId',
    as: 'chats'
  });

  // ConceptExplanation과의 관계
  LectureMaterial.hasMany(models.ConceptExplanation, {
    foreignKey: 'materialId',
    as: 'conceptExplanations'
  });
};

return LectureMaterial;
};
