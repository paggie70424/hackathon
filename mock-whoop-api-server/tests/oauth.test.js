/**
 * Tests for OAuth Token Endpoint
 * Feature: life-metrics
 */

const fc = require('fast-check');
const request = require('supertest');
const express = require('express');
const DataStore = require('../src/data/DataStore');
const createOAuthTokenHandler = require('../src/routes/oauth');

describe('OAuth Token Endpoint', () => {
  let app;
  let dataStore;

  beforeEach(() => {
    // Create fresh data store and app for each test
    dataStore = new DataStore();
    
    // Add test users
    dataStore.addUser({
      user_id: 'user-1',
      email: 'user1@example.com',
      first_name: 'John',
      last_name: 'Doe'
    });
    dataStore.addUser({
      user_id: 'user-2',
      email: 'user2@example.com',
      first_name: 'Jane',
      last_name: 'Smith'
    });

    // Create Express app
    app = express();
    app.use(express.json());
    app.post('/oauth/token', createOAuthTokenHandler(dataStore));
  });

  // Feature: life-metrics, Property 3: Token generation for any credentials
  describe('Property 3: Token generation for any credentials', () => {
    test('should generate valid tokens for any client credentials', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          async (grantType, clientId, clientSecret) => {
            // Create fresh instances for each iteration to avoid state issues
            const testDataStore = new DataStore();
            testDataStore.addUser({
              user_id: 'test-user-1',
              email: 'test1@example.com',
              first_name: 'Test',
              last_name: 'User'
            });
            
            const testApp = express();
            testApp.use(express.json());
            testApp.post('/oauth/token', createOAuthTokenHandler(testDataStore));

            const response = await request(testApp)
              .post('/oauth/token')
              .send({
                grant_type: grantType,
                client_id: clientId,
                client_secret: clientSecret
              });

            // Should return 200 OK
            expect(response.status).toBe(200);

            // Should return required fields
            expect(response.body).toHaveProperty('access_token');
            expect(response.body).toHaveProperty('token_type');
            expect(response.body).toHaveProperty('expires_in');

            // Token type should be Bearer
            expect(response.body.token_type).toBe('Bearer');

            // Expires in should be 3600 seconds (Requirement 2.3)
            expect(response.body.expires_in).toBe(3600);

            // Access token should be a non-empty string
            expect(typeof response.body.access_token).toBe('string');
            expect(response.body.access_token.length).toBeGreaterThan(0);
            
            // Token should be a valid hex string (64 characters for 32 bytes)
            expect(response.body.access_token).toMatch(/^[0-9a-f]{64}$/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Unit tests for specific scenarios
  describe('Unit Tests', () => {
    test('should return 400 when grant_type is missing', async () => {
      const response = await request(app)
        .post('/oauth/token')
        .send({
          client_id: 'test-client',
          client_secret: 'test-secret'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_request');
    });

    test('should return 400 when client_id is missing', async () => {
      const response = await request(app)
        .post('/oauth/token')
        .send({
          grant_type: 'client_credentials',
          client_secret: 'test-secret'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_request');
    });

    test('should return 400 when client_secret is missing', async () => {
      const response = await request(app)
        .post('/oauth/token')
        .send({
          grant_type: 'client_credentials',
          client_id: 'test-client'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_request');
    });

    test('should generate different tokens for subsequent requests', async () => {
      const response1 = await request(app)
        .post('/oauth/token')
        .send({
          grant_type: 'client_credentials',
          client_id: 'test-client',
          client_secret: 'test-secret'
        });

      const response2 = await request(app)
        .post('/oauth/token')
        .send({
          grant_type: 'client_credentials',
          client_id: 'test-client',
          client_secret: 'test-secret'
        });

      expect(response1.body.access_token).not.toBe(response2.body.access_token);
    });
  });
});
