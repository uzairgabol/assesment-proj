import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const result = await authService.getCurrentUser();
    if (result.success) {
      setUser(result.user);
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    return await authService.login(username, password);
  };

  const logout = async () => {
    const result = await authService.logout();
    if (result.success) {
      setUser(null);
    }
    return result;
  };

  const completeNewPassword = async (newPassword) => {
    return await authService.completeNewPassword(newPassword);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, completeNewPassword, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};