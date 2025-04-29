// src/stores/user.js
import { defineStore } from 'pinia';
import { login, register, validateToken } from '@/api/auth';
import { getUserInfo } from '@/api/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || '',
    isAuthenticated: !!localStorage.getItem('token'), // 初始化时检查token
  }),
  
  getters: {
    userId: (state) => state.user?.id,
    username: (state) => state.user?.username,
  },
  
  actions: {
    async login(credentials) {
      try {
        const res = await login(credentials);
        if (res.code === 200 && res.data.token) {
          this.token = res.data.token;
          localStorage.setItem('token', res.data.token);
          await this.fetchUserInfo();
          this.isAuthenticated = true; // 确保设置为 true
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },
    
    async register(userData) {
      try {
        const res = await register(userData);
        if (res.code === 200 && res.data) {
          return true;
        }
        return false;
      } catch (error) {
        console.error('Register error:', error);
        return false;
      }
    },
    
    async validateToken() {
      if (!this.token) return false;
      
      try {
        const res = await validateToken();
        if (res.code === 200 && res.data) {
          this.user = res.data;
          this.isAuthenticated = true;
          localStorage.setItem('userId', res.data.id);
          return true;
        } else {
          this.logout();
          return false;
        }
      } catch (error) {
        console.error('Token validation error:', error);
        this.logout();
        return false;
      }
    },
    
    async fetchUserInfo() {
      try {
        const res = await getUserInfo();
        if (res.code === 200 && res.data) {
          this.user = res.data;
          this.isAuthenticated = true; // 明确设置为已认证
          localStorage.setItem('userId', res.data.id);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Fetch user info error:', error);
        return false;
      }
    },
    
    logout() {
      this.user = null;
      this.token = '';
      this.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
  }
});