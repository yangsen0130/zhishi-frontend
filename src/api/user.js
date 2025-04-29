// src/api/user.js
import api from './index';

export const getUserInfo = () => {
  return api.get('/user/info');
};

export const getUserById = (userId) => {
  return api.get(`/user/info/${userId}`);
};