import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setupInterceptors, resetCsrfToken } from "../services/api";
import { getUserInfo } from "../services/userService";
import { clearAccessToken,logoutApi } from "../services/authService";
import { useDispatch } from 'react-redux';
import { setCredentials, logoutStore, setLoading as setReduxLoading } from '../store/authSlice';
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(async () => {
  console.log("👋 [Auth] Logging out - calling server");

  try {
    await logoutApi();
  } catch (error) {
    console.warn("Logout API failed:", error?.response?.data || error.message);
  }
  setUser(null);
  setIsAuthenticated(false);
  clearAccessToken();
  resetCsrfToken();
  localStorage.removeItem("hasSession");

}, []);
  // Khởi tạo user từ token khi app mount
    const dispatch = useDispatch();
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Khởi tạo interceptor
        setupInterceptors(logout);

        // Kiểm tra token có tồn tại
        const hasSession = localStorage.getItem("hasSession") === "true";
        if (hasSession) {
          // Lấy thông tin user từ API
          const userData = await getUserInfo();
          setUser(userData);
          setIsAuthenticated(true);
          dispatch(setCredentials({ user: userData }));
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        logout();
          dispatch(logoutStore());
      } finally {
        setLoading(false);
         dispatch(setReduxLoading(false));
      }
    };

    initializeUser();
  }, [logout,dispatch]);
 useEffect(() => {
    const syncLogoutAcrossTabs = (event) => {

      if (event.key === "hasSession" && event.newValue === null) {
        console.log("🔄 Phát hiện đăng xuất từ Tab khác. Đang đồng bộ...");

        setUser(null);
        setIsAuthenticated(false);
        
        dispatch(logoutStore()); 
        
        window.location.href = '/login'; 
      }
    };


    window.addEventListener("storage", syncLogoutAcrossTabs);


    return () => {
      window.removeEventListener("storage", syncLogoutAcrossTabs);
    };
  }, [dispatch]);
  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        loading,
        isAuthenticated,
        setIsAuthenticated
      }}
    >
      {!loading && children}
    </UserContext.Provider>
  );
};

const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export default useUser;
