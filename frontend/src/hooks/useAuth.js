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
    return result;
  };

  const login = async (username, password) => {
    const result = await authService.login(username, password);
    if (result.success && result.nextStep?.signInStep === 'DONE') {
      // User successfully signed in without additional challenges
      const authResult = await checkAuth();
      return { ...result, userUpdated: true };
    }
    return result;
  };

  const logout = async () => {
    const result = await authService.logout();
    if (result.success) {
      setUser(null);
    }
    return result;
  };

  const completeNewPassword = async (newPassword) => {
    const result = await authService.completeNewPassword(newPassword);
    if (result.success) {
      // User successfully completed password change
      await checkAuth();
    }
    return result;
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