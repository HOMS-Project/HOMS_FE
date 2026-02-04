import api,{ pureApi } from "./api";

/* ================= AUTH API ================= */

export const login = (data) =>
  api.post("/auth/login", data, { withCredentials: true });

export const register = (data) => api.post("/auth/register", data);

export const sendOTP = (data) => api.post("/auth/send-otp", data);

export const verifyOTP = (data) => api.post("/auth/verify-otp", data);

export const resendOTP = (data) => api.post("/auth/resend-otp", data);

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (token, data) =>
  api.post(`/auth/reset-password/${token}`, data);

export const loginGoogle = (googleToken) =>
  api.post(
    "/auth/google-login",
    { token: googleToken },
    { withCredentials: true },
  );

/* ================= TOKEN MANAGEMENT ================= */

let isRefreshing = false;
let refreshSubscribers = [];
let refreshTimeout = null;

const onRefreshed = (token) => {
  console.log("📢 [Auth] Đang cấp phát Access Token mới cho các request đang chờ...");
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

let _accessToken = null;
let _expireTime = 0;

export const saveAccessToken = (accessToken, expiresInMs) => {
  _accessToken = accessToken;
  _expireTime = Date.now() + expiresInMs;

  localStorage.setItem("hasSession", "true");

  const expireDate = new Date(_expireTime).toLocaleTimeString();

  console.group("%c🔐 [Auth] Cập nhật Token mới", "color: #2196f3; font-weight: bold;");
  console.log(`- Expire lúc: ${expireDate}`);
  console.groupEnd();

  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }

  // Refresh trước khi hết hạn 10s
  const delay = Math.max(expiresInMs - 10000, 5000);

  console.log(`🚀 [Auth] Đã đặt lịch AUTO-REFRESH sau ${delay / 1000}s`);


};


/**
 * Lấy access token hợp lệ
 */
export const getValidAccessToken = async () => {
  const now = Date.now();
  const threshold = 5 * 1000;

  if (_accessToken && _expireTime - now > threshold) {
    return _accessToken;
  }

  const hasSession = localStorage.getItem('hasSession') === 'true';
  if (!hasSession) return null;

  if (isRefreshing) {
    return new Promise(resolve => addRefreshSubscriber(resolve));
  }

  // 🔥 CHỖ QUAN TRỌNG
  isRefreshing = true;

  try {
    const newToken = await refreshAccessToken();
    onRefreshed(newToken);
    return newToken;
  } catch (err) {
    throw err;
  } finally {
    isRefreshing = false;
  }
};



/**
 * Refresh access token
 */
export const refreshAccessToken = async () => {
  console.log("📡 [Auth] Gửi request REFRESH TOKEN...");

  try {
    const res = await pureApi.post(
      "/auth/refresh",
      {},
      { withCredentials: true }
    );

    const { accessToken, expiresInMs } = res.data.data || res.data;

    console.log("%c♻️ [Auth] REFRESH THÀNH CÔNG", "color: #4caf50; font-weight: bold;");
    
    saveAccessToken(accessToken, expiresInMs);
    return accessToken;
  } catch (error) {
    console.error(
      "🚫 [Auth] REFRESH TOKEN THẤT BẠI (Session hết hạn)",
      error.response?.data || error.message
    );
    throw error;
  }
};

/* ================= LOGOUT ================= */

export const logout = async () => {
  try {
    await api.post('/auth/logout', {}, { withCredentials: true });
  } finally {
    _accessToken = null;
    _expireTime = 0;
    localStorage.removeItem('hasSession'); 
    
  }
};
