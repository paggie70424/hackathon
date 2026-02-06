/**
 * Workout Data Generator
 * 
 * Generates realistic synthetic workout data for the Mock WHOOP API Server.
 * Generates 3-5 workouts per week with varied sport types and realistic metrics.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

const { v4: uuidv4 } = require('uuid');
const {
  STRAIN_MIN,
  STRAIN_MAX,
  HEART_RATE_MIN,
  HEART_RATE_MAX,
  WORKOUTS_PER_WEEK_MIN,
  WORKOUTS_PER_WEEK_MAX,
} = require('../../models');

/**
 * WHOOP Sport IDs
 * Common sport types with their WHOOP identifiers
 */
const SPORT_TYPES = {
  RUNNING: 1,
  CYCLING: 2,
  WEIGHTLIFTING: 44,
  SWIMMING: 22,
  YOGA: 43,
  HIIT: 63,
  WALKING: 93,
  ROWING: 24,
  BASKETBALL: 4,
  SOCCER: 27,
};

/**
 * Get array of sport IDs for random selection
 */
const SPORT_IDS = Object.values(SPORT_TYPES);

/**
 * Generate workout strain based on sport type and duration
 * 
 * Strain varies by workout intensity and duration:
 * - Short/light workouts: 3-8 strain
 * - Medium workouts: 8-14 strain
 * - Long/intense workouts: 14-21 strain
 * 
 * @param {number} durationMinutes - Workout duration in minutes
 * @param {number} sportId - WHOOP sport identifier
 * @returns {number} Strain value (0-21)
 */
function generateWorkoutStrain(durationMinutes, sportId) {
  // Base strain from duration (longer = higher strain)
  const durationFactor = Math.min(1.0, durationMinutes / 90); // 0-1, capped at 90 min
  
  // Intensity factor based on sport type
  let intensityMultiplier = 1.0;
  if ([SPORT_TYPES.HIIT, SPORT_TYPES.RUNNING, SPORT_TYPES.ROWING].includes(sportId)) {
    intensityMultiplier = 1.3; // High intensity sports
  } else if ([SPORT_TYPES.YOGA, SPORT_TYPES.WALKING].includes(sportId)) {
    intensityMultiplier = 0.6; // Low intensity sports
  }
  
  // Calculate base strain
  const baseStrain = 5 + (durationFactor * 12 * intensityMultiplier); // 5-17 base range
  
  // Add random variation (±2)
  const variation = (Math.random() * 4) - 2;
  const strain = baseStrain + variation;
  
  // Clamp to valid range and round to 1 decimal
  return parseFloat(Math.max(STRAIN_MIN, Math.min(STRAIN_MAX, strain)).toFixed(1));
}

/**
 * Generate average heart rate for workout
 * 
 * Average heart rate correlates with workout strain and sport type.
 * 
 * @param {number} strain - Workout strain value
 * @param {number} sportId - WHOOP sport identifier
 * @returns {number} Average heart rate in bpm
 */
function generateWorkoutAverageHeartRate(strain, sportId) {
  // Map strain to heart rate range
  // Low strain (3-8): 100-130 bpm
  // Medium strain (8-14): 130-160 bpm
  // High strain (14-21): 160-185 bpm
  
  const strainFactor = strain / STRAIN_MAX; // 0-1
  
  // Base heart rate from strain
  const baseHR = 100 + (strainFactor * 85); // 100-185 bpm
  
  // Adjust for sport type
  let sportAdjustment = 0;
  if ([SPORT_TYPES.YOGA, SPORT_TYPES.WALKING].includes(sportId)) {
    sportAdjustment = -15; // Lower HR for low-intensity activities
  } else if ([SPORT_TYPES.HIIT, SPORT_TYPES.RUNNING].includes(sportId)) {
    sportAdjustment = 10; // Higher HR for high-intensity activities
  }
  
  // Add random variation (±5 bpm)
  const variation = (Math.random() * 10) - 5;
  
  const avgHR = Math.floor(baseHR + sportAdjustment + variation);
  
  // Clamp to realistic workout range (80-185 bpm)
  return Math.max(80, Math.min(185, avgHR));
}

/**
 * Generate maximum heart rate for workout
 * 
 * Max heart rate is higher than average, typically 10-30 bpm higher.
 * 
 * @param {number} averageHeartRate - Average heart rate for workout
 * @param {number} strain - Workout strain value
 * @returns {number} Maximum heart rate in bpm
 */
function generateWorkoutMaxHeartRate(averageHeartRate, strain) {
  // Higher strain workouts have larger HR spikes
  const strainFactor = strain / STRAIN_MAX; // 0-1
  
  // Calculate difference (10-30 bpm higher than average)
  const hrDifference = 10 + (strainFactor * 20);
  
  // Add random variation (±5 bpm)
  const variation = (Math.random() * 10) - 5;
  
  const maxHR = Math.floor(averageHeartRate + hrDifference + variation);
  
  // Clamp to valid range
  return Math.max(averageHeartRate + 5, Math.min(HEART_RATE_MAX, maxHR));
}

/**
 * Generate energy expenditure in kilojoules for workout
 * 
 * Kilojoules correlate with workout duration and strain.
 * 
 * @param {number} durationMinutes - Workout duration in minutes
 * @param {number} strain - Workout strain value
 * @returns {number} Energy expenditure in kilojoules
 */
function generateWorkoutKilojoules(durationMinutes, strain) {
  // Base calculation: ~40-80 kJ per minute depending on intensity
  const strainFactor = strain / STRAIN_MAX; // 0-1
  const kjPerMinute = 40 + (strainFactor * 40); // 40-80 kJ/min
  
  const baseKJ = durationMinutes * kjPerMinute;
  
  // Add random variation (±10%)
  const variation = baseKJ * (Math.random() * 0.2 - 0.1);
  
  const kilojoules = Math.floor(baseKJ + variation);
  
  // Ensure value is within realistic range (500-8000 kJ)
  return Math.max(500, Math.min(8000, kilojoules));
}

/**
 * Generate distance in meters for distance-based sports
 * 
 * @param {number} sportId - WHOOP sport identifier
 * @param {number} durationMinutes - Workout duration in minutes
 * @returns {number} Distance in meters (0 for non-distance sports)
 */
function generateDistance(sportId, durationMinutes) {
  // Only certain sports track distance
  const distanceSports = [
    SPORT_TYPES.RUNNING,
    SPORT_TYPES.CYCLING,
    SPORT_TYPES.SWIMMING,
    SPORT_TYPES.WALKING,
    SPORT_TYPES.ROWING,
  ];
  
  if (!distanceSports.includes(sportId)) {
    return 0;
  }
  
  // Calculate distance based on sport and duration
  let metersPerMinute;
  switch (sportId) {
    case SPORT_TYPES.RUNNING:
      metersPerMinute = 150 + Math.random() * 50; // 9-12 km/h pace
      break;
    case SPORT_TYPES.CYCLING:
      metersPerMinute = 300 + Math.random() * 100; // 18-24 km/h pace
      break;
    case SPORT_TYPES.SWIMMING:
      metersPerMinute = 30 + Math.random() * 20; // 1.8-3 km/h pace
      break;
    case SPORT_TYPES.WALKING:
      metersPerMinute = 70 + Math.random() * 30; // 4.2-6 km/h pace
      break;
    case SPORT_TYPES.ROWING:
      metersPerMinute = 200 + Math.random() * 50; // 12-15 km/h pace
      break;
    default:
      metersPerMinute = 0;
  }
  
  const distance = Math.floor(durationMinutes * metersPerMinute);
  
  // Add random variation (±10%)
  const variation = distance * (Math.random() * 0.2 - 0.1);
  
  return Math.floor(distance + variation);
}

/**
 * Generate altitude metrics for outdoor sports
 * 
 * @param {number} sportId - WHOOP sport identifier
 * @param {number} distance - Distance in meters
 * @returns {Object} Altitude gain and change in meters
 */
function generateAltitude(sportId, distance) {
  // Only outdoor sports have altitude data
  const outdoorSports = [
    SPORT_TYPES.RUNNING,
    SPORT_TYPES.CYCLING,
    SPORT_TYPES.WALKING,
  ];
  
  if (!outdoorSports.includes(sportId) || distance === 0) {
    return {
      altitude_gain_meter: 0,
      altitude_change_meter: 0,
    };
  }
  
  // Calculate altitude gain (roughly 10-50m per km for varied terrain)
  const distanceKm = distance / 1000;
  const gainPerKm = 10 + Math.random() * 40;
  const altitudeGain = Math.floor(distanceKm * gainPerKm);
  
  // Altitude change is typically close to 0 for out-and-back routes
  // or small positive/negative for point-to-point
  const altitudeChange = Math.floor((Math.random() * 40) - 20); // -20 to +20m
  
  return {
    altitude_gain_meter: altitudeGain,
    altitude_change_meter: altitudeChange,
  };
}

/**
 * Generate heart rate zone distribution for workout
 * 
 * Distributes workout time across 6 heart rate zones based on workout intensity.
 * Higher strain workouts spend more time in higher zones.
 * 
 * @param {number} durationMinutes - Workout duration in minutes
 * @param {number} strain - Workout strain value
 * @param {number} averageHeartRate - Average heart rate
 * @returns {Object} Time spent in each zone in milliseconds
 */
function generateZoneDuration(durationMinutes, strain, averageHeartRate) {
  const totalMillis = durationMinutes * 60 * 1000;
  const strainFactor = strain / STRAIN_MAX; // 0-1
  
  // Zone distribution based on strain level
  // Low strain: more time in zones 0-2
  // High strain: more time in zones 3-5
  
  let zoneDistribution;
  if (strainFactor < 0.4) {
    // Low intensity workout
    zoneDistribution = [0.10, 0.30, 0.35, 0.20, 0.05, 0.00];
  } else if (strainFactor < 0.7) {
    // Medium intensity workout
    zoneDistribution = [0.05, 0.15, 0.30, 0.30, 0.15, 0.05];
  } else {
    // High intensity workout
    zoneDistribution = [0.02, 0.08, 0.20, 0.30, 0.25, 0.15];
  }
  
  // Add some randomness to each zone (±5%)
  const randomizedDistribution = zoneDistribution.map(percent => {
    const variation = (Math.random() * 0.1) - 0.05; // ±5%
    return Math.max(0, percent + variation);
  });
  
  // Normalize to ensure they sum to 1.0
  const sum = randomizedDistribution.reduce((a, b) => a + b, 0);
  const normalizedDistribution = randomizedDistribution.map(val => val / sum);
  
  return {
    zone_zero_milli: Math.floor(totalMillis * normalizedDistribution[0]),
    zone_one_milli: Math.floor(totalMillis * normalizedDistribution[1]),
    zone_two_milli: Math.floor(totalMillis * normalizedDistribution[2]),
    zone_three_milli: Math.floor(totalMillis * normalizedDistribution[3]),
    zone_four_milli: Math.floor(totalMillis * normalizedDistribution[4]),
    zone_five_milli: Math.floor(totalMillis * normalizedDistribution[5]),
  };
}

/**
 * Generate complete workout score object
 * 
 * @param {number} durationMinutes - Workout duration in minutes
 * @param {number} sportId - WHOOP sport identifier
 * @returns {Object} Complete workout score with all metrics
 */
function generateWorkoutScore(durationMinutes, sportId) {
  const strain = generateWorkoutStrain(durationMinutes, sportId);
  const averageHeartRate = generateWorkoutAverageHeartRate(strain, sportId);
  const maxHeartRate = generateWorkoutMaxHeartRate(averageHeartRate, strain);
  const kilojoules = generateWorkoutKilojoules(durationMinutes, strain);
  const distance = generateDistance(sportId, durationMinutes);
  const altitude = generateAltitude(sportId, distance);
  const zoneDuration = generateZoneDuration(durationMinutes, strain, averageHeartRate);
  
  // Percent recorded is typically 95-100% for good data quality
  const percentRecorded = 95 + Math.random() * 5;
  
  return {
    strain,
    average_heart_rate: averageHeartRate,
    max_heart_rate: maxHeartRate,
    kilojoule: kilojoules,
    percent_recorded: parseFloat(percentRecorded.toFixed(1)),
    distance_meter: distance,
    altitude_gain_meter: altitude.altitude_gain_meter,
    altitude_change_meter: altitude.altitude_change_meter,
    zone_duration: zoneDuration,
  };
}

/**
 * Determine workout days for the date range
 * 
 * Generates 3-5 workouts per week with realistic distribution.
 * Avoids consecutive workout days when possible.
 * 
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Set<string>} Set of date strings (YYYY-MM-DD) that should have workouts
 */
function determineWorkoutDays(startDate, endDate) {
  const workoutDays = new Set();
  const currentDate = new Date(startDate);
  
  // Calculate total weeks
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const totalWeeks = Math.ceil(totalDays / 7);
  
  // For each week, generate 3-5 workouts
  for (let week = 0; week < totalWeeks; week++) {
    const workoutsThisWeek = WORKOUTS_PER_WEEK_MIN + 
                             Math.floor(Math.random() * (WORKOUTS_PER_WEEK_MAX - WORKOUTS_PER_WEEK_MIN + 1));
    
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + (week * 7));
    
    // Generate workout days for this week
    const daysInWeek = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + day);
      
      if (date <= endDate) {
        daysInWeek.push(date.toISOString().split('T')[0]);
      }
    }
    
    // Randomly select workout days for this week
    const shuffled = daysInWeek.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(workoutsThisWeek, shuffled.length); i++) {
      workoutDays.add(shuffled[i]);
    }
  }
  
  return workoutDays;
}

/**
 * Generate realistic workout data for a user within a date range
 * 
 * Generates 3-5 workouts per week with:
 * - Varied sport types (running, cycling, weightlifting, etc.)
 * - Realistic durations (20-90 minutes)
 * - Heart rate zones based on intensity
 * - Distance and elevation for applicable sports
 * - Strain values correlated with duration and intensity
 * 
 * @param {string} userId - User identifier (UUID)
 * @param {Date} startDate - Start date for data generation
 * @param {Date} endDate - End date for data generation
 * @returns {Array<Object>} Array of workout records
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
function generateWorkoutData(userId, startDate, endDate) {
  const workoutRecords = [];
  
  // Ensure we don't modify the input dates
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  // Determine which days should have workouts
  const workoutDays = determineWorkoutDays(start, end);
  
  // Generate workouts for selected days
  workoutDays.forEach(dateString => {
    const workoutDate = new Date(dateString);
    
    // Generate workout start time (typically 6am-8pm)
    const startHour = 6 + Math.floor(Math.random() * 14); // 6-19 (6am-7pm)
    const startMinute = Math.floor(Math.random() * 60);
    workoutDate.setHours(startHour, startMinute, 0, 0);
    
    // Generate workout duration (20-90 minutes)
    const durationMinutes = 20 + Math.floor(Math.random() * 71); // 20-90 minutes
    const durationMillis = durationMinutes * 60 * 1000;
    
    const workoutEnd = new Date(workoutDate.getTime() + durationMillis);
    
    // Select random sport type
    const sportId = SPORT_IDS[Math.floor(Math.random() * SPORT_IDS.length)];
    
    const now = new Date();
    
    const workoutRecord = {
      id: uuidv4(),
      user_id: userId,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      start: workoutDate.toISOString(),
      end: workoutEnd.toISOString(),
      timezone_offset: '-08:00', // Pacific Time
      sport_id: sportId,
      score: generateWorkoutScore(durationMinutes, sportId),
    };
    
    workoutRecords.push(workoutRecord);
  });
  
  // Sort workouts by start time
  workoutRecords.sort((a, b) => new Date(a.start) - new Date(b.start));
  
  return workoutRecords;
}

module.exports = {
  generateWorkoutData,
  generateWorkoutScore,
  generateWorkoutStrain,
  generateWorkoutAverageHeartRate,
  generateWorkoutMaxHeartRate,
  generateWorkoutKilojoules,
  generateDistance,
  generateAltitude,
  generateZoneDuration,
  determineWorkoutDays,
  SPORT_TYPES,
};
