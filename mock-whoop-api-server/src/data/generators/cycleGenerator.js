/**
 * Cycle Data Generator
 * 
 * Generates realistic synthetic cycle data for the Mock WHOOP API Server.
 * Cycles represent daily physiological periods with strain and heart rate metrics.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

const { v4: uuidv4 } = require('uuid');
const {
  STRAIN_MIN,
  STRAIN_MAX,
  HEART_RATE_MIN,
  HEART_RATE_MAX,
} = require('../../models');

/**
 * Generate strain value with realistic patterns
 * 
 * Strain varies based on day of week and random factors:
 * - Higher strain on workout days (simulated randomly)
 * - Lower strain on rest days
 * - Typical range: 5-18 for active days, 2-8 for rest days
 * 
 * @param {boolean} isWorkoutDay - Whether this is a workout day
 * @returns {number} Strain value (0-21)
 */
function generateStrain(isWorkoutDay) {
  let baseStrain;
  
  if (isWorkoutDay) {
    // Workout days: higher strain (8-18)
    baseStrain = 8 + Math.random() * 10;
  } else {
    // Rest days: lower strain (2-8)
    baseStrain = 2 + Math.random() * 6;
  }
  
  // Add some random variation
  const variation = (Math.random() * 4) - 2; // ±2
  const strain = baseStrain + variation;
  
  // Clamp to valid range and round to 1 decimal
  return parseFloat(Math.max(STRAIN_MIN, Math.min(STRAIN_MAX, strain)).toFixed(1));
}

/**
 * Generate average heart rate for the cycle
 * 
 * Average heart rate correlates with strain level.
 * Higher strain days have higher average heart rates.
 * 
 * @param {number} strain - Strain value for the cycle
 * @returns {number} Average heart rate in bpm
 */
function generateAverageHeartRate(strain) {
  // Map strain (0-21) to average heart rate
  // Low strain (0-5): 60-75 bpm (resting/light activity)
  // Medium strain (5-12): 75-100 bpm (moderate activity)
  // High strain (12-21): 100-130 bpm (intense activity)
  
  const strainFactor = strain / STRAIN_MAX; // 0-1
  
  // Base heart rate increases with strain
  const baseHR = 60 + (strainFactor * 70); // 60-130 bpm
  
  // Add random variation (±5 bpm)
  const variation = (Math.random() * 10) - 5;
  
  const avgHR = Math.floor(baseHR + variation);
  
  // Clamp to realistic range for daily average (55-130 bpm)
  return Math.max(55, Math.min(130, avgHR));
}

/**
 * Generate maximum heart rate for the cycle
 * 
 * Max heart rate is higher than average and correlates with strain.
 * Higher strain days have higher max heart rates.
 * 
 * @param {number} strain - Strain value for the cycle
 * @param {number} averageHeartRate - Average heart rate for the cycle
 * @returns {number} Maximum heart rate in bpm
 */
function generateMaxHeartRate(strain, averageHeartRate) {
  // Max HR is typically 20-60 bpm higher than average
  // Higher strain = larger difference
  
  const strainFactor = strain / STRAIN_MAX; // 0-1
  
  // Calculate difference based on strain
  const hrDifference = 20 + (strainFactor * 40); // 20-60 bpm difference
  
  // Add random variation (±10 bpm)
  const variation = (Math.random() * 20) - 10;
  
  const maxHR = Math.floor(averageHeartRate + hrDifference + variation);
  
  // Clamp to valid range
  return Math.max(averageHeartRate + 10, Math.min(HEART_RATE_MAX, maxHR));
}

/**
 * Generate energy expenditure in kilojoules
 * 
 * Kilojoules correlate with strain level.
 * Higher strain = more energy expenditure.
 * 
 * @param {number} strain - Strain value for the cycle
 * @returns {number} Energy expenditure in kilojoules
 */
function generateKilojoules(strain) {
  // Map strain to kilojoules
  // Low strain (0-5): 5000-8000 kJ (sedentary day)
  // Medium strain (5-12): 8000-12000 kJ (active day)
  // High strain (12-21): 12000-18000 kJ (very active day)
  
  const strainFactor = strain / STRAIN_MAX; // 0-1
  
  // Base kilojoules increases with strain
  const baseKJ = 5000 + (strainFactor * 13000); // 5000-18000 kJ
  
  // Add random variation (±1000 kJ)
  const variation = (Math.random() * 2000) - 1000;
  
  const kilojoules = Math.floor(baseKJ + variation);
  
  // Ensure value is within realistic range (5000-25000 kJ)
  return Math.max(5000, Math.min(25000, kilojoules));
}

/**
 * Generate complete cycle score object
 * 
 * @param {boolean} isWorkoutDay - Whether this is a workout day
 * @returns {Object} Complete cycle score with all metrics
 */
function generateCycleScore(isWorkoutDay) {
  const strain = generateStrain(isWorkoutDay);
  const averageHeartRate = generateAverageHeartRate(strain);
  const maxHeartRate = generateMaxHeartRate(strain, averageHeartRate);
  const kilojoules = generateKilojoules(strain);
  
  return {
    strain,
    kilojoule: kilojoules,
    average_heart_rate: averageHeartRate,
    max_heart_rate: maxHeartRate,
  };
}

/**
 * Determine if a given day should be a workout day
 * 
 * Uses a simple probability model to generate approximately 3-5 workouts per week.
 * 
 * @param {number} dayIndex - Day index in the sequence
 * @param {number} totalDays - Total number of days in the sequence
 * @returns {boolean} Whether this day should be a workout day
 */
function isWorkoutDay(dayIndex, totalDays) {
  // Use a probability of ~50% for workout days to get 3-4 workouts per week
  return Math.random() < 0.5;
}

/**
 * Generate realistic cycle data for a user within a date range
 * 
 * Generates one cycle record per day with:
 * - Daily cycles starting at midnight
 * - Strain values 0-21 (higher on workout days)
 * - Heart rate metrics correlated with strain
 * - Energy expenditure in kilojoules
 * 
 * @param {string} userId - User identifier (UUID)
 * @param {Date} startDate - Start date for data generation
 * @param {Date} endDate - End date for data generation
 * @returns {Array<Object>} Array of cycle records
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
function generateCycleData(userId, startDate, endDate) {
  const cycleRecords = [];
  const currentDate = new Date(startDate);
  
  // Ensure we don't modify the input dates
  currentDate.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  // Calculate total days for workout day determination
  const totalDays = Math.ceil((end - currentDate) / (1000 * 60 * 60 * 24)) + 1;
  let dayIndex = 0;
  
  while (currentDate <= end) {
    // Cycle starts at midnight
    const cycleStart = new Date(currentDate);
    cycleStart.setHours(0, 0, 0, 0);
    
    // Cycle ends exactly 24 hours later (86400000 milliseconds)
    // This ensures consistent 24-hour cycles regardless of DST
    const cycleEnd = new Date(cycleStart.getTime() + 24 * 60 * 60 * 1000);
    
    // Determine if this is a workout day
    const workout = isWorkoutDay(dayIndex, totalDays);
    
    const now = new Date();
    
    const cycleRecord = {
      id: uuidv4(),
      user_id: userId,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      start: cycleStart.toISOString(),
      end: cycleEnd.toISOString(),
      timezone_offset: '-08:00', // Pacific Time
      score: generateCycleScore(workout),
    };
    
    cycleRecords.push(cycleRecord);
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    dayIndex++;
  }
  
  return cycleRecords;
}

module.exports = {
  generateCycleData,
  generateCycleScore,
  generateStrain,
  generateAverageHeartRate,
  generateMaxHeartRate,
  generateKilojoules,
  isWorkoutDay,
};
