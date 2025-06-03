const { Mentor, MentorKnowledge, MentorConversation, User } = require('../models');
const { Op } = require('sequelize');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const chatController = {
    // 새 대화 시작
    async startConversation(req, res) {
        try {
            const { mentorId } = req.params;
            const userId = req.user.id;
            
            // 멘토 접근 권한 확인
            const mentor = await Mentor.findOne({
                where: {
                    id: mentorId,
                    [Op.or]: [
                        { ownerId: userId },
                        { isPublic: true }
                    ]
                },
                include: [
                    {
                        model: MentorKnowledge,
                        as: 'knowledge',
                        where: { status: 'completed' },
                        required: false
                    }
                ]
            });
            
            if (!mentor) {
                return res.status(404).json({
                    success: false,
                    message: '멘토를 찾을 수 없거나 권한이 없습니다.'
                });
            }
            
            // 세션 ID 생성
            const sessionId = `${mentorId}_${userId}_${Date.now()}`;
            
            // 대화 생성
            const conversation = await MentorConversation.create({
                mentorId,
                userId,
                sessionId,
                messages: [],
                status: 'active'
            });
            
            // 멘토 사용 횟수 증가
            await mentor.increment('usageCount');
            await mentor.update({ lastUsedAt: new Date() });
            
            res.status(201).json({
                success: true,
                message: '새 대화가 시작되었습니다.',
                data: {
                    conversation,
                    mentor: {
                        id: mentor.id,
                        name: mentor.name,
                        description: mentor.description,
                        expertise: mentor.expertise,
                        personality: mentor.personality,
                        knowledgeCount: mentor.knowledge.length
                    }
                }
            });
        } catch (error) {
            console.error('Error starting conversation:', error);
            res.status(500).json({
                success: false,
                message: '대화 시작 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    },

    // 메시지 전송
    async sendMessage(req, res) {
        try {
            const { mentorId } = req.params;
            const { sessionId, message } = req.body;
            const userId = req.user.id;
            
            // 대화 확인
            const conversation = await MentorConversation.findOne({
                where: { sessionId, userId, mentorId },
                include: [
                    {
                        model: Mentor,
                        as: 'mentor',
                        include: [
                            {
                                model: MentorKnowledge,
                                as: 'knowledge',
                                where: { status: 'completed' },
                                required: false
                            }
                        ]
                    }
                ]
            });
            
            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: '대화를 찾을 수 없습니다.'
                });
            }
            
            const mentor = conversation.mentor;
            
            // 사용자 메시지 추가
            const userMessage = {
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            };
            
            const messages = [...conversation.messages, userMessage];
            
            // 멘토의 배경 지식 컨텍스트 구성
            let knowledgeContext = '';
            if (mentor.knowledge && mentor.knowledge.length > 0) {
                const knowledgeTexts = mentor.knowledge
                    .map(k => `[${k.title}]\n${k.content}`)
                    .join('\n\n');
                
                knowledgeContext = `
다음은 당신(${mentor.name})의 전문 지식과 배경 정보입니다:

${knowledgeTexts}

위 정보를 바탕으로 답변해주세요.
`;
            }
            
            // 멘토 성격 설정
            const personality = mentor.personality || {};
            const personalityPrompt = `
당신은 "${mentor.name}"라는 이름의 AI 멘토입니다.
전문 분야: ${mentor.expertise || '다양한 분야'}
성격 특성: ${personality.tone || 'friendly'} 톤, ${personality.style || 'professional'} 스타일

${mentor.description ? `멘토 소개: ${mentor.description}` : ''}

${knowledgeContext}

사용자의 질문에 대해 당신의 전문 지식과 성격을 바탕으로 도움이 되는 답변을 제공해주세요.
답변은 친근하면서도 전문적이어야 하며, 구체적인 조언이나 정보를 포함해야 합니다.
`;
            
            // Claude API 호출
            const response = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1000,
                system: personalityPrompt,
                messages: [
                    ...messages.slice(-10).map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content: msg.content
                    }))
                ]
            });
            
            const assistantMessage = {
                role: 'assistant',
                content: response.content[0].text,
                timestamp: new Date().toISOString()
            };
            
            const updatedMessages = [...messages, assistantMessage];
            
            // 대화 업데이트
            await conversation.update({
                messages: updatedMessages,
                messageCount: updatedMessages.length,
                lastMessageAt: new Date(),
                title: conversation.title || message.substring(0, 50) + (message.length > 50 ? '...' : '')
            });
            
            res.json({
                success: true,
                data: {
                    message: assistantMessage,
                    conversation: {
                        sessionId: conversation.sessionId,
                        messageCount: updatedMessages.length
                    }
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({
                success: false,
                message: '메시지 전송 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    },

    // 대화 이력 조회
    async getConversations(req, res) {
        try {
            const { mentorId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const userId = req.user.id;
            
            const offset = (page - 1) * limit;
            
            const conversations = await MentorConversation.findAndCountAll({
                where: { mentorId, userId },
                include: [
                    {
                        model: Mentor,
                        as: 'mentor',
                        attributes: ['id', 'name', 'avatar']
                    }
                ],
                order: [['lastMessageAt', 'DESC']],
                limit: parseInt(limit),
                offset: offset,
                attributes: ['id', 'sessionId', 'title', 'messageCount', 'status', 'lastMessageAt', 'createdAt']
            });
            
            res.json({
                success: true,
                data: {
                    conversations: conversations.rows,
                    pagination: {
                        total: conversations.count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(conversations.count / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching conversations:', error);
            res.status(500).json({
                success: false,
                message: '대화 이력을 가져오는 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    },

    // 특정 대화 상세 조회
    async getConversation(req, res) {
        try {
            const { sessionId } = req.params;
            const userId = req.user.id;
            
            const conversation = await MentorConversation.findOne({
                where: { sessionId, userId },
                include: [
                    {
                        model: Mentor,
                        as: 'mentor',
                        attributes: ['id', 'name', 'avatar', 'personality']
                    }
                ]
            });
            
            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: '대화를 찾을 수 없습니다.'
                });
            }
            
            res.json({
                success: true,
                data: conversation
            });
        } catch (error) {
            console.error('Error fetching conversation:', error);
            res.status(500).json({
                success: false,
                message: '대화 정보를 가져오는 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    },

    // 대화 평가
    async rateConversation(req, res) {
        try {
            const { sessionId } = req.params;
            const { rating, feedback } = req.body;
            const userId = req.user.id;
            
            const conversation = await MentorConversation.findOne({
                where: { sessionId, userId }
            });
            
            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: '대화를 찾을 수 없습니다.'
                });
            }
            
            await conversation.update({
                rating,
                feedback,
                status: 'completed'
            });
            
            res.json({
                success: true,
                message: '대화 평가가 완료되었습니다.'
            });
        } catch (error) {
            console.error('Error rating conversation:', error);
            res.status(500).json({
                success: false,
                message: '대화 평가 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }
};

module.exports = chatController;
