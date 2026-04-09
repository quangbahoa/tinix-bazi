/**
 * Admin API Routes
 * Manages questions, categories, customers
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const dbService = require('../services/database.service');
const { authMiddleware, adminMiddleware } = require('./auth.routes');

const parseApiKeyFromAuthorization = (authorization) => {
    if (!authorization || typeof authorization !== 'string') return null;
    const match = authorization.match(/^ApiKey\s+(.+)$/i);
    return match ? match[1].trim() : null;
};

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

const API_KEY_CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const API_KEY_PART_LENGTH = 36;

const generateApiKeyPart = (length = API_KEY_PART_LENGTH) => {
    let out = '';
    while (out.length < length) {
        const bytes = crypto.randomBytes(64);
        for (const b of bytes) {
            // 248 is highest multiple of 62 under 256, avoids modulo bias
            if (b < 248) out += API_KEY_CHARSET[b % API_KEY_CHARSET.length];
            if (out.length === length) break;
        }
    }
    return out;
};

const generateUserApiKey = (username) => {
    return `${username}_${generateApiKeyPart(API_KEY_PART_LENGTH)}`;
};

const manageKeyMiddleware = (req, res, next) => {
    const manageKey = process.env.API_KEY_MANAGE;
    const apiKey = parseApiKeyFromAuthorization(req.headers.authorization);
    if (manageKey && apiKey && apiKey === manageKey) {
        req.user = { id: 0, email: 'manage-key@system', is_admin: 1, role: 'admin' };
        req.authType = 'manage_key';
    }
    next();
};

// Apply protection to all admin routes:
// - Either API_KEY_MANAGE
// - Or normal admin session
router.use(manageKeyMiddleware);
router.use((req, res, next) => {
    if (req.authType === 'manage_key') return next();
    return authMiddleware(req, res, next);
});
router.use((req, res, next) => {
    if (req.authType === 'manage_key') return next();
    return adminMiddleware(req, res, next);
});

// ========== CATEGORIES ==========

// GET all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await dbService.getAllCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create category
router.post('/categories', async (req, res) => {
    try {
        const id = await dbService.createCategory(req.body);
        res.json({ id, message: 'Category created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update category
router.put('/categories/:id', async (req, res) => {
    try {
        await dbService.updateCategory(parseInt(req.params.id), req.body);
        res.json({ message: 'Category updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE category
router.delete('/categories/:id', async (req, res) => {
    try {
        await dbService.deleteCategory(parseInt(req.params.id));
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== QUESTIONS ==========

// GET all questions
router.get('/questions', async (req, res) => {
    try {
        const categoryId = req.query.category_id ? parseInt(req.query.category_id) : null;
        const questions = await dbService.getAllQuestions(categoryId);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create question
router.post('/questions', async (req, res) => {
    try {
        const id = await dbService.createQuestion(req.body);
        res.json({ id, message: 'Question created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update question
router.put('/questions/:id', async (req, res) => {
    try {
        await dbService.updateQuestion(parseInt(req.params.id), req.body);
        res.json({ message: 'Question updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE question
router.delete('/questions/:id', async (req, res) => {
    try {
        await dbService.deleteQuestion(parseInt(req.params.id));
        res.json({ message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== CUSTOMERS ==========

// GET customers with pagination
router.get('/customers', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const result = await dbService.getCustomersWithPagination(page, limit, search);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET customer detail with consultations
router.get('/customers/:id', async (req, res) => {
    try {
        const customer = await dbService.getCustomerWithConsultations(parseInt(req.params.id));
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== STATS ==========

// GET admin stats
router.get('/stats', async (req, res) => {
    try {
        const stats = await dbService.getStats();
        const categories = await dbService.getAllCategories();
        const questions = await dbService.getAllQuestions();
        stats.totalCategories = categories.length;
        stats.totalQuestions = questions.length;
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET chart data (daily and category distribution)
router.get('/chart-data', async (req, res) => {
    try {
        const daily = await dbService.getDailyConsultationStats();
        const categories = await dbService.getConsultationByCategoryStats();
        res.json({ daily, categories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== USERS (Account & Credit Management) ==========

// GET users with pagination
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const result = await dbService.getAllUsers(page, limit, search);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new user by admin
router.post('/users', async (req, res) => {
    try {
        const { email, password, name = '', username, status = 'active' } = req.body || {};

        if (!email || !password || !username) {
            return res.status(400).json({ error: 'Email, username và mật khẩu là bắt buộc' });
        }
        if (String(password).length < 6) {
            return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: 'status phải là active hoặc inactive' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(email))) {
            return res.status(400).json({ error: 'Email không đúng định dạng' });
        }
        const usernameRegex = /^[A-Za-z0-9]+$/;
        if (!usernameRegex.test(String(username))) {
            return res.status(400).json({ error: 'Username chỉ được chứa chữ và số (A-Z, a-z, 0-9)' });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const normalizedUsername = String(username).trim();
        const userId = await dbService.createUser(normalizedEmail, hashPassword(String(password)), name || '', normalizedUsername, status);

        const plainApiKey = generateUserApiKey(normalizedUsername);
        const apiKeyHash = hashPassword(plainApiKey);
        const keyPrefix = plainApiKey.slice(0, 16);
        await dbService.createUserApiKey(userId, keyPrefix, apiKeyHash, 'default', plainApiKey);

        const user = await dbService.getUserById(userId);
        res.status(201).json({
            message: 'Tạo tài khoản thành công',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                credits: user.credits,
                is_admin: user.is_admin,
                status: user.status
            },
            apiKey: plainApiKey
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const user = await dbService.getUserById(parseInt(req.params.id));
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const history = await dbService.getUserCreditHistory(user.id);
        const apiKeys = await dbService.getUserApiKeysByUserId(user.id);
        res.json({ ...user, credit_history: history, api_keys: apiKeys });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update user credits
router.put('/users/:id/credits', async (req, res) => {
    try {
        const { credits, description } = req.body;
        await dbService.setUserCredits(parseInt(req.params.id), credits, description || 'Admin điều chỉnh');
        res.json({ message: 'Credits updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update user profile/status by admin
router.put('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const updated = await dbService.updateUserByAdmin(userId, req.body || {});
        res.json({ message: 'User updated', user: updated });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT set user status active/inactive
router.put('/users/:id/status', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { status } = req.body || {};
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: 'status phải là active hoặc inactive' });
        }
        const updated = await dbService.updateUserByAdmin(userId, { status });
        res.json({ message: 'User status updated', user: updated });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT admin reset/change user password
router.put('/users/:id/password', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { password } = req.body || {};
        if (!password || String(password).length < 6) {
            return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }
        const updated = await dbService.setUserPasswordByAdmin(userId, hashPassword(String(password)));
        res.json({ message: 'Password updated', user: updated });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE remove user account by admin
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        if (req.user?.id && req.user.id === userId) {
            return res.status(400).json({ error: 'Không thể tự xóa tài khoản đang đăng nhập' });
        }
        const removed = await dbService.deleteUserByAdmin(userId);
        res.json({ message: 'User deleted', user: removed });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST deposit credits for a user
router.post('/users/:id/credits/deposit', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const amount = Number(req.body?.amount);
        const description = req.body?.description || 'Admin nạp credits';

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ error: 'amount phải là số dương' });
        }

        await dbService.depositCredits(userId, amount, description);
        const user = await dbService.getUserById(userId);
        res.json({ message: 'Deposit thành công', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST withdraw credits from a user
router.post('/users/:id/credits/withdraw', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const amount = Number(req.body?.amount);
        const description = req.body?.description || 'Admin trừ credits';

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ error: 'amount phải là số dương' });
        }

        await dbService.withdrawCredits(userId, amount, description);
        const user = await dbService.getUserById(userId);
        res.json({ message: 'Withdraw thành công', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ========== CREDIT REQUESTS ==========

// GET pending credit requests
router.get('/credit-requests', async (req, res) => {
    try {
        const requests = await dbService.getPendingRequests();
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST approve credit request
router.post('/credit-requests/:id/approve', async (req, res) => {
    try {
        const adminId = req.user.id;
        await dbService.approveCreditRequest(parseInt(req.params.id), adminId);
        res.json({ message: 'Yêu cầu đã được duyệt' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST reject credit request
router.post('/credit-requests/:id/reject', async (req, res) => {
    try {
        const adminId = req.user.id;
        const { note } = req.body;
        await dbService.rejectCreditRequest(parseInt(req.params.id), adminId, note || '');
        res.json({ message: 'Yêu cầu đã bị từ chối' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET credit statistics for dashboard
router.get('/credit-stats', async (req, res) => {
    try {
        const stats = await dbService.getCreditStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== ACCESS LOGS ==========

// GET access logs with pagination + filters
router.get('/access-logs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const filters = {
            ip: req.query.ip || '',
            path: req.query.path || '',
            method: req.query.method || '',
            userId: req.query.userId || '',
            date: req.query.date || ''
        };
        // Remove empty filters
        Object.keys(filters).forEach(k => { if (!filters[k]) delete filters[k]; });

        const result = await dbService.getAccessLogs(page, limit, filters);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET access log statistics
router.get('/access-stats', async (req, res) => {
    try {
        const stats = await dbService.getAccessStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
