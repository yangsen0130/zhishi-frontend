// src/stores/planet.js
import { defineStore } from 'pinia';
import { getPlanetList, getPlanetDetail } from '@/api/planet';

export const usePlanetStore = defineStore('planet', {
  state: () => ({
    planets: [],
    currentPlanet: null,
    loading: false,
  }),
  
  actions: {
    async fetchPlanets() {
      this.loading = true;
      try {
        const res = await getPlanetList();
        if (res.code === 0 && res.data) {
          this.planets = res.data;
        }
      } catch (error) {
        console.error('Fetch planets error:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchPlanetDetail(planetId) {
      this.loading = true;
      try {
        const res = await getPlanetDetail(planetId);
        if (res.code === 0 && res.data) {
          this.currentPlanet = res.data;
          return res.data;
        }
        return null;
      } catch (error) {
        console.error('Fetch planet detail error:', error);
        return null;
      } finally {
        this.loading = false;
      }
    }
  }
});