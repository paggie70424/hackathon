<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1 class="logo">LifeMetrics</h1>
    </div>
    
    <nav class="nav-links">
      <router-link to="/connected-services" class="nav-item">
        <LayoutGrid class="icon" />
        <span class="text">Connected Services</span>
      </router-link>
      
      <!-- Data Resources Section -->
      <div class="nav-group">
        <div class="nav-item group-header" @click="toggleResources" :class="{ active: isResourcesOpen }">
          <Database class="icon" />
          <span class="text">Data Resources</span>
          <ChevronDown class="chevron" :class="{ rotated: isResourcesOpen }" />
        </div>
        <div class="sub-menu" v-show="isResourcesOpen">
          <router-link to="/resources/whoop" class="nav-item sub-item">
            <span class="dot"></span>
            Whoop
          </router-link>
          <router-link to="/resources/apple-health" class="nav-item sub-item">
            <span class="dot"></span>
            Apple Watch
          </router-link>
          <router-link to="/resources/fitbit" class="nav-item sub-item">
            <span class="dot"></span>
            Fitbit
          </router-link>
          <router-link to="/resources/moodle" class="nav-item sub-item">
            <span class="dot"></span>
            Moodle
          </router-link>
          <router-link to="/resources/canvas" class="nav-item sub-item">
            <span class="dot"></span>
            Canvas
          </router-link>
        </div>
      </div>

      <router-link to="/data-permissions" class="nav-item">
        <Shield class="icon" />
        <span class="text">Data Permissions</span>
      </router-link>
      
      <router-link to="/data-insights" class="nav-item">
        <BarChart3 class="icon" />
        <span class="text">Data Insights</span>
      </router-link>
       <router-link to="/data-retention" class="nav-item">
        <Database class="icon" />
        <span class="text">Data Retention</span>
      </router-link>
      
      <router-link to="/ai-chat" class="nav-item">
        <MessageSquare class="icon" />
        <span class="text">AI Chat</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { LayoutGrid, Shield, BarChart3, Database, MessageSquare, ChevronDown } from 'lucide-vue-next'

const isResourcesOpen = ref(true) // Default open

const toggleResources = () => {
  isResourcesOpen.value = !isResourcesOpen.value
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--sidebar-border);
}

.logo {
  font-size: 1.5rem;
  color: var(--c-brand);
  margin: 0;
  font-weight: bold;
}

.nav-links {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: var(--c-text);
  transition: color 0.2s, background-color 0.2s;
  gap: 1rem;
  cursor: pointer;
  text-decoration: none;
}

.nav-item:hover {
  color: var(--c-brand);
  background-color: var(--c-bg-light);
}

.nav-item.router-link-active:not(.group-header) {
  color: var(--c-brand);
  border-right: 3px solid var(--c-brand);
  background-color: rgba(62, 175, 124, 0.1);
}

.icon {
  width: 20px;
  height: 20px;
}

.text {
  font-weight: 500;
  flex: 1;
}

/* Sub-menu Styles */
.nav-group {
  display: flex;
  flex-direction: column;
}

.group-header {
  justify-content: space-between;
}

.group-header.active {
  color: var(--c-text); /* Keep header neutral when active */
}

.chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.sub-menu {
  display: flex;
  flex-direction: column;
  background-color: rgba(0,0,0,0.02);
}

.sub-item {
  padding-left: 3rem; /* Indent sub-items */
  font-size: 0.95rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.dot {
  width: 6px;
  height: 6px;
  background-color: var(--c-text-light);
  border-radius: 50%;
  margin-right: 0.75rem;
  transition: background-color 0.2s;
}

.sub-item:hover .dot {
  background-color: var(--c-brand);
}

.sub-item.router-link-active .dot {
  background-color: var(--c-brand);
}
</style>
