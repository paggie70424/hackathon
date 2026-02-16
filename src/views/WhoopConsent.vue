<template>
  <div class="consent-page">
    <div class="consent-card">
      <div class="logos">
        <div class="logo app-logo">LifeMetrics</div>
        <div class="connection-line"></div>
        <div class="logo whoop-logo">WHOOP</div>
      </div>
      
      <h1>Authorize Connection</h1>
      <p class="description">
        <strong>LifeMetrics Dashboard</strong> would like to access your Whoop data to provide insights on your recovery and academic performance.
      </p>

      <ul class="permissions-list">
        <li>View your profile information</li>
        <li>Read your recovery, strain, and sleep data</li>
        <li>Sync data periodically</li>
      </ul>

      <div class="actions">
        <button class="btn-cancel" @click="cancel">Cancel</button>
        <button class="btn-authorize" @click="authorize" :disabled="authorizing">
          {{ authorizing ? 'Authorizing...' : 'Authorize' }}
        </button>
      </div>
      
      <p class="secure-note">
        <span class="lock-icon">🔒</span> Secure Connection via OAuth 2.0 simulation
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authorizing = ref(false)

const authorize = () => {
  authorizing.value = true
  // Simulate delay then redirect to backend callback
  setTimeout(() => {
    window.location.href = 'http://localhost:3001/api/auth/whoop/callback?code=mock_auth_code_xyz'
  }, 1500)
}

const cancel = () => {
  router.push('/connected-services')
}
</script>

<style scoped>
.consent-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 1rem;
}

.consent-card {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.logos {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.logo {
  font-weight: 800;
  font-size: 1.5rem;
  padding: 1rem;
  border-radius: 12px;
}

.app-logo {
  background-color: var(--c-brand);
  color: white;
}

.whoop-logo {
  background-color: #cd3838;
  color: white;
}

.connection-line {
  height: 2px;
  width: 50px;
  background: #ddd;
  position: relative;
}

.connection-line::after {
  content: '⇄';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 0 5px;
  color: #888;
}

h1 {
  margin-bottom: 1rem;
  color: var(--c-text);
}

.description {
  color: var(--c-text-light);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.permissions-list {
  text-align: left;
  margin: 0 auto 2.5rem;
  max-width: 350px;
  background: #f9f9f9;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  list-style-type: disc;
}

.permissions-list li {
  margin-bottom: 0.5rem;
  color: var(--c-text);
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

button {
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-authorize {
  background-color: #cd3838; /* Whoop brand color-ish */
  color: white;
}

.btn-authorize:hover {
  background-color: #b02a2a;
}

.btn-authorize:disabled {
  opacity: 0.7;
  cursor: wait;
}

.btn-cancel {
  background-color: transparent;
  border: 1px solid #ddd;
  color: var(--c-text);
}

.btn-cancel:hover {
  background-color: #f5f5f5;
}

.secure-note {
  font-size: 0.85rem;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
</style>
