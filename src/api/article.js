// src/api/article.js
import api from './index';

export const getPlanetArticles = (planetId) => {
  return api.get(`/article/planet/${planetId}`);
};

export const getArticleDetail = (articleId) => {
  return api.get(`/article/detail/${articleId}`);
};

export const createArticle = (data) => {
  return api.post('/article/create', data);
};