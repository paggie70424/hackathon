<template>
  <div class="placeholder-view">
    <div class="content">
      <div class="icon-wrapper fitbit">
        <Activity class="icon" />
      </div>
      <h1>Fitbit Integration</h1>
      <p>Sync your steps, sleep, and heart rate data from your Fitbit device.</p>
      <button class="connect-btn">Connect Fitbit</button>
    </div>
  </div>
</template>

<script setup>
import { Activity } from 'lucide-vue-next';
</script>

<style scoped>
.placeholder-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  text-align: center;
}

.content {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  max-width: 500px;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.icon-wrapper.fitbit {
  background-color: rgba(0, 181, 185, 0.1);
  color: #00B0B9;
}

.icon {
  width: 40px;
  height: 40px;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--c-text);
}

p {
  color: var(--c-text-light);
  margin-bottom: 2rem;
}

.connect-btn {
  background-color: #00B0B9;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.connect-btn:hover {
  opacity: 0.9;
}
</style>
