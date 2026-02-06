<template>
  <header class="header">
    <div class="header-content">
      <div class="right-section">
        <router-link to="/about" class="header-link">About Us</router-link>
        <a href="#" class="header-link" @click.prevent="openAuth('signin')">Sign In</a>
        <button class="header-link account-btn" @click="openAuth('signup')">Sign Up</button>
      </div>
    </div>

    <!-- Auth Modal -->
    <transition name="modal">
      <AuthModal 
        v-if="showAuth" 
        :initial-mode="authMode" 
        @close="showAuth = false"
        @success="handleAuthSuccess" 
      />
    </transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import AuthModal from './AuthModal.vue'

const showAuth = ref(false)
const authMode = ref('signin')

const openAuth = (mode) => {
  authMode.value = mode
  showAuth.value = true
}

const handleAuthSuccess = (userData) => {
  showAuth.value = false
  // Ideally, update global state/user store here
  alert(`Welcome, ${userData.firstName || userData.email}!`)
}
</script>

<style scoped>
.header {
  height: 4rem;
  background-color: var(--c-bg);
  border-bottom: 1px solid var(--c-border);
  position: sticky;
  top: 0;
  z-index: 5;
  padding: 0 2rem;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.header-link {
  color: var(--c-text);
  font-weight: 500;
  font-size: 0.9rem;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: color 0.2s;
}

.header-link:hover {
  color: var(--c-brand);
}

.account-btn {
  padding: 0.5rem 1rem;
  background-color: var(--c-brand);
  color: white;
  border-radius: 4px;
}

.account-btn:hover {
  background-color: var(--c-brand-light);
  color: white;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
