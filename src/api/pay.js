import api from './index';

/**
 * 调用支付接口获取支付宝支付链接
 * @param {string|number} orderId - 订单ID
 * @returns {Promise} - 返回支付宝跳转链接的Promise
 */
export function getPaymentUrl(orderId) {
  return api.get('/pay', { params: { orderId } });
} 