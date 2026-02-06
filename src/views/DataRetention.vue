<template>
  <div class="data-retention">
    <div class="page-header">
      <h1 class="page-title">Data Retention</h1>
      <p class="page-subtitle">Manage how long your data is stored on our servers.</p>
    </div>

    <div class="settings-card">
      <div class="setting-item">
        <label class="setting-label">Retention Period</label>
        <p class="setting-desc">Choose how long your personal data is kept before being automatically deleted.</p>
        
        <div class="options-group">
          <label class="radio-option" :class="{ active: period === '6m' }">
            <input type="radio" v-model="period" value="6m">
            <span class="option-title">6 Months</span>
          </label>
          
          <label class="radio-option" :class="{ active: period === '1y' }">
            <input type="radio" v-model="period" value="1y">
            <span class="option-title">1 Year</span>
          </label>
          
          <label class="radio-option" :class="{ active: period === 'forever' }">
            <input type="radio" v-model="period" value="forever">
            <span class="option-title">Forever</span>
          </label>
        </div>
      </div>

      <div class="actions">
        <button class="btn-primary" @click="saveSettings" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Settings' }}
        </button>
        <p v-if="message" class="status-message">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const period = ref('forever')
const saving = ref(false)
const message = ref('')

const saveSettings = () => {
  saving.value = true
  message.value = ''
  
  // Simulate API call
  setTimeout(() => {
    saving.value = false
    message.value = 'Settings saved successfully.'
    setTimeout(() => message.value = '', 3000)
  }, 1000)
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

.settings-card {
  background: var(--c-bg);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--c-border);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  max-width: 600px;
}

.setting-label {
  display: block;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.setting-desc {
  color: var(--c-text-light);
  margin-bottom: 1.5rem;
}

.options-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.radio-option {
  flex: 1;
  border: 2px solid var(--c-border);
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.radio-option:hover {
  border-color: var(--c-brand-light);
}

.radio-option.active {
  border-color: var(--c-brand);
  background-color: rgba(62, 175, 124, 0.05);
  color: var(--c-brand);
  font-weight: 600;
}

.radio-option input {
  display: none;
}

.btn-primary {
  padding: 0.75rem 2rem;
  background-color: var(--c-brand);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: var(--c-brand-light);
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.status-message {
  margin-top: 1rem;
  color: var(--c-brand);
  font-weight: 500;
}
</style>
