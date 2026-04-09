const fs = require('fs');
const path = require('path');
const authRoutes = require('../routes/auth.routes');

const ALLOWED_PERMISSIONS = new Set(['public', 'auth', 'admin', 'disabled']);

const parseApiKeyFromAuthorization = (authorization) => {
    if (!authorization || typeof authorization !== 'string') return null;
    const match = authorization.match(/^ApiKey\s+(.+)$/i);
    return match ? match[1].trim() : null;
};

const normalizePath = (rawPath) => (rawPath || '').split('?')[0];

const resolvePolicyPath = () => {
    const configured = process.env.ROUTE_PERMISSIONS_FILE || './route-permissions.json';
    return path.isAbsolute(configured)
        ? configured
        : path.resolve(process.cwd(), configured);
};

const loadPolicy = () => {
    const policyPath = resolvePolicyPath();
    const raw = fs.readFileSync(policyPath, 'utf8');
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Route permissions policy must be a JSON object.');
    }

    const defaultPermission = parsed.defaultPermission || 'auth';
    if (!ALLOWED_PERMISSIONS.has(defaultPermission)) {
        throw new Error(`Invalid defaultPermission: ${defaultPermission}`);
    }

    const rules = Array.isArray(parsed.rules) ? parsed.rules : [];
    for (const rule of rules) {
        if (!rule || typeof rule !== 'object') {
            throw new Error('Each route permission rule must be an object.');
        }
        if (!rule.method || !rule.pathPattern || !rule.permission) {
            throw new Error('Each rule requires method, pathPattern, and permission.');
        }
        if (!ALLOWED_PERMISSIONS.has(rule.permission)) {
            throw new Error(`Invalid permission in rule: ${rule.permission}`);
        }
    }

    return { defaultPermission, rules };
};

const matchRule = (method, pathOnly, rules) => {
    const normalizedMethod = String(method || '').toUpperCase();

    const exactRule = rules.find((rule) =>
        String(rule.method).toUpperCase() === normalizedMethod &&
        !String(rule.pathPattern).endsWith('*') &&
        String(rule.pathPattern) === pathOnly
    );
    if (exactRule) return exactRule;

    const prefixRule = rules.find((rule) => {
        if (String(rule.method).toUpperCase() !== normalizedMethod) return false;
        const pattern = String(rule.pathPattern);
        if (!pattern.endsWith('*')) return false;
        const prefix = pattern.slice(0, -1);
        return pathOnly.startsWith(prefix);
    });
    return prefixRule || null;
};

const routePermissionsMiddleware = () => {
    const { defaultPermission, rules } = loadPolicy();

    return (req, res, next) => {
        if (req.method === 'OPTIONS') return next();

        const pathOnly = normalizePath(req.originalUrl || req.url || '');
        const matchedRule = matchRule(req.method, pathOnly, rules);
        const permission = matchedRule?.permission || defaultPermission;

        if (permission === 'public') return next();

        if (permission === 'disabled') {
            return res.status(503).json({
                error: 'Endpoint đang tạm tắt bởi cấu hình hệ thống'
            });
        }

        if (permission === 'auth') {
            return authRoutes.authMiddleware(req, res, next);
        }

        if (permission === 'admin') {
            const manageKey = process.env.API_KEY_MANAGE;
            const apiKey = parseApiKeyFromAuthorization(req.headers.authorization);
            if (manageKey && apiKey && apiKey === manageKey) {
                req.user = { id: 0, email: 'manage-key@system', is_admin: 1, role: 'admin' };
                req.authType = 'manage_key';
                return next();
            }

            return authRoutes.authMiddleware(req, res, () => {
                if (!req.user || !req.user.is_admin) {
                    return res.status(403).json({ error: 'Quyền truy cập bị từ chối. Yêu cầu quyền Admin.' });
                }
                return next();
            });
        }

        return res.status(500).json({ error: `Permission không hợp lệ: ${permission}` });
    };
};

module.exports = { routePermissionsMiddleware };
