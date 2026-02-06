/**
 * Tests for User Profile Endpoint
 * Feature: life-metrics
 */

const fc = require('fast-check');
const request = require('supertest');
const express = require('express');
const DataStore = require('../src/data/DataStore');
const createUserProfileHandler = require('../src/routes/userProfile');
const authMiddleware = require('../src/middleware/auth');

describe('User Profile Endpoint', () => {
  let app;
  let dataStore;
  let validToken;
  let testUser;

  beforeEach(() => {
    // Create fresh data store and app for each test
    dataStore = new DataStore();
    
    // Add test user
    testUser = {
      user_id: 'user-123',
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe'
    };
    dataStore.addUser(testUser);
    
    // Create valid token
    validToken = dataStore.createToken(testUser.user_id, 3600);

    // Create Express app
    app = express();
    app.use(express.json());
    app.get('/developer/v1/user/profile/basic', authMiddleware(dataStore), createUserProfileHandler(dataStore));
  });

  // Feature: life-metrics, Property 6: User profile idempotence
  describe('Property 6: User profile idempotence', () => {
    test('should return identical data for multiple requests with same token', () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 10 }),
          async (numRequests) => {
            const responses = [];
            
            // Make multiple requests with the same token
            for (let i = 0; i < numRequests; i++) {
              const response = await request(app)
                .get('/developer/v1/user/profile/basic')
                .set('Authorization', `Bearer ${validToken}`);
              
              expect(response.status).toBe(200);
              responses.push(response.body);
            }
            
            // All responses should be identical
            const firstResponse = responses[0];
            for (let i = 1; i < responses.length; i++) {
              expect(responses[i]).toEqual(firstResponse);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: life-metrics, Property 7: User profile contains required fields
  describe('Property 7: User profile contains required fields', () => {
    test('should always contain user_id, email, first_name, and last_name', () => {
      fc.assert(
        fc.asyncProperty(
          fc.record({
            user_id: fc.uuid(),
            email: fc.emailAddress(),
            first_name: fc.string({ minLength: 1, maxLength: 50 }),
            last_name: fc.string({ minLength: 1, maxLength: 50 })
          }),
          async (user) => {
            // Create fresh instances for each iteration
            const testDataStore = new DataStore();
            testDataStore.addUser(user);
            const token = testDataStore.createToken(user.user_id, 3600);
            
            const testApp = express();
            testApp.use(express.json());
            testApp.get('/developer/v1/user/profile/basic', 
              authMiddleware(testDataStore), 
              createUserProfileHandler(testDataStore));

            const response = await request(testApp)
              .get('/developer/v1/user/profile/basic')
              .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            
            // Check all required fields are present
            expect(response.body).toHaveProperty('user_id');
            expect(response.body).toHaveProperty('email');
            expect(response.body).toHaveProperty('first_name');
            expect(response.body).toHaveProperty('last_name');
            
            // Verify field values match the user
            expect(response.body.user_id).toBe(user.user_id);
            expect(response.body.email).toBe(user.email);
            expect(response.body.first_name).toBe(user.first_name);
            expect(response.body.last_name).toBe(user.last_name);
            
            // Ensure no extra fields are present
            const expectedKeys = ['user_id', 'email', 'first_name', 'last_name'];
            const actualKeys = Object.keys(response.body);
            expect(actualKeys.sort()).toEqual(expectedKeys.sort());
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Unit tests for specific scenarios
  describe('Unit Tests', () => {
    test('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/developer/v1/user/profile/basic');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('missing_token');
    });

    test('should return 401 when invalid token is provided', async () => {
      const response = await request(app)
        .get('/developer/v1/user/profile/basic')
        .set('Authorization', 'Bearer invalid-token-12345');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('invalid_token');
    });

    test('should return 401 when token format is malformed', async () => {
      const response = await request(app)
        .get('/developer/v1/user/profile/basic')
        .set('Authorization', 'InvalidFormat token123');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('malformed_token');
    });

    test('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/developer/v1/user/profile/basic')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        user_id: testUser.user_id,
        email: testUser.email,
        first_name: testUser.first_name,
        last_name: testUser.last_name
      });
    });
  });
});
