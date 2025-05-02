// src/api/article.js
import api from './index';

// // 删除了 getPlanetArticles 函数
// export const getPlanetArticles = (planetId) => {
//   return api.get(`/article/planet/${planetId}`);
// };

// 新增：获取文章列表的函数
export const getArticles = () => {
  return api.get('/article/list'); // 假设后端列表接口是 /article/list
};

export const getArticleDetail = (articleId) => {
  return api.get(`/article/detail/${articleId}`);
};

export const createArticle = (data) => {
  return api.post('/article/create', data);
};