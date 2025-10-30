import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tokenManager from '../services/tokenManager';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage on app start (migration)
  useEffect(() => {
    const savedToken = localStorage.getItem('kyro_token');
    if (savedToken) {
      setToken(savedToken);
      tokenManager.setToken(savedToken); // Initialize token manager too
    }
    setLoading(false);

    // Cleanup: optionally clear localStorage after migration
    // localStorage.removeItem('kyro_token');
  }, []);

  const login = (tokenData, userData = null) => {
    setToken(tokenData);
    tokenManager.setToken(tokenData); // Update token manager
    setUser(userData);
    localStorage.setItem('kyro_token', tokenData); // For now, keep for compatibility during transition
  };

  const logout = () => {
    setToken(null);
    tokenManager.clearToken(); // Clear token manager
    setUser(null);
    localStorage.removeItem('kyro_token');
    navigate('/login');
  };

  const value = {
    token,
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};