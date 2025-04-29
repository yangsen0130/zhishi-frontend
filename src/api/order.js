// src/api/order.js
import api from './index';

export const createOrder = (data) => {
  return api.post('/order/create', data);
};

export const payOrder = (orderId) => {
  return api.post(`/order/pay/${orderId}`);
};

export const getOrderDetail = (orderId) => {
  return api.get(`/order/detail/${orderId}`);
};

export const getOrderList = () => {
  return api.get('/order/list');
};

export const checkPlanetPurchase = (userId, planetId) => {
  return api.get(`/order/check/${userId}/${planetId}`);
};