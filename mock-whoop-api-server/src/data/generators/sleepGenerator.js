/**
 * Sleep Data Generator
 * 
 * Generates realistic synthetic sleep data for the Mock WHOOP API Server.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.2
 */

const { v4: uuidv4 } = require('uuid');
const {
  SLEEP_DURATION_MIN_HOURS,
  SLEEP_DURATION_MAX_HOURS,
  RESPIRATORY_RATE_MIN,
  RESPIRATORY_RATE_MAX,
  SLEEP_PERFORMANCE_MIN,
  SLEEP_PERFORMANCE_MAX,
  SLEEP_CONSISTENCY_MIN,
  SLEEP_CONSISTENCY_MAX,
  SLEEP_EFFICIENCY_MIN,
  SLEEP_EFFICIENCY_MAX,
} = require('../../models');

/**
 * Generate realistic sleep stage distribution based on total sleep duration
 * 
 * Sleep stages follow typical patterns:
 * - Awake: ~5% of total time
 * - Light sleep: ~50% of total time
 * - Deep sleep (slow wave): ~20% of total time
 * - REM sleep: ~25% of total time
 * 
 * @param {number} totalMinutes - Total sleep duration in minutes
 * @returns {Object} Sleep stage breakdown in milliseconds
 */
function generateSleepStages(totalMinutes) {
  const totalMillis = totalMinutes * 60 * 1000;
  
  // Add some randomness to stage distributions (±2%)
  const awakePercent = 0.05 + (Math.random() * 0.04 - 0.02);
  const lightPercent = 0.50 + (Math.random() * 0.04 - 0.02);
  const deepPercent = 0.20 + (Math.random() * 0.04 - 0.02);
  const remPercent = 0.25 + (Math.random() * 0.04 - 0.02);
  
  // Normalize to ensure they sum to 1.0
  const total = awakePercent + lightPercent + deepPercent + remPercent;
  
  return {
    total_in_bed_time_milli: totalMillis,
    total_awake_time_milli: Math.floor(totalMillis * (awakePercent / total)),
    total_no_data_time_milli: 0,
    total_light_sleep_time_milli: Math.floor(totalMillis * (lightPercent / total)),
    total_slow_wave_sleep_time_milli: Math.floor(totalMillis * (deepPercent / total)),
    total_rem_sleep_time_milli: Math.floor(totalMillis * (remPercent / total)),
    sleep_cycle_count: Math.floor(totalMinutes / 90), // ~90 min per cycle
    disturbance_count: Math.floor(Math.random() * 15), // 0-14 disturbances
  };
}

/**
 * Generate sleep needed breakdown
 * 
 * @returns {Object} Sleep need analysis in milliseconds
 */
function generateSleepNeeded() {
  const baselineHours = 8;
  const baselineMillis = baselineHours * 60 * 60 * 1000;
  
  return {
    baseline_milli: baselineMillis,
    need_from_sleep_debt_milli: Math.floor(Math.random() * 60 * 60 * 1000), // 0-1 hour
    need_from_recent_strain_milli: Math.floor(Math.random() * 30 * 60 * 1000), // 0-30 min
    need_from_recent_nap_milli: 0, // Simplified: no naps
  };
}

/**
 * Generate complete sleep score object
 * 
 * @param {number} durationHours - Sleep duration in hours
 * @returns {Object} Complete sleep score with all metrics
 */
function generateSleepScore(durationHours) {
  const totalMinutes = durationHours * 60;
  
  // Better sleep duration correlates with better scores
  const durationQuality = Math.min(1.0, (durationHours - 6) / 3); // 0 at 6h, 1.0 at 9h
  
  // Generate scores with some correlation to duration
  const basePerformance = 60 + durationQuality * 30; // 60-90 base
  const sleepPerformance = Math.floor(
    Math.max(SLEEP_PERFORMANCE_MIN, 
    Math.min(SLEEP_PERFORMANCE_MAX, basePerformance + (Math.random() * 20 - 10)))
  );
  
  const sleepConsistency = Math.floor(
    SLEEP_CONSISTENCY_MIN + Math.random() * (SLEEP_CONSISTENCY_MAX - SLEEP_CONSISTENCY_MIN)
  );
  
  const sleepEfficiency = Math.floor(
    85 + Math.random() * (SLEEP_EFFICIENCY_MAX - 85) // 85-100%
  );
  
  const respiratoryRate = RESPIRATORY_RATE_MIN + Math.random() * (RESPIRATORY_RATE_MAX - RESPIRATORY_RATE_MIN);
  
  return {
    stage_summary: generateSleepStages(totalMinutes),
    sleep_needed: generateSleepNeeded(),
    respiratory_rate: parseFloat(respiratoryRate.toFixed(1)),
    sleep_performance_percentage: sleepPerformance,
    sleep_consistency_percentage: sleepConsistency,
    sleep_efficiency_percentage: sleepEfficiency,
  };
}

/**
 * Generate realistic sleep data for a user within a date range
 * 
 * Generates one sleep record per night with:
 * - Sleep start time between 10pm-12am
 * - Duration between 7-9 hours
 * - Realistic sleep stage distributions
 * - No overlapping sleep periods
 * 
 * @param {string} userId - User identifier (UUID)
 * @param {Date} startDate - Start date for data generation
 * @param {Date} endDate - End date for data generation
 * @returns {Array<Object>} Array of sleep records
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.2
 */
function generateSleepData(userId, startDate, endDate) {
  const sleepRecords = [];
  const currentDate = new Date(startDate);
  
  // Ensure we don't modify the input dates
  currentDate.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  while (currentDate <= end) {
    // Generate sleep start time between 10pm-12am (22:00-24:00)
    const sleepStart = new Date(currentDate);
    const startHour = 22 + Math.random() * 2; // 22.0 to 24.0
    const startMinute = Math.floor(Math.random() * 60);
    sleepStart.setHours(Math.floor(startHour), startMinute, 0, 0);
    
    // Generate sleep duration between 7-9 hours
    const durationHours = SLEEP_DURATION_MIN_HOURS + 
                         Math.random() * (SLEEP_DURATION_MAX_HOURS - SLEEP_DURATION_MIN_HOURS);
    const durationMillis = durationHours * 60 * 60 * 1000;
    const sleepEnd = new Date(sleepStart.getTime() + durationMillis);
    
    const now = new Date();
    
    const sleepRecord = {
      id: uuidv4(),
      user_id: userId,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      start: sleepStart.toISOString(),
      end: sleepEnd.toISOString(),
      timezone_offset: '-08:00', // Pacific Time
      nap: false,
      score_state: 'SCORED',
      score: generateSleepScore(durationHours),
    };
    
    sleepRecords.push(sleepRecord);
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return sleepRecords;
}

module.exports = {
  generateSleepData,
  generateSleepScore,
  generateSleepStages,
  generateSleepNeeded,
};
