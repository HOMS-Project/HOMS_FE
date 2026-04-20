import api from './api';
export const login = (data) =>
  api.post("/auth/login", data, {
    withCredentials: true,
    headers: { "ngrok-skip-browser-warning": "69420" }
  });
export const register = (data) => api.post('/auth/register', data);
export const sendRegistrationOTP = (data) => api.post('/auth/send-registration-otp', data);
export const verifyRegistrationOTP = (data) => api.post('/auth/verify-registration-otp', data);
export const forgotPassword = (email) => api.post("/auth/forgot-password", { email });
export const verifyOTP = (data) => api.post("/auth/verify-otp", data);
export const resetPassword = (data) => api.post("/auth/reset-password", data);
export const logoutApi = async () => {
  return await api.post("/auth/logout");
};
let isRefreshing = false;
// ... (omitted lines)
let refreshSubscribers = [];

const onRefreshed = (token) => {
  console.log(" [Auth] Đang cấp phát Access Token mới cho các request đang chờ...");
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  console.log('[Auth] ⏳ Waiting for token refresh, subscribing...');
  refreshSubscribers.push(callback);
};
let _accessToken = null;
let _expireTime = 0;

export const saveAccessToken = (accessToken, expiresInMs) => {
  _accessToken = accessToken;
  _expireTime = Date.now() + Number(expiresInMs);
  
  localStorage.setItem("hasSession", "true");
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("expireTime", _expireTime);
  
  sessionStorage.setItem("expireTime", _expireTime);
  console.log(`🔐 [Auth] Đã lưu token mới bền vững. Hết hạn sau: ${expiresInMs / 1000}s`);
};

export const clearAccessToken = () => {
  console.log('🧹 [Auth] Clearing access token');
  _accessToken = null;
  _expireTime = 0;
  refreshSubscribers = [];
  localStorage.removeItem("hasSession");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("expireTime");
  sessionStorage.removeItem("expireTime");
};

export const getValidAccessToken = async () => {
  const now = Date.now();
  const threshold = 5 * 1000;

  // 1. Kiểm tra RAM trước
  if (_accessToken && (_expireTime - now > threshold)) {
    return _accessToken;
  }

  // 2. Kiểm tra LocalStorage nếu RAM trống (do F5 hoặc lỗi đồng bộ)
  const storedToken = localStorage.getItem("accessToken");
  const storedExpire = Number(localStorage.getItem("expireTime") || 0);
  
  if (storedToken && (storedExpire - now > threshold)) {
    _accessToken = storedToken;
    _expireTime = storedExpire;
    return _accessToken;
  }


  const hasSession = localStorage.getItem('hasSession') === 'true';
  if (!hasSession) return null;

  if (isRefreshing) {
    return new Promise(resolve => addRefreshSubscriber(resolve));
  }

  isRefreshing = true;
  try {
    const newToken = await refreshAccessToken();
    onRefreshed(newToken);
    return newToken;
  } catch (err) {
    localStorage.removeItem("hasSession");
    return null;
  } finally {
    isRefreshing = false;
  }
};
export const refreshAccessToken = async () => {
  console.log("📡 [Auth] Token hết hạn, đang Refresh...");
  try {
    const res = await api.post("/auth/refresh", {}, {
      withCredentials: true,
      headers: {
        "ngrok-skip-browser-warning": "69420"
      }
    });
    const { accessToken, expiresInMs } = res.data.data || res.data;
    saveAccessToken(accessToken, expiresInMs);
    return accessToken;
  } catch (error) {
    throw error;
  }
};


export const loginGoogle = (googleToken) => {
  return api.post('/auth/google-login', { token: googleToken }, {
    withCredentials: true,
    headers: { "ngrok-skip-browser-warning": "69420" }
  });

};
export const loginFacebook = (accessToken) => {
  return api.post('/auth/facebook-login', { accessToken }, {
    withCredentials: true,
    headers: { "ngrok-skip-browser-warning": "69420" }
  });
};