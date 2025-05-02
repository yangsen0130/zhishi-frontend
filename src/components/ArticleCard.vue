<!-- src/components/ArticleCard.vue -->
<template>
    <el-card class="article-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="article-title">{{ article.title }}</span>
          <el-button type="primary" link @click="viewDetail">阅读全文</el-button>
        </div>
      </template>
      <div class="article-content">
        <p class="article-excerpt">{{ formatExcerpt(article.content) }}</p>
        <!-- 可以添加更多信息，如作者、发布时间等 -->
        <div class="article-meta">
           <span v-if="article.author">作者: {{ article.author.username || '匿名' }}</span>
           <span v-if="article.createdAt">发布于: {{ formatDate(article.createdAt) }}</span>
        </div>
      </div>
    </el-card>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  
  const props = defineProps({
    article: {
      type: Object,
      required: true,
    },
  });
  
  const router = useRouter();
  
  // 格式化摘要，截取前 N 个字符
  const formatExcerpt = (content) => {
    if (!content) return '暂无内容';
    const plainText = content.replace(/<[^>]*>/g, ''); // 简单去除HTML标签
    const maxLength = 100; // 摘要最大长度
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
  };
  
  // 格式化日期 (可选)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString; // 返回原始字符串以防出错
    }
  };
  
  const viewDetail = () => {
    router.push({ name: 'ArticleDetail', params: { id: props.article.id } });
  };
  </script>
  
  <style scoped>
  .article-card {
    margin-bottom: 20px;
    transition: transform 0.3s ease;
  }
  
  .article-card:hover {
    transform: translateY(-5px);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .article-title {
    font-size: 1.1em;
    font-weight: bold;
  }
  
  .article-content {
    color: #606266;
  }
  
  .article-excerpt {
    margin-bottom: 15px;
    line-height: 1.6;
    min-height: 40px; /* 根据需要调整，确保有一定高度 */
  }
  
  .article-meta {
    font-size: 0.85em;
    color: #909399;
    display: flex;
    gap: 15px; /* 元素间距 */
    margin-top: 10px;
    border-top: 1px solid #eee; /* 分隔线 */
    padding-top: 10px;
  }
  </style>