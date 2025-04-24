// Environment-specific configuration
const ENV = process.env.NODE_ENV || 'development';

const config = {
  development: {
    BACKEND_API_URL: 'http://192.168.1.101:8082',
    FRONTEND_URL: 'http://192.168.1.101:8081',
  },
  production: {
    BACKEND_API_URL: process.env.BACKEND_API_URL || 'https://api.medigo.com',
    FRONTEND_URL: process.env.FRONTEND_URL || 'https://medigo.com',
  },
  test: {
    BACKEND_API_URL: 'http://localhost:8082',
    FRONTEND_URL: 'http://localhost:8081',
  },
};

export const { BACKEND_API_URL, FRONTEND_URL } = config[ENV]; 