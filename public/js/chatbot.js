// PBT LMS Chatbot JavaScript

class PBTChatbot {
    constructor() {
        this.isOpen = false;
        this.conversation = [];
        this.isTyping = false;
        this.quickActions = [
            '로그인 방법',
            '과정 수강 신청',
            '프로젝트 수행 방법',
            '과제 제출 방법',
            '학습 진도 확인',
            '토론 게시판 사용법'
        ];
        
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.bindEvents();
        this.showWelcomeMessage();
    }

    createChatbotHTML() {
        // 챗봇 토글 버튼 생성
        const toggleButton = document.createElement('button');
        toggleButton.id = 'chatbot-toggle';
        toggleButton.innerHTML = '💬';
        toggleButton.title = 'PBT LMS 도움말';
        
        // 챗봇 컨테이너 생성
        const container = document.createElement('div');
        container.id = 'chatbot-container';
        container.innerHTML = `
            <div class="chatbot-header">
                <div>
                    <h3>PBT LMS 도우미</h3>
                    <div class="chatbot-status">
                        <span class="status-dot"></span>
                        온라인
                    </div>
                </div>
            </div>
            <div class="chatbot-messages" id="chatbot-messages">
                <div class="welcome-message">
                    <div class="icon">🤖</div>
                    <div>
                        안녕하세요! PBT LMS 도우미입니다.<br>
                        학습과 관련된 궁금한 점을 언제든지 물어보세요!
                    </div>
                    <div class="quick-actions" id="quick-actions">
                        ${this.quickActions.map(action => 
                            `<button class="quick-action-btn" onclick="pbtChatbot.sendQuickAction('${action}')">${action}</button>`
                        ).join('')}
                    </div>
                </div>
            </div>
            <div class="chatbot-input">
                <input type="text" id="chatbot-input" placeholder="메시지를 입력하세요..." maxlength="500">
                <button id="chatbot-send" title="전송">
                    <span>📤</span>
                </button>
            </div>
        `;

        // DOM에 추가
        document.body.appendChild(toggleButton);
        document.body.appendChild(container);
    }

    bindEvents() {
        const toggleButton = document.getElementById('chatbot-toggle');
        const sendButton = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');

        toggleButton.addEventListener('click', () => this.toggle());
        sendButton.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // ESC 키로 챗봇 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.toggle();
            }
        });
    }

    toggle() {
        const container = document.getElementById('chatbot-container');
        const toggleButton = document.getElementById('chatbot-toggle');
        
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            container.classList.add('show');
            toggleButton.classList.add('chat-open');
            toggleButton.innerHTML = '✖️';
            toggleButton.title = '채팅창 닫기';
            
            // 입력창에 포커스
            setTimeout(() => {
                document.getElementById('chatbot-input').focus();
            }, 300);
        } else {
            container.classList.remove('show');
            toggleButton.classList.remove('chat-open');
            toggleButton.innerHTML = '💬';
            toggleButton.title = 'PBT LMS 도움말';
        }
    }

    showWelcomeMessage() {
        // 초기 환영 메시지는 HTML에서 직접 표시되므로 별도 처리 불필요
    }

    sendQuickAction(action) {
        this.sendMessage(action);
    }

    async sendMessage(text = null) {
        const input = document.getElementById('chatbot-input');
        const message = text || input.value.trim();
        
        if (!message || this.isTyping) return;

        // 사용자 메시지 표시
        this.addMessage(message, 'user');
        
        // 입력창 초기화
        if (!text) {
            input.value = '';
        }

        // 빠른 액션 버튼 숨기기
        const quickActions = document.getElementById('quick-actions');
        if (quickActions && quickActions.parentElement.classList.contains('welcome-message')) {
            quickActions.parentElement.style.display = 'none';
        }

        // 타이핑 인디케이터 표시
        this.showTypingIndicator();

        try {
            // API 호출
            const response = await fetch('/api/chatbot/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversation: this.conversation.slice(-10) // 최근 10개 메시지만 전송
                })
            });

            const data = await response.json();

            if (data.success) {
                // 대화 기록에 추가
                this.conversation.push(
                    { role: 'user', content: message },
                    { role: 'assistant', content: data.message }
                );

                // 봇 응답 표시
                setTimeout(() => {
                    this.hideTypingIndicator();
                    this.addMessage(data.message, 'bot');
                }, 1000); // 1초 후 응답 (자연스러운 느낌)
            } else {
                throw new Error(data.message || '응답을 받을 수 없습니다.');
            }
        } catch (error) {
            console.error('Chatbot Error:', error);
            this.hideTypingIndicator();
            this.addMessage(
                '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 🔧', 
                'bot'
            );
        }
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = sender === 'user' ? '👤' : '🤖';
        const userName = sender === 'user' ? '나' : 'LMS 도우미';
        
        messageDiv.innerHTML = `
            <div class="message-avatar" title="${userName}">${avatar}</div>
            <div class="message-content">${this.formatMessage(content)}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(content) {
        // 기본적인 텍스트 포맷팅
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
            .replace(/\/([a-zA-Z0-9\-\.]+\.html)/g, '<a href="$1" target="_blank">$1</a>');
    }

    showTypingIndicator() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chatbot-messages');
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'message bot';
        typingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // 페이지별 컨텍스트 제공
    getPageContext() {
        const path = window.location.pathname;
        const contexts = {
            '/': '메인 페이지',
            '/login.html': '로그인 페이지',
            '/register.html': '회원가입 페이지',
            '/dashboard.html': '대시보드',
            '/courses.html': '내 과정 페이지',
            '/browse-courses.html': '과정 둘러보기 페이지',
            '/problems.html': '프로젝트 목록 페이지',
            '/assignments.html': '과제 목록 페이지',
            '/discussions.html': '토론 게시판',
            '/profile.html': '프로필 설정 페이지'
        };
        
        return contexts[path] || '알 수 없는 페이지';
    }
}

// 페이지 로드 후 챗봇 초기화
document.addEventListener('DOMContentLoaded', () => {
    // CSS 파일 동적 로드
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/styles/chatbot.css';
    document.head.appendChild(link);
    
    // 챗봇 초기화
    window.pbtChatbot = new PBTChatbot();
});

// 전역 함수로 내보내기 (빠른 액션 버튼용)
window.sendQuickAction = (action) => {
    if (window.pbtChatbot) {
        window.pbtChatbot.sendQuickAction(action);
    }
};
