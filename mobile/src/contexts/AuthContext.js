import React, { createContext, useEffect, useState } from 'react';
import { loginApi, registerApi } from '../api/api';
import { saveAuth, clearAuth, getUser, getToken } from '../utils/storage';
import { getSocket, disconnectSocket } from '../services/socket';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const user = await getUser();

        if (token && user) {
          setMe(user);
          await getSocket(token);
        }
      } catch (err) {
        console.error('Auth load failed', err);
      } finally {
        setAuthLoading(false);
      }
    })();

    return disconnectSocket;
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await loginApi({ email, password });

      console.log('Login API response:', data); // for debugging

      // Accept data even if wrapped differently
      const user = data.user || data?.data?.user;
      const token = data.token || data?.data?.token;

      if (user && token) {
        await saveAuth(token, user);
        setMe(user);
        await getSocket(token);
        return { ok: true, user }; // optional return
      } else {
        console.error('Login failed: missing user or token', data);
        throw new Error(data?.message || 'Invalid login response');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await registerApi({ name, email, password });

      console.log('Register API response:', data); // debug

      const user = data.user || data?.data?.user;
      const token = data.token || data?.data?.token;

      if (user && token) {
        await saveAuth(token, user);
        setMe(user);
        await getSocket(token);
        return { ok: true, user };
      } else {
        console.error('Register failed: missing user or token', data);
        throw new Error(data?.message || 'Invalid register response');
      }
    } catch (err) {
      console.error('Register error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'Register failed');
    }
  };

  const logout = async () => {
    await clearAuth();
    setMe(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ me, authLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
