import { createContext, useContext, useState, useEffect } from "react";
import { setupInterceptors } from "../services/api";
import { getUserInfo } from "../services/userService";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpire");
    localStorage.removeItem("refreshToken");
  };

  // Khởi tạo user từ token khi app mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Khởi tạo interceptor
        setupInterceptors(logout);
        
        // Kiểm tra token có tồn tại
        const token = localStorage.getItem("token");
        if (token) {
          // Lấy thông tin user từ API
          const userData = await getUserInfo();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

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
      {children}
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
