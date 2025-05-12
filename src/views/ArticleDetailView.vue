<template>
  <div class="article-detail-container">
    <!-- 加载状态 -->
    <el-card v-if="loading" shadow="never" class="skeleton-card">
      <el-skeleton :rows="1" animated class="skeleton-title" />
      <el-skeleton :rows="1" animated class="skeleton-meta" />
      <el-skeleton :rows="10" animated class="skeleton-content" />
    </el-card>

    <!-- 有权限，显示文章 -->
    <el-card v-else-if="article && hasPermission" class="article-card" shadow="never">
      <template #header>
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span v-if="article.author" class="meta-item">
            <el-icon><User /></el-icon> 作者: {{ article.author.username || '匿名' }}
          </span>
          <span v-if="article.createdAt" class="meta-item">
            <el-icon><Clock /></el-icon> 发布于: {{ formatDate(article.createdAt) }}
          </span>
        </div>
      </template>
      <div class="article-content" v-html="article.content"></div>
    </el-card>

    <!-- 无权限，显示购买区域 -->
    <el-card v-else-if="showPurchaseSection && articlePreview" class="purchase-section-card" shadow="never">
      <template #header>
        <h1 class="article-title">{{ articlePreview.title || '文章内容受限' }}</h1>
      </template>
      <div class="purchase-info">
        <p class="purchase-prompt">此文章为付费内容，购买后即可查看完整内容。</p>
        <p v-if="articlePreview.price !== undefined && articlePreview.price !== null" class="price-tag">
          价格: <span class="price-value">¥{{ Number(articlePreview.price).toFixed(2) }}</span>
        </p>
        <div v-if="articlePreview.previewContent" class="preview-content" v-html="articlePreview.previewContent"></div>
        
        <el-button 
          type="primary" 
          @click="handlePurchase" 
          :loading="purchaseLoading"
          class="purchase-button"
        >
          {{ userStore.isAuthenticated ? '立即购买' : '登录后购买' }}
        </el-button>
        <p v-if="!userStore.isAuthenticated" class="login-prompt-text">
          您需要 <el-link type="primary" @click="promptLogin">登录</el-link> 才能购买。
        </p>
      </div>
    </el-card>

    <!-- 文章不存在或通用加载失败 -->
    <el-empty v-else :description="loadErrorText" class="empty-state"/>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getArticleDetail } from '@/api/article';
import { createOrder } from '@/api/order'; // 引入创建订单API
import { useUserStore } from '@/stores/user'; // 引入用户Store
import { ElCard, ElSkeleton, ElEmpty, ElMessage, ElIcon, ElButton, ElLink } from 'element-plus';
import { User, Clock } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const article = ref(null); // 存储完整文章内容
const articlePreview = ref(null); // 存储无权限时返回的文章预览信息（含价格）
const loading = ref(true);
const purchaseLoading = ref(false); // 购买按钮加载状态

const hasPermission = ref(false); // 用户是否有权限查看
const showPurchaseSection = ref(false); // 是否显示购买区域
const loadErrorText = ref('文章加载失败或不存在'); // 错误提示文本

const articleId = computed(() => route.params.id);

// 监听路由参数变化，当从支付返回并带有 ?paid=true 时，重新加载
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.paid === 'true' && newQuery.order_id) {
      ElMessage.success('支付成功！正在加载文章...');
      // 清理URL中的查询参数，避免刷新页面时重复提示和逻辑
      // 使用 replace 清理查询参数，不留历史记录
      const newRoute = { ...route, query: {} };
      delete newRoute.query.paid; // 确保完全移除
      delete newRoute.query.order_id;
      router.replace({ path: route.path, query: newRoute.query });
      
      fetchArticleDetail(true); // 强制重新获取，因为权限可能已更新
    }
  },
  { immediate: false } // 不需要立即执行，onMounted会处理首次加载
);


onMounted(async () => {
  if (articleId.value) {
    // 检查是否从支付成功返回
    if (route.query.paid === 'true' && route.query.order_id) {
      // watch 中已处理，这里主要是为了确保首次挂载时如果带参数也能触发
      // ElMessage.success('支付成功！正在加载文章...');
      // const newRoute = { ...route, query: {} };
      // delete newRoute.query.paid;
      // delete newRoute.query.order_id;
      // router.replace({ path: route.path, query: newRoute.query });
      // await fetchArticleDetail(true); // watch 会处理
    } else {
      await fetchArticleDetail();
    }
  } else {
    loading.value = false;
    loadErrorText.value = '无效的文章ID';
    ElMessage.error('无效的文章ID');
  }
});

const fetchArticleDetail = async (forceRefresh = false) => {
  if (!articleId.value) return;
  loading.value = true;
  hasPermission.value = false; // 重置权限状态
  showPurchaseSection.value = false; // 重置购买区域显示

  try {
    const res = await getArticleDetail(articleId.value);
    
    if (res.code === 200 && res.data) {
      if (res.data.hasFullAccess) {
        // 用户有权限查看完整内容
        article.value = res.data;
        articlePreview.value = null; // 清空预览
        hasPermission.value = true;
      } else {
        // 用户没有权限，需要购买
        article.value = null;
        articlePreview.value = res.data; // 包含预览内容和价格信息
        showPurchaseSection.value = true;
      }
    } else if (res.code === 5000) { // 文章不存在
      article.value = null;
      articlePreview.value = null;
      loadErrorText.value = '文章不存在';
    } else { // 其他错误
      article.value = null;
      articlePreview.value = null;
      loadErrorText.value = res.message || '获取文章详情失败';
      ElMessage.error(loadErrorText.value);
    }
  } catch (error) {
    console.error('Error fetching article detail:', error);
    article.value = null;
    articlePreview.value = null;
    loadErrorText.value = '加载文章详情时出错，请检查网络连接或稍后再试';
    if (error.response && error.response.status === 403) { // HTTP 403
        // 如果后端直接返回HTTP 403，并且响应体中有特定结构指示购买
        if (error.response.data && error.response.data.code === 200 && 
            error.response.data.data && error.response.data.data.hasFullAccess === false) {
            articlePreview.value = error.response.data.data;
            showPurchaseSection.value = true;
        } else {
           ElMessage.error('您可能没有权限查看此文章。');
        }
    } else {
        ElMessage.error(loadErrorText.value);
    }
  } finally {
    loading.value = false;
  }
};

const handlePurchase = async () => {
  if (!userStore.isAuthenticated) {
    promptLogin();
    return;
  }

  if (!articlePreview.value || articlePreview.value.price === undefined || articlePreview.value.price === null) {
    ElMessage.error('无法获取文章价格信息，请稍后再试。');
    return;
  }

  purchaseLoading.value = true;
  try {
    const orderData = {
      articleId: Number(articleId.value),
      amount: Number(articlePreview.value.price)
    };
    const res = await createOrder(orderData);

    if (res.code === 200 && res.data && res.data.payUrl && res.data.orderId) {
      // 在跳转到支付前，将 articleId 与 orderId 关联存储，以便支付成功回调时使用
      localStorage.setItem(`paying_article_id_for_${res.data.orderId}`, articleId.value);
      // 跳转到后端提供的支付URL，后端会处理重定向到支付宝
      window.location.href = res.data.payUrl;
    } else {
      ElMessage.error(res.message || '创建订单失败，请稍后再试。');
    }
  } catch (error) {
    console.error('Purchase error:', error);
    ElMessage.error('购买过程中发生错误，请稍后再试。');
  } finally {
    purchaseLoading.value = false;
  }
};

const promptLogin = () => {
  userStore.showLoginDialogAction(); // 调用 store action 显示 App.vue 中的登录框
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleString(); 
  } catch (e) {
    return dateString;
  }
};
</script>

<style scoped>
.article-detail-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 15px;
}

.article-card, .skeleton-card, .purchase-section-card {
  background-color: #fff;
  border: none;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

:deep(.el-card__header) {
  padding: 25px 30px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.article-title {
  font-size: 2em;
  font-weight: 600;
  margin-bottom: 15px;
  line-height: 1.4;
  color: #303133;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 0.9em;
  color: #909399;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.el-icon {
  font-size: 1.1em;
}

:deep(.el-card__body) {
  padding: 30px 40px;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  word-wrap: break-word;
}

.article-content :deep(p) { margin-bottom: 1.5em; }
.article-content :deep(h2) { font-size: 1.5em; margin-top: 2em; margin-bottom: 1em; padding-bottom: 0.3em; border-bottom: 1px solid #eee; }
.article-content :deep(h3) { font-size: 1.3em; margin-top: 1.8em; margin-bottom: 0.8em; }
.article-content :deep(ul), .article-content :deep(ol) { margin-left: 2em; margin-bottom: 1.5em; }
.article-content :deep(li) { margin-bottom: 0.5em; }
.article-content :deep(blockquote) { margin: 1.5em 0; padding: 10px 20px; background-color: #f8f8f8; border-left: 4px solid #ccc; color: #666; }
.article-content :deep(pre) { background-color: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; margin-bottom: 1.5em; }
.article-content :deep(code) { font-family: 'Courier New', Courier, monospace; background-color: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
.article-content :deep(pre code) { background-color: transparent; padding: 0; font-size: inherit; }
.article-content :deep(img) { max-width: 100%; height: auto; display: block; margin: 1.5em auto; border-radius: 4px; }
.article-content :deep(a) { color: #409eff; text-decoration: none; }
.article-content :deep(a:hover) { text-decoration: underline; }

.skeleton-card :deep(.el-card__body) { padding: 30px 40px; }
.skeleton-title :deep(.el-skeleton__item) { height: 36px; margin-bottom: 15px; }
.skeleton-meta :deep(.el-skeleton__item) { height: 20px; width: 60%; margin-bottom: 30px; }
.skeleton-content :deep(.el-skeleton__p) { margin-bottom: 1.8em; }

.purchase-info {
  text-align: center;
  padding: 20px;
}
.purchase-prompt {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 15px;
}
.price-tag {
  font-size: 1.2em;
  margin-bottom: 20px;
  color: #333;
}
.price-value {
  font-weight: bold;
  color: #E6A23C; /* Element Plus warning color */
  font-size: 1.3em;
}
.preview-content {
  margin-top: 15px;
  margin-bottom: 25px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  text-align: left;
  color: #606266;
  max-height: 150px; /* Limit preview height */
  overflow-y: auto; /* Add scroll if preview is long */
}
.purchase-button {
  padding: 12px 30px;
  font-size: 1.1em;
}
.login-prompt-text {
  margin-top: 15px;
  font-size: 0.9em;
  color: #909399;
}
.empty-state {
  margin-top: 40px;
}

@media (max-width: 768px) {
  .article-detail-container { padding: 0 10px; }
  :deep(.el-card__header) { padding: 20px 20px 15px; }
  :deep(.el-card__body) { padding: 20px 25px; }
  .article-title { font-size: 1.6em; }
  .article-content { font-size: 15px; line-height: 1.7; }
}
</style>