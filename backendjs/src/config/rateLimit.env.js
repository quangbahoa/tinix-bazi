/**
 * Rate limit numeric config from environment (shared by server + consultant routes).
 * dotenv must be loaded before this module is required (see server.js).
 */

const MIN_WINDOW_MS = 1000;

/**
 * @param {string|undefined} value
 * @param {number} fallback
 * @returns {number}
 */
const parsePositiveInt = (value, fallback) => {
    if (value === undefined || value === null || value === '') return fallback;
    const n = parseInt(String(value), 10);
    if (!Number.isFinite(n) || n < 1) return fallback;
    return n;
};

/**
 * @param {string|undefined} value
 * @param {number} fallback
 * @returns {number}
 */
const parseWindowMs = (value, fallback) => {
    const n = parsePositiveInt(value, fallback);
    return n < MIN_WINDOW_MS ? fallback : n;
};

const DEFAULT_GENERAL_MAX = 2500;
const DEFAULT_GENERAL_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_AUTH_MAX = 250;
const DEFAULT_AUTH_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_AI_MAX = 75;
const DEFAULT_AI_WINDOW_MS = 60 * 1000;

const generalMax = parsePositiveInt(process.env.RATE_LIMIT_GENERAL_MAX, DEFAULT_GENERAL_MAX);
const generalWindowMs = parseWindowMs(process.env.RATE_LIMIT_GENERAL_WINDOW_MS, DEFAULT_GENERAL_WINDOW_MS);
const authMax = parsePositiveInt(process.env.RATE_LIMIT_AUTH_MAX, DEFAULT_AUTH_MAX);
const authWindowMs = parseWindowMs(process.env.RATE_LIMIT_AUTH_WINDOW_MS, DEFAULT_AUTH_WINDOW_MS);
const aiMax = parsePositiveInt(process.env.RATE_LIMIT_AI_MAX, DEFAULT_AI_MAX);
const aiWindowMs = parseWindowMs(process.env.RATE_LIMIT_AI_WINDOW_MS, DEFAULT_AI_WINDOW_MS);

module.exports = {
    parsePositiveInt,
    parseWindowMs,
    generalMax,
    generalWindowMs,
    authMax,
    authWindowMs,
    aiMax,
    aiWindowMs,
    defaults: {
        generalMax: DEFAULT_GENERAL_MAX,
        generalWindowMs: DEFAULT_GENERAL_WINDOW_MS,
        authMax: DEFAULT_AUTH_MAX,
        authWindowMs: DEFAULT_AUTH_WINDOW_MS,
        aiMax: DEFAULT_AI_MAX,
        aiWindowMs: DEFAULT_AI_WINDOW_MS
    }
};
