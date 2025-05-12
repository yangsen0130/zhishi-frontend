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
          <span v-if="article.authorName" class="meta-item"> <!-- Changed from article.author.username -->
            <el-icon><User /></el-icon> 作者: {{ article.authorName }}
          </span>
          <span v-if="article.createTime" class="meta-item"> <!-- Changed from article.createdAt -->
            <el-icon><Clock /></el-icon> 发布于: {{ formatDate(article.createTime) }}
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
        <!-- 预览内容可以根据后端返回的 articlePreview.content 来决定是否显示 -->
        <div v-if="articlePreview.content" class="preview-content" v-html="articlePreview.content.substring(0, 200) + '...'"></div>
        
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
import { createOrder } from '@/api/order';
// import { getPaymentUrl } from '@/api/pay'; // No longer needed as we construct URL directly
import api from '@/api/index'; // Import the axios instance to get baseURL
import { useUserStore } from '@/stores/user';
import { ElCard, ElSkeleton, ElEmpty, ElMessage, ElIcon, ElButton, ElLink } from 'element-plus';
import { User, Clock } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const article = ref(null);
const articlePreview = ref(null);
const loading = ref(true);
const purchaseLoading = ref(false);

const hasPermission = ref(false);
const showPurchaseSection = ref(false);
const loadErrorText = ref('文章加载失败或不存在');

const articleId = computed(() => route.params.id);

watch(
  () => route.query,
  (newQuery, oldQuery) => {
    // Only react if 'paid' query parameter changes or appears
    if (newQuery.paid && newQuery.paid !== oldQuery?.paid) {
      if (newQuery.paid === 'true' && newQuery.order_id) {
        ElMessage.success('支付成功！正在加载文章...');
        fetchArticleDetail(true); // Force refresh
      } else if (newQuery.paid === 'false' && newQuery.order_id) {
        ElMessage.error(newQuery.error_msg || '支付失败或已取消。');
      }
      // Clean up query parameters after processing
      // Use a slight delay to ensure message is visible if needed, then clean URL
      setTimeout(() => {
        const currentPath = route.path;
        // Create a new query object excluding the processed payment params
        const queryWithoutPaymentParams = { ...route.query };
        delete queryWithoutPaymentParams.paid;
        delete queryWithoutPaymentParams.order_id;
        delete queryWithoutPaymentParams.error_msg; // Also remove error_msg
        router.replace({ path: currentPath, query: queryWithoutPaymentParams });
      }, 100); // Delay to allow messages to be seen
    }
  },
  { deep: true } // Use deep watch if query object structure might be complex, though usually not needed for flat query params
);

onMounted(async () => {
  if (articleId.value) {
    // Initial check for query params on mount, handled by watch now
    // if (route.query.paid === 'true' && route.query.order_id) {
    //   // This case will be handled by the watcher now
    // } else if (route.query.paid === 'false' && route.query.order_id) {
    //   // This case will be handled by the watcher now
    // }
    await fetchArticleDetail();
  } else {
    loading.value = false;
    loadErrorText.value = '无效的文章ID';
    ElMessage.error('无效的文章ID');
  }
});

const fetchArticleDetail = async (forceRefresh = false) => {
  if (!articleId.value) return;
  loading.value = true;
  hasPermission.value = false;
  showPurchaseSection.value = false;

  try {
    // Pass a cache-busting parameter if forceRefresh is true
    const params = forceRefresh ? { _t: Date.now() } : {};
    const res = await getArticleDetail(articleId.value, { params });
    
    if (res.code === 200 && res.data) {
      if (res.data.hasFullAccess) {
        article.value = res.data;
        articlePreview.value = null;
        hasPermission.value = true;
      } else {
        article.value = null;
        articlePreview.value = res.data;
        showPurchaseSection.value = true;
      }
    } else if (res.code === Code.ARTICLE_NOT_EXIST || res.code === 5000) { // Check against imported Code enum or hardcoded value
      article.value = null;
      articlePreview.value = null;
      loadErrorText.value = '文章不存在';
      ElMessage.error(loadErrorText.value);
    } else {
      article.value = null;
      articlePreview.value = null;
      loadErrorText.value = res.message || '获取文章详情失败';
      ElMessage.error(loadErrorText.value);
    }
  } catch (error) {
    console.error('Error fetching article detail:', error);
    article.value = null;
    articlePreview.value = null;
    loadErrorText.value = '加载文章详情时出错';
    if (error.response && error.response.data && error.response.data.data && error.response.data.data.hasFullAccess === false) {
        articlePreview.value = error.response.data.data;
        showPurchaseSection.value = true;
        loadErrorText.value = '请购买以查看全文'; // More specific message
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
    const createOrderResponse = await createOrder(orderData);

    if (createOrderResponse.code === 200 && createOrderResponse.data && createOrderResponse.data.orderId && createOrderResponse.data.payUrl) {
      // payUrl from backend is relative to the order service, e.g., "/order/pay?orderId=..."
      // We need to construct the full URL for the gateway
      // api.defaults.baseURL is like "http://localhost:9100/api"
      // The gateway route for order service is "/api/order/**" which strips "/api"
      // So, the target URL for the browser is GATEWAY_BASE_URL + backend_relative_payUrl
      // Example: "http://localhost:9100/api" + "/order/pay?orderId=xyz"
      // Result: "http://localhost:9100/api/order/pay?orderId=xyz"

      const fullPayUrl = api.defaults.baseURL + createOrderResponse.data.payUrl;
      
      // Directly navigate the browser to the URL that serves the Alipay form
      window.location.href = fullPayUrl;

    } else {
      ElMessage.error(createOrderResponse.message || '创建订单失败，请稍后再试。');
    }
  } catch (error) {
    console.error('Purchase error:', error);
    const errorMsg = error.response?.data?.message || '购买过程中发生错误，请稍后再试。';
    ElMessage.error(errorMsg);
  } finally {
    purchaseLoading.value = false;
  }
};

const promptLogin = () => {
  // Assuming App.vue exposes a way to show login dialog, or userStore handles it
  // For simplicity, let's assume userStore has an action for this
  // This part depends on how you've structured your global login dialog visibility
  // A common way is to have a ref in App.vue and a Pinia action to toggle it.
  // If your userStore.showLoginDialogAction() is not defined, you need to implement it.
  // Example: userStore.toggleLoginDialog(true);
  ElMessage.info('请先登录后再进行购买。');
  // router.push({ name: 'Login' }); // Or redirect to a login page
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleString('zh-CN', { hour12: false }); 
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
  border: 1px solid #eee;
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