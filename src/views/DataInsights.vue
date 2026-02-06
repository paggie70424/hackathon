<template>
  <div class="data-insights">
    <div class="page-header">
      <h1 class="page-title">Data Insights</h1>
      <p class="page-subtitle">Visual analysis of your integrated life metrics.</p>
    </div>

    <!-- Summary Cards -->
    <div class="summary-grid">
      <div class="summary-card">
        <h3>Recovery Score</h3>
        <p class="summary-value">{{ recoveryScore }}</p>
        <p class="summary-trend" :class="getScoreClass(recoveryScore)">Whoop</p>
      </div>
      <div class="summary-card">
        <h3>HRV (ms)</h3>
        <p class="summary-value">{{ hrv }}</p>
        <p class="summary-trend neutral">Variability</p>
      </div>
       <div class="summary-card">
        <h3>RHR (bpm)</h3>
        <p class="summary-value">{{ rhr }}</p>
        <p class="summary-trend neutral">Resting Rate</p>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <div class="chart-card">
        <h3>Weekly Activity Strain</h3>
        <div class="chart-container">
          <Bar v-if="loaded" :data="activityData" :options="chartOptions" />
        </div>
      </div>
      
      <div class="chart-card">
        <h3>Sleep Quality vs Focus</h3>
        <div class="chart-container">
          <Line v-if="loaded" :data="focusData" :options="chartOptions" />
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
import { ref, onMounted } from 'vue'
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

// Sample Data
const activityData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Strain',
      backgroundColor: '#3eaf7c',
      data: [10, 12, 8, 15, 12, 18, 14]
    }
  ]
}

const focusData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Focus Score',
      borderColor: '#3498db',
      backgroundColor: '#3498db',
      data: [65, 78, 80, 85, 90, 75, 70],
      tension: 0.4
    },
    {
      label: 'Sleep Quality',
      borderColor: '#9b59b6',
      backgroundColor: '#9b59b6',
      data: [70, 75, 82, 88, 85, 90, 85],
      tension: 0.4
    }
  ]
}

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

const recoveryScore = ref('Loading...')
const hrv = ref('--')
const rhr = ref('--')

onMounted(async () => {
    try {
        const response = await fetch('http://localhost:3000/api/data/whoop');
        if (response.ok) {
            const data = await response.json();
            // Process Whoop Data
            if (data.recovery_data) {
                // Example: Whoop Recovery data structure might vary, let's assume flat or adjust
                // Based on standard Whoop API: data.recovery_data.score (0-100)
                // Note: The previous backend implementation fetched `recoveryResponse.data`.
                // Let's assume it returned an array of records or a single record.
                // We'll log it to be safe in dev, but for code we'll try to access safely.
                
                const records = Array.isArray(data.recovery_data) ? data.recovery_data : [data.recovery_data];
                const latestRecord = records[0]; // Assuming newest first or single object

                if (latestRecord && latestRecord.score) {
                    recoveryScore.value = latestRecord.score.recovery_score || latestRecord.score; // Adjust based on actual API
                    hrv.value = latestRecord.score.hrv_rmssd_milli || '--';
                    rhr.value = latestRecord.score.resting_heart_rate || '--';

                    // Update Charts if we had historical data (mocking the chart update with this single point for now)
                    // activityData.datasets[0].data = ... 
                }
            }
        }
    } catch (e) {
        console.error("Failed to fetch Whoop data", e)
    } finally {
        loaded.value = true
    }
})
</script>

<script>
// Helper for class binding (can be in setup too but keeping clean)
const getScoreClass = (score) => {
    if (score >= 66) return 'positive'; // Green
    if (score >= 33) return 'neutral';  // Yellow
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
</style>
