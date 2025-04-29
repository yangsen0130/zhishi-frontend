// src/api/file.js
import api from './index';

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};