<template>
  <div class="user-center-view">
    <el-card class="profile-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>

      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="user" class="user-profile">
        <el-row :gutter="20" align="middle">
          <el-col :xs="24" :sm="6" :md="4" class="avatar-col">
            <el-avatar :size="100" :src="user.avatar || defaultAvatar" />
          </el-col>
          <el-col :xs="24" :sm="18" :md="20" class="info-col">
            <h2 class="username">{{ user.username }}</h2>
            <el-descriptions :column="1" border class="user-details">
              <el-descriptions-item label="用户ID">{{ user.id || 'N/A' }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ user.email || '未设置' }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ user.phone || '未设置' }}</el-descriptions-item>
              <!-- 可以根据需要添加更多用户信息，例如注册时间等 -->
              <!-- <el-descriptions-item label="注册时间">{{ formatDate(user.createdAt) }}</el-descriptions-item> -->
            </el-descriptions>
          </el-col>
        </el-row>
        
        <!-- 未来可以添加其他功能区域，如：我的文章、我的收藏、设置等 -->
        <!-- 
        <el-divider />
        <div class="user-actions">
          <el-button type="primary">编辑资料</el-button>
          <el-button>修改密码</el-button>
        </div> 
        -->
      </div>
      
      <div v-else class="error-state">
        <el-empty description="无法加载用户信息" />
      </div>

    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { ElCard, ElRow, ElCol, ElAvatar, ElDescriptions, ElDescriptionsItem, ElSkeleton, ElEmpty, ElDivider, ElButton, ElMessage } from 'element-plus';

const userStore = useUserStore();
const loading = ref(true);
const defaultAvatar = '/default-avatar.jpg'; // 确保这个默认头像存在于 public 目录下

// 使用 computed 属性确保响应性
const user = computed(() => userStore.user);

onMounted(async () => {
  // 检查用户信息是否已加载，如果没有，尝试重新获取
  if (!user.value && userStore.isAuthenticated) {
    try {
      await userStore.fetchUserInfo();
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      ElMessage.error('获取用户信息失败');
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false; // 如果用户信息已存在或用户未认证，则停止加载
  }
});

// 可选：格式化日期函数
// const formatDate = (dateString) => {
//   if (!dateString) return 'N/A';
//   try {
//     return new Date(dateString).toLocaleDateString();
//   } catch (e) {
//     return dateString;
//   }
// };

</script>

<style scoped>
.user-center-view {
  max-width: 900px; /* 限制最大宽度，使其居中 */
  margin: 20px auto; /* 上下边距 20px，左右自动居中 */
  padding: 0 15px; /* 在小屏幕上添加一些左右内边距 */
}

.profile-card {
  border: none; /* 移除默认边框，更简洁 */
  background-color: #fff; /* 明确背景色 */
  border-radius: 8px; /* 轻微圆角 */
  overflow: hidden; /* 确保内容不溢出圆角 */
}

.card-header {
  font-size: 1.2em;
  font-weight: bold;
  color: #303133;
}

.user-profile {
  padding: 20px;
}

.avatar-col {
  display: flex;
  justify-content: center; /* 头像水平居中 */
  align-items: center;
  margin-bottom: 20px; /* 在小屏幕上与下方信息保持距离 */
}

.el-avatar {
  border: 2px solid #eee; /* 给头像添加一个细边框 */
}

.info-col {
  text-align: left; /* 信息列左对齐 */
}

.username {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.8em;
  color: #303133;
}

.user-details {
  margin-top: 10px;
}

/* Element Plus Descriptions 样式微调 */
:deep(.el-descriptions__label) {
  font-weight: bold;
  color: #606266;
  width: 100px; /* 固定标签宽度 */
}

:deep(.el-descriptions__content) {
  color: #303133;
}

.loading-state, .error-state {
  padding: 40px 20px;
  text-align: center;
}

.user-actions {
  margin-top: 20px;
  text-align: right;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .info-col {
    text-align: center; /* 在小屏幕上信息也居中 */
  }
  .username {
    font-size: 1.5em;
  }
  .user-details {
     /* 让描述列表在小屏幕上更好看 */
    :deep(.el-descriptions__body) {
      display: block; 
    }
     :deep(.el-descriptions__row) {
      display: flex;
      flex-direction: column;
      margin-bottom: 10px;
    }
     :deep(.el-descriptions__cell) {
      padding-bottom: 5px;
      border-bottom: 1px dashed #eee; /* 添加分隔线 */
    }
     :deep(.el-descriptions__label) {
       width: auto; /* 标签宽度自适应 */
       margin-bottom: 5px;
    }
  }
  .user-actions {
    text-align: center; /* 按钮居中 */
  }
}
</style>