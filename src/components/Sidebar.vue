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
import { LayoutGrid, Shield, BarChart3, Database, MessageSquare } from 'lucide-vue-next'
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
}

.nav-item:hover {
  color: var(--c-brand);
  background-color: var(--c-bg-light);
}

.nav-item.router-link-active {
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
}
</style>
