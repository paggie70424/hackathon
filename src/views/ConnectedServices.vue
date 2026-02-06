<template>
  <div class="connected-services">
    <div class="page-header">
      <h1 class="page-title">Connected Services</h1>
      <p class="page-subtitle">Manage your data sources and integrations.</p>
    </div>

    <div class="services-grid">
      <div v-for="service in services" :key="service.id" class="service-card">
        <div class="card-header">
          <div class="icon-wrapper" :style="{ backgroundColor: service.bgColor }">
            <component :is="service.icon" class="service-icon" :style="{ color: service.color }" />
          </div>
          <span class="status-badge" :class="{ connected: service.connected }">
            {{ service.connected ? 'Connected' : 'Not Connected' }}
          </span>
        </div>
        
        <h3 class="service-name">{{ service.name }}</h3>
        <p class="service-description">{{ service.description }}</p>
        
        <button 
          class="action-btn" 
          :class="{ 'btn-outline': service.connected, 'btn-primary': !service.connected }"
          @click="toggleConnection(service)"
        >
          {{ service.connected ? 'Disconnect' : 'Connect' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Activity, BookOpen, Building2, Smartphone, Calendar, Hash } from 'lucide-vue-next'

const services = ref([
  {
    id: 'whoop',
    name: 'Whoop',
    description: 'Fitness and health tracking data integration.',
    icon: Activity,
    color: '#e74c3c',
    bgColor: '#fdezea',
    connected: true
  },
  {
    id: 'canvas',
    name: 'Canvas',
    description: 'Educational course management system data.',
    icon: BookOpen,
    color: '#e67e22',
    bgColor: '#fdf6e3',
    connected: true
  },
  {
    id: 'school',
    name: 'School System',
    description: 'Official academic records and administrative data.',
    icon: Building2,
    color: '#3498db',
    bgColor: '#e8f6f3',
    connected: false
  },
  {
    id: 'apple-health',
    name: 'Apple Health',
    description: 'Health data from your iOS devices.',
    icon: Smartphone,
    color: '#9b59b6',
    bgColor: '#f5eef8',
    connected: false
  },
  {
    id: 'google-cal',
    name: 'Google Calendar',
    description: 'Schedule and event data integration.',
    icon: Calendar,
    color: '#2ecc71',
    bgColor: '#eafaf1',
    connected: false
  },
   {
    id: 'other',
    name: 'Custom Source',
    description: 'Connect to other compatible data sources.',
    icon: Hash,
    color: '#34495e',
    bgColor: '#ebedef',
    connected: false
  }
])

const toggleConnection = (service) => {
  service.connected = !service.connected
}
</script>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--c-text);
}

.page-subtitle {
  color: var(--c-text-light);
  font-size: 1.1rem;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.service-card {
  background: var(--c-bg);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-icon {
  width: 24px;
  height: 24px;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  background-color: var(--c-bg-light);
  color: var(--c-text-lighter);
  font-weight: 600;
}

.status-badge.connected {
  background-color: rgba(62, 175, 124, 0.1);
  color: var(--c-brand);
}

.service-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--c-text);
}

.service-description {
  color: var(--c-text-light);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  flex: 1; /* Push button to bottom */
}

.action-btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.btn-primary {
  background-color: var(--c-brand);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: var(--c-brand-light);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--c-border);
  color: var(--c-text);
}

.btn-outline:hover {
  border-color: var(--c-brand);
  color: var(--c-brand);
}
</style>
