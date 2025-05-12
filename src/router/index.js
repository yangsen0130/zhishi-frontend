// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import HomeView from '@/views/HomeView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  // { // 删除了 PlanetDetail 路由
  //   path: '/planet/:id',
  //   name: 'PlanetDetail',
  //   component: () => import('@/views/PlanetDetailView.vue'),
  //   meta: { requiresAuth: true },
  // },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('@/views/ArticleDetailView.vue'),
    meta: { requiresAuth: true }, // 保持文章详情需要认证
  },
  {
    path: '/user-center',
    name: 'UserCenter',
    component: () => import('@/views/UserCenterView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/create-article',
    name: 'CreateArticle',
    component: () => import('@/views/CreateArticleView.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // 验证逻辑保持不变
  if (to.meta.requiresAuth) {
    if (!userStore.isAuthenticated) {
      if (userStore.token) {
        const valid = await userStore.validateToken();
        if (valid) {
          next();
        } else {
          // 验证失败，重定向到首页或其他公共页面
          next({ name: 'Home' });
        }
      } else {
        // 没有 token，重定向到首页或其他公共页面
        next({ name: 'Home' });
      }
    } else {
      // 已认证
      next();
    }
  } else {
    // 不需要认证的页面
    next();
  }
});

export default router;