// Backend Configuration
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8082';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8081';

module.exports = {
    BACKEND_API_URL,
    FRONTEND_URL
}; 