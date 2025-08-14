// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check if logged in by fetching /users/me/ or similar endpoint
  const fetchUser = async () => {
    try {
      const res = await api.get('accounts/users/me/');
      setUser(res.data);
    } catch (err) {
      // If 401, redirect to login
      if (err.response && err.response.status === 401) {
        setUser(null);
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    // Your logout logic here (call logout API or clear cookies)
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
