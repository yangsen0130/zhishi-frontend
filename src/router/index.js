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
  {
    path: '/planet/:id',
    name: 'PlanetDetail',
    component: () => import('@/views/PlanetDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('@/views/ArticleDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/user-center',
    name: 'UserCenter',
    component: () => import('@/views/UserCenterView.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  
  if (to.meta.requiresAuth) {
    if (!userStore.isAuthenticated) {
      // 如果有token，尝试验证
      if (userStore.token) {
        const valid = await userStore.validateToken();
        if (valid) {
          next();
        } else {
          next({ name: 'Home' });
        }
      } else {
        next({ name: 'Home' });
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;