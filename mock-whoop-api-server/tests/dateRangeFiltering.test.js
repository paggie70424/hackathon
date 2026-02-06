/**
 * Tests for Date Range Filtering across all collection endpoints
 * Feature: life-metrics
 */

const fc = require('fast-check');
const request = require('supertest');
const express = require('express');
const DataStore = require('../src/data/DataStore');
const authMiddleware = require('../src/middleware/auth');
const createSleepDataHandler = require('../src/routes/sleep');
const createRecoveryDataHandler = require('../src/routes/recovery');
const createCycleDataHandler = require('../src/routes/cycle');
const createWorkoutDataHandler = require('../src/routes/workout');
const { generateSleepData } = require('../src/data/generators/sleepGenerator');
const { generateRecoveryData } = require('../src/data/generators/recoveryGenerator');
const { generateCycleData } = require('../src/data/generators/cycleGenerator');
const { generateWorkoutData } = require('../src/data/generators/workoutGenerator');

describe('Date Range Filtering', () => {
  // Feature: life-metrics, Property 8: Date range filtering
  describe('Property 8: Date range filtering', () => {
    test('should only return records within the specified date range for all endpoints', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 30 }), // Days before today for start
          fc.integer({ min: 1, max: 30 }), // Days after start for end
          async (daysBeforeToday, daysAfterStart) => {
            // Create fresh instances for each iteration
            const dataStore = new DataStore();
            
            // Create test user
            const userId = 'test-user-123';
            dataStore.addUser({
              user_id: userId,
              email: 'test@example.com',
              first_name: 'Test',
              last_name: 'User'
            });
            
            // Create token
            const token = dataStore.createToken(userId, 3600);
            
            // Generate test data for a wider range (60 days)
            const dataStartDate = new Date();
            dataStartDate.setDate(dataStartDate.getDate() - 60);
            const dataEndDate = new Date();
            
            const sleepData = generateSleepData(userId, dataStartDate, dataEndDate);
            const recoveryData = generateRecoveryData(userId, dataStartDate, dataEndDate, sleepData);
            const cycleData = generateCycleData(userId, dataStartDate, dataEndDate);
            const workoutData = generateWorkoutData(userId, dataStartDate, dataEndDate);
            
            // Add data to store
            dataStore.addSleepData(userId, sleepData);
            dataStore.addRecoveryData(userId, recoveryData);
            dataStore.addCycleData(userId, cycleData);
            dataStore.addWorkoutData(userId, workoutData);
            
            // Define query date range (subset of data range)
            const queryStartDate = new Date();
            queryStartDate.setDate(queryStartDate.getDate() - daysBeforeToday);
            const queryEndDate = new Date(queryStartDate);
            queryEndDate.setDate(queryEndDate.getDate() + daysAfterStart);
            
            // Create Express app
            const app = express();
            app.use(express.json());
            app.get('/developer/v1/activity/sleep', authMiddleware(dataStore), createSleepDataHandler(dataStore));
            app.get('/developer/v1/recovery', authMiddleware(dataStore), createRecoveryDataHandler(dataStore));
            app.get('/developer/v1/cycle', authMiddleware(dataStore), createCycleDataHandler(dataStore));
            app.get('/developer/v1/activity/workout', authMiddleware(dataStore), createWorkoutDataHandler(dataStore));
            
            // Test sleep endpoint
            const sleepResponse = await request(app)
              .get('/developer/v1/activity/sleep')
              .query({
                start: queryStartDate.toISOString(),
                end: queryEndDate.toISOString(),
                limit: 100
              })
              .set('Authorization', `Bearer ${token}`);
            
            expect(sleepResponse.status).toBe(200);
            
            // Verify all sleep records are within date range
            for (const record of sleepResponse.body.records) {
              const recordDate = new Date(record.start);
              expect(recordDate >= queryStartDate).toBe(true);
              expect(recordDate <= queryEndDate).toBe(true);
            }
            
            // Test recovery endpoint
            const recoveryResponse = await request(app)
              .get('/developer/v1/recovery')
              .query({
                start: queryStartDate.toISOString(),
                end: queryEndDate.toISOString(),
                limit: 100
              })
              .set('Authorization', `Bearer ${token}`);
            
            expect(recoveryResponse.status).toBe(200);
            
            // Verify all recovery records are within date range
            for (const record of recoveryResponse.body.records) {
              const recordDate = new Date(record.created_at);
              expect(recordDate >= queryStartDate).toBe(true);
              expect(recordDate <= queryEndDate).toBe(true);
            }
            
            // Test cycle endpoint
            const cycleResponse = await request(app)
              .get('/developer/v1/cycle')
              .query({
                start: queryStartDate.toISOString(),
                end: queryEndDate.toISOString(),
                limit: 100
              })
              .set('Authorization', `Bearer ${token}`);
            
            expect(cycleResponse.status).toBe(200);
            
            // Verify all cycle records are within date range
            for (const record of cycleResponse.body.records) {
              const recordDate = new Date(record.start);
              expect(recordDate >= queryStartDate).toBe(true);
              expect(recordDate <= queryEndDate).toBe(true);
            }
            
            // Test workout endpoint
            const workoutResponse = await request(app)
              .get('/developer/v1/activity/workout')
              .query({
                start: queryStartDate.toISOString(),
                end: queryEndDate.toISOString(),
                limit: 100
              })
              .set('Authorization', `Bearer ${token}`);
            
            expect(workoutResponse.status).toBe(200);
            
            // Verify all workout records are within date range
            for (const record of workoutResponse.body.records) {
              const recordDate = new Date(record.start);
              expect(recordDate >= queryStartDate).toBe(true);
              expect(recordDate <= queryEndDate).toBe(true);
            }
          }
        ),
        { numRuns: 50 } // Reduced runs since this test generates a lot of data
      );
    });
  });

  // Unit tests for specific date filtering scenarios
  describe('Unit Tests', () => {
    let app, dataStore, token, userId;

    beforeEach(() => {
      dataStore = new DataStore();
      userId = 'test-user-456';
      dataStore.addUser({
        user_id: userId,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      });
      token = dataStore.createToken(userId, 3600);

      // Generate test data
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const sleepData = generateSleepData(userId, startDate, endDate);
      dataStore.addSleepData(userId, sleepData);

      app = express();
      app.use(express.json());
      app.get('/developer/v1/activity/sleep', authMiddleware(dataStore), createSleepDataHandler(dataStore));
    });

    test('should return 400 for invalid start date format', async () => {
      const response = await request(app)
        .get('/developer/v1/activity/sleep')
        .query({ start: 'invalid-date' })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_date');
    });

    test('should return 400 for invalid end date format', async () => {
      const response = await request(app)
        .get('/developer/v1/activity/sleep')
        .query({ end: 'not-a-date' })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_date');
    });

    test('should return 400 when start date is after end date', async () => {
      const response = await request(app)
        .get('/developer/v1/activity/sleep')
        .query({
          start: '2024-01-31T00:00:00Z',
          end: '2024-01-01T00:00:00Z'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_date_range');
    });

    test('should use default date range when no dates provided', async () => {
      const response = await request(app)
        .get('/developer/v1/activity/sleep')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('records');
    });

    test('should return empty array for date range with no data', async () => {
      const response = await request(app)
        .get('/developer/v1/activity/sleep')
        .query({
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-31T00:00:00Z'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.records).toEqual([]);
    });
  });
});
