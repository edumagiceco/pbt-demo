const { MentorKnowledge, Mentor } = require('../models');
const pdfParse = require('pdf-parse');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const knowledgeController = {
    // 텍스트 지식 추가
    async addTextKnowledge(req, res) {
        try {
            const { mentorId } = req.params;
            const { title, content } = req.body;
            const userId = req.user.id;
            
            // 멘토 소유권 확인
            const mentor = await Mentor.findOne({
                where: { id: mentorId, ownerId: userId }
            });
            
            if (!mentor) {
                return res.status(404).json({
                    success: false,
                    message: '멘토를 찾을 수 없거나 권한이 없습니다.'
                });
            }
            
            const wordCount = content.trim().split(/\s+/).length;
            
            const knowledge = await MentorKnowledge.create({
                mentorId,
                type: 'text',
                title,
                content,
                wordCount,
                status: 'completed'
            });
            
            res.status(201).json({
                success: true,
                message: '텍스트 지식이 성공적으로 추가되었습니다.',
                data: knowledge
            });
        } catch (error) {
            console.error('Error adding text knowledge:', error);
            res.status(500).json({
                success: false,
                message: '텍스트 지식 추가 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    },

    // PDF 지식 추가
    async addPdfKnowledge(req, res) {
        try {
            const { mentorId } = req.params;
            const { title } = req.body;
            const userId = req.user.id;
            
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'PDF 파일이 필요합니다.'
                });
            }
            
            // 멘토 소유권 확인
            const mentor = await Mentor.findOne({
                where: { id: mentorId, ownerId: userId }
            });
            
            if (!mentor) {
                return res.status(404).json({
                    success: false,
                    message: '멘토를 찾을 수 없거나 권한이 없습니다.'
                });
            }
            
            // 지식 레코드 생성 (처리 중 상태)
            const knowledge = await MentorKnowledge.create({
                mentorId,
                type: 'pdf',
                title: title || req.file.originalname,
                content: '',
                filePath: req.file.path,
                status: 'processing',
                metadata: {
                    filename: req.file.originalname,
                    size: req.file.size
                }
            });
            
            // PDF 파싱 (비동기)
            setTimeout(async () => {
                try {
                    const dataBuffer = await fs.readFile(req.file.path);
                    const data = await pdfParse(dataBuffer);
                    
                    const wordCount = data.text.trim().split(/\s+/).length;
                    
                    await knowledge.update({
                        content: data.text,
                        wordCount,
                        status: 'completed',
                        metadata: {
                            ...knowledge.metadata,
                            pages: data.numpages,
                            info: data.info
                        }
                    });
                } catch (error) {
                    console.error('PDF parsing error:', error);
                    await knowledge.update({
                        status: 'failed',
                        processingLog: error.message
                    });
                }
            }, 100);
            
            res.status(201).json({
                success: true,
                message: 'PDF 파일이 업로드되었습니다. 처리가 완료되면 알림을 받으실 수 있습니다.',
                data: knowledge
            });
        } catch (error) {
            console.error('Error adding PDF knowledge:', error);
            res.status(500).json({
                success: false,
                message: 'PDF 지식 추가 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    },

    // 유튜브 지식 추가
    async addYoutubeKnowledge(req, res) {
        try {
            const { mentorId } = req.params;
            const { title, url } = req.body;
            const userId = req.user.id;
            
            // 멘토 소유권 확인
            const mentor = await Mentor.findOne({
                where: { id: mentorId, ownerId: userId }
            });
            
            if (!mentor) {
                return res.status(404).json({
                    success: false,
                    message: '멘토를 찾을 수 없거나 권한이 없습니다.'
                });
            }
            
            // 유튜브 URL 검증
            const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
            const match = url.match(youtubeRegex);
            
            if (!match) {
                return res.status(400).json({
                    success: false,
                    message: '유효한 유튜브 URL을 입력해주세요.'
                });
            }
            
            const videoId = match[1];
            
            // 지식 레코드 생성 (처리 중 상태)
            const knowledge = await MentorKnowledge.create({
                mentorId,
                type: 'youtube',
                title: title || '유튜브 영상',
                content: '',
                sourceUrl: url,
                status: 'processing',
                metadata: {
                    videoId: videoId
                }
            });
            
            // 유튜브 트랜스크립트 추출 시뮬레이션 (실제로는 youtube-transcript-api 사용)
            setTimeout(async () => {
                try {
                    // 실제 구현에서는 youtube-transcript-api 사용
                    const simulatedTranscript = `유튜브 영상 "${title}"의 내용입니다. 
                    이 영상에서는 다양한 주제를 다루고 있으며, 
                    실제 구현에서는 youtube-transcript-api를 사용하여 
                    자동으로 트랜스크립트를 추출합니다.`;
                    
                    const wordCount = simulatedTranscript.trim().split(/\s+/).length;
                    
                    await knowledge.update({
                        content: simulatedTranscript,
                        wordCount,
                        status: 'completed',
                        metadata: {
                            ...knowledge.metadata,
                            extractedAt: new Date()
                        }
                    });
                } catch (error) {
                    console.error('YouTube transcript extraction error:', error);
                    await knowledge.update({
                        status: 'failed',
                        processingLog: error.message
                    });
                }
            }, 100);
            
            res.status(201).json({
                success: true,
                message: '유튜브 영상 분석이 시작되었습니다. 처리가 완료되면 알림을 받으실 수 있습니다.',
                data: knowledge
            });
        } catch (error) {
            console.error('Error adding YouTube knowledge:', error);
            res.status(500).json({
                success: false,
                message: '유튜브 지식 추가 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    },

    // 웹사이트 지식 추가
    async addWebsiteKnowledge(req, res) {
        try {
            const { mentorId } = req.params;
            const { title, url } = req.body;
            const userId = req.user.id;
            
            // 멘토 소유권 확인
            const mentor = await Mentor.findOne({
                where: { id: mentorId, ownerId: userId }
            });
            
            if (!mentor) {
                return res.status(404).json({
                    success: false,
                    message: '멘토를 찾을 수 없거나 권한이 없습니다.'
                });
            }
            
            // 지식 레코드 생성 (처리 중 상태)
            const knowledge = await MentorKnowledge.create({
                mentorId,
                type: 'website',
                title: title || url,
                content: '',
                sourceUrl: url,
                status: 'processing'
            });
            
            // 웹사이트 스크래핑 (비동기)
            setTimeout(async () => {
                try {
                    const response = await axios.get(url, {
                        timeout: 10000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });
                    
                    const $ = cheerio.load(response.data);
                    
                    // 불필요한 요소 제거
                    $('script, style, nav, header, footer, .ad, .advertisement').remove();
                    
                    // 텍스트 추출
                    const extractedText = $('body').text()
                        .replace(/\s+/g, ' ')
                        .trim();
                    
                    const wordCount = extractedText.split(/\s+/).length;
                    
                    await knowledge.update({
                        content: extractedText,
                        wordCount,
                        status: 'completed',
                        metadata: {
                            extractedAt: new Date(),
                            title: $('title').text() || '',
                            description: $('meta[name="description"]').attr('content') || ''
                        }
                    });
                } catch (error) {
                    console.error('Website scraping error:', error);
                    await knowledge.update({
                        status: 'failed',
                        processingLog: error.message
                    });
                }
            }, 100);
            
            res.status(201).json({
                success: true,
                message: '웹사이트 분석이 시작되었습니다. 처리가 완료되면 알림을 받으실 수 있습니다.',
                data: knowledge
            });
        } catch (error) {
            console.error('Error adding website knowledge:', error);
            res.status(500).json({
                success: false,
                message: '웹사이트 지식 추가 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    },

    // 멘토 지식 목록 조회
    async getKnowledge(req, res) {
        try {
            const { mentorId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const userId = req.user.id;
            
            // 멘토 접근 권한 확인
            const mentor = await Mentor.findOne({
                where: {
                    id: mentorId,
                    [require('sequelize').Op.or]: [
                        { ownerId: userId },
                        { isPublic: true }
                    ]
                }
            });
            
            if (!mentor) {
                return res.status(404).json({
                    success: false,
                    message: '멘토를 찾을 수 없거나 권한이 없습니다.'
                });
            }
            
            const offset = (page - 1) * limit;
            
            const knowledge = await MentorKnowledge.findAndCountAll({
                where: { mentorId },
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: offset,
                attributes: ['id', 'type', 'title', 'status', 'wordCount', 'createdAt', 'updatedAt']
            });
            
            res.json({
                success: true,
                data: {
                    knowledge: knowledge.rows,
                    pagination: {
                        total: knowledge.count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(knowledge.count / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching knowledge:', error);
            res.status(500).json({
                success: false,
                message: '지식 목록을 가져오는 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    },

    // 지식 삭제
    async deleteKnowledge(req, res) {
        try {
            const { mentorId, knowledgeId } = req.params;
            const userId = req.user.id;
            
            // 멘토 소유권 확인
            const mentor = await Mentor.findOne({
                where: { id: mentorId, ownerId: userId }
            });
            
            if (!mentor) {
                return res.status(404).json({
                    success: false,
                    message: '멘토를 찾을 수 없거나 권한이 없습니다.'
                });
            }
            
            const knowledge = await MentorKnowledge.findOne({
                where: { id: knowledgeId, mentorId }
            });
            
            if (!knowledge) {
                return res.status(404).json({
                    success: false,
                    message: '지식을 찾을 수 없습니다.'
                });
            }
            
            // 파일이 있다면 삭제
            if (knowledge.filePath) {
                try {
                    await fs.unlink(knowledge.filePath);
                } catch (error) {
                    console.error('Error deleting file:', error);
                }
            }
            
            await knowledge.destroy();
            
            res.json({
                success: true,
                message: '지식이 성공적으로 삭제되었습니다.'
            });
        } catch (error) {
            console.error('Error deleting knowledge:', error);
            res.status(500).json({
                success: false,
                message: '지식 삭제 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }
};

module.exports = knowledgeController;
