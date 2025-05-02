<!-- src/components/ArticleList.vue -->
<template>
    <div class="article-list">
      <h2 class="section-title">最新文章</h2>
      <div v-if="loading" class="loading-container">
        <!-- 使用 Element Plus 的骨架屏 -->
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else-if="articles.length > 0">
        <el-row :gutter="20">
          <el-col
            v-for="article in articles"
            :key="article.id"
            :xs="24"
            :sm="12"
            :md="8"
          >
            <article-card :article="article" />
          </el-col>
        </el-row>
      </div>
      <div v-else class="empty-container">
        <el-empty description="暂无文章" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { getArticles } from '@/api/article'; // 导入获取文章列表的 API 函数
  import ArticleCard from './ArticleCard.vue'; // 导入文章卡片组件
  import { ElMessage } from 'element-plus';
  
  const articles = ref([]);
  const loading = ref(true);
  
  onMounted(async () => {
    await fetchArticles();
  });
  
  const fetchArticles = async () => {
    loading.value = true;
    try {
      const res = await getArticles();
      if (res.code === 200 && Array.isArray(res.data)) {
        articles.value = res.data;
      } else {
        articles.value = []; // 清空以防万一
        ElMessage.error(res.message || '获取文章列表失败');
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      articles.value = [];
      ElMessage.error('加载文章时出错，请稍后再试');
    } finally {
      loading.value = false;
    }
  };
  </script>
  
  <style scoped>
  .article-list {
    margin-top: 20px;
  }
  
  .section-title {
    margin-bottom: 20px;
    padding-left: 10px;
    border-left: 4px solid #409eff;
    font-size: 1.5em;
  }
  
  .loading-container, .empty-container {
    margin-top: 40px;
    text-align: center;
  }
  
  /* 响应式布局调整 */
  @media (max-width: 768px) {
    .el-col {
      margin-bottom: 20px; /* 在小屏幕上增加卡片间距 */
    }
  }
  </style>