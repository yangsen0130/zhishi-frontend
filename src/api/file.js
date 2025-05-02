// src/api/file.js
import api from './index';

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/article/fileupload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};