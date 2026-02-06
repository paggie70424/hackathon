/**
 * In-Memory Data Store for Mock WHOOP API Server
 * 
 * This module provides a simple in-memory data store using JavaScript Maps
 * to store users, authentication tokens, and health data (sleep, recovery,
 * cycle, workout records).
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.5, 2.4
 */

const crypto = require('crypto');

/**
 * DataStore class for managing in-memory storage of all server data
 */
class DataStore {
  constructor() {
    /**
     * Map of user IDs to UserProfile objects
     * @type {Map<string, import('../models').UserProfile>}
     */
    this.users = new Map();
    
    /**
     * Map of authentication tokens to token data
     * @type {Map<string, {userId: string, expiresAt: number}>}
     */
    this.tokens = new Map();
    
    /**
     * Map of user IDs to arrays of SleepRecord objects
     * @type {Map<string, import('../models').SleepRecord[]>}
     */
    this.sleepData = new Map();
    
    /**
     * Map of user IDs to arrays of RecoveryRecord objects
     * @type {Map<string, import('../models').RecoveryRecord[]>}
     */
    this.recoveryData = new Map();
    
    /**
     * Map of user IDs to arrays of CycleRecord objects
     * @type {Map<string, import('../models').CycleRecord[]>}
     */
    this.cycleData = new Map();
    
    /**
     * Map of user IDs to arrays of WorkoutRecord objects
     * @type {Map<string, import('../models').WorkoutRecord[]>}
     */
    this.workoutData = new Map();
  }

  // ============================================================================
  // User Methods
  // ============================================================================

  /**
   * Get a user by their user ID
   * 
   * @param {string} userId - The user ID to look up
   * @returns {import('../models').UserProfile | undefined} The user profile or undefined if not found
   * 
   * Requirements: 3.1, 3.3
   */
  getUser(userId) {
    return this.users.get(userId);
  }

  /**
   * Get a user by their authentication token
   * 
   * @param {string} token - The authentication token
   * @returns {import('../models').UserProfile | null} The user profile or null if token is invalid/expired
   * 
   * Requirements: 3.2, 2.4
   */
  getUserByToken(token) {
    const tokenData = this.tokens.get(token);
    
    if (!tokenData) {
      return null;
    }
    
    // Check if token is expired
    if (Date.now() > tokenData.expiresAt) {
      // Clean up expired token
      this.tokens.delete(token);
      return null;
    }
    
    return this.users.get(tokenData.userId) || null;
  }

  /**
   * Add a user to the data store
   * 
   * @param {import('../models').UserProfile} user - The user profile to add
   * 
   * Requirements: 3.1
   */
  addUser(user) {
    this.users.set(user.user_id, user);
  }

  // ============================================================================
  // Token Methods
  // ============================================================================

  /**
   * Create a new authentication token for a user
   * 
   * @param {string} userId - The user ID to create a token for
   * @param {number} expiresIn - Token lifetime in seconds (default: 3600)
   * @returns {string} The generated authentication token
   * 
   * Requirements: 2.3, 2.4
   */
  createToken(userId, expiresIn = 3600) {
    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Calculate expiration time
    const expiresAt = Date.now() + (expiresIn * 1000);
    
    // Store token data
    this.tokens.set(token, {
      userId,
      expiresAt
    });
    
    return token;
  }

  /**
   * Validate an authentication token and return the associated user ID
   * 
   * @param {string} token - The authentication token to validate
   * @returns {string | null} The user ID if token is valid, null otherwise
   * 
   * Requirements: 2.4, 2.5
   */
  validateToken(token) {
    const tokenData = this.tokens.get(token);
    
    if (!tokenData) {
      return null;
    }
    
    // Check if token is expired
    if (Date.now() > tokenData.expiresAt) {
      // Clean up expired token
      this.tokens.delete(token);
      return null;
    }
    
    return tokenData.userId;
  }

  // ============================================================================
  // Sleep Data Methods
  // ============================================================================

  /**
   * Get sleep data for a user within a date range
   * 
   * @param {string} userId - The user ID
   * @param {Date} startDate - Start of date range (inclusive)
   * @param {Date} endDate - End of date range (inclusive)
   * @returns {import('../models').SleepRecord[]} Array of sleep records within the date range
   * 
   * Requirements: 4.2, 8.8
   */
  getSleepData(userId, startDate, endDate) {
    const allSleepData = this.sleepData.get(userId) || [];
    
    // Filter by date range
    return allSleepData.filter(record => {
      const recordDate = new Date(record.start);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  /**
   * Add sleep data for a user
   * 
   * @param {string} userId - The user ID
   * @param {import('../models').SleepRecord[]} sleepRecords - Array of sleep records to add
   * 
   * Requirements: 4.1
   */
  addSleepData(userId, sleepRecords) {
    if (!this.sleepData.has(userId)) {
      this.sleepData.set(userId, []);
    }
    
    const existingData = this.sleepData.get(userId);
    existingData.push(...sleepRecords);
    
    // Sort by start date for consistent ordering
    existingData.sort((a, b) => new Date(a.start) - new Date(b.start));
  }

  // ============================================================================
  // Recovery Data Methods
  // ============================================================================

  /**
   * Get recovery data for a user within a date range
   * 
   * @param {string} userId - The user ID
   * @param {Date} startDate - Start of date range (inclusive)
   * @param {Date} endDate - End of date range (inclusive)
   * @returns {import('../models').RecoveryRecord[]} Array of recovery records within the date range
   * 
   * Requirements: 5.2, 8.8
   */
  getRecoveryData(userId, startDate, endDate) {
    const allRecoveryData = this.recoveryData.get(userId) || [];
    
    // Filter by date range using created_at timestamp
    return allRecoveryData.filter(record => {
      const recordDate = new Date(record.created_at);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  /**
   * Add recovery data for a user
   * 
   * @param {string} userId - The user ID
   * @param {import('../models').RecoveryRecord[]} recoveryRecords - Array of recovery records to add
   * 
   * Requirements: 5.1
   */
  addRecoveryData(userId, recoveryRecords) {
    if (!this.recoveryData.has(userId)) {
      this.recoveryData.set(userId, []);
    }
    
    const existingData = this.recoveryData.get(userId);
    existingData.push(...recoveryRecords);
    
    // Sort by created_at date for consistent ordering
    existingData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  // ============================================================================
  // Cycle Data Methods
  // ============================================================================

  /**
   * Get cycle data for a user within a date range
   * 
   * @param {string} userId - The user ID
   * @param {Date} startDate - Start of date range (inclusive)
   * @param {Date} endDate - End of date range (inclusive)
   * @returns {import('../models').CycleRecord[]} Array of cycle records within the date range
   * 
   * Requirements: 6.2, 8.8
   */
  getCycleData(userId, startDate, endDate) {
    const allCycleData = this.cycleData.get(userId) || [];
    
    // Filter by date range using start timestamp
    return allCycleData.filter(record => {
      const recordDate = new Date(record.start);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  /**
   * Add cycle data for a user
   * 
   * @param {string} userId - The user ID
   * @param {import('../models').CycleRecord[]} cycleRecords - Array of cycle records to add
   * 
   * Requirements: 6.1
   */
  addCycleData(userId, cycleRecords) {
    if (!this.cycleData.has(userId)) {
      this.cycleData.set(userId, []);
    }
    
    const existingData = this.cycleData.get(userId);
    existingData.push(...cycleRecords);
    
    // Sort by start date for consistent ordering
    existingData.sort((a, b) => new Date(a.start) - new Date(b.start));
  }

  // ============================================================================
  // Workout Data Methods
  // ============================================================================

  /**
   * Get workout data for a user within a date range
   * 
   * @param {string} userId - The user ID
   * @param {Date} startDate - Start of date range (inclusive)
   * @param {Date} endDate - End of date range (inclusive)
   * @returns {import('../models').WorkoutRecord[]} Array of workout records within the date range
   * 
   * Requirements: 7.2, 8.8
   */
  getWorkoutData(userId, startDate, endDate) {
    const allWorkoutData = this.workoutData.get(userId) || [];
    
    // Filter by date range using start timestamp
    return allWorkoutData.filter(record => {
      const recordDate = new Date(record.start);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  /**
   * Add workout data for a user
   * 
   * @param {string} userId - The user ID
   * @param {import('../models').WorkoutRecord[]} workoutRecords - Array of workout records to add
   * 
   * Requirements: 7.1
   */
  addWorkoutData(userId, workoutRecords) {
    if (!this.workoutData.has(userId)) {
      this.workoutData.set(userId, []);
    }
    
    const existingData = this.workoutData.get(userId);
    existingData.push(...workoutRecords);
    
    // Sort by start date for consistent ordering
    existingData.sort((a, b) => new Date(a.start) - new Date(b.start));
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get all user IDs in the data store
   * 
   * @returns {string[]} Array of all user IDs
   */
  getAllUserIds() {
    return Array.from(this.users.keys());
  }

  /**
   * Clear all data from the store (useful for testing)
   */
  clear() {
    this.users.clear();
    this.tokens.clear();
    this.sleepData.clear();
    this.recoveryData.clear();
    this.cycleData.clear();
    this.workoutData.clear();
  }
}

module.exports = DataStore;
