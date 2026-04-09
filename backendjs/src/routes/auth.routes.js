/**
 * Authentication Routes
 * Handles user registration, login, and session management
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const dbService = require('../services/database.service');
const { authenticateApiKey } = require('../middleware/apiKeyAuth');

// Simple hash function (for demo - use bcrypt in production)
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Simple session store (Deprecated - now using dbService for persistent sessions)
// const sessions = new Map();

// CAPTCHA store (token -> { answer, expiresAt })
const captchaStore = new Map();

// Generate session token
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const parseApiKeyFromAuthorization = (authorization) => {
    if (!authorization || typeof authorization !== 'string') return null;
    const match = authorization.match(/^ApiKey\s+(.+)$/i);
    return match ? match[1].trim() : null;
};

const generateUserApiKey = (username) => {
    return `${username}_${crypto.randomBytes(32).toString('base64url')}`;
};

// Generate CAPTCHA challenge
const generateCaptcha = () => {
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * 2)]; // Only + and - for simplicity
    let num1, num2, answer;

    if (operator === '+') {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 + num2;
    } else {
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 - num2;
    }

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    captchaStore.set(token, { answer, expiresAt });

    // Clean up expired captchas
    for (const [key, value] of captchaStore.entries()) {
        if (value.expiresAt < Date.now()) {
            captchaStore.delete(key);
        }
    }

    return {
        token,
        question: `${num1} ${operator} ${num2} = ?`,
        num1,
        num2,
        operator
    };
};

// Verify CAPTCHA
const verifyCaptcha = (token, userAnswer) => {
    const captcha = captchaStore.get(token);

    if (!captcha) {
        return { valid: false, error: 'Mã xác thực không hợp lệ hoặc đã hết hạn' };
    }

    if (captcha.expiresAt < Date.now()) {
        captchaStore.delete(token);
        return { valid: false, error: 'Mã xác thực đã hết hạn, vui lòng thử lại' };
    }

    const isValid = parseInt(userAnswer) === captcha.answer;
    captchaStore.delete(token); // One-time use

    if (!isValid) {
        return { valid: false, error: 'Đáp án không đúng, vui lòng thử lại' };
    }

    return { valid: true };
};

// GET /api/auth/captcha - Get new CAPTCHA challenge
router.get('/captcha', (req, res) => {
    const captcha = generateCaptcha();
    res.json({
        token: captcha.token,
        question: captcha.question
    });
});

// Middleware to check authentication
const authMiddleware = async (req, res, next) => {
    if (/^ApiKey\s+/i.test(req.headers.authorization || '')) {
        return authenticateApiKey(req, res, next);
    }

    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    try {
        const session = await dbService.getSession(token);
        if (!session) {
            return res.status(401).json({ error: 'Phiên đăng nhập hết hạn' });
        }

        const user = await dbService.getUserById(session.user_id);
        if (!user) {
            await dbService.deleteSession(token);
            return res.status(401).json({ error: 'Người dùng không tồn tại' });
        }
        if (user.status && user.status !== 'active') {
            await dbService.deleteSession(token);
            return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
        }

        req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            credits: user.credits,
            is_admin: user.is_admin,
            status: user.status
        };
        req.token = token;
        next();
    } catch (error) {
        console.error('[AUTH] Middleware error:', error);
        return res.status(500).json({ error: 'Lỗi xác thực hệ thống' });
    }
};

const authOrApiKeyMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    if (/^ApiKey\s+/i.test(authHeader)) {
        return authenticateApiKey(req, res, next);
    }
    return authMiddleware(req, res, next);
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    console.log('--- REGISTER REQUEST ---');
    console.log('[AUTH] Register attempt for:', req.body?.email || 'unknown');
    try {
        const { email, password, name, username, inviteCode } = req.body;

        const registerKey = process.env.API_KEY_REGISTER;
        const headerApiKey = parseApiKeyFromAuthorization(req.headers.authorization);
        const providedApiKey = headerApiKey || inviteCode;
        if (!registerKey) {
            return res.status(500).json({ error: 'API_KEY_REGISTER chưa được cấu hình' });
        }
        if (!providedApiKey || providedApiKey !== registerKey) {
            return res.status(403).json({ error: 'API key đăng ký không hợp lệ' });
        }

        if (!email || !password || !username) {
            console.warn('[AUTH] Register failed: Missing email/password/username');
            return res.status(400).json({ error: 'Email, username và mật khẩu là bắt buộc' });
        }

        if (password.length < 6) {
            console.warn('[AUTH] Register failed: Password too short');
            return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.warn('[AUTH] Register failed: Invalid email format');
            return res.status(400).json({ error: 'Email không đúng định dạng' });
        }
        const usernameRegex = /^[A-Za-z0-9]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ error: 'Username chỉ được chứa chữ và số (A-Z, a-z, 0-9)' });
        }

        const passwordHash = hashPassword(password);
        console.log(`[AUTH] Creating user: ${email.toLowerCase().trim()}`);

        const normalizedUsername = username.trim();
        const userId = await dbService.createUser(email.toLowerCase().trim(), passwordHash, name || '', normalizedUsername, 'active');
        console.log(`[AUTH] User created with ID: ${userId}`);

        const plainApiKey = generateUserApiKey(normalizedUsername);
        const apiKeyHash = hashPassword(plainApiKey);
        const keyPrefix = plainApiKey.slice(0, 16);
        await dbService.createUserApiKey(userId, keyPrefix, apiKeyHash, 'default');

        // Auto login after registration
        const user = await dbService.getUserById(userId);
        console.log(`[AUTH] getUserById result:`, user);

        if (!user) {
            console.error(`[AUTH] CRITICAL: getUserById returned null for userId ${userId}`);
            // Fallback: create user object manually
            const fallbackUser = {
                id: userId,
                email: email.toLowerCase().trim(),
                username: normalizedUsername,
                name: name || '',
                credits: 100,
                is_admin: 0,
                status: 'active'
            };
            const token = generateToken();
            await dbService.createSession(token, fallbackUser);
            console.log(`[AUTH] Register success (fallback): ${email} -> User ID ${userId}`);
            return res.json({
                message: 'Đăng ký thành công! Bạn nhận được 100 Linh Thạch',
                token,
                user: fallbackUser,
                apiKey: plainApiKey
            });
        }

        const token = generateToken();
        const userData = { id: user.id, email: user.email, username: user.username, name: user.name, credits: user.credits, is_admin: user.is_admin, status: user.status };
        await dbService.createSession(token, userData);

        await dbService.updateLastLogin(userId);

        console.log(`[AUTH] Register success: ${email} -> User ID ${userId}`);

        res.json({
            message: 'Đăng ký thành công! Bạn nhận được 100 Linh Thạch',
            token,
            user: { id: user.id, email: user.email, username: user.username, name: user.name, credits: user.credits, is_admin: user.is_admin, status: user.status },
            apiKey: plainApiKey
        });
    } catch (error) {
        console.error('[AUTH] Register error:', error.message);
        res.status(400).json({ error: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    console.log('--- LOGIN REQUEST ---');
    console.log('[AUTH] Login attempt for:', req.body?.identifier || req.body?.email || 'unknown');
    try {
        const { identifier, email, password } = req.body;
        const loginId = String(identifier || email || '').trim();

        if (!loginId || !password) {
            console.warn('[AUTH] Missing identifier or password');
            return res.status(400).json({ error: 'Email/username và mật khẩu là bắt buộc' });
        }

        const normalizedLoginId = loginId.toLowerCase();
        const isEmailLogin = normalizedLoginId.includes('@');
        const user = isEmailLogin
            ? await dbService.getUserByEmail(normalizedLoginId)
            : await dbService.getUserByUsername(loginId);

        if (!user) {
            console.warn(`[AUTH] Login Failed: User NOT FOUND -> "${loginId}"`);
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }
        if (user.status && user.status !== 'active') {
            return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
        }

        const passwordHash = hashPassword(password);
        if (user.password_hash !== passwordHash) {
            console.warn(`[AUTH] Login Failed: PASSWORD MISMATCH for -> "${loginId}"`);
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        console.log(`[AUTH] Login Success: "${loginId}" (is_admin: ${user.is_admin})`);
        const token = generateToken();
        const userData = { id: user.id, email: user.email, username: user.username, name: user.name, credits: user.credits, is_admin: user.is_admin, status: user.status };
        await dbService.createSession(token, userData);

        await dbService.updateLastLogin(user.id);

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: { id: user.id, email: user.email, username: user.username, name: user.name, credits: user.credits, is_admin: user.is_admin, status: user.status }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/auth/me - Get current user info
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // Refresh user data from database
        const user = await dbService.getUserById(req.user.id);

        if (!user) {
            await dbService.deleteSession(req.token);
            return res.status(401).json({ error: 'Người dùng không tồn tại' });
        }

        // Update session with fresh credits
        if (user.status && user.status !== 'active') {
            await dbService.deleteSession(req.token);
            return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
        }

        const userData = { id: user.id, email: user.email, username: user.username, name: user.name, credits: user.credits, is_admin: user.is_admin, status: user.status };
        await dbService.createSession(req.token, userData); // Overwrites with fresh data

        let baziData = null;
        try {
            baziData = user.bazi_data ? JSON.parse(user.bazi_data) : null;
        } catch (e) {
            console.error('[AUTH] Failed to parse bazi_data:', e.message);
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                credits: user.credits,
                is_admin: user.is_admin,
                status: user.status,
                bazi_data: baziData
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        await dbService.deleteSession(token);
    }
    res.json({ message: 'Đã đăng xuất' });
});

// GET /api/auth/suggestions - Get latest suggested questions for user
router.get('/suggestions', authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const suggestions = await dbService.getLatestSuggestions(req.user.id, limit);
        res.json({ suggestions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/profile - Update user profile
router.post('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, baziData } = req.body;
        console.log(`[AUTH] Update Profile for ${req.user.id}:`, req.body); // DEBUG LOG

        if (name !== undefined) {
            await dbService.updateUserProfile(req.user.id, { name });
        }

        if (baziData !== undefined) {
            await dbService.updateUserBaziData(req.user.id, baziData);
        }

        const freshUser = await dbService.getUserById(req.user.id);

        res.json({
            message: 'Cập nhật thành công',
            user: {
                ...freshUser,
                bazi_data: freshUser.bazi_data ? JSON.parse(freshUser.bazi_data) : null
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /api/auth/request-credits - User requests more credits
router.post('/request-credits', authMiddleware, async (req, res) => {
    try {
        const amount = 50; // Fixed amount per request
        const requestId = await dbService.createCreditRequest(req.user.id, amount);
        res.json({
            message: 'Yêu cầu đã được gửi, vui lòng chờ Admin phê duyệt',
            requestId
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /api/auth/pending-request - Check if user has pending request
router.get('/pending-request', authMiddleware, async (req, res) => {
    try {
        const pending = await dbService.getUserPendingRequest(req.user.id);
        res.json({ hasPending: !!pending, request: pending });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Quyền truy cập bị từ chối. Yêu cầu quyền Admin.' });
    }
    next();
};

// Export middleware for use in other routes
router.authMiddleware = authMiddleware;
router.apiKeyMiddleware = authenticateApiKey;
router.authOrApiKeyMiddleware = authOrApiKeyMiddleware;
router.adminMiddleware = adminMiddleware;
// router.sessions = sessions; // Removed for DB sessions

module.exports = router;
