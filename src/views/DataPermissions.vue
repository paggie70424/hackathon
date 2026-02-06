<template>
  <div class="data-permissions">
    <div class="page-header">
      <h1 class="page-title">Data Permissions</h1>
      <p class="page-subtitle">Control who has access to your data and how it is shared.</p>
    </div>

    <!-- Active Sharing Section -->
    <div class="section-card">
      <h2 class="section-title">
        <Shield class="section-icon" /> Service Permissions
      </h2>
      <p class="section-desc">Manage data sharing for your connected services.</p>
      
      <div class="permissions-list">
        <div v-for="service in services" :key="service.id" class="permission-item">
          <div class="permission-info">
            <h3 class="permission-name">{{ service.name }}</h3>
            <p class="permission-status">
              Status: <span :class="service.allowShare ? 'text-success' : 'text-danger'">{{ service.allowShare ? 'Sharing Active' : 'Not Shared' }}</span>
            </p>
          </div>
          
          <label class="toggle-switch">
            <input type="checkbox" v-model="service.allowShare">
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </div>

    <!-- Share with New User Section -->
    <div class="section-card">
      <h2 class="section-title">
        <UserPlus class="section-icon" /> Share Access
      </h2>
      <p class="section-desc">Grant access to your data to a trusted individual.</p>
      
      <div class="share-form">
        <div class="input-group">
          <input 
            type="email" 
            v-model="emailInput" 
            placeholder="Enter email address" 
            class="form-input"
          >
          <button class="btn-primary" @click="inviteUser" :disabled="!emailInput">
            Send Invitation
          </button>
        </div>
        <p v-if="inviteStatus" class="status-message">{{ inviteStatus }}</p>
      </div>

      <div class="shared-users" v-if="sharedUsers.length > 0">
        <h3 class="subsection-title">Currently Shared With</h3>
        <ul class="users-list">
          <li v-for="(user, index) in sharedUsers" :key="index" class="user-item">
            <div class="user-avatar">{{ user.charAt(0).toUpperCase() }}</div>
            <span class="user-email">{{ user }}</span>
            <button class="btn-icon" @click="removeUser(index)">
              <Trash2 class="icon-sm" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Shield, UserPlus, Trash2 } from 'lucide-vue-next'

const services = ref([
  { id: 'whoop', name: 'Whoop Fitness Data', allowShare: true },
  { id: 'canvas', name: 'Canvas School Records', allowShare: false },
  { id: 'school', name: 'Academic Transcripts', allowShare: false },
  { id: 'health', name: 'Apple Health', allowShare: true }
])

const emailInput = ref('')
const inviteStatus = ref('')
const sharedUsers = ref(['advisor@university.edu'])

const inviteUser = () => {
  if (emailInput.value) {
    // Simulate API call
    setTimeout(() => {
      sharedUsers.value.push(emailInput.value)
      inviteStatus.value = `Invitation sent to ${emailInput.value}`
      emailInput.value = ''
      setTimeout(() => inviteStatus.value = '', 3000)
    }, 500)
  }
}

const removeUser = (index) => {
  sharedUsers.value.splice(index, 1)
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

.section-card {
  background: var(--c-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--c-border);
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--c-text);
}

.section-icon {
  color: var(--c-brand);
}

.section-desc {
  color: var(--c-text-light);
  margin-bottom: 2rem;
}

/* Permissions List */
.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.permission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--c-bg-light);
  border-radius: 8px;
}

.permission-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.permission-status {
  font-size: 0.9rem;
  color: var(--c-text-light);
}

.text-success { color: var(--c-brand); font-weight: 500; }
.text-danger { color: #e74c3c; font-weight: 500; }

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.toggle-switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .2s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--c-brand);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

/* Share Form */
.share-form {
  margin-bottom: 2rem;
}

.input-group {
  display: flex;
  gap: 1rem;
}

.form-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--c-brand);
}

.btn-primary {
  padding: 0 1.5rem;
  background-color: var(--c-brand);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
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
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--c-brand);
}

/* Shared Users List */
.subsection-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--c-text);
}

.users-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: var(--c-bg-light);
  border-radius: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background-color: var(--c-brand);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.user-email {
  flex: 1;
  font-weight: 500;
}

.btn-icon {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-icon:hover {
  opacity: 1;
}

.icon-sm {
  width: 18px;
  height: 18px;
}
</style>
