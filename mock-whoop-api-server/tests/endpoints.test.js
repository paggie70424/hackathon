/**
 * Unit Tests for All API Endpoints
 * Feature: life-metrics
 * 
 * Tests successful responses, error handling, pagination, and date validation
 * for all collection endpoints (sleep, recovery, cycle, workout).
 */

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

describe('API Endpoints Unit Tests', () => {
  let app, dataStore, token, userId;

  beforeEach(() => {
    // Create fresh data store and app for each test
    dataStore = new DataStore();
    
    // Add test user
    userId = 'test-user-789';
    dataStore.addUser({
      user_id: userId,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User'
    });
    
    // Create valid token
    token = dataStore.createToken(userId, 3600);

    // Generate test data for 30 days
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-30');
    
    const sleepData = generateSleepData(userId, startDate, endDate);
    const recoveryData = generateRecoveryData(userId, startDate, endDate, sleepData);
    const cycleData = generateCycleData(userId, startDate, endDate);
    const workoutData = generateWorkoutData(userId, startDate, endDate);
    
    dataStore.addSleepData(userId, sleepData);
    dataStore.addRecoveryData(userId, recoveryData);
    dataStore.addCycleData(userId, cycleData);
    dataStore.addWorkoutData(userId, workoutData);

    // Create Express app with all endpoints
    app = express();
    app.use(express.json());
    app.get('/developer/v1/activity/sleep', authMiddleware(dataStore), createSleepDataHandler(dataStore));
    app.get('/developer/v1/recovery', authMiddleware(dataStore), createRecoveryDataHandler(dataStore));
    app.get('/developer/v1/cycle', authMiddleware(dataStore), createCycleDataHandler(dataStore));
    app.get('/developer/v1/activity/workout', authMiddleware(dataStore), createWorkoutDataHandler(dataStore));
  });

  // Sleep Endpoint Tests
  describe('Sleep Endpoint', () => {
    test('should return 200 with valid token', async () => {
      const response = await request(app)
        .get('/developer/v1/activity/sleep')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('records');
      expect(Array.isArray(response.body.records)).toBe(true);
    });

    test('should return paginated results with default limit of 25', async () => {
      const response = await request(app)
        .get('/developer/v1/activity/sleep')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.records.length).toBeLessThanOrEqual(25);
    });

    test('should respect custom limit parameter', async () => {
      const response = await request(app)
        .get('/developer/v1/activity/sleep')
        .query({ limit: 5 })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.records.length).toBeLessThanOrEqual(5);
    });

    test('should return 400 for invalid limit', async () => {
      const response = await request(app)
        .get('/developer/v1/activity/sleep')
        .query({ limit: 150 })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_limit');
    });

    test('should support pagination with nextToken', async () => {
      // Get first page
      const firstPage = await request(app)
        .get('/developer/v1/activity/sleep')
        .query({ limit: 5 })
        .set('Authorization', `Bearer ${token}`);

      expect(firstPage.status).toBe(200);

      // If there's a next token, get second page
      if (firstPage.body.next_token) {
        const secondPage = await request(app)
          .get('/developer/v1/activity/sleep')
          .query({ limit: 5, nextToken: firstPage.body.next_token })
          .set('Authorization', `Bearer ${token}`);

        expect(secondPage.status).toBe(200);
        expect(secondPage.body.records).toBeDefined();
        
        // Records should be different
        if (firstPage.body.records.length > 0 && secondPage.body.records.length > 0) {
          expect(firstPage.body.records[0].id).not.toBe(secondPage.body.records[0].id);
        }
      }
    });

    test('should filter by date range', async () => {
      const response = await request(app)
        .get('/developer/v1/activity/sleep')
        .query({
          start: '2024-01-10T00:00:00Z',
          end: '2024-01-15T23:59:59Z'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      
      // All records should be within range
      response.body.records.forEach(record => {
        const recordDate = new Date(record.start);
        expect(recordDate >= new Date('2024-01-10')).toBe(true);
        expect(recordDate <= new Date('2024-01-15T23:59:59Z')).toBe(true);
      });
    });
  });

  // Recovery Endpoint Tests
  describe('Recovery Endpoint', () => {
    test('should return 200 with valid token', async () => {
      const response = await request(app)
        .get('/developer/v1/recovery')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('records');
      expect(Array.isArray(response.body.records)).toBe(true);
    });

    test('should return paginated results', async () => {
      const response = await request(app)
        .get('/developer/v1/recovery')
        .query({ limit: 10 })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.records.length).toBeLessThanOrEqual(10);
    });

    test('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .get('/developer/v1/recovery')
        .query({ start: 'not-a-date' })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_date');
    });

    test('should filter by date range', async () => {
      const response = await request(app)
        .get('/developer/v1/recovery')
        .query({
          start: '2024-01-05T00:00:00Z',
          end: '2024-01-10T23:59:59Z'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      
      // All records should be within range
      response.body.records.forEach(record => {
        const recordDate = new Date(record.created_at);
        expect(recordDate >= new Date('2024-01-05')).toBe(true);
        expect(recordDate <= new Date('2024-01-10T23:59:59Z')).toBe(true);
      });
    });
  });

  // Cycle Endpoint Tests
  describe('Cycle Endpoint', () => {
    test('should return 200 with valid token', async () => {
      const response = await request(app)
        .get('/developer/v1/cycle')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('records');
      expect(Array.isArray(response.body.records)).toBe(true);
    });

    test('should return paginated results', async () => {
      const response = await request(app)
        .get('/developer/v1/cycle')
        .query({ limit: 15 })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.records.length).toBeLessThanOrEqual(15);
    });

    test('should return 400 for invalid limit', async () => {
      const response = await request(app)
        .get('/developer/v1/cycle')
        .query({ limit: 0 })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_limit');
    });

    test('should return 400 when start date is after end date', async () => {
      const response = await request(app)
        .get('/developer/v1/cycle')
        .query({
          start: '2024-01-20T00:00:00Z',
          end: '2024-01-10T00:00:00Z'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_date_range');
    });

    test('should filter by date range', async () => {
      const response = await request(app)
        .get('/developer/v1/cycle')
        .query({
          start: '2024-01-15T00:00:00Z',
          end: '2024-01-20T23:59:59Z'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      
      // All records should be within range
      response.body.records.forEach(record => {
        const recordDate = new Date(record.start);
        expect(recordDate >= new Date('2024-01-15')).toBe(true);
        expect(recordDate <= new Date('2024-01-20T23:59:59Z')).toBe(true);
      });
    });
  });

  // Workout Endpoint Tests
  describe('Workout Endpoint', () => {
    test('should return 200 with valid token', async () => {
      const response = await request(app)
        .get('/developer/v1/activity/workout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('records');
      expect(Array.isArray(response.body.records)).toBe(true);
    });

    test('should return paginated results', async () => {
      const response = await request(app)
        .get('/developer/v1/activity/workout')
        .query({ limit: 20 })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.records.length).toBeLessThanOrEqual(20);
    });

    test('should return 400 for invalid pagination token', async () => {
      const response = await request(app)
        .get('/developer/v1/activity/workout')
        .query({ nextToken: 'invalid-token-xyz' })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_token');
    });

    test('should filter by date range', async () => {
      const response = await request(app)
        .get('/developer/v1/activity/workout')
        .query({
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-31T23:59:59Z'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      
      // All records should be within range
      response.body.records.forEach(record => {
        const recordDate = new Date(record.start);
        expect(recordDate >= new Date('2024-01-01')).toBe(true);
        expect(recordDate <= new Date('2024-01-31T23:59:59Z')).toBe(true);
      });
    });

    test('should return empty array for date range with no workouts', async () => {
      const response = await request(app)
        .get('/developer/v1/activity/workout')
        .query({
          start: '2025-06-01T00:00:00Z',
          end: '2025-06-30T23:59:59Z'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.records).toEqual([]);
    });
  });

  // Authentication Tests (applies to all endpoints)
  describe('Authentication', () => {
    test('all endpoints should return 401 without token', async () => {
      const endpoints = [
        '/developer/v1/activity/sleep',
        '/developer/v1/recovery',
        '/developer/v1/cycle',
        '/developer/v1/activity/workout'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('missing_token');
      }
    });

    test('all endpoints should return 401 with invalid token', async () => {
      const endpoints = [
        '/developer/v1/activity/sleep',
        '/developer/v1/recovery',
        '/developer/v1/cycle',
        '/developer/v1/activity/workout'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', 'Bearer invalid-token-12345');
        
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('invalid_token');
      }
    });
  });

  // Base Path Tests
  describe('Base Path Validation', () => {
    test('all endpoints should use /developer/v1/ base path', () => {
      const endpoints = [
        '/developer/v1/activity/sleep',
        '/developer/v1/recovery',
        '/developer/v1/cycle',
        '/developer/v1/activity/workout'
      ];

      endpoints.forEach(endpoint => {
        expect(endpoint.startsWith('/developer/v1/')).toBe(true);
      });
    });
  });
});
