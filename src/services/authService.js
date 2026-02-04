import api from './api'; 
export const login = (data) =>
  api.post("/auth/login", data, { withCredentials: true });
export const register = (data) => api.post('/auth/register', data);
export const sendRegistrationOTP = (data) => api.post('/auth/send-registration-otp', data);
export const verifyRegistrationOTP = (data) => api.post('/auth/verify-registration-otp', data);
export const forgotPassword = (email) => api.post("/auth/forgot-password", { email });
export const verifyOTP = (data) => api.post("/auth/verify-otp", data);
export const resetPassword = (data) => api.post("/auth/reset-password", data);
let isRefreshing = false;
let refreshSubscribers = [];
let refreshTimeout = null;

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
  console.log("Check expiresInMs from server:", expiresInMs);
_expireTime = Date.now() + Number(expiresInMs);
  localStorage.setItem("hasSession", "true");
  sessionStorage.setItem("expireTime", _expireTime);
  console.log(`🔐 [Auth] Đã lưu token mới. Hết hạn sau: ${expiresInMs / 1000}s`);
};

export const getValidAccessToken = async () => {
  const now = Date.now();
  const threshold = 5 * 1000; 


  if (_accessToken && (_expireTime - now > threshold)) {
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
    const res = await api.post("/auth/refresh", {}, { withCredentials: true });
    const { accessToken, expiresInMs } = res.data.data || res.data;
    saveAccessToken(accessToken, expiresInMs);
    return accessToken;
  } catch (error) {
    throw error;
  }
};
  

export const loginGoogle = (googleToken) => {
  return api.post('/auth/google-login', { token: googleToken },{withCredentials:true});
  
};