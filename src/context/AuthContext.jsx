import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { API_ROUTES } from '../constants/apiRoutes';
import { parseError } from '../utils/errorHandler';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(API_ROUTES.AUTH.ME);
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Failed to authenticate session:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post(API_ROUTES.AUTH.LOGIN, { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        setUser(res.data.data.user);
        return true;
      }
      return false;
    } catch (err) {
      const errMsg = parseError(err);
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post(API_ROUTES.AUTH.REGISTER, { name, email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        setUser(res.data.data.user);
        return true;
      }
      return false;
    } catch (err) {
      const errMsg = parseError(err);
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfileData = (updatedProfileData) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        profileData: updatedProfileData
      };
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateProfileData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
