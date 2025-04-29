<!-- src/components/PlanetCard.vue -->
<template>
  <el-card class="planet-card" :body-style="{ padding: '0px' }" shadow="hover">
    <img :src="planet.cover || defaultCover" class="planet-cover" />
    <div class="planet-info">
      <h3 class="planet-name">{{ planet.name }}</h3>
      <p class="planet-description">{{ formatDescription(planet.description) }}</p>
      <div class="planet-footer">
        <span class="planet-price">¥{{ planet.price }}</span>
        <el-button type="primary" size="small" @click="viewDetail">查看详情</el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  planet: {
    type: Object,
    required: true,
  },
});

const router = useRouter();
const defaultCover = '/default-cover.jpg';

const formatDescription = (description) => {
  if (!description) return '暂无描述';
  return description.length > 100 ? description.substring(0, 100) + '...' : description;
};

const viewDetail = () => {
  router.push({ name: 'PlanetDetail', params: { id: props.planet.id } });
};
</script>

<style scoped>
.planet-card {
  width: 100%;
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.planet-card:hover {
  transform: translateY(-5px);
}

.planet-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.planet-info {
  padding: 15px;
}

.planet-name {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: bold;
}

.planet-description {
  color: #666;
  margin-bottom: 10px;
  height: 60px;
  overflow: hidden;
}

.planet-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.planet-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}
</style>