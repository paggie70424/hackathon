/**
 * Data Models and Constants for Mock WHOOP API Server
 * 
 * This module defines JSDoc type definitions for all data models used in the
 * Mock WHOOP API Server, along with constants for realistic physiological ranges.
 * 
 * Requirements: 3.4, 4.3, 4.4, 5.3, 5.4, 6.3, 6.4, 7.3, 7.4, 9.3, 9.4
 */

// ============================================================================
// Physiological Constants - Realistic Ranges
// ============================================================================

/**
 * Heart rate range in beats per minute (bpm)
 * Based on Requirement 9.3: realistic ranges (40-200 bpm)
 */
const HEART_RATE_MIN = 40;
const HEART_RATE_MAX = 200;

/**
 * Resting heart rate range in beats per minute (bpm)
 * Typical resting heart rate for adults
 */
const RESTING_HEART_RATE_MIN = 40;
const RESTING_HEART_RATE_MAX = 100;

/**
 * Heart Rate Variability (HRV) range in milliseconds
 * Based on Requirement 9.4: realistic ranges (20-150 ms)
 */
const HRV_MIN = 20;
const HRV_MAX = 150;

/**
 * Strain range (WHOOP-specific metric)
 * Based on Requirement 6.5: strain values 0-21
 */
const STRAIN_MIN = 0;
const STRAIN_MAX = 21;

/**
 * Recovery score range (percentage)
 * Based on Requirement 5.4: recovery_score (0-100)
 */
const RECOVERY_SCORE_MIN = 0;
const RECOVERY_SCORE_MAX = 100;

/**
 * Sleep performance percentage range
 * Based on Requirement 4.4: sleep scores between 0-100
 */
const SLEEP_PERFORMANCE_MIN = 0;
const SLEEP_PERFORMANCE_MAX = 100;

/**
 * Sleep consistency percentage range
 */
const SLEEP_CONSISTENCY_MIN = 0;
const SLEEP_CONSISTENCY_MAX = 100;

/**
 * Sleep efficiency percentage range
 */
const SLEEP_EFFICIENCY_MIN = 0;
const SLEEP_EFFICIENCY_MAX = 100;

/**
 * Respiratory rate range in breaths per minute
 * Based on Property 13: respiratory rate (12-20 breaths/min)
 */
const RESPIRATORY_RATE_MIN = 12;
const RESPIRATORY_RATE_MAX = 20;

/**
 * Blood oxygen saturation (SpO2) percentage range
 * Based on Property 13: SpO2 (95-100%)
 */
const SPO2_MIN = 95;
const SPO2_MAX = 100;

/**
 * Skin temperature range in Celsius
 * Based on Property 13: skin temperature (33-36°C)
 */
const SKIN_TEMP_MIN = 33;
const SKIN_TEMP_MAX = 36;

/**
 * Sleep duration range in hours
 * Based on Requirement 4.5: 7-9 hours per night
 */
const SLEEP_DURATION_MIN_HOURS = 7;
const SLEEP_DURATION_MAX_HOURS = 9;

/**
 * Workout frequency per week
 * Based on Requirement 7.5: 3-5 workouts per week
 */
const WORKOUTS_PER_WEEK_MIN = 3;
const WORKOUTS_PER_WEEK_MAX = 5;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * User Profile
 * 
 * Represents a synthetic user account with basic profile information.
 * 
 * @typedef {Object} UserProfile
 * @property {string} user_id - Unique user identifier (UUID)
 * @property {string} email - User's email address
 * @property {string} first_name - User's first name
 * @property {string} last_name - User's last name
 * 
 * Requirements: 3.4
 */

/**
 * Sleep Stage Summary
 * 
 * Contains detailed breakdown of sleep stages and quality metrics.
 * 
 * @typedef {Object} SleepStageSummary
 * @property {number} total_in_bed_time_milli - Total time in bed in milliseconds
 * @property {number} total_awake_time_milli - Total time awake in milliseconds
 * @property {number} total_no_data_time_milli - Total time with no data in milliseconds
 * @property {number} total_light_sleep_time_milli - Total light sleep time in milliseconds
 * @property {number} total_slow_wave_sleep_time_milli - Total deep sleep time in milliseconds
 * @property {number} total_rem_sleep_time_milli - Total REM sleep time in milliseconds
 * @property {number} sleep_cycle_count - Number of complete sleep cycles
 * @property {number} disturbance_count - Number of sleep disturbances
 * 
 * Requirements: 4.4
 */

/**
 * Sleep Needed
 * 
 * Breakdown of sleep need from various factors.
 * 
 * @typedef {Object} SleepNeeded
 * @property {number} baseline_milli - Baseline sleep need in milliseconds
 * @property {number} need_from_sleep_debt_milli - Additional need from sleep debt in milliseconds
 * @property {number} need_from_recent_strain_milli - Additional need from recent strain in milliseconds
 * @property {number} need_from_recent_nap_milli - Reduction from recent naps in milliseconds
 * 
 * Requirements: 4.4
 */

/**
 * Sleep Score
 * 
 * Comprehensive sleep quality metrics and analysis.
 * 
 * @typedef {Object} SleepScore
 * @property {SleepStageSummary} stage_summary - Sleep stage breakdown
 * @property {SleepNeeded} sleep_needed - Sleep need analysis
 * @property {number} respiratory_rate - Average respiratory rate in breaths per minute
 * @property {number} sleep_performance_percentage - Sleep performance score (0-100)
 * @property {number} sleep_consistency_percentage - Sleep consistency score (0-100)
 * @property {number} sleep_efficiency_percentage - Sleep efficiency score (0-100)
 * 
 * Requirements: 4.4
 */

/**
 * Sleep Record
 * 
 * Represents a single sleep session with detailed metrics.
 * 
 * @typedef {Object} SleepRecord
 * @property {string} id - Unique sleep record identifier (UUID)
 * @property {string} user_id - User identifier (UUID)
 * @property {string} created_at - Record creation timestamp (ISO 8601)
 * @property {string} updated_at - Record last update timestamp (ISO 8601)
 * @property {string} start - Sleep start timestamp (ISO 8601)
 * @property {string} end - Sleep end timestamp (ISO 8601)
 * @property {string} timezone_offset - Timezone offset (e.g., "-08:00")
 * @property {boolean} nap - Whether this is a nap (true) or main sleep (false)
 * @property {string} score_state - Scoring state ("SCORED" | "PENDING")
 * @property {SleepScore} score - Sleep quality metrics
 * 
 * Requirements: 4.3, 4.4
 */

/**
 * Recovery Score
 * 
 * Daily recovery metrics including HRV and physiological measurements.
 * 
 * @typedef {Object} RecoveryScore
 * @property {number} recovery_score - Overall recovery score (0-100)
 * @property {number} resting_heart_rate - Resting heart rate in bpm
 * @property {number} hrv_rmssd_milli - Heart rate variability (RMSSD) in milliseconds
 * @property {number} spo2_percentage - Blood oxygen saturation percentage (0-100)
 * @property {number} skin_temp_celsius - Skin temperature in Celsius
 * 
 * Requirements: 5.4
 */

/**
 * Recovery Record
 * 
 * Represents daily recovery data with correlations to sleep and cycle.
 * 
 * @typedef {Object} RecoveryRecord
 * @property {string} id - Unique recovery record identifier (UUID)
 * @property {string} user_id - User identifier (UUID)
 * @property {string} created_at - Record creation timestamp (ISO 8601)
 * @property {string} updated_at - Record last update timestamp (ISO 8601)
 * @property {string} cycle_id - Associated cycle identifier (UUID)
 * @property {string} sleep_id - Associated sleep identifier (UUID)
 * @property {boolean} user_calibrating - Whether user is in calibration period
 * @property {RecoveryScore} score - Recovery metrics
 * 
 * Requirements: 5.3, 5.4
 */

/**
 * Cycle Score
 * 
 * Daily physiological cycle metrics including strain and heart rate.
 * 
 * @typedef {Object} CycleScore
 * @property {number} strain - Daily strain score (0-21)
 * @property {number} kilojoule - Energy expenditure in kilojoules
 * @property {number} average_heart_rate - Average heart rate in bpm
 * @property {number} max_heart_rate - Maximum heart rate in bpm
 * 
 * Requirements: 6.4
 */

/**
 * Cycle Record
 * 
 * Represents a daily physiological cycle (typically 24 hours).
 * 
 * @typedef {Object} CycleRecord
 * @property {string} id - Unique cycle record identifier (UUID)
 * @property {string} user_id - User identifier (UUID)
 * @property {string} created_at - Record creation timestamp (ISO 8601)
 * @property {string} updated_at - Record last update timestamp (ISO 8601)
 * @property {string} start - Cycle start timestamp (ISO 8601)
 * @property {string} end - Cycle end timestamp (ISO 8601)
 * @property {string} timezone_offset - Timezone offset (e.g., "-08:00")
 * @property {CycleScore} score - Cycle metrics
 * 
 * Requirements: 6.3, 6.4
 */

/**
 * Heart Rate Zone Duration
 * 
 * Time spent in each heart rate zone during a workout.
 * 
 * @typedef {Object} ZoneDuration
 * @property {number} zone_zero_milli - Time in zone 0 (very light) in milliseconds
 * @property {number} zone_one_milli - Time in zone 1 (light) in milliseconds
 * @property {number} zone_two_milli - Time in zone 2 (moderate) in milliseconds
 * @property {number} zone_three_milli - Time in zone 3 (hard) in milliseconds
 * @property {number} zone_four_milli - Time in zone 4 (very hard) in milliseconds
 * @property {number} zone_five_milli - Time in zone 5 (max effort) in milliseconds
 * 
 * Requirements: 7.4
 */

/**
 * Workout Score
 * 
 * Detailed workout performance metrics.
 * 
 * @typedef {Object} WorkoutScore
 * @property {number} strain - Workout strain score (0-21)
 * @property {number} average_heart_rate - Average heart rate in bpm
 * @property {number} max_heart_rate - Maximum heart rate in bpm
 * @property {number} kilojoule - Energy expenditure in kilojoules
 * @property {number} percent_recorded - Percentage of workout recorded (0-100)
 * @property {number} distance_meter - Distance covered in meters
 * @property {number} altitude_gain_meter - Altitude gained in meters
 * @property {number} altitude_change_meter - Net altitude change in meters
 * @property {ZoneDuration} zone_duration - Time spent in each heart rate zone
 * 
 * Requirements: 7.4
 */

/**
 * Workout Record
 * 
 * Represents a single workout session with detailed performance metrics.
 * 
 * @typedef {Object} WorkoutRecord
 * @property {string} id - Unique workout record identifier (UUID)
 * @property {string} user_id - User identifier (UUID)
 * @property {string} created_at - Record creation timestamp (ISO 8601)
 * @property {string} updated_at - Record last update timestamp (ISO 8601)
 * @property {string} start - Workout start timestamp (ISO 8601)
 * @property {string} end - Workout end timestamp (ISO 8601)
 * @property {string} timezone_offset - Timezone offset (e.g., "-08:00")
 * @property {number} sport_id - WHOOP sport identifier
 * @property {WorkoutScore} score - Workout performance metrics
 * 
 * Requirements: 7.3, 7.4
 */

/**
 * Authentication Token Data
 * 
 * Internal representation of an authentication token.
 * 
 * @typedef {Object} TokenData
 * @property {string} userId - Associated user identifier
 * @property {number} expiresAt - Token expiration timestamp (Unix milliseconds)
 * 
 * Requirements: 2.3, 2.4
 */

/**
 * Paginated Response
 * 
 * Generic paginated API response structure.
 * 
 * @template T
 * @typedef {Object} PaginatedResponse
 * @property {T[]} records - Array of records for current page
 * @property {string} [next_token] - Token for retrieving next page (optional)
 * 
 * Requirements: 8.1, 8.3, 8.5
 */

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // Constants - Heart Rate
  HEART_RATE_MIN,
  HEART_RATE_MAX,
  RESTING_HEART_RATE_MIN,
  RESTING_HEART_RATE_MAX,
  
  // Constants - HRV
  HRV_MIN,
  HRV_MAX,
  
  // Constants - Strain and Recovery
  STRAIN_MIN,
  STRAIN_MAX,
  RECOVERY_SCORE_MIN,
  RECOVERY_SCORE_MAX,
  
  // Constants - Sleep
  SLEEP_PERFORMANCE_MIN,
  SLEEP_PERFORMANCE_MAX,
  SLEEP_CONSISTENCY_MIN,
  SLEEP_CONSISTENCY_MAX,
  SLEEP_EFFICIENCY_MIN,
  SLEEP_EFFICIENCY_MAX,
  SLEEP_DURATION_MIN_HOURS,
  SLEEP_DURATION_MAX_HOURS,
  
  // Constants - Respiratory and Vitals
  RESPIRATORY_RATE_MIN,
  RESPIRATORY_RATE_MAX,
  SPO2_MIN,
  SPO2_MAX,
  SKIN_TEMP_MIN,
  SKIN_TEMP_MAX,
  
  // Constants - Workouts
  WORKOUTS_PER_WEEK_MIN,
  WORKOUTS_PER_WEEK_MAX,
};
