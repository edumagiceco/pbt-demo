// PBT LMS Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');

// Import routes
const authRoutes = require('./src/routes/auth');
const instructorAiRoutes = require('./src/routes/instructorAI');
const chatbotRoutes = require('./src/routes/chatbot');
const mandartRoutes = require('./src/routes/mandarts');
// const problemRoutes = require('./src/routes/problems');
// const solutionRoutes = require('./src/routes/solutions');
const userRoutes = require('./src/routes/users');
// const testcaseRoutes = require('./src/routes/testcases');
// const materialRoutes = require('./src/routes/materials');
// const discussionRoutes = require('./src/routes/discussions');
// const courseRoutes = require('./src/routes/courses_test');

// Import database
const db = require('./src/models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://www.youtube.com"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'", "https://www.youtube.com"]
        }
    }
})); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'pbt-lms-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'PBT LMS API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// 강사 AI 라우트
app.use('/api/instructor-ai', instructorAiRoutes);

// 챗봇 라우트
app.use('/api/chatbot', chatbotRoutes);

// 인증 라우트
app.use('/api/auth', authRoutes);

// 사용자 라우트
app.use('/api/users', userRoutes);

// 만다라트 라우트
app.use('/api/mandarts', mandartRoutes);



// Serve React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all handler: send back React's index.html file for non-API routes
// app.get('/*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Auto-create test users function
async function createTestUsers() {
    try {
        const { User } = require('./src/models');
        
        console.log('🔐 자동 테스트 사용자 생성 확인 중...');

        const testUsers = [
            {
                username: 'admin',
                email: 'admin@pbtlms.com',
                password: 'admin123',
                fullName: '관리자',
                userType: 'admin'
            },
            {
                username: 'instructor',
                email: 'instructor@pbtlms.com',
                password: 'instructor123',
                fullName: '김강사',
                userType: 'instructor'
            },
            {
                username: 'student',
                email: 'student@pbtlms.com',
                password: 'student123',
                fullName: '이학생',
                userType: 'student'
            }
        ];

        for (const userData of testUsers) {
            const [user, created] = await User.findOrCreate({
                where: { email: userData.email },
                defaults: userData
            });

            if (created) {
                console.log(`✅ 새 계정 생성: ${userData.email} (${userData.userType})`);
            } else {
                console.log(`🔄 기존 계정 확인: ${userData.email} (${userData.userType})`);
            }
        }

        console.log('🎉 테스트 사용자 확인 완료!');
    } catch (error) {
        console.error('❌ 테스트 사용자 생성 실패:', error.message);
    }
}

// Database connection and server start
db.sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
        
        // 테이블 동기화 (개발 환경에서만)
        if (process.env.NODE_ENV !== 'production') {
            console.log('🔄 데이터베이스 테이블 동기화 중...');
            return db.sequelize.sync({ alter: true });
        }
    })
    .then(() => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('✅ 데이터베이스 테이블 동기화 완료!');
        }
    })
    .then(async () => {
        // 서버 시작 시 자동으로 테스트 사용자 생성
        await createTestUsers();
        
        app.listen(PORT, () => {
            console.log(`PBT LMS Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('📋 사용 가능한 테스트 계정:');
            console.log('- admin@pbtlms.com / admin123 (관리자)');
            console.log('- instructor@pbtlms.com / instructor123 (강사)');
            console.log('- student@pbtlms.com / student123 (학생)');
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
        process.exit(1);
    });

module.exports = app;
