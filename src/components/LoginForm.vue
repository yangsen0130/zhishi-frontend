<!-- src/components/LoginForm.vue -->
<template>
  <div class="login-form">
    <h2>登录</h2>
    <el-form ref="loginForm" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input 
          v-model="form.password" 
          type="password" 
          placeholder="请输入密码"
          show-password
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="loading">登录</el-button>
        <el-button @click="$emit('switch-to-register')">注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const emit = defineEmits(['login-success', 'switch-to-register']);
const userStore = useUserStore();
const loginForm = ref(null);
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' },
  ],
};

const submitForm = async () => {
  if (!loginForm.value) return;
  
  await loginForm.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const result = await userStore.login(form);
        if (result) {
          ElMessage.success('登录成功');
          emit('login-success');
        } else {
          ElMessage.error('登录失败，请检查用户名和密码');
        }
      } catch (error) {
        console.error('Login error:', error);
        ElMessage.error('登录出错，请稍后再试');
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 4px;
  background-color: #f9f9f9;
}
</style>