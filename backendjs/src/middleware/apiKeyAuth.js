const crypto = require('crypto');
const dbService = require('../services/database.service');

const parseApiKeyFromAuthorization = (authorization) => {
    if (!authorization || typeof authorization !== 'string') return null;
    const match = authorization.match(/^ApiKey\s+(.+)$/i);
    return match ? match[1].trim() : null;
};

const hashApiKey = (apiKey) => crypto.createHash('sha256').update(apiKey).digest('hex');

const authenticateApiKey = async (req, res, next) => {
    const apiKey = parseApiKeyFromAuthorization(req.headers.authorization);
    if (!apiKey) {
        return res.status(401).json({ error: 'Thiếu ApiKey trong header Authorization' });
    }

    try {
        const keyHash = hashApiKey(apiKey);
        const keyRow = await dbService.getUserApiKeyByHash(keyHash);
        if (!keyRow) {
            return res.status(401).json({ error: 'ApiKey không hợp lệ' });
        }
        if (keyRow.status && keyRow.status !== 'active') {
            return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
        }

        await dbService.touchUserApiKeyLastUsed(keyRow.id);

        req.user = {
            id: keyRow.user_id_ref,
            email: keyRow.email,
            username: keyRow.username,
            name: keyRow.user_name,
            credits: keyRow.credits,
            is_admin: keyRow.is_admin,
            status: keyRow.status
        };
        req.authType = 'api_key';
        next();
    } catch (error) {
        console.error('[API_KEY] Authentication error:', error.message);
        return res.status(500).json({ error: 'Lỗi xác thực API key' });
    }
};

module.exports = {
    authenticateApiKey,
    parseApiKeyFromAuthorization
};
