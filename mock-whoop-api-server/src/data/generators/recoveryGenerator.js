/**
 * Recovery Data Generator
 * 
 * Generates realistic synthetic recovery data for the Mock WHOOP API Server.
 * Recovery scores are correlated with sleep quality to reflect realistic patterns.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 9.1, 9.5
 */

const { v4: uuidv4 } = require('uuid');
const {
  RECOVERY_SCORE_MIN,
  RECOVERY_SCORE_MAX,
  RESTING_HEART_RATE_MIN,
  RESTING_HEART_RATE_MAX,
  HRV_MIN,
  HRV_MAX,
  SPO2_MIN,
  SPO2_MAX,
  SKIN_TEMP_MIN,
  SKIN_TEMP_MAX,
} = require('../../models');

/**
 * Calculate sleep quality factor from sleep record
 * 
 * Extracts sleep performance percentage as a quality indicator (0-1 scale).
 * Better sleep quality leads to better recovery scores.
 * 
 * @param {Object} sleepRecord - Sleep record with score object
 * @returns {number} Sleep quality factor between 0 and 1
 */
function calculateSleepQuality(sleepRecord) {
  if (!sleepRecord || !sleepRecord.score || !sleepRecord.score.sleep_performance_percentage) {
    return 0.5; // Default to medium quality if no sleep data
  }
  
  // Convert 0-100 percentage to 0-1 scale
  return sleepRecord.score.sleep_performance_percentage / 100;
}

/**
 * Generate recovery score correlated with sleep quality
 * 
 * Better sleep quality correlates with higher recovery scores.
 * Adds some randomness to simulate other factors (stress, nutrition, etc.)
 * 
 * @param {number} sleepQuality - Sleep quality factor (0-1)
 * @returns {number} Recovery score (0-100)
 */
function generateRecoveryScore(sleepQuality) {
  // Base recovery from sleep quality (60-90% of final score)
  const baseRecovery = sleepQuality * 70 + 20; // 20-90 range
  
  // Add random variation (±10 points) for other factors
  const variation = (Math.random() * 20) - 10;
  
  const recoveryScore = Math.floor(baseRecovery + variation);
  
  // Clamp to valid range
  return Math.max(RECOVERY_SCORE_MIN, Math.min(RECOVERY_SCORE_MAX, recoveryScore));
}

/**
 * Generate resting heart rate correlated with recovery
 * 
 * Higher recovery correlates with lower resting heart rate.
 * 
 * @param {number} recoveryScore - Recovery score (0-100)
 * @returns {number} Resting heart rate in bpm
 */
function generateRestingHeartRate(recoveryScore) {
  // Inverse correlation: high recovery = low RHR
  const recoveryFactor = recoveryScore / 100; // 0-1
  
  // Map recovery to RHR: high recovery (1.0) -> low RHR (40-60), low recovery (0) -> high RHR (70-100)
  const baseRHR = RESTING_HEART_RATE_MAX - (recoveryFactor * (RESTING_HEART_RATE_MAX - RESTING_HEART_RATE_MIN));
  
  // Add small random variation (±5 bpm)
  const variation = (Math.random() * 10) - 5;
  
  const rhr = Math.floor(baseRHR + variation);
  
  // Clamp to valid range
  return Math.max(RESTING_HEART_RATE_MIN, Math.min(RESTING_HEART_RATE_MAX, rhr));
}

/**
 * Generate HRV (Heart Rate Variability) correlated with recovery
 * 
 * Higher recovery correlates with higher HRV.
 * 
 * @param {number} recoveryScore - Recovery score (0-100)
 * @returns {number} HRV in milliseconds
 */
function generateHRV(recoveryScore) {
  // Direct correlation: high recovery = high HRV
  const recoveryFactor = recoveryScore / 100; // 0-1
  
  // Map recovery to HRV: high recovery (1.0) -> high HRV (80-150), low recovery (0) -> low HRV (20-50)
  const baseHRV = HRV_MIN + (recoveryFactor * (HRV_MAX - HRV_MIN));
  
  // Add random variation (±15 ms)
  const variation = (Math.random() * 30) - 15;
  
  const hrv = Math.floor(baseHRV + variation);
  
  // Clamp to valid range
  return Math.max(HRV_MIN, Math.min(HRV_MAX, hrv));
}

/**
 * Generate SpO2 (blood oxygen saturation) percentage
 * 
 * SpO2 is relatively stable for healthy individuals (95-100%).
 * Slight correlation with recovery.
 * 
 * @param {number} recoveryScore - Recovery score (0-100)
 * @returns {number} SpO2 percentage (95-100)
 */
function generateSpO2(recoveryScore) {
  // Weak correlation: recovery mostly affects SpO2 in the 95-100 range
  const recoveryFactor = recoveryScore / 100; // 0-1
  
  // Map to SpO2: high recovery -> 98-100%, low recovery -> 95-97%
  const baseSpo2 = SPO2_MIN + (recoveryFactor * (SPO2_MAX - SPO2_MIN));
  
  // Add small random variation (±1%)
  const variation = (Math.random() * 2) - 1;
  
  const spo2 = baseSpo2 + variation;
  
  // Clamp to valid range and round to 1 decimal
  return parseFloat(Math.max(SPO2_MIN, Math.min(SPO2_MAX, spo2)).toFixed(1));
}

/**
 * Generate skin temperature in Celsius
 * 
 * Skin temperature is relatively stable (33-36°C).
 * Very slight correlation with recovery.
 * 
 * @param {number} recoveryScore - Recovery score (0-100)
 * @returns {number} Skin temperature in Celsius
 */
function generateSkinTemp(recoveryScore) {
  // Very weak correlation: mostly random within normal range
  const recoveryFactor = recoveryScore / 100; // 0-1
  
  // Map to skin temp: slight variation based on recovery
  const baseTemp = SKIN_TEMP_MIN + (recoveryFactor * (SKIN_TEMP_MAX - SKIN_TEMP_MIN));
  
  // Add random variation (±0.5°C)
  const variation = (Math.random() * 1.0) - 0.5;
  
  const skinTemp = baseTemp + variation;
  
  // Clamp to valid range and round to 1 decimal
  return parseFloat(Math.max(SKIN_TEMP_MIN, Math.min(SKIN_TEMP_MAX, skinTemp)).toFixed(1));
}

/**
 * Generate complete recovery score object
 * 
 * @param {number} sleepQuality - Sleep quality factor (0-1)
 * @returns {Object} Complete recovery score with all metrics
 */
function generateRecoveryScoreObject(sleepQuality) {
  const recoveryScore = generateRecoveryScore(sleepQuality);
  
  return {
    recovery_score: recoveryScore,
    resting_heart_rate: generateRestingHeartRate(recoveryScore),
    hrv_rmssd_milli: generateHRV(recoveryScore),
    spo2_percentage: generateSpO2(recoveryScore),
    skin_temp_celsius: generateSkinTemp(recoveryScore),
  };
}

/**
 * Generate realistic recovery data for a user within a date range
 * 
 * Generates one recovery record per day, correlated with sleep quality.
 * Better sleep quality leads to higher recovery scores and better HRV.
 * 
 * @param {string} userId - User identifier (UUID)
 * @param {Date} startDate - Start date for data generation
 * @param {Date} endDate - End date for data generation
 * @param {Array<Object>} sleepData - Array of sleep records for correlation
 * @returns {Array<Object>} Array of recovery records
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 9.1, 9.5
 */
function generateRecoveryData(userId, startDate, endDate, sleepData = []) {
  const recoveryRecords = [];
  const currentDate = new Date(startDate);
  
  // Ensure we don't modify the input dates
  currentDate.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  // Create a map of sleep records by date for easy lookup
  const sleepByDate = new Map();
  sleepData.forEach(sleep => {
    const sleepDate = new Date(sleep.end);
    const dateKey = sleepDate.toISOString().split('T')[0]; // YYYY-MM-DD
    sleepByDate.set(dateKey, sleep);
  });
  
  while (currentDate <= end) {
    const dateKey = currentDate.toISOString().split('T')[0];
    
    // Find corresponding sleep record for this day
    const sleepRecord = sleepByDate.get(dateKey);
    const sleepQuality = calculateSleepQuality(sleepRecord);
    
    // Generate recovery timestamp (typically morning after sleep)
    const recoveryTime = new Date(currentDate);
    recoveryTime.setHours(8, 0, 0, 0); // 8:00 AM
    
    const now = new Date();
    
    const recoveryRecord = {
      id: uuidv4(),
      user_id: userId,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      cycle_id: uuidv4(), // Generate placeholder cycle ID
      sleep_id: sleepRecord ? sleepRecord.id : uuidv4(), // Link to sleep if available
      user_calibrating: false,
      score: generateRecoveryScoreObject(sleepQuality),
    };
    
    recoveryRecords.push(recoveryRecord);
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return recoveryRecords;
}

module.exports = {
  generateRecoveryData,
  generateRecoveryScoreObject,
  generateRecoveryScore,
  generateRestingHeartRate,
  generateHRV,
  generateSpO2,
  generateSkinTemp,
  calculateSleepQuality,
};
