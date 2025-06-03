'use strict';

module.exports = (sequelize, DataTypes) => {
  const ConceptExplanation = sequelize.define('ConceptExplanation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  materialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '연관된 자료 ID'
  },
  concept: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '개념명'
  },
  definition: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '개념 정의'
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '상세 설명 내용'
  },
  examples: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '예시들'
  },
  codeExamples: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '코드 예시들 [{language: "python", code: "...", description: "..."}]'
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner',
    comment: '설명 난이도'
  },
  targetAudience: {
    type: DataTypes.ENUM('student', 'beginner', 'intermediate', 'advanced', 'all'),
    defaultValue: 'all',
    comment: '대상 학습자'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '태그들 (검색용)'
  },
  relatedConcepts: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '관련 개념들 [concept_id, ...]'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '조회 수'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    comment: '평점 (0-5)'
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '평가 수'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '생성한 사용자 ID (AI 생성의 경우 null)'
  },
  isAiGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'AI 생성 여부'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '활성 상태'
  }
}, {
  tableName: 'concept_explanations',
  timestamps: true,
  underscored: true,
  paranoid: true,
  comment: '개념 설명 저장 테이블'
});

// 관계 설정
ConceptExplanation.associate = function(models) {
  // LectureMaterial과의 관계
  ConceptExplanation.belongsTo(models.LectureMaterial, {
    foreignKey: 'materialId',
    as: 'material'
  });

  // User와의 관계 (생성한 사용자)
  ConceptExplanation.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
};

return ConceptExplanation;
};
