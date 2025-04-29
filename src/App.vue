<!-- src/App.vue -->
<template>
  <el-config-provider :locale="zhCn">
    <div class="app">
      <el-container>
        <el-header>
          <div class="header-content">
            <div class="logo" @click="$router.push('/')">
              <span class="logo-text">星球社区</span>
            </div>
            <div class="nav-links">
              <el-button text @click="$router.push('/')">首页</el-button>
              <el-button text @click="$router.push('/user-center')" v-if="isAuthenticated">
                个人中心
              </el-button>
            </div>
            <div class="user-section">
              <div v-if="!isAuthenticated">
                <el-button @click="$router.push('/')">登录 / 注册</el-button>
              </div>
              <div v-else class="user-info">
                <span class="welcome-text">欢迎，{{ username }}</span>
                <el-dropdown>
                  <span class="el-dropdown-link">
                    <el-avatar :size="32" :src="user?.avatar || defaultAvatar" />
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="$router.push('/user-center')">
                        个人中心
                      </el-dropdown-item>
                      <el-dropdown-item divided @click="handleLogout">
                        退出登录
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </el-header>
        
        <el-main>
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
        
        <el-footer>
          <div class="footer-content">
            <p>&copy; 2025 星球社区 - 探索知识星球，与志同道合的人一起成长</p>
          </div>
        </el-footer>
      </el-container>
    </div>
  </el-config-provider>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';

const userStore = useUserStore();
const defaultAvatar = '/default-avatar.jpg';

const isAuthenticated = computed(() => userStore.isAuthenticated);
const username = computed(() => userStore.username);
const user = computed(() => userStore.user);

onMounted(async () => {
  // 应用加载时检查用户认证状态
  if (userStore.token) {
    await userStore.validateToken();
  }
});

const handleLogout = () => {
  userStore.logout();
  ElMessage.success('已退出登录');
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
}

.app {
  min-height: 100vh;
}

.el-container {
  min-height: 100vh;
}

.el-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  cursor: pointer;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.user-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.welcome-text {
  margin-right: 10px;
}

.el-main {
  padding: 20px;
}

.el-footer {
  background-color: #545c64;
  color: #fff;
  text-align: center;
  padding: 20px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>