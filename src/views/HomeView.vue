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
        <el-col :span="24" :lg="isAuthenticated ? 18 : 24">
          <planet-list />
        </el-col>
        
        <el-col :span="24" :lg="6" v-if="!isAuthenticated">
          <div class="auth-section">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="登录" name="login">
                <login-form 
                  @login-success="handleLoginSuccess"
                  @switch-to-register="activeTab = 'register'"
                />
              </el-tab-pane>
              <el-tab-pane label="注册" name="register">
                <register-form 
                  @register-success="handleRegisterSuccess"
                  @switch-to-login="activeTab = 'login'"
                />
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-col>
        
        <el-col :span="24" :lg="6" v-else>
          <div class="user-panel">
            <h3>欢迎，{{ username }}</h3>
            <div class="user-actions">
              <el-button type="primary" @click="$router.push('/user-center')">个人中心</el-button>
              <el-button @click="handleLogout">退出登录</el-button>
            </div>
            <div class="create-planet-section">
              <el-button type="success" @click="showCreatePlanetDialog = true">创建星球</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <!-- 创建星球对话框 -->
      <el-dialog v-model="showCreatePlanetDialog" title="创建星球" width="500px">
        <el-form ref="planetForm" :model="planetForm" :rules="planetRules" label-width="80px">
          <el-form-item label="星球名称" prop="name">
            <el-input v-model="planetForm.name" placeholder="请输入星球名称"></el-input>
          </el-form-item>
          <el-form-item label="星球描述" prop="description">
            <el-input 
              v-model="planetForm.description" 
              type="textarea" 
              rows="4"
              placeholder="请输入星球描述"
            ></el-input>
          </el-form-item>
          <el-form-item label="价格" prop="price">
            <el-input-number v-model="planetForm.price" :min="0" :precision="2"></el-input-number>
          </el-form-item>
          <el-form-item label="封面图">
            <el-upload
              class="avatar-uploader"
              action="#"
              :auto-upload="false"
              :on-change="handleCoverChange"
              :show-file-list="false"
            >
              <img v-if="planetForm.cover" :src="planetForm.cover" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showCreatePlanetDialog = false">取消</el-button>
            <el-button type="primary" @click="createPlanet" :loading="creating">创建</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, reactive } from 'vue';
  import { useUserStore } from '@/stores/user';
  import { usePlanetStore } from '@/stores/planet';
  import { ElMessage } from 'element-plus';
  import { Plus } from '@element-plus/icons-vue';
  import { createPlanet as apiCreatePlanet } from '@/api/planet';
  import { uploadImage } from '@/api/file';
  import PlanetList from '@/components/PlanetList.vue';
  import LoginForm from '@/components/LoginForm.vue';
  import RegisterForm from '@/components/RegisterForm.vue';
  
  const userStore = useUserStore();
  const planetStore = usePlanetStore();
  const activeTab = ref('login');
  const showCreatePlanetDialog = ref(false);
  const creating = ref(false);
  
  const isAuthenticated = computed(() => userStore.isAuthenticated);
  const username = computed(() => userStore.username);
  
  const planetForm = reactive({
    name: '',
    description: '',
    price: 0,
    cover: '',
    file: null,
  });
  
  const planetRules = {
    name: [
      { required: true, message: '请输入星球名称', trigger: 'blur' },
    ],
    description: [
      { required: true, message: '请输入星球描述', trigger: 'blur' },
    ],
    price: [
      { required: true, message: '请输入价格', trigger: 'blur' },
    ],
  };
  
  const handleLoginSuccess = () => {
    // 登录成功后刷新星球列表
    planetStore.fetchPlanets();
  };
  
  const handleRegisterSuccess = () => {
    ElMessage.success('注册成功，请登录');
    activeTab.value = 'login';
  };
  
  const handleLogout = () => {
    userStore.logout();
    ElMessage.success('已退出登录');
  };
  
  const handleCoverChange = (file) => {
    planetForm.file = file.raw;
    // 预览图片
    const reader = new FileReader();
    reader.readAsDataURL(file.raw);
    reader.onload = () => {
      planetForm.cover = reader.result;
    };
  };
  
  const createPlanet = async () => {
    creating.value = true;
    try {
      // 先上传封面图
      let coverUrl = '';
      if (planetForm.file) {
        const uploadRes = await uploadImage(planetForm.file);
        if (uploadRes.code === 0 && uploadRes.data && uploadRes.data.url) {
          coverUrl = uploadRes.data.url;
        } else {
          ElMessage.error('封面图上传失败');
          creating.value = false;
          return;
        }
      }
      
      // 创建星球
      const createData = {
        name: planetForm.name,
        description: planetForm.description,
        price: planetForm.price,
        cover: coverUrl,
      };
      
      const res = await apiCreatePlanet(createData);
      if (res.code === 0 && res.data) {
        ElMessage.success('星球创建成功');
        showCreatePlanetDialog.value = false;
        // 刷新星球列表
        await planetStore.fetchPlanets();
        // 重置表单
        planetForm.name = '';
        planetForm.description = '';
        planetForm.price = 0;
        planetForm.cover = '';
        planetForm.file = null;
      } else {
        ElMessage.error('星球创建失败');
      }
    } catch (error) {
      console.error('Create planet error:', error);
      ElMessage.error('星球创建出错，请稍后再试');
    } finally {
      creating.value = false;
    }
  };
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
  
  .auth-section {
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .user-panel {
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .user-actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
  }
  
  .create-planet-section {
    margin-top: 20px;
    border-top: 1px solid #eee;
    padding-top: 20px;
  }
  
  .avatar-uploader {
    width: 178px;
    height: 178px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  
  .avatar-uploader:hover {
    border-color: #409eff;
  }
  
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
  </style>