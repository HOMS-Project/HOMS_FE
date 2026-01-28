import { createContext, useContext, useState, useEffect } from "react";
import { getUserInfo } from "../services/profileService";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpire");
    localStorage.removeItem("refreshToken");
  };


  return (
    <UserContext.Provider
      value={{ user, setUser, logout, loading }}
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
