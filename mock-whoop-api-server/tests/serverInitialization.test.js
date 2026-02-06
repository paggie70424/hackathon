/**
 * Unit Tests: Server Initialization
 * 
 * Tests for server initialization, data pre-generation, and server startup.
 * 
 * Requirements: 1.6
 */

const request = require('supertest');
const { initializeDataStore, getPredefinedUsers } = require('../src/data/initialize');
const createApp = require('../src/app');

describe('Server Initialization', () => {
  let dataStore;
  let app;
  
  beforeAll(() => {
    // Initialize data store with pre-generated data
    dataStore = initializeDataStore();
    app = createApp(dataStore);
  });
  
  describe('Data Store Initialization', () => {
    test('should create data store successfully', () => {
      expect(dataStore).toBeDefined();
      expect(dataStore.users).toBeDefined();
      expect(dataStore.sleepData).toBeDefined();
      expect(dataStore.recoveryData).toBeDefined();
      expect(dataStore.cycleData).toBeDefined();
      expect(dataStore.workoutData).toBeDefined();
    });
    
    test('should pre-generate data for all users', () => {
      const users = getPredefinedUsers();
      
      // Verify all users are in the data store
      expect(users.length).toBeGreaterThanOrEqual(5);
      
      users.forEach(user => {
        // Check user exists
        const storedUser = dataStore.getUser(user.user_id);
        expect(storedUser).toBeDefined();
        expect(storedUser.user_id).toBe(user.user_id);
        expect(storedUser.email).toBe(user.email);
        expect(storedUser.first_name).toBe(user.first_name);
        expect(storedUser.last_name).toBe(user.last_name);
      });
    });
    
    test('should pre-generate 90 days of sleep data for each user', () => {
      const users = getPredefinedUsers();
      
      // Calculate date range (90 days)
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 90);
      
      users.forEach(user => {
        const sleepData = dataStore.getSleepData(user.user_id, startDate, endDate);
        
        // Should have approximately 91 sleep records (90 days + 1)
        // Allow some variance due to date range calculations
        expect(sleepData.length).toBeGreaterThanOrEqual(85);
        expect(sleepData.length).toBeLessThanOrEqual(95);
        
        // Verify sleep records have required fields
        sleepData.forEach(record => {
          expect(record.id).toBeDefined();
          expect(record.user_id).toBe(user.user_id);
          expect(record.start).toBeDefined();
          expect(record.end).toBeDefined();
          expect(record.score).toBeDefined();
        });
      });
    });
    
    test('should pre-generate 90 days of recovery data for each user', () => {
      const users = getPredefinedUsers();
      
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 90);
      
      users.forEach(user => {
        const recoveryData = dataStore.getRecoveryData(user.user_id, startDate, endDate);
        
        // Should have approximately 91 recovery records
        expect(recoveryData.length).toBeGreaterThanOrEqual(85);
        expect(recoveryData.length).toBeLessThanOrEqual(95);
        
        // Verify recovery records have required fields
        recoveryData.forEach(record => {
          expect(record.id).toBeDefined();
          expect(record.user_id).toBe(user.user_id);
          expect(record.score).toBeDefined();
          expect(record.score.recovery_score).toBeDefined();
        });
      });
    });
    
    test('should pre-generate 90 days of cycle data for each user', () => {
      const users = getPredefinedUsers();
      
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 90);
      
      users.forEach(user => {
        const cycleData = dataStore.getCycleData(user.user_id, startDate, endDate);
        
        // Should have approximately 91 cycle records
        expect(cycleData.length).toBeGreaterThanOrEqual(85);
        expect(cycleData.length).toBeLessThanOrEqual(95);
        
        // Verify cycle records have required fields
        cycleData.forEach(record => {
          expect(record.id).toBeDefined();
          expect(record.user_id).toBe(user.user_id);
          expect(record.start).toBeDefined();
          expect(record.end).toBeDefined();
          expect(record.score).toBeDefined();
          expect(record.score.strain).toBeDefined();
        });
      });
    });
    
    test('should pre-generate workout data for each user', () => {
      const users = getPredefinedUsers();
      
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 90);
      
      users.forEach(user => {
        const workoutData = dataStore.getWorkoutData(user.user_id, startDate, endDate);
        
        // Should have workouts (3-5 per week for ~13 weeks = ~39-65 workouts)
        expect(workoutData.length).toBeGreaterThanOrEqual(30);
        expect(workoutData.length).toBeLessThanOrEqual(70);
        
        // Verify workout records have required fields
        workoutData.forEach(record => {
          expect(record.id).toBeDefined();
          expect(record.user_id).toBe(user.user_id);
          expect(record.start).toBeDefined();
          expect(record.end).toBeDefined();
          expect(record.sport_id).toBeDefined();
          expect(record.score).toBeDefined();
          expect(record.score.strain).toBeDefined();
        });
      });
    });
  });
  
  describe('Server Startup', () => {
    test('should start server successfully', () => {
      expect(app).toBeDefined();
    });
    
    test('should respond to requests after initialization', async () => {
      // Get a user and create a token
      const users = getPredefinedUsers();
      const testUser = users[0];
      const token = dataStore.createToken(testUser.user_id, 3600);
      
      // Test that server responds to a request
      const response = await request(app)
        .get('/developer/v1/user/profile/basic')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.user_id).toBe(testUser.user_id);
    });
    
    test('should serve pre-generated data through endpoints', async () => {
      // Get a user and create a token
      const users = getPredefinedUsers();
      const testUser = users[0];
      const token = dataStore.createToken(testUser.user_id, 3600);
      
      // Test sleep endpoint
      const sleepResponse = await request(app)
        .get('/developer/v1/activity/sleep')
        .set('Authorization', `Bearer ${token}`);
      
      expect(sleepResponse.status).toBe(200);
      expect(sleepResponse.body.records).toBeDefined();
      expect(sleepResponse.body.records.length).toBeGreaterThan(0);
      
      // Test recovery endpoint
      const recoveryResponse = await request(app)
        .get('/developer/v1/recovery')
        .set('Authorization', `Bearer ${token}`);
      
      expect(recoveryResponse.status).toBe(200);
      expect(recoveryResponse.body.records).toBeDefined();
      expect(recoveryResponse.body.records.length).toBeGreaterThan(0);
      
      // Test cycle endpoint
      const cycleResponse = await request(app)
        .get('/developer/v1/cycle')
        .set('Authorization', `Bearer ${token}`);
      
      expect(cycleResponse.status).toBe(200);
      expect(cycleResponse.body.records).toBeDefined();
      expect(cycleResponse.body.records.length).toBeGreaterThan(0);
      
      // Test workout endpoint
      const workoutResponse = await request(app)
        .get('/developer/v1/activity/workout')
        .set('Authorization', `Bearer ${token}`);
      
      expect(workoutResponse.status).toBe(200);
      expect(workoutResponse.body.records).toBeDefined();
      expect(workoutResponse.body.records.length).toBeGreaterThan(0);
    });
    
    test('should have consistent data across multiple requests', async () => {
      // Get a user and create a token
      const users = getPredefinedUsers();
      const testUser = users[0];
      const token = dataStore.createToken(testUser.user_id, 3600);
      
      // Make two requests to the same endpoint
      const response1 = await request(app)
        .get('/developer/v1/user/profile/basic')
        .set('Authorization', `Bearer ${token}`);
      
      const response2 = await request(app)
        .get('/developer/v1/user/profile/basic')
        .set('Authorization', `Bearer ${token}`);
      
      // Responses should be identical
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body).toEqual(response2.body);
    });
  });
  
  describe('Pre-defined Users', () => {
    test('should have at least 5 pre-defined users', () => {
      const users = getPredefinedUsers();
      expect(users.length).toBeGreaterThanOrEqual(5);
    });
    
    test('each user should have required profile fields', () => {
      const users = getPredefinedUsers();
      
      users.forEach(user => {
        expect(user.user_id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.first_name).toBeDefined();
        expect(user.last_name).toBeDefined();
        
        // Validate email format
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });
    
    test('all users should have unique IDs', () => {
      const users = getPredefinedUsers();
      const userIds = users.map(u => u.user_id);
      const uniqueIds = new Set(userIds);
      
      expect(uniqueIds.size).toBe(users.length);
    });
    
    test('all users should have unique emails', () => {
      const users = getPredefinedUsers();
      const emails = users.map(u => u.email);
      const uniqueEmails = new Set(emails);
      
      expect(uniqueEmails.size).toBe(users.length);
    });
  });
});
