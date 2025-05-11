<template>
  <div class="article-detail-container">
    <el-card v-if="loading" shadow="never" class="skeleton-card">
      <el-skeleton :rows="1" animated class="skeleton-title" />
      <el-skeleton :rows="1" animated class="skeleton-meta" />
      <el-skeleton :rows="10" animated class="skeleton-content" />
    </el-card>

    <el-card v-else-if="article" class="article-card" shadow="never">
      <template #header>
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span v-if="article.author" class="meta-item">
            <el-icon><User /></el-icon> 作者: {{ article.author.username || '匿名' }}
          </span>
          <span v-if="article.createdAt" class="meta-item">
            <el-icon><Clock /></el-icon> 发布于: {{ formatDate(article.createdAt) }}
          </span>
          <!-- 可以添加其他元信息，如阅读量、分类等 -->
        </div>
      </template>
      
      <!-- 使用 v-html 渲染可能包含 HTML 标签的文章内容 -->
      <!-- 添加一个包装 div 以便更好地控制样式 -->
      <div class="article-content" v-html="article.content"></div>

    </el-card>

    <el-empty v-else description="文章加载失败或不存在" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getArticleDetail } from '@/api/article';
import { ElCard, ElSkeleton, ElEmpty, ElMessage, ElIcon } from 'element-plus';
import { User, Clock } from '@element-plus/icons-vue'; // 引入图标

const route = useRoute();
const article = ref(null);
const loading = ref(true);

const articleId = computed(() => route.params.id);

onMounted(async () => {
  if (articleId.value) {
    await fetchArticleDetail();
  } else {
    loading.value = false;
    ElMessage.error('无效的文章ID');
  }
});

const fetchArticleDetail = async () => {
  loading.value = true;
  try {
    const res = await getArticleDetail(articleId.value);
    if (res.code === 200 && res.data) {
      article.value = res.data;
    } else {
      ElMessage.error(res.message || '获取文章详情失败');
      article.value = null; // 确保在失败时清空
    }
  } catch (error) {
    console.error('Error fetching article detail:', error);
    ElMessage.error('加载文章详情时出错');
    article.value = null;
  } finally {
    loading.value = false;
  }
};

// 格式化日期函数
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    // 可以根据需要调整日期格式
    return new Date(dateString).toLocaleString(); 
  } catch (e) {
    return dateString;
  }
};
</script>

<style scoped>
.article-detail-container {
  max-width: 800px; /* 限制内容最大宽度，提供更好的阅读体验 */
  margin: 20px auto; /* 居中显示 */
  padding: 0 15px; /* 移动端边距 */
}

.article-card, .skeleton-card {
  background-color: #fff;
  border: none; /* 移除边框 */
  border-radius: 8px; /* 轻微圆角 */
  overflow: hidden; /* 防止内容溢出 */
}

/* Card Header 样式 */
:deep(.el-card__header) {
  padding: 25px 30px 20px; /* 增加头部内边距 */
  border-bottom: 1px solid #e4e7ed; /* 头部底部分隔线 */
}

.article-title {
  font-size: 2em; /* 增大标题字号 */
  font-weight: 600;
  margin-bottom: 15px; /* 标题和元信息间距 */
  line-height: 1.4;
  color: #303133;
}

.article-meta {
  display: flex;
  flex-wrap: wrap; /* 元信息换行 */
  gap: 15px; /* 元信息项之间的间距 */
  font-size: 0.9em;
  color: #909399;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px; /* 图标和文字间距 */
}

.el-icon {
  font-size: 1.1em; /* 图标稍大一点 */
}

/* Card Body / Content 样式 */
:deep(.el-card__body) {
  padding: 30px 40px; /* 增加内容区域内边距 */
}

.article-content {
  font-size: 16px; /* 合适的正文字号 */
  line-height: 1.8; /* 增加行高，提升阅读舒适度 */
  color: #303133;
  word-wrap: break-word; /* 长单词或链接自动换行 */
}

/* 针对 v-html 渲染内容的常见标签进行样式优化 */
.article-content :deep(p) {
  margin-bottom: 1.5em; /* 段落间距 */
}

.article-content :deep(h2) {
  font-size: 1.5em;
  margin-top: 2em;
  margin-bottom: 1em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eee;
}

.article-content :deep(h3) {
  font-size: 1.3em;
  margin-top: 1.8em;
  margin-bottom: 0.8em;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin-left: 2em;
  margin-bottom: 1.5em;
}

.article-content :deep(li) {
  margin-bottom: 0.5em;
}

.article-content :deep(blockquote) {
  margin: 1.5em 0;
  padding: 10px 20px;
  background-color: #f8f8f8;
  border-left: 4px solid #ccc;
  color: #666;
}

.article-content :deep(pre) {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto; /* 代码块水平滚动 */
  margin-bottom: 1.5em;
}

.article-content :deep(code) {
  font-family: 'Courier New', Courier, monospace;
  background-color: #f5f5f5;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.article-content :deep(pre code) {
  background-color: transparent; /* pre 里的 code 不需要背景色 */
  padding: 0;
  font-size: inherit; /* 继承 pre 的字号 */
}

.article-content :deep(img) {
  max-width: 100%; /* 图片自适应宽度 */
  height: auto;
  display: block; /* 避免图片下方空白 */
  margin: 1.5em auto; /* 图片居中并添加垂直间距 */
  border-radius: 4px; /* 图片轻微圆角 */
}

.article-content :deep(a) {
  color: #409eff;
  text-decoration: none;
}
.article-content :deep(a:hover) {
  text-decoration: underline;
}

/* 骨架屏样式 */
.skeleton-card :deep(.el-card__body) {
  padding: 30px 40px;
}
.skeleton-title :deep(.el-skeleton__item) {
  height: 36px; /* 模拟标题高度 */
  margin-bottom: 15px;
}
.skeleton-meta :deep(.el-skeleton__item) {
  height: 20px; /* 模拟元信息高度 */
  width: 60%; /* 模拟元信息宽度 */
  margin-bottom: 30px;
}
.skeleton-content :deep(.el-skeleton__p) {
  margin-bottom: 1.8em; /* 模拟段落间距 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .article-detail-container {
    padding: 0 10px; /* 移动端进一步减小边距 */
  }
  :deep(.el-card__header) {
    padding: 20px 20px 15px;
  }
  :deep(.el-card__body) {
    padding: 20px 25px; /* 减小内容内边距 */
  }
  .article-title {
    font-size: 1.6em; /* 减小标题字号 */
  }
  .article-content {
    font-size: 15px;
    line-height: 1.7;
  }
}
</style>