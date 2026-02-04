import axios from 'axios';
import { getValidAccessToken } from './authService';

// Instance này KHÔNG có interceptor - dùng để refresh hoặc gọi endpoint public
export const pureApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

// Instance này CÓ interceptor - dùng cho toàn bộ logic nghiệp vụ
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/google-login',
  '/ai/chat' 
];

export const setupInterceptors = (contextLogout) => {
  api.interceptors.request.use(
    async (config) => {
      const isPublic = PUBLIC_ENDPOINTS.some(endpoint => config.url.includes(endpoint));
      
      if (isPublic) return config;

      // Lấy token (đã xử lý logic đợi refresh bên trong authService)
      const token = await getValidAccessToken();
      
      if (!token) {
        contextLogout(); 
        return Promise.reject(new Error('Session expired'));
      }

      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );
};

export default api;