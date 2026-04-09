require('dotenv').config();
process.env.TZ = 'Asia/Ho_Chi_Minh';
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const rateLimitCfg = require('./src/config/rateLimit.env');

const baziRoutes = require('./src/routes/bazi.routes');
const consultantRoutes = require('./src/routes/consultant.routes');
const adminRoutes = require('./src/routes/admin.routes');
const authRoutes = require('./src/routes/auth.routes');
const usersRoutes = require('./src/routes/users.routes');
const articlesRoutes = require('./src/routes/articles.routes');
const queRoutes = require('./src/routes/que.routes');
const { routePermissionsMiddleware } = require('./src/middleware/routePermissions');
// const dailyRoutes = require('./src/routes/daily.routes');
const dbService = require('./src/services/database.service');

const staticDir = path.join(__dirname, 'public');
const serveSpa = fs.existsSync(staticDir);

const parseTrustProxy = () => {
    const v = String(process.env.TRUST_PROXY || '').trim().toLowerCase();
    if (['1', 'true', 'yes'].includes(v)) return 1;
    return false;
};

const app = express();
const PORT = process.env.PORT || 8888;
// Rate limiting (numeric limits from env via src/config/rateLimit.env.js)
const generalLimiter = rateLimit({
    windowMs: rateLimitCfg.generalWindowMs,
    max: rateLimitCfg.generalMax,
    message: { error: 'Quá nhiều request, vui lòng thử lại sau 15 phút' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: rateLimitCfg.authWindowMs,
    max: rateLimitCfg.authMax,
    message: { error: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '5mb' })); // Increased limit for large chart data
app.use(generalLimiter); // Apply general rate limit to all routes

app.set('trust proxy', parseTrustProxy());
// Trust proxy for real IP behind Nginx/Cloudflare
app.set('trust proxy', false);

const skipAccessDbLog = (rawUrl) => {
    const pathOnly = (rawUrl || '').split('?')[0];
    if (pathOnly === '/api/docs' || pathOnly === '/api/health' || pathOnly.startsWith('/assets')) return true;
    if (serveSpa && pathOnly === '/') return true;
    if (!pathOnly.startsWith('/api') && /^\/[^/]+\.[a-z0-9]+$/i.test(pathOnly)) return true;
    return false;
};

// Access logging middleware
app.use((req, res, next) => {
    const startTime = Date.now();

    // Extract real IP (handles X-Forwarded-For from reverse proxy)
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.headers['x-real-ip']
        || req.ip
        || req.socket?.remoteAddress
        || 'unknown';

    // Console log for dev
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${ip}`);

    // Hook into response finish to capture status code + response time
    res.on('finish', () => {
        if (skipAccessDbLog(req.url)) return;

        const responseTime = Date.now() - startTime;
        dbService.saveAccessLog({
            ip,
            method: req.method,
            path: req.url,
            statusCode: res.statusCode,
            userAgent: req.headers['user-agent'] || '',
            userId: req.user?.id || null,
            userEmail: req.user?.email || null,
            responseTime
        });
    });

    next();
});

// Routes
app.use('/api', routePermissionsMiddleware());

app.use('/api', baziRoutes);
app.use('/api/consultant', consultantRoutes);  // Removed global aiLimiter, will apply per-route
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authLimiter, authRoutes);  // Strict auth rate limit
app.use('/api/users', usersRoutes);
app.use('/api/articles', articlesRoutes);  // Articles routes
app.use('/api/que', queRoutes);
// app.use('/api/daily', dailyRoutes);

const apiMetaJson = () => ({
    name: 'VietLac BaZi API',
    version: '2.1',
    status: 'running',
    docs: '/api/docs'
});

app.get('/api/health', (req, res) => {
    res.json(apiMetaJson());
});

// API Documentation
app.get('/api/docs', (req, res) => {
    res.json({
        endpoints: [
            { method: 'GET', path: '/api/analyze', description: 'Full BaZi analysis' },
            { method: 'GET', path: '/api/chart', description: 'Basic chart info' },
            { method: 'GET', path: '/api/elements', description: 'Ngũ hành analysis' },
            { method: 'GET', path: '/api/stars', description: 'Thần sát analysis' },
            { method: 'GET', path: '/api/luck-cycles', description: 'Đại vận analysis' },
            { method: 'GET', path: '/api/year-analysis', description: 'Lưu niên analysis' },
            { method: 'GET', path: '/api/auspicious-dates', description: 'Ngày tốt xấu' },
            { method: 'POST', path: '/api/consultant/ask', description: 'AI Consultant Q&A' },
            { method: 'GET', path: '/api/consultant/stats', description: 'Thống kê tư vấn' },
            { method: 'GET', path: '/api/consultant/customers', description: 'Danh sách khách hàng' },
            { method: 'GET', path: '/api/consultant/history/:id', description: 'Lịch sử tư vấn khách hàng' },
        ],
        parameters: {
            year: 'number (required)',
            month: 'number (required)',
            day: 'number (required)',
            hour: 'number (default: 12)',
            minute: 'number (default: 0)',
            gender: 'string: "Nam" | "Nữ" (default: "Nam")',
            calendar: 'string: "solar" | "lunar" (default: "solar")'
        }
    });
});

if (serveSpa) {
    app.use(express.static(staticDir, { index: 'index.html', maxAge: '1h' }));
    app.get('*', (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(staticDir, 'index.html'), (err) => (err ? next(err) : undefined));
    });
} else {
    app.get('/', (req, res) => {
        res.json(apiMetaJson());
    });
}

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[SHUTDOWN] Closing database connection...');
    dbService.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n[SHUTDOWN] Closing database connection...');
    dbService.close();
    process.exit(0);
});

process.once('SIGUSR2', () => {
    console.log('\n[RESTART] Closing database connection before nodemon restart...');
    dbService.close();
    // Allow a small delay for OS to sync file
    setTimeout(() => {
        process.kill(process.pid, 'SIGUSR2');
    }, 100);
});

// Initialize database and start server
(async () => {
    try {
        await dbService.init();
        console.log('[STARTUP] Database initialized successfully.');

        app.listen(PORT, () => {
            console.log(`🚀 VietLac BaZi API running on port ${PORT}`);
            if (serveSpa) console.log(`🌐 SPA static: ${staticDir}`);
            console.log(`📚 API Docs (local): http://localhost:${PORT}/api/docs`);
            console.log(`💾 SQLite Database: data/bazi_consultant.db`);

            // Auto-cleanup old access logs (>30 days)
            dbService.cleanOldAccessLogs(30).catch(() => { });
        });
    } catch (error) {
        console.error('[STARTUP] Critical Error: Failed to initialize database:', error.message);
        process.exit(1);
    }
})();

module.exports = app;

