<!-- src/components/PlanetList.vue -->
<template>
    <div class="planet-list">
      <h2 class="section-title">发现星球</h2>
      <el-row :gutter="20">
        <el-col 
          v-for="planet in planets" 
          :key="planet.id" 
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6"
        >
          <planet-card :planet="planet" />
        </el-col>
      </el-row>
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-if="!loading && planets.length === 0" class="empty-container">
        <el-empty description="暂无星球，快来创建第一个吧！" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { usePlanetStore } from '@/stores/planet';
  import PlanetCard from './PlanetCard.vue';
  
  const planetStore = usePlanetStore();
  const planets = ref([]);
  const loading = ref(true);
  
  onMounted(async () => {
    await fetchPlanets();
  });
  
  const fetchPlanets = async () => {
    loading.value = true;
    try {
      await planetStore.fetchPlanets();
      planets.value = planetStore.planets;
    } catch (error) {
      console.error('Error fetching planets:', error);
    } finally {
      loading.value = false;
    }
  };
  </script>
  
  <style scoped>
  .planet-list {
    margin-top: 20px;
  }
  
  .section-title {
    margin-bottom: 20px;
    padding-left: 10px;
    border-left: 4px solid #409eff;
  }
  
  .loading-container, .empty-container {
    margin-top: 40px;
    text-align: center;
  }
  </style>