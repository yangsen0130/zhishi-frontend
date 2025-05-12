// src/api/order.js
import api from './index';

/**
 * 创建文章购买订单
 * @param {object} data - 包含 articleId 和 amount
 * @param {number} data.articleId - 文章ID
 * @param {number} data.amount - 支付金额
 */
export const createOrder = (data) => {
  // OrderController.createOrder 使用 @RequestParam，所以将参数放在 params 中
  // axios 会将 params 对象序列化为 URL 查询字符串，即使是 POST 请求，Spring MVC 也能正确处理
  return api.post('/order/create', null, { 
    params: data 
  });
};

// 可选：如果你需要在前端轮询订单状态（不在此次核心需求中，但支付后可能有用）
// export const getOrderStatus = (orderId) => {
//   return api.get(`/order/status/${orderId}`); // 假设有此接口
// };