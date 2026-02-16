<template>
  <div class="apple-consent-page">
    <div class="consent-card">
      <div class="header">
        <div class="icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none" class="apple-icon" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 12C17.5 15.0376 20.0376 17.5 23.0751 17.5C23.3308 17.5 23.5789 17.4767 23.8195 17.4323C23.2383 20.2474 21.0504 22.5805 18.2323 23.5188C15.8647 24.3075 13.5662 23.2985 12 21.6707C10.4338 23.2985 8.13534 24.3075 5.76767 23.5188C2.94962 22.5805 0.761654 20.2474 0.180451 17.4323C0.421053 17.4767 0.669173 17.5 0.924812 17.5C3.96241 17.5 6.5 15.0376 6.5 12C6.5 8.96241 3.96241 6.5 0.924812 6.5C0.669173 6.5 0.421053 6.52331 0.180451 6.56767C0.761654 3.75263 2.94962 1.41955 5.76767 0.481203C8.13534 -0.307519 10.4338 0.701504 12 2.32932C13.5662 0.701504 15.8647 -0.307519 18.2323 0.481203C21.0504 1.41955 23.2383 3.75263 23.8195 6.56767C23.5789 6.52331 23.3308 6.5 23.0751 6.5C20.0376 6.5 17.5 8.96241 17.5 12Z" fill="#FA2D48"/>
          </svg>
        </div>
        <h1>Health Access</h1>
      </div>
      
      <p class="description">
        <strong>LifeMetrics</strong> would like to access your health data.
      </p>

      <div class="permissions">
        <div class="permission-item">
          <div class="toggle-row">
            <span>All Categories</span>
            <div class="toggle on"></div>
          </div>
        </div>
        
        <div class="permission-group">
          <h3>READ ACCESS</h3>
           <div class="permission-item">
            <div class="toggle-row">
              <span>Walking + Running Distance</span>
              <div class="toggle on"></div>
            </div>
          </div>
          <div class="permission-item">
            <div class="toggle-row">
              <span>Heart Rate</span>
              <div class="toggle on"></div>
            </div>
          </div>
           <div class="permission-item">
            <div class="toggle-row">
              <span>Sleep Analysis</span>
              <div class="toggle on"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <button class="btn-link" @click="cancel">Don't Allow</button>
        <button class="btn-link bold" @click="authorize">Allow</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const authorize = () => {
    // Simulate iOS native transition
    setTimeout(() => {
        window.location.href = 'http://localhost:3001/api/auth/apple/callback?code=mock_apple_code_123'
    }, 800)
}

const cancel = () => {
  router.push('/connected-services')
}
</script>

<style scoped>
.apple-consent-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  padding: 1rem;
}

.consent-card {
  background: #1c1c1e;
  padding: 0;
  border-radius: 14px;
  width: 100%;
  max-width: 375px;
  overflow: hidden;
  color: white;
}

.header {
  padding: 2rem 1.5rem 1rem;
  text-align: center;
}

.icon-wrapper {
  margin-bottom: 1rem;
}

.apple-icon {
  width: 60px;
  height: 60px;
}

h1 {
  font-size: 1.7rem;
  font-weight: 700;
  margin: 0;
}

.description {
  text-align: left;
  padding: 0 1.5rem;
  font-size: 1rem;
  margin-bottom: 2rem;
  line-height: 1.4;
}

.permissions {
  background: #2c2c2e;
  margin: 0;
}

.permission-group h3 {
  padding: 1rem 1rem 0.5rem;
  font-size: 0.8rem;
  color: #8e8e93;
  font-weight: 400;
}

.permission-item {
  padding: 1rem;
  border-bottom: 1px solid #3a3a3c;
}

.permission-item:last-child {
  border-bottom: none;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
}

.toggle {
  width: 51px;
  height: 31px;
  background: #39393d;
  border-radius: 31px;
  position: relative;
}

.toggle.on {
  background: #34c759;
}

.toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 27px;
  height: 27px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 3px 8px rgba(0,0,0,0.15);
  transition: transform 0.2s;
}

.toggle.on::after {
  transform: translateX(20px);
}

.footer {
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  margin-top: 1rem;
  padding-bottom: 2rem;
}

.btn-link {
  background: none;
  border: none;
  color: #0a84ff;
  font-size: 1.1rem;
  cursor: pointer;
}

.btn-link.bold {
  font-weight: 600;
}
</style>
