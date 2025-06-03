const db = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const cheerio = require('cheerio');
const axios = require('axios'); // 웹 스크래핑용
const Anthropic = require('@anthropic-ai/sdk');

// Anthropic 클라이언트 초기화
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;
console.log('Claude API 키 설정 확인:', CLAUDE_API_KEY ? '설정됨' : '설정되지 않음');

let anthropic = null;
if (CLAUDE_API_KEY) {
    try {
        anthropic = new Anthropic({
            apiKey: CLAUDE_API_KEY,
        });
        console.log('✅ Anthropic 클라이언트 초기화 완료');
    } catch (error) {
        console.error('❌ Anthropic 클라이언트 초기화 실패:', error.message);
    }
} else {
    console.warn('⚠️ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');
}

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/lecture-materials/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB 제한
    },
    fileFilter: function (req, file, cb) {
        // PDF, 문서, 이미지 파일만 허용
        const allowedTypes = /pdf|doc|docx|txt|png|jpg|jpeg|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('허용되지 않는 파일 형식입니다.'));
        }
    }
});

class InstructorAiController {
    // 파일 타입 판별 함수
    getFileType(filename) {
        if (!filename) return 'document';
        
        const ext = filename.toLowerCase().split('.').pop();
        const typeMap = {
            'pdf': 'pdf',
            'ppt': 'presentation',
            'pptx': 'presentation',
            'doc': 'document',
            'docx': 'document',
            'txt': 'document',
            'png': 'image',
            'jpg': 'image',
            'jpeg': 'image',
            'gif': 'image'
        };
        return typeMap[ext] || 'document';
    }
    
    // 강의 자료 업로드 및 분석
    async uploadAndAnalyzeMaterial(req, res) {
        try {
            const { title, type, url, courseId, lectureId } = req.body;
            const userId = req.user.id;
            
            let filePath = null;
            let fileSize = null;
            
            // 파일 업로드된 경우
            if (req.file) {
                filePath = req.file.path;
                fileSize = req.file.size;
            }
            
            // title이 없는 경우 파일명 사용
            const materialTitle = title || (req.file ? req.file.originalname : 'Untitled');
            
            // type이 없는 경우 파일 확장자로 추정
            const materialType = type || this.getFileType(req.file ? req.file.originalname : '');
            
            // 자료 저장
            const material = await db.LectureMaterial.create({
                title: materialTitle,
                type: materialType,
                filePath,
                url,
                fileSize,
                courseId: courseId || null,
                lectureId: lectureId || null,
                uploadedBy: userId
            });
            
            // 자료 내용 분석 (비동기 처리)
            this.analyzeMaterialContent(material.id).catch(error => {
                console.error('자료 분석 중 오류:', error);
            });
            
            res.status(201).json({
                success: true,
                message: '자료 업로드가 완료되었습니다. 분석이 진행 중입니다.',
                data: material
            });
            
        } catch (error) {
            console.error('자료 업로드 오류:', error);
            res.status(500).json({
                success: false,
                message: '자료 업로드 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }
    
    // 자료 내용 분석 (비동기)
    async analyzeMaterialContent(materialId) {
        try {
            const material = await db.LectureMaterial.findByPk(materialId);
            if (!material) return;
            
            let extractedContent = '';
            
            // 파일 유형에 따른 내용 추출
            if (material.type === 'pdf' && material.filePath) {
                extractedContent = await this.extractPdfContent(material.filePath);
            } else if (material.type === 'website' && material.url) {
                extractedContent = await this.extractWebContent(material.url);
            } else if (material.type === 'document' && material.filePath) {
                extractedContent = await this.extractDocumentContent(material.filePath);
            }
            
            if (!extractedContent) return;
            
            // Claude AI를 통한 내용 분석
            const analysis = await this.analyzeContentWithAI(extractedContent);
            
            // 분석 결과 저장
            await material.update({
                extractedContent,
                summary: analysis.summary,
                concepts: analysis.concepts,
                difficulty: analysis.difficulty,
                analyzedAt: new Date()
            });
            
            // 개념 설명 저장
            if (analysis.concepts && analysis.concepts.length > 0) {
                await this.saveConcepts(materialId, analysis.concepts);
            }
            
        } catch (error) {
            console.error('자료 분석 오류:', error);
        }
    }
    
    // Claude AI를 통한 내용 분석
    async analyzeContentWithAI(content) {
        try {
            if (!anthropic) {
                console.error('Anthropic 클라이언트가 초기화되지 않았습니다.');
                return {
                    summary: '자료가 업로드되었습니다. (AI 분석 미지원)',
                    difficulty: 'intermediate',
                    concepts: []
                };
            }

            const prompt = `
다음 강의 자료를 분석하여 교육적 관점에서 요약하고 핵심 개념들을 추출해주세요.

강의 자료 내용:
${content.substring(0, 8000)} // 토큰 제한 고려

다음 JSON 형식으로 응답해주세요:
{
    "summary": "자료의 핵심 내용 요약 (200자 내외)",
    "difficulty": "beginner|intermediate|advanced",
    "concepts": [
        {
            "name": "개념명",
            "definition": "개념 정의",
            "explanation": "상세 설명",
            "examples": "예시",
            "importance": "중요도 (1-5)"
        }
    ]
}
            `;
            
            console.log('📊 AI 분석 시작...');
            
            const message = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });
            
            // Claude 응답에서 텍스트 추출
            const responseText = message.content[0].text;
            console.log('📝 AI 응답 받음:', responseText.substring(0, 200) + '...');
            
            // JSON 파싱 시도
            try {
                // JSON 블록 추출 (```json 블록이나 {} 블록 찾기)
                let jsonText = responseText;
                
                // ```json 블록이 있는 경우
                const jsonBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonBlockMatch) {
                    jsonText = jsonBlockMatch[1];
                } else {
                    // 중괄호로 시작하는 JSON 객체 찾기
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        jsonText = jsonMatch[0];
                    }
                }
                
                const parsed = JSON.parse(jsonText);
                
                console.log('✅ JSON 파싱 성공');
                
                // 기본 구조 확인 및 보정
                return {
                    summary: parsed.summary || content.substring(0, 200) + '...',
                    difficulty: parsed.difficulty || 'intermediate',
                    concepts: Array.isArray(parsed.concepts) ? parsed.concepts : []
                };
            } catch (parseError) {
                console.error('JSON 파싱 오류:', parseError);
                console.error('원본 응답:', responseText.substring(0, 500));
                
                // JSON 파싱 실패 시 텍스트 분석으로 기본값 생성
                const summary = responseText.substring(0, 200).replace(/\n/g, ' ').trim();
                
                return {
                    summary: summary || content.substring(0, 200) + '...',
                    difficulty: 'intermediate',
                    concepts: []
                };
            }
            
        } catch (error) {
            console.error('AI 분석 오류:', error);
            // 오류 발생 시 기본 분석 결과 반환
            return {
                summary: content.substring(0, 200) + '...',
                difficulty: 'intermediate',
                concepts: []
            };
        }
    }
    
    // 개념 설명 저장
    async saveConcepts(materialId, concepts) {
        try {
            for (const concept of concepts) {
                await db.ConceptExplanation.create({
                    materialId,
                    concept: concept.name || '개념명',
                    definition: concept.definition || '정의가 제공되지 않았습니다.',
                    explanation: concept.explanation || concept.definition || '설명이 제공되지 않았습니다.',
                    examples: concept.examples || null,
                    difficulty: 'intermediate', // 기본값
                    isAiGenerated: true
                });
            }
        } catch (error) {
            console.error('개념 저장 오류:', error);
        }
    }
    
    // 강사 AI와 채팅
    async chat(req, res) {
        try {
            const { message, sessionId, materialId, lectureId } = req.body;
            const userId = req.user.id;
            
            // 기존 채팅 세션 찾기 또는 새로 생성
            let chat = await db.InstructorChat.findOne({
                where: { sessionId, userId }
            });
            
            if (!chat) {
                chat = await db.InstructorChat.create({
                    userId,
                    sessionId: sessionId || uuidv4(),
                    materialId: materialId || null,
                    lectureId: lectureId || null,
                    messages: [],
                    context: await this.buildChatContext(materialId, lectureId)
                });
            }
            
            // 사용자 메시지 추가
            const updatedMessages = [
                ...chat.messages,
                {
                    role: 'user',
                    content: message,
                    timestamp: new Date().toISOString()
                }
            ];
            
            // AI 응답 생성
            const aiResponse = await this.generateInstructorResponse(message, chat.context, updatedMessages);
            
            // AI 응답 추가
            updatedMessages.push({
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date().toISOString()
            });
            
            // 채팅 업데이트
            await chat.update({
                messages: updatedMessages,
                lastMessageAt: new Date()
            });
            
            res.json({
                success: true,
                data: {
                    response: aiResponse,
                    sessionId: chat.sessionId
                }
            });
            
        } catch (error) {
            console.error('채팅 오류:', error);
            res.status(500).json({
                success: false,
                message: '채팅 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }
    
    // 채팅 컨텍스트 구축
    async buildChatContext(materialId, lectureId) {
        const context = {
            material: null,
            concepts: [],
            lectureInfo: null
        };
        
        // 자료 정보 로드
        if (materialId) {
            const material = await db.LectureMaterial.findByPk(materialId, {
                include: [{
                    model: db.ConceptExplanation,
                    as: 'conceptExplanations'
                }]
            });
            
            if (material) {
                context.material = {
                    title: material.title,
                    summary: material.summary,
                    extractedContent: material.extractedContent?.substring(0, 4000), // 일부만 포함
                    difficulty: material.difficulty
                };
                context.concepts = material.conceptExplanations || [];
            }
        }
        
        return context;
    }
    
    // 강사 AI 응답 생성
    async generateInstructorResponse(userMessage, context, messageHistory) {
        try {
            if (!anthropic) {
                return '죄송합니다. 현재 AI 기능이 설정되지 않아 답변을 제공할 수 없습니다. 시스템 관리자에게 문의해주세요.';
            }

            const systemPrompt = `당신은 교육 전문가이자 강사 AI입니다. 다음 특징을 가지고 있습니다:

1. 교육적 설명에 특화: 복잡한 개념을 쉽게 풀어서 설명
2. 학습자 수준 맞춤: 초급/중급/고급에 따른 설명 조절
3. 실무 중심: 이론과 실제 적용 사례 연결
4. 상호작용적: 질문을 통한 학습 유도

강의 자료 정보:
${context.material ? `
- 제목: ${context.material.title}
- 요약: ${context.material.summary}
- 난이도: ${context.material.difficulty}
` : '현재 특정 강의 자료 없음'}

핵심 개념들:
${context.concepts.length > 0 ? context.concepts.map(c => `- ${c.concept}: ${c.definition || c.explanation}`).join('\n') : '분석된 개념 없음'}

학습자의 질문에 대해 교육적이고 친근한 톤으로 답변해주세요.
필요시 예시나 실습 문제를 제안하고, 추가 학습 자료를 추천해주세요.`;
            
            // 메시지 히스토리를 Anthropic 형식으로 변환 (system 메시지 제외)
            const messages = messageHistory.slice(-10)
                .filter(msg => msg.role !== 'system')
                .map(msg => ({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content
                }));
            
            console.log('🤖 강사 AI 응답 생성 중...');
            console.log('메시지 수:', messages.length);
            
            const message = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1500,
                system: systemPrompt,
                messages: messages
            });
            
            const response = message.content[0].text;
            console.log('✅ 강사 AI 응답 생성 완료 (' + response.length + '자)');
            
            return response;
            
        } catch (error) {
            console.error('AI 응답 생성 오류:', error);
            
            // 오류 발생 시 폴백 응답
            if (context.material) {
                return `"${context.material.title}" 자료와 관련된 질문을 주셨네요. 현재 AI 시스템에 일시적인 문제가 있어 상세한 답변을 드리기 어렵습니다. 다음을 참고해주세요:

자료 요약: ${context.material.summary || '요약 정보가 없습니다.'}

추가 질문이 있으시면 다시 시도해주세요.`;
            }
            
            return '죄송합니다. 현재 응답을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.';
        }
    }
    
    // 자료 목록 조회
    async getMaterials(req, res) {
        try {
            const { page = 1, limit = 10, type, difficulty } = req.query;
            const offset = (page - 1) * limit;
            
            const whereClause = {};
            
            if (type) whereClause.type = type;
            if (difficulty) whereClause.difficulty = difficulty;
            
            const materials = await db.LectureMaterial.findAndCountAll({
                where: whereClause,
                include: [{
                    model: db.User,
                    as: 'uploader',
                    attributes: ['id', 'fullName', 'email']
                }],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            
            res.json({
                success: true,
                data: {
                    materials: materials.rows,
                    pagination: {
                        total: materials.count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(materials.count / limit)
                    }
                }
            });
            
        } catch (error) {
            console.error('자료 목록 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '자료 목록을 불러오는 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }
    
    // 자료 상세 정보 조회
    async getMaterialDetail(req, res) {
        try {
            const { id } = req.params;
            
            const material = await db.LectureMaterial.findByPk(id, {
                include: [
                    {
                        model: db.User,
                        as: 'uploader',
                        attributes: ['id', 'fullName', 'email']
                    },
                    {
                        model: db.ConceptExplanation,
                        as: 'conceptExplanations'
                    }
                ]
            });
            
            if (!material) {
                return res.status(404).json({
                    success: false,
                    message: '자료를 찾을 수 없습니다.'
                });
            }
            
            res.json({
                success: true,
                data: material
            });
            
        } catch (error) {
            console.error('자료 상세 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '자료 정보를 불러오는 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }
    
    // 개념 설명 요청
    async explainConcept(req, res) {
        try {
            const { concept, level = 'intermediate', materialId } = req.body;
            
            let context = '';
            if (materialId) {
                const material = await db.LectureMaterial.findByPk(materialId);
                if (material && material.extractedContent) {
                    context = material.extractedContent.substring(0, 2000);
                }
            }
            
            const explanation = await this.generateConceptExplanation(concept, level, context);
            
            res.json({
                success: true,
                data: {
                    concept,
                    level,
                    explanation
                }
            });
            
        } catch (error) {
            console.error('개념 설명 오류:', error);
            res.status(500).json({
                success: false,
                message: '개념 설명 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }
    
    // 개념 설명 생성
    async generateConceptExplanation(concept, level, context) {
        try {
            if (!anthropic) {
                return `"${concept}" 개념에 대한 설명:\n\n이 개념은 ${level} 수준의 학습자를 위한 중요한 주제입니다. 현재 AI 기능이 비활성화되어 상세한 설명을 제공할 수 없습니다.`;
            }

            const prompt = `
"${concept}" 개념을 ${level} 수준의 학습자에게 설명해주세요.

참고 자료:
${context}

다음 형식으로 설명해주세요:
1. 개념 정의
2. 핵심 포인트
3. 실제 예시
4. 학습 팁
5. 관련 개념

친근하고 이해하기 쉽게 설명해주세요.
            `;
            
            console.log('📖 개념 설명 생성 중...');
            
            const message = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1500,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });
            
            const response = message.content[0].text;
            console.log('✅ 개념 설명 생성 완료');
            
            return response;
            
        } catch (error) {
            console.error('개념 설명 생성 오류:', error);
            return `"${concept}" 개념에 대한 간단한 설명:\n\n이 개념은 ${level} 수준의 학습자를 위한 중요한 주제입니다. 현재 상세한 설명을 생성할 수 없어 죄송합니다. 다시 시도해주세요.`;
        }
    }
    
    // PDF 내용 추출
    async extractPdfContent(filePath) {
        try {
            const fs = require('fs');
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            
            // PDF 텍스트 추출
            let extractedText = pdfData.text;
            
            // 텍스트 정리 (불필요한 공백 제거, 줄바꿈 정리)
            extractedText = extractedText
                .replace(/\s+/g, ' ')
                .replace(/\n\s*\n/g, '\n\n')
                .trim();
            
            console.log(`PDF 추출 완료: ${extractedText.length}자`);
            
            return extractedText;
        } catch (error) {
            console.error('PDF 추출 오류:', error);
            return '';
        }
    }
    
    // 웹 내용 추출
    async extractWebContent(url) {
        try {
            // 웹 페이지 가져오기
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });
            
            // cheerio로 HTML 파싱
            const $ = cheerio.load(response.data);
            
            // 스크립트와 스타일 태그 제거
            $('script').remove();
            $('style').remove();
            
            // 메인 콘텐츠 추출 시도 (여러 선택자 시도)
            let content = '';
            const contentSelectors = [
                'main',
                'article',
                '[role="main"]',
                '#content',
                '.content',
                '#main',
                '.main',
                'body'
            ];
            
            for (const selector of contentSelectors) {
                const element = $(selector);
                if (element.length > 0) {
                    content = element.text();
                    if (content.length > 500) break; // 충분한 내용이 있으면 중단
                }
            }
            
            // 텍스트 정리
            content = content
                .replace(/\s+/g, ' ')
                .replace(/\n\s*\n/g, '\n\n')
                .trim();
            
            console.log(`웹 내용 추출 완료: ${content.length}자`);
            
            return content || '웹 페이지에서 내용을 추출할 수 없습니다.';
        } catch (error) {
            console.error('웹 내용 추출 오류:', error);
            return '웹 페이지에 접근할 수 없거나 내용을 추출할 수 없습니다.';
        }
    }
    
    // 문서 내용 추출
    async extractDocumentContent(filePath) {
        try {
            const ext = path.extname(filePath).toLowerCase();
            
            // 텍스트 파일의 경우
            if (ext === '.txt') {
                const content = await fs.readFile(filePath, 'utf8');
                console.log(`텍스트 파일 추출 완료: ${content.length}자`);
                return content;
            }
            
            // Word 문서의 경우 (추후 mammoth 라이브러리로 구현 가능)
            if (ext === '.doc' || ext === '.docx') {
                // 임시로 파일명과 크기 정보만 반환
                const stats = await fs.stat(filePath);
                return `Word 문서: ${path.basename(filePath)} (${Math.round(stats.size / 1024)}KB)\n\nWord 문서 내용 추출 기능은 추후 업데이트될 예정입니다.`;
            }
            
            return '지원하지 않는 문서 형식입니다.';
        } catch (error) {
            console.error('문서 추출 오류:', error);
            return '';
        }
    }
}

module.exports = { InstructorAiController, upload };
