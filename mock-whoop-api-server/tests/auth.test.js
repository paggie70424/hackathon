/**
 * Property-Based Tests for Authentication Middleware
 * 
 * Feature: life-metrics
 * Property 4: Valid tokens authorize requests
 * Property 5: Invalid tokens return 401
 * 
 * Validates: Requirements 2.4, 2.5
 */

const fc = require('fast-check');
const express = require('express');
const request = require('supertest');
const authMiddleware = require('../src/middleware/auth');
const DataStore = require('../src/data/DataStore');

describe('Authentication Middleware - Property Tests', () => {
  
  let dataStore;
  let app;
  
  beforeEach(() => {
    // Create fresh data store for each test
    dataStore = new DataStore();
    
    // Add a test user
    dataStore.addUser({
      user_id: 'test-user-123',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User'
    });
    
    // Create test app with auth middleware
    app = express();
    app.use(authMiddleware(dataStore));
    
    // Protected endpoint that returns userId
    app.get('/protected', (req, res) => {
      res.json({ userId: req.userId, message: 'success' });
    });
  });
  
  /**
   * Feature: life-metrics, Property 4: Valid tokens authorize requests
   * 
   * For any valid authentication token, when provided in the Authorization header,
   * the request should be authorized and return HTTP 200 (or appropriate success code)
   * 
   * Validates: Requirements 2.4
   */
  test('Property 4: valid tokens authorize requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }), // Number of tokens to test
        async (numTokens) => {
          // Generate multiple valid tokens
          const tokens = [];
          for (let i = 0; i < numTokens; i++) {
            const token = dataStore.createToken('test-user-123', 3600);
            tokens.push(token);
          }
          
          // Test each token
          for (const token of tokens) {
            const response = await request(app)
              .get('/protected')
              .set('Authorization', `Bearer ${token}`);
            
            // Valid token should return 200
            expect(response.status).toBe(200);
            
            // Response should contain userId
            expect(response.body).toHaveProperty('userId');
            expect(response.body.userId).toBe('test-user-123');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: life-metrics, Property 5: Invalid tokens return 401
   * 
   * For any missing or invalid authentication token, the server should return
   * HTTP 401 with an error message
   * 
   * Validates: Requirements 2.5
   */
  test('Property 5: invalid tokens return 401', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(undefined), // No header
          fc.constant(''), // Empty string
          fc.string(), // Random string (not Bearer format)
          fc.hexaString(), // Random hex string
          fc.uuid() // Random UUID
        ),
        async (invalidToken) => {
          let response;
          
          if (invalidToken === undefined) {
            // Test missing Authorization header
            response = await request(app).get('/protected');
          } else if (!invalidToken.startsWith('Bearer ')) {
            // Test malformed token (not Bearer format)
            response = await request(app)
              .get('/protected')
              .set('Authorization', invalidToken);
          } else {
            // Test invalid Bearer token
            response = await request(app)
              .get('/protected')
              .set('Authorization', `Bearer ${invalidToken}`);
          }
          
          // Invalid/missing token should return 401
          expect(response.status).toBe(401);
          
          // Response should contain error information
          expect(response.body).toHaveProperty('error');
          expect(response.body).toHaveProperty('message');
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('missing Authorization header returns 401 with missing_token error', async () => {
    const response = await request(app).get('/protected');
    
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('missing_token');
    expect(response.body.message).toBe('Authorization header required');
  });
  
  test('malformed Authorization header returns 401 with malformed_token error', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'NotBearer token123');
    
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('malformed_token');
    expect(response.body.message).toBe('Token format is invalid');
  });
  
  test('invalid Bearer token returns 401 with invalid_token error', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token-12345');
    
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('invalid_token');
    expect(response.body.message).toBe('Invalid or expired token');
  });
  
  test('expired token returns 401', async () => {
    // Create token that expires immediately
    const token = dataStore.createToken('test-user-123', 0);
    
    // Wait for token to expire
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('invalid_token');
  });
  
  test('valid token attaches userId to request', async () => {
    const token = dataStore.createToken('test-user-123', 3600);
    
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.userId).toBe('test-user-123');
  });
  
});
