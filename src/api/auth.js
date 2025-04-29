// src/api/auth.js
import api from './index';

export const login = (data) => {
  return api.post('/auth/login', data);
};

export const register = (data) => {
  return api.post('/auth/register', data);
};

export const validateToken = () => {
  return api.post('/auth/validate');
};