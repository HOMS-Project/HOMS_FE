// api.js
import axios from 'axios';
import { getValidAccessToken } from './authService';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: false,
});

// Hàm gắn interceptor
export const setupInterceptors = (contextLogout) => {
  api.interceptors.request.use(
    async (config) => {
      if (
        config.url.includes('/auth/login') ||
        config.url.includes('/auth/register') ||
        config.url.includes('/auth/refresh') || 
        config.url.includes('/forgot-password') ||
        config.url.includes('/verify-otp') ||
        config.url.includes('/send-registration-otp') ||
        config.url.includes('/verify-registration-otp') ||
        config.url.includes('/reset-password') ||
        config.url.includes('/ai/chat')||
        config.url.includes('/auth/google-login')
      ) {
        return config;
      }

      const token = await getValidAccessToken();
      if (!token) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        contextLogout();
        window.location.href = "/login";
        return Promise.reject(new Error("Token hết hạn"));
      }


      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );
};

export default api;