<template>
  <div class="data-insights">
    <div class="page-header">
      <h1 class="page-title">Data Insights</h1>
      <p class="page-subtitle">Visual analysis of your integrated life metrics.</p>
    </div>

    <!-- Health Alerts -->
    <div class="alerts-section" v-if="healthAlerts.length > 0">
        <div class="alert-banner" v-for="(alert, index) in healthAlerts" :key="index">
            <div class="alert-icon">⚠️</div>
            <div class="alert-content">
                <h3>{{ alert.title }}</h3>
                <p>{{ alert.message }}</p>
            </div>
            <div class="alert-action">
                <button @click="dismissAlert(index)">Dismiss</button>
            </div>
        </div>
    </div>

    <!-- Profile Grid -->
    <div class="profile-section" v-if="profile.name">
        <div class="user-info">
             <h2>{{ profile.name }}</h2>
             <div class="stats">
                 <div class="stat">
                     <span class="label">Height</span>
                     <span class="value">{{ profile.height }}m</span>
                 </div>
                 <div class="stat">
                     <span class="label">Weight</span>
                     <span class="value">{{ profile.weight }}kg</span>
                 </div>
             </div>
        </div>
    </div>

    <!-- Controls Section -->
    <div class="controls-section">
        <div class="time-ranges">
            <button 
                v-for="range in timeRanges" 
                :key="range.value" 
                :class="['range-btn', { active: selectedRange === range.value }]"
                @click="setRange(range.value)"
            >
                {{ range.label }}
            </button>
            <!-- Critical Simulation Button -->
            <button 
                class="range-btn critical-btn"
                :class="{ active: isCriticalMode }" 
                @click="toggleCriticalMode"
            >
                Simulate Critical
            </button>
        </div>

        <div class="custom-calendar" v-if="selectedRange === 'custom'">
            <div class="date-input">
                <label>Start Date</label>
                <input type="date" v-model="customStart" />
            </div>
            <div class="date-input">
                <label>End Date</label>
                <input type="date" v-model="customEnd" />
            </div>
        </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-grid">
      <div class="summary-card">
        <h3>Recovery Score</h3>
        <p class="summary-value" :class="{ 'critical-text': isMetricCritical(recoveryScore, 'recovery') }">{{ recoveryScore }}</p>
        <p class="summary-trend" :class="getScoreClass(recoveryScore)">Whoop</p>
      </div>
      <div class="summary-card">
        <h3>HRV (ms)</h3>
        <p class="summary-value" :class="{ 'critical-text': isMetricCritical(hrv, 'hrv') }">{{ hrv }}</p>
        <p class="summary-trend neutral">Variability</p>
      </div>
       <div class="summary-card">
        <h3>RHR (bpm)</h3>
        <p class="summary-value" :class="{ 'critical-text': isMetricCritical(rhr, 'rhr') }">{{ rhr }}</p>
        <p class="summary-trend neutral">Resting Rate</p>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <div class="chart-card">
        <h3>Activity Strain ({{ getRangeLabel(selectedRange) }})</h3>
        <div class="chart-container">
          <Bar v-if="loaded" :data="currentActivityData" :options="chartOptions" />
        </div>
      </div>
      
      <div class="chart-card">
        <h3>Sleep Quality vs Focus</h3>
        <div class="chart-container">
          <Line v-if="loaded" :data="currentFocusData" :options="chartOptions" />
        </div>
      </div>
      
       <div class="chart-card">
        <h3>Time Distribution</h3>
        <div class="chart-container">
          <Doughnut v-if="loaded" :data="distributionData" :options="doughnutOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar, Doughnut } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const loaded = ref(false)
const recoveryScore = ref('Loading...')
const hrv = ref('--')
const rhr = ref('--')

const profile = ref({
    name: '',
    height: '--',
    weight: '--'
})

// Alerts System
const healthAlerts = ref([])

const checkHealthMetrics = (rec, h_rv, r_hr) => {
    const alerts = []
    
    // Numeric conversions
    const recVal = parseInt(rec) || 0
    // const hrvVal = parseInt(h_rv) || 0
    const rhrVal = parseInt(r_hr) || 0

    if (recVal > 0 && recVal < 33) {
        alerts.push({
            title: 'Critical Recovery Detected',
            message: `Your Recovery Score is critically low (${recVal}%). Avoid strenuous activity and prioritize sleep.`
        })
    }

    if (rhrVal > 100) { // Arbitrary threshold for demo
        alerts.push({
            title: 'Abnormal Heart Rate Detected',
            message: `Your Resting Heart Rate is abnormally high (${rhrVal} bpm). Please consult a medical professional if this persists.`
        })
    }

    healthAlerts.value = alerts
}

const dismissAlert = (index) => {
    healthAlerts.value.splice(index, 1)
}

const isMetricCritical = (val, type) => {
    const num = parseInt(val)
    if (isNaN(num)) return false
    
    if (type === 'recovery' && num < 33) return true
    if (type === 'rhr' && num > 100) return true
    return false
}


// Time Range Logic
const selectedRange = ref('week')
const isCriticalMode = ref(false)
const customStart = ref(new Date().toISOString().split('T')[0])
const customEnd = ref(new Date().toISOString().split('T')[0])

const timeRanges = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: '3 Months', value: '3m' },
    { label: '6 Months', value: '6m' },
    { label: 'Custom', value: 'custom' }
]

const setRange = (range) => {
    selectedRange.value = range
    updateDummyData(range)
}

const toggleCriticalMode = () => {
    isCriticalMode.value = !isCriticalMode.value
    // Trigger data refresh with new mode
    updateDummyData(selectedRange.value)
    
    // Also override summary cards for the sake of the demo
    if (isCriticalMode.value) {
        recoveryScore.value = 15
        rhr.value = 110
        hrv.value = 25
    } else {
        // Reset to "normal" random or refetch (simple reset for demo)
        recoveryScore.value = 85
        rhr.value = 58
        hrv.value = 65
    }
    checkHealthMetrics(recoveryScore.value, hrv.value, rhr.value)
}

const getRangeLabel = (val) => {
    const r = timeRanges.find(tr => tr.value === val)
    return r ? r.label : 'Week'
}

// Dummy Data Generators
const generateLabels = (range) => {
    if (range === 'day') return ['6am', '9am', '12pm', '3pm', '6pm', '9pm']
    if (range === 'week') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    if (range === 'month') return Array.from({length: 30}, (_, i) => `Day ${i+1}`)
    if (range === '3m') return ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12']
    if (range === '6m') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    if (range === 'custom') return ['Start', '...', 'End'] // Simplification for custom
    return []
}

const generateRandomData = (count, min, max) => {
    return Array.from({length: count}, () => Math.floor(Math.random() * (max - min + 1) + min))
}

const currentActivityData = ref({
    labels: [],
    datasets: []
})

const currentFocusData = ref({
    labels: [],
    datasets: []
})

const updateDummyData = (range) => {
    const labels = generateLabels(range)
    const count = labels.length
    
    let strainMin = 4, strainMax = 18
    let scoreMin = 60, scoreMax = 100

    // Adjusted for critical mode demo
    if (isCriticalMode.value) {
        strainMin = 18; strainMax = 21 // High strain
        scoreMin = 10; scoreMax = 40   // Low scores
    }

    currentActivityData.value = {
        labels: labels,
        datasets: [{
            label: 'Strain',
            backgroundColor: isCriticalMode.value ? '#e74c3c' : '#3eaf7c',
            data: generateRandomData(count, strainMin, strainMax)
        }]
    }

    currentFocusData.value = {
        labels: labels,
        datasets: [
            {
                label: 'Focus Score',
                borderColor: '#3498db',
                backgroundColor: '#3498db',
                data: generateRandomData(count, scoreMin, scoreMax),
                tension: 0.4
            },
            {
                label: 'Sleep Quality',
                borderColor: isCriticalMode.value ? '#e74c3c' : '#9b59b6',
                backgroundColor: isCriticalMode.value ? '#e74c3c' : '#9b59b6',
                data: generateRandomData(count, scoreMin, scoreMax),
                tension: 0.4
            }
        ]
    }
}

// Initial Data
updateDummyData('week')

const distributionData = {
  labels: ['Study', 'Exercise', 'Sleep', 'Leisure'],
  datasets: [
    {
      backgroundColor: ['#e67e22', '#e74c3c', '#34495e', '#2ecc71'],
      data: [25, 10, 35, 30]
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right'
    }
  }
}

onMounted(async () => {
    try {
        const response = await fetch('http://localhost:3000/api/whoop/data');
        if (response.ok) {
            const data = await response.json();
            
            // Process Recovery
            if (data.recovery_data) {
                const records = Array.isArray(data.recovery_data) ? data.recovery_data : [data.recovery_data];
                const latestRecord = records[0]; 

                if (latestRecord && latestRecord.score) {
                    recoveryScore.value = latestRecord.score.recovery_score || latestRecord.score;
                    hrv.value = latestRecord.score.hrv_rmssd_milli || '--';
                    rhr.value = latestRecord.score.resting_heart_rate || '--';
                }
            }

            // Process Profile
            if (data.user_profile) {
                profile.value.name = `${data.user_profile.first_name} ${data.user_profile.last_name}`;
            }

            // Process Measurements
            if (data.body_measurement) {
                profile.value.height = data.body_measurement.height_meter || '--';
                profile.value.weight = data.body_measurement.weight_kilogram || '--';
            }
        }
    } catch (e) {
        console.error("Failed to fetch Whoop data", e)
    } finally {
        loaded.value = true
        // Initial check in case loaded data is already critical
        if (recoveryScore.value !== 'Loading...') {
             checkHealthMetrics(recoveryScore.value, hrv.value, rhr.value)
        }
    }
})
</script>

<script>
// Helper for class binding
const getScoreClass = (score) => {
    // If it's not a number (like 'Loading...') return neutral
    const num = parseInt(score)
    if (isNaN(num)) return 'neutral'

    if (num >= 66) return 'positive'; // Green
    if (num >= 33) return 'neutral';  // Yellow
    return 'negative';                  // Red
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

/* Alerts Section */
.alerts-section {
    margin-bottom: 2rem;
}

.alert-banner {
    background-color: #fef2f2;
    border: 1px solid #ef4444;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
    animation: slideDown 0.3s ease-out;
}

.alert-icon {
    font-size: 1.5rem;
}

.alert-content h3 {
    color: #b91c1c;
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.alert-content p {
    color: #7f1d1d;
    font-size: 0.95rem;
    line-height: 1.4;
}

.alert-action {
    margin-left: auto;
}

.alert-action button {
    background: transparent;
    border: 1px solid #ef4444;
    color: #ef4444;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
}

.alert-action button:hover {
    background: #ef4444;
    color: white;
}

/* Controls Section */
.controls-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
    background: var(--c-bg);
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid var(--c-border);
}

.time-ranges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.range-btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--c-border);
    background: var(--c-bg-light);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
    color: var(--c-text);
}

.range-btn:hover {
    background: var(--c-border);
}

.range-btn.active {
    background: var(--c-brand);
    color: white;
    border-color: var(--c-brand);
}

.critical-btn {
    border-color: #ef4444;
    color: #ef4444;
}

.critical-btn:hover {
    background: #fef2f2;
}

.critical-btn.active {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
}

.custom-calendar {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.date-input {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.date-input label {
    font-size: 0.75rem;
    color: var(--c-text-light);
    font-weight: 600;
}

input[type="date"] {
    padding: 0.5rem;
    border: 1px solid var(--c-border);
    border-radius: 6px;
    font-family: inherit;
    color: var(--c-text);
    background: var(--c-bg-light);
}

/* Profile Section */
.profile-section {
    background: linear-gradient(135deg, var(--c-brand) 0%, #2980b9 100%);
    color: white;
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.user-info h2 {
    margin: 0 0 1rem 0;
    font-size: 1.8rem;
}

.stats {
    display: flex;
    gap: 3rem;
}

.stat {
    display: flex;
    flex-direction: column;
}

.stat .label {
    font-size: 0.9rem;
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat .value {
    font-size: 1.5rem;
    font-weight: 700;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: var(--c-bg);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--c-border);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.summary-card h3 {
  font-size: 1rem;
  color: var(--c-text-light);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--c-text);
  margin-bottom: 0.25rem;
}

.critical-text {
    color: #dc2626 !important; /* Red text for critical values */
}

.summary-trend {
  font-size: 0.875rem;
  font-weight: 500;
}

.summary-trend.positive { color: var(--c-brand); }
.summary-trend.negative { color: #e74c3c; }
.summary-trend.neutral { color: var(--c-text-light); }

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.chart-card {
  background: var(--c-bg);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--c-border);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

.chart-card h3 {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  color: var(--c-text);
}

.chart-container {
  height: 300px;
  width: 100%;
  position: relative;
}

@keyframes slideDown {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
</style>
