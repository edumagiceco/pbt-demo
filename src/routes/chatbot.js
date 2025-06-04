const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const router = express.Router();

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// PBT LMS 관련 지식 베이스
const LMS_KNOWLEDGE_BASE = {
    system: {
        role: "당신은 PBT(Project-Based Training) LMS 시스템의 운영 도우미입니다. 학습자, 강사, 관리자에게 도움을 제공합니다.",
        context: `
PBT LMS는 프로젝트 중심의 학습 관리 시스템입니다.

주요 기능:
1. 프로젝트 수행 시스템 - 실무 프로젝트를 수행하고 자동 평가를 받을 수 있습니다
2. 과정 관리 - 다양한 프로그래밍 과정을 수강할 수 있습니다
3. 과제 제출 - 과제를 온라인으로 제출하고 피드백을 받을 수 있습니다
4. 토론 게시판 - 학습자들과 소통하고 질문할 수 있습니다
5. 학습 진도 관리 - 개인별 학습 현황을 추적할 수 있습니다
6. 만다라트 시스템 - 목표 설정 및 관리 기능이 있습니다

사용자 유형:
- 학습자: 과정 수강, 프로젝트 수행, 과제 제출
- 강사: 과정 관리, 프로젝트 출제, 학습자 관리
- 관리자: 시스템 전체 관리, 사용자 관리, 통계 확인

주요 URL:
- 로그인: /login.html
- 대시보드: /dashboard.html
- 과정 목록: /courses.html
- 프로젝트 수행: /problems.html
- 토론 게시판: /discussions.html
- 프로필 설정: /profile.html
`
    },
    faqs: [
        {
            question: "로그인은 어떻게 하나요?",
            answer: "메인 페이지 상단의 '로그인' 버튼을 클릭하거나 /login.html 페이지로 이동하여 사용자명과 비밀번호를 입력해주세요."
        },
        {
            question: "새로운 과정은 어떻게 수강하나요?",
            answer: "대시보드에서 '과정 둘러보기' 카드를 클릭하거나 /browse-courses.html 페이지에서 원하는 과정을 찾아 수강신청 버튼을 클릭해주세요."
        },
        {
            question: "프로젝트는 어떻게 수행할 수 있나요?",
            answer: "프로젝트 목록 페이지(/problems.html)에서 프로젝트를 선택하고, 내장된 코드 에디터에서 코드를 작성한 후 실행 및 제출할 수 있습니다. Python, JavaScript, Java, C++ 등을 지원합니다."
        },
        {
            question: "과제 제출은 어떻게 하나요?",
            answer: "과제 목록 페이지(/assignments.html)에서 과제를 선택하고 '제출하기' 버튼을 클릭하여 텍스트나 파일을 업로드할 수 있습니다."
        },
        {
            question: "학습 진도는 어떻게 확인하나요?",
            answer: "대시보드(/dashboard.html)에서 전반적인 진도를 확인하거나, 학습 진도 페이지(/progress.html)에서 상세한 진행 현황을 볼 수 있습니다."
        },
        {
            question: "토론 게시판에서 질문할 수 있나요?",
            answer: "네, 토론 게시판(/discussions.html)에서 새 글 작성 버튼을 클릭하여 질문이나 토론 주제를 올릴 수 있습니다. 카테고리별로 분류도 가능합니다."
        },
        {
            question: "만다라트는 무엇인가요?",
            answer: "만다라트는 목표 설정 및 관리 도구로, 9x9 매트릭스를 통해 핵심 목표와 세부 실행 계획을 체계적으로 관리할 수 있는 기능입니다."
        }
    ]
};

// POST /api/chatbot/message - 챗봇 메시지 처리
router.post('/message', async (req, res) => {
    try {
        const { message, conversation = [] } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                message: '메시지가 제공되지 않았습니다.'
            });
        }

        // 사용자 컨텍스트 구성
        const systemPrompt = `${LMS_KNOWLEDGE_BASE.system.context}

당신의 역할: ${LMS_KNOWLEDGE_BASE.system.role}

주요 FAQ:
${LMS_KNOWLEDGE_BASE.faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

답변 가이드라인:
1. 친근하고 도움이 되는 톤으로 답변해주세요
2. PBT LMS 시스템과 관련된 질문에 집중해주세요
3. 구체적인 URL이나 페이지를 언급할 때는 정확한 경로를 제공해주세요
4. 기술적인 문제는 단계별로 설명해주세요
5. 모르는 내용은 솔직하게 모른다고 하고 관리자에게 문의하도록 안내해주세요

답변은 한국어로 해주세요.`;

        // 이전 대화 내역을 포함한 메시지 구성
        const messages = [
            { role: 'user', content: message }
        ];

        // 이전 대화가 있다면 포함
        if (conversation && conversation.length > 0) {
            messages.unshift(...conversation.slice(-10)); // 최근 10개 메시지만 포함
        }

        // Claude API 호출
        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1024,
            system: systemPrompt,
            messages: messages
        });

        const botResponse = response.content[0].text;

        res.json({
            success: true,
            message: botResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chatbot API Error:', error);
        res.status(500).json({
            success: false,
            message: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/chatbot/health - 챗봇 상태 확인
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'PBT LMS 챗봇이 정상적으로 작동 중입니다. (Claude Haiku 3)',
        timestamp: new Date().toISOString(),
        status: 'online',
        model: 'claude-3-haiku-20240307'
    });
});

module.exports = router;
