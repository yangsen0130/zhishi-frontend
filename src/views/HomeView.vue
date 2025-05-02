<!-- src/views/HomeView.vue -->
<template>
  <div class="home-page">
    <el-row :gutter="20">
      <el-col :span="24" class="header-section">
        <h1 class="site-title">星球社区</h1>
        <p class="site-description">探索知识星球，与志同道合的人一起成长</p>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="main-section">
      <el-col :span="24">
        <!-- 使用新的 ArticleList 组件替换原来的 PlanetList -->
        <article-list />
      </el-col>
    </el-row>

    <!-- 创建星球对话框及其相关逻辑已完全移除 -->

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ElMessage } from 'element-plus';
// 移除了 PlanetList, usePlanetStore, apiCreatePlanet, uploadImage, Plus 的导入
import ArticleList from '@/components/ArticleList.vue'; // 新增：导入 ArticleList 组件
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// 移除了创建星球相关的 ref 和 reactive 变量
// const showCreatePlanetDialog = ref(false);
// const creating = ref(false);
// const planetFormRef = ref(null);
// const planetForm = shallowReactive({ ... });
// const coverFile = ref(null);
// const planetRules = { ... };

const isAuthenticated = computed(() => userStore.isAuthenticated);
const username = computed(() => userStore.username); // 保留，虽然此视图不再直接显示

const handleLogout = () => { // 保留，虽然此视图不再直接调用，但逻辑可能在别处复用
  userStore.logout();
  ElMessage.success('已退出登录');
};

// 移除了 handleCoverChange, createPlanet, resetDialog 函数

</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.site-title {
  font-size: 36px;
  margin-bottom: 10px;
  color: #409eff;
}

.site-description {
  font-size: 18px;
  color: #666;
}

.main-section {
  margin-top: 20px;
}

/* 移除了 .user-panel, .user-actions, .create-planet-section 的样式 */
/* 移除了 .avatar-uploader, .avatar-uploader-icon, .avatar 的样式 */

</style>