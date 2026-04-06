/**
 * API Configuration
 * Automatically detects environment and sets API base URL
 */

// Detect if running on production domain
const isProduction = window.location.hostname === 'vietlac.com' ||
    window.location.hostname === 'www.vietlac.com';

// API Base URL - use relative path for portability and prod-readiness
// Vite dev server proxies /api to backends
const API_HOST = ''; 

// Alternatively, for truly relative paths that work behind proxies:
// const API_HOST = ''; 

// Export API endpoints
export const API_CONFIG = {
    HOST: API_HOST,
    BASE_URL: `${API_HOST}/api`,
    AUTH: `${API_HOST}/api/auth`,
    CONSULTANT: `${API_HOST}/api/consultant`,
    ADMIN: `${API_HOST}/api/admin`,
    BAZI: `${API_HOST}/api/bazi`,
};

// For debugging
console.log('[API Config] Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('[API Config] API Host:', API_HOST);

export default API_CONFIG;
