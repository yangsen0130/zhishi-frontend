<!-- src/views/CreateArticleView.vue -->
<template>
  <div class="create-article-view">
    <el-card class="article-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>创建文章</span>
        </div>
      </template>

      <el-form :model="articleForm" label-position="top" @submit.prevent="handleSubmit">
        <el-form-item label="标题" prop="title">
          <el-input v-model="articleForm.title" placeholder="请输入文章标题" />
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <div class="editor-container">
            <MdEditor 
              v-model="articleForm.content" 
              :theme="theme"
              :toolbars="toolbars"
              @on-upload-img="handleUploadImg"
              placeholder="请输入文章内容"
            />
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">发布文章</el-button>
          <el-button @click="$router.push('/')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { createArticle } from '@/api/article';
import { uploadImage } from '@/api/file';

const router = useRouter();
const submitting = ref(false);

// 编辑器主题：light或dark
const theme = ref('light');

// 添加需要的工具栏按钮
const toolbars = [
  'bold', 'underline', 'italic', 
  '-', 
  'title', 'strikethrough', 'sub', 'sup', 'quote', 'unordered-list', 'ordered-list',
  '-',
  'code', 'link', 'image', 'table', 'mermaid',
  '-',
  'preview', 'fullscreen'
];

const articleForm = reactive({
  title: '',
  content: '',
});

// 处理图片上传
const handleUploadImg = async (files, callback) => {
  const res = [];
  
  try {
    for (let file of files) {
      const response = await uploadImage(file);
      // 假设后端返回的数据结构为 { url: '图片URL' }
      if (response.data && response.data.url) {
        res.push(response.data.url);
      }
    }
    // 将图片URL返回给编辑器
    callback(res);
  } catch (error) {
    console.error('上传图片失败:', error);
    ElMessage.error('上传图片失败，请重试');
  }
};

// 提交文章
const handleSubmit = async () => {
  // 基本表单验证
  if (!articleForm.title.trim()) {
    return ElMessage.warning('请输入文章标题');
  }
  
  if (!articleForm.content.trim()) {
    return ElMessage.warning('请输入文章内容');
  }
  
  submitting.value = true;
  
  try {
    await createArticle({
      title: articleForm.title,
      content: articleForm.content,
    });
    
    ElMessage.success('发布成功');
    
    // 发布成功后跳转到首页
    router.push('/');
  } catch (error) {
    console.error('发布文章失败:', error);
    ElMessage.error('发布失败，请重试');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.create-article-view {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 15px;
}

.article-card {
  border: none;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  font-size: 1.2em;
  font-weight: bold;
  color: #303133;
}

.editor-container {
  margin-bottom: 20px;
}

/* 适配不同屏幕尺寸 */
@media (max-width: 768px) {
  .create-article-view {
    padding: 0 10px;
  }
}
</style> 