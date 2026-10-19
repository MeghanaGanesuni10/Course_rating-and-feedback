import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cr_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // On mount, verify token is still valid
  useEffect(() => {
    const token = localStorage.getItem('cr_token');
    if (!token) { setLoading(false); return; }

    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('cr_user', JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem('cr_token');
        localStorage.removeItem('cr_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('cr_token', data.token);
    localStorage.setItem('cr_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('cr_token', data.token);
    localStorage.setItem('cr_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const googleAuth = useCallback(async (credential, role) => {
    const { data } = await api.post('/auth/google', { credential, role });
    localStorage.setItem('cr_token', data.token);
    localStorage.setItem('cr_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cr_token');
    localStorage.removeItem('cr_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) => {
    setUser(updated);
    localStorage.setItem('cr_user', JSON.stringify(updated));
  }, []);

  return (
      <AuthContext.Provider value={{ user, loading, login, register, googleAuth, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
