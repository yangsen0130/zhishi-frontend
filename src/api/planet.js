// src/api/planet.js
import api from './index';

export const getPlanetList = () => {
  return api.get('/planet/list');
};

export const getPlanetDetail = (planetId) => {
  return api.get(`/planet/detail/${planetId}`);
};

export const createPlanet = (data) => {
  return api.post('/planet/create', data);
};

export const checkPlanetAccess = (planetId) => {
  return api.get(`/planet/access/${planetId}`);
};