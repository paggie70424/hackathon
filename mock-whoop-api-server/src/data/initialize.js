/**
 * Data Initialization Module
 * 
 * Initializes the Mock WHOOP API Server with pre-defined users and
 * pre-generated synthetic health data for 90 days.
 * 
 * Requirements: 1.6, 3.1
 */

const { v4: uuidv4 } = require('uuid');
const DataStore = require('./DataStore');
const { generateSleepData } = require('./generators/sleepGenerator');
const { generateRecoveryData } = require('./generators/recoveryGenerator');
const { generateCycleData } = require('./generators/cycleGenerator');
const { generateWorkoutData } = require('./generators/workoutGenerator');

/**
 * Pre-defined user profiles for testing
 * 
 * Creates 5 distinct users with realistic profile information.
 * 
 * Requirements: 3.1
 */
const PREDEFINED_USERS = [
  {
    user_id: uuidv4(),
    email: 'alice.johnson@example.com',
    first_name: 'Alice',
    last_name: 'Johnson',
  },
  {
    user_id: uuidv4(),
    email: 'bob.smith@example.com',
    first_name: 'Bob',
    last_name: 'Smith',
  },
  {
    user_id: uuidv4(),
    email: 'carol.williams@example.com',
    first_name: 'Carol',
    last_name: 'Williams',
  },
  {
    user_id: uuidv4(),
    email: 'david.brown@example.com',
    first_name: 'David',
    last_name: 'Brown',
  },
  {
    user_id: uuidv4(),
    email: 'emma.davis@example.com',
    first_name: 'Emma',
    last_name: 'Davis',
  },
];

/**
 * Calculate date range for data generation
 * 
 * Generates data for the past 90 days from today.
 * 
 * @returns {Object} Object with startDate and endDate
 */
function calculateDateRange() {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 90);
  startDate.setHours(0, 0, 0, 0);
  
  return { startDate, endDate };
}

/**
 * Initialize data store with users and synthetic health data
 * 
 * Creates a new DataStore instance, adds pre-defined users, and generates
 * 90 days of synthetic health data for each user.
 * 
 * Logs progress during initialization to provide feedback.
 * 
 * @returns {DataStore} Initialized data store with all data
 * 
 * Requirements: 1.6, 3.1
 */
function initializeDataStore() {
  console.log('Initializing Mock WHOOP API Server data store...');
  
  const dataStore = new DataStore();
  const { startDate, endDate } = calculateDateRange();
  
  console.log(`Generating data for date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
  
  // Add users to data store
  console.log(`Creating ${PREDEFINED_USERS.length} pre-defined users...`);
  PREDEFINED_USERS.forEach(user => {
    dataStore.addUser(user);
    console.log(`  - Created user: ${user.first_name} ${user.last_name} (${user.email})`);
  });
  
  // Generate synthetic data for each user
  console.log('\nGenerating synthetic health data for all users...');
  
  PREDEFINED_USERS.forEach((user, index) => {
    console.log(`\n[${index + 1}/${PREDEFINED_USERS.length}] Generating data for ${user.first_name} ${user.last_name}...`);
    
    // Generate sleep data
    console.log('  - Generating sleep data...');
    const sleepData = generateSleepData(user.user_id, startDate, endDate);
    dataStore.addSleepData(user.user_id, sleepData);
    console.log(`    ✓ Generated ${sleepData.length} sleep records`);
    
    // Generate recovery data (correlated with sleep)
    console.log('  - Generating recovery data...');
    const recoveryData = generateRecoveryData(user.user_id, startDate, endDate, sleepData);
    dataStore.addRecoveryData(user.user_id, recoveryData);
    console.log(`    ✓ Generated ${recoveryData.length} recovery records`);
    
    // Generate cycle data
    console.log('  - Generating cycle data...');
    const cycleData = generateCycleData(user.user_id, startDate, endDate);
    dataStore.addCycleData(user.user_id, cycleData);
    console.log(`    ✓ Generated ${cycleData.length} cycle records`);
    
    // Generate workout data
    console.log('  - Generating workout data...');
    const workoutData = generateWorkoutData(user.user_id, startDate, endDate);
    dataStore.addWorkoutData(user.user_id, workoutData);
    console.log(`    ✓ Generated ${workoutData.length} workout records`);
  });
  
  console.log('\n✓ Data store initialization complete!');
  console.log(`\nSummary:`);
  console.log(`  - Users: ${PREDEFINED_USERS.length}`);
  console.log(`  - Date range: 90 days`);
  console.log(`  - Total records per user: ~${91 * 3 + 30} (sleep, recovery, cycle, workouts)`);
  
  return dataStore;
}

/**
 * Get list of pre-defined users
 * 
 * Useful for testing and token generation.
 * 
 * @returns {Array<Object>} Array of user profiles
 */
function getPredefinedUsers() {
  return PREDEFINED_USERS;
}

module.exports = {
  initializeDataStore,
  getPredefinedUsers,
  PREDEFINED_USERS,
};
