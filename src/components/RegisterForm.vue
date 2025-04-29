<!-- src/components/RegisterForm.vue -->
<template>
  <div class="register-form">
    <h2>注册</h2>
    <el-form ref="registerForm" :model="form" :rules="rules" label-width="80px">
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
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="loading">注册</el-button>
        <el-button @click="$emit('switch-to-login')">已有账号，去登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const emit = defineEmits(['register-success', 'switch-to-login']);
const userStore = useUserStore();
const registerForm = ref(null);
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
  email: '',
  phone: '',
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
};

const submitForm = async () => {
  if (!registerForm.value) return;
  
  await registerForm.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const result = await userStore.register(form);
        if (result) {
          ElMessage.success('注册成功，请登录');
          emit('register-success');
          emit('switch-to-login');
        } else {
          ElMessage.error('注册失败，请稍后再试');
        }
      } catch (error) {
        console.error('Register error:', error);
        ElMessage.error('注册出错，请稍后再试');
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 4px;
  background-color: #f9f9f9;
}
</style>