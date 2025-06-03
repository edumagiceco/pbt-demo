const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MentorKnowledge = sequelize.define('MentorKnowledge', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        mentorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'mentor_id',
            references: {
                model: 'mentors',
                key: 'id'
            }
        },
        type: {
            type: DataTypes.ENUM('text', 'pdf', 'youtube', 'website'),
            allowNull: false,
            comment: '지식 유형 (직접입력, PDF, 유튜브, 웹사이트)'
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 200]
            }
        },
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
            comment: '추출된 텍스트 내용'
        },
        sourceUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
            field: 'source_url',
            validate: {
                isUrl: {
                    msg: '유효한 URL을 입력해주세요.'
                }
            },
            comment: '원본 URL (유튜브, 웹사이트의 경우)'
        },
        filePath: {
            type: DataTypes.STRING(500),
            allowNull: true,
            field: 'file_path',
            comment: '업로드된 파일 경로 (PDF의 경우)'
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {},
            comment: '추가 메타데이터 (파일 크기, 페이지 수 등)'
        },
        status: {
            type: DataTypes.ENUM('processing', 'completed', 'failed'),
            defaultValue: 'processing',
            comment: '처리 상태'
        },
        wordCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'word_count',
            comment: '텍스트 단어 수'
        },
        processingLog: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'processing_log',
            comment: '처리 과정 로그'
        }
    }, {
        tableName: 'mentor_knowledge',
        timestamps: true
    });

    MentorKnowledge.associate = (models) => {
        // 멘토와의 관계
        MentorKnowledge.belongsTo(models.Mentor, {
            foreignKey: 'mentorId',
            as: 'mentor'
        });
    };

    return MentorKnowledge;
};
