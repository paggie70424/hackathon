<template>
  <div class="whoop-view">
    <div class="header">
      <h1>Whoop Data Dashboard</h1>
      <div class="actions">
        <button @click="downloadData" class="action-btn download-btn" :disabled="!data">
          <DownloadCloud class="icon-small" /> Download JSON
        </button>
        <button @click="refreshData" class="action-btn refresh-btn">
          <RefreshCw :class="{ 'spin': loading }" class="icon-small" /> Refresh
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>Loading your metrics...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="connectWhoop" class="connect-btn">Connect Whoop Account</button>
    </div>

    <div v-else class="dashboard-content">
      <!-- User Summary Card -->
      <div class="summary-card" v-if="data.user_profile">
        <div class="user-info">
          <img :src="data.user_profile.profile_image_url || 'https://via.placeholder.com/60'" alt="Profile Result" class="avatar" />
          <div>
            <h2>{{ data.user_profile.first_name }} {{ data.user_profile.last_name }}</h2>
            <p class="email">{{ data.user_profile.email }}</p>
          </div>
        </div>
        <div class="meta-info">
          <div class="meta-item">
            <span class="label">Last Synced</span>
            <span class="value">{{ new Date(data.synced_at).toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-btn"
          :class="{ active: currentTab === tab.id }"
          @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        
        <!-- Profile & Body Tab -->
        <div v-if="currentTab === 'profile'" class="tab-pane">
          <h3>Body Measurements</h3>
          <div class="metrics-grid">
            <div class="metric-card">
              <span class="metric-label">Height</span>
              <span class="metric-value">{{ formatHeight(data.body_measurement?.height_meter) }}</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Weight</span>
              <span class="metric-value">{{ formatWeight(data.body_measurement?.weight_kilogram) }}</span>
            </div>
             <div class="metric-card">
              <span class="metric-label">Max Heart Rate</span>
              <span class="metric-value">{{ data.body_measurement?.max_heart_rate }} BPM</span>
            </div>
          </div>
        </div>

        <!-- Sleep Tab -->
        <div v-if="currentTab === 'sleep'" class="tab-pane">
          <h3>Sleep Analysis</h3>
          <div v-if="data.sleep_data?.records?.length" class="data-table-wrapper">
             <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Efficiency</th>
                  <th>Consistency</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in data.sleep_data.records.slice(0, 10)" :key="index">
                  <td>{{ formatDate(record.created_at) }}</td>
                  <td>
                    <span class="badge" :class="getScoreClass(record.score?.sleep_performance_percentage)">
                      {{ record.score?.sleep_performance_percentage }}%
                    </span>
                  </td>
                  <td>{{ record.score?.sleep_efficiency_percentage }}%</td>
                  <td>{{ record.score?.sleep_consistency_percentage }}%</td>
                  <td>{{ formatDuration(record.score?.stage_summary?.total_in_bed_time_milli) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">No sleep data available.</div>
        </div>

        <!-- Recovery Tab -->
        <div v-if="currentTab === 'recovery'" class="tab-pane">
          <h3>Recovery Metrics</h3>
          <div v-if="data.recovery_data?.records?.length" class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Recovery Score</th>
                  <th>HRV (ms)</th>
                  <th>RHR (bpm)</th>
                  <th>SpO2</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in data.recovery_data.records.slice(0, 10)" :key="index">
                  <td>{{ formatDate(record.created_at) }}</td>
                  <td>
                     <span class="badge" :class="getScoreClass(record.score?.recovery_score)">
                      {{ record.score?.recovery_score }}%
                    </span>
                  </td>
                  <td>{{ record.score?.hrv_rmssd_milli }}</td>
                  <td>{{ record.score?.resting_heart_rate }}</td>
                  <td>{{ record.score?.spo2_percentage }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">No recovery data available.</div>
        </div>

        <!-- Cycle Tab -->
        <div v-if="currentTab === 'cycle'" class="tab-pane">
          <h3>Daily Cycles</h3>
          <div v-if="data.cycle_data?.records?.length" class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Strain</th>
                  <th>Calories</th>
                  <th>Avg HR</th>
                  <th>Max HR</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in data.cycle_data.records.slice(0, 10)" :key="index">
                  <td>{{ formatDate(record.created_at) }}</td>
                  <td>
                    <span class="strain-value">{{ record.score?.strain?.toFixed(1) }}</span>
                  </td>
                  <td>{{ record.score?.kilojoule ? (record.score.kilojoule * 0.239).toFixed(0) : '--' }} kcal</td>
                  <td>{{ record.score?.average_heart_rate }} bpm</td>
                  <td>{{ record.score?.max_heart_rate }} bpm</td>
                </tr>
              </tbody>
            </table>
          </div>
           <div v-else class="empty-state">No cycle data available.</div>
        </div>

         <!-- Workout Tab -->
        <div v-if="currentTab === 'workout'" class="tab-pane">
          <h3>Recent Workouts</h3>
          <div class="metrics-grid" v-if="data.workout_data?.records?.length">
             <div v-for="(record, index) in data.workout_data.records.slice(0, 6)" :key="index" class="metric-card workout-card">
               <div class="workout-header">
                 <span class="workout-id">ID: {{ record.sport_id }}</span>
                 <span class="workout-date">{{ formatDate(record.created_at) }}</span>
               </div>
               <div class="workout-strain">
                 <span class="label">Strain</span>
                 <span class="value">{{ record.score?.strain?.toFixed(1) }}</span>
               </div>
               <div class="workout-stats">
                  <div>
                    <span class="label">Duration</span>
                    <span>{{ formatDuration(record.score?.duration_milli) }}</span>
                  </div>
                  <div>
                    <span class="label">Zone 5</span>
                    <span>{{ formatDuration(record.score?.zone_duration?.zone_five_milli) }}</span>
                  </div>
               </div>
             </div>
          </div>
          <div v-else class="empty-state">No workout data available.</div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { whoopService } from '../../services/whoopService';
import { RefreshCw, DownloadCloud } from 'lucide-vue-next';

const loading = ref(true);
const error = ref(null);
const data = ref(null);
const currentTab = ref('profile');

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'recovery', label: 'Recovery' },
  { id: 'cycle', label: 'Cycle' },
  { id: 'workout', label: 'Workout' }
];

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    data.value = await whoopService.getWhoopData();
   // Debug log to check structure
   console.log("Whoop Data Loaded:", data.value);
  } catch (err) {
    console.error(err);
    error.value = "Failed to load Whoop data. Please ensure you are connected.";
  } finally {
    loading.value = false;
  }
};

const refreshData = async () => {
  loading.value = true;
  error.value = null;
  try {
     // Use the new refresh endpoint which actually calls Whoop API
     data.value = await whoopService.refreshWhoopData();
     console.log("Whoop Data Refreshed:", data.value);
  } catch (err) {
      console.error(err);
      error.value = "Failed to refresh data. Try reconnecting.";
  } finally {
      loading.value = false;
  }
};

const downloadData = () => {
  if (!data.value) return;
  
  const blob = new Blob([JSON.stringify(data.value, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `whoop_data_export_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

const connectWhoop = () => {
  whoopService.connectWhoop();
};

const formatHeight = (meters) => {
  if (!meters) return '--';
  return `${(meters * 3.28084).toFixed(1)} ft`; // Convert to feet
};

const formatWeight = (kg) => {
  if (!kg) return '--';
  return `${kg.toFixed(0)} kg`;
};

const formatDate = (isoString) => {
  if (!isoString) return '--';
  return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatDuration = (ms) => {
  if (!ms) return '--';
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const getScoreClass = (score) => {
    if (score >= 66) return 'score-green';
    if (score >= 33) return 'score-yellow';
    return 'score-red';
};


onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.whoop-view {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  color: var(--c-text);
  margin: 0;
}

.actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  background-color: white;
  color: var(--c-text);
  border: 1px solid var(--c-border);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: var(--c-bg-light);
  border-color: var(--c-brand);
  color: var(--c-brand);
}

.download-btn {
  background-color: var(--c-brand);
  color: white;
  border-color: var(--c-brand);
}

.download-btn:hover {
  background-color: var(--c-brand-light);
  color: white;
}

.connect-btn {
  background-color: var(--c-brand);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.icon-small {
  width: 16px;
  height: 16px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-state, .error-state {
  text-align: center;
  padding: 4rem;
  color: var(--c-text-light);
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--c-brand);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border: 1px solid var(--c-border);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--c-brand);
}

.user-info h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--c-text);
}

.email {
  color: var(--c-text-light);
  margin: 0.25rem 0 0;
}

.meta-item {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.meta-item .label {
  font-size: 0.85rem;
  color: var(--c-text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-item .value {
  font-weight: 600;
  color: var(--c-text);
}

/* Tabs */
.tabs {
  display: flex;
  border-bottom: 1px solid var(--c-border);
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--c-text-light);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn.active {
  color: var(--c-brand);
  border-bottom-color: var(--c-brand);
  font-weight: 600;
}

.tab-btn:hover:not(.active) {
  color: var(--c-text);
}

/* Grids & Cards */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  text-align: center;
  border: 1px solid var(--c-border);
  transition: transform 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.metric-label {
  display: block;
  font-size: 0.9rem;
  color: var(--c-text-light);
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--c-brand);
}

/* Workout Cards */
.workout-card {
  text-align: left;
}

.workout-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: var(--c-text-light);
}

.workout-strain {
  margin-bottom: 1rem;
}

.workout-strain .value {
  font-size: 2rem;
  color: var(--c-text);
}

.workout-stats {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
}

.workout-stats .label {
  display: block;
  font-size: 0.75rem;
  color: var(--c-text-light);
  margin-bottom: 0.25rem;
}

/* Data Tables */
.data-table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid var(--c-border);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid var(--c-border);
}

.data-table th {
  background-color: var(--c-bg-light);
  font-weight: 600;
  color: var(--c-text);
}

.data-table tr:last-child td {
  border-bottom: none;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.score-green { background-color: rgba(62, 175, 124, 0.15); color: #3eaf7c; }
.score-yellow { background-color: rgba(255, 193, 7, 0.15); color: #f9a825; }
.score-red { background-color: rgba(231, 76, 60, 0.15); color: #e74c3c; }

.empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--c-text-light);
    font-style: italic;
    background: white;
    border-radius: 12px;
    border: 1px solid var(--c-border);
}
</style>
