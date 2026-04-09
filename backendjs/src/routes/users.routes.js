const express = require('express');
const router = express.Router();
const dbService = require('../services/database.service');
const { authOrApiKeyMiddleware } = require('./auth.routes');

router.get('/me', authOrApiKeyMiddleware, async (req, res) => {
    try {
        const user = await dbService.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.status && user.status !== 'active') {
            return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                credits: user.credits,
                status: user.status || 'active',
                is_admin: user.is_admin
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
