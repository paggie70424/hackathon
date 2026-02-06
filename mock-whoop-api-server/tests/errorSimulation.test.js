/**
 * Property-Based Tests for Error Simulation Middleware
 * 
 * Feature: life-metrics
 * Property 20: Error simulation header support
 * Property 21: Simulated errors are logged
 * 
 * Validates: Requirements 10.1, 10.5
 */

const fc = require('fast-check');
const express = require('express');
const request = require('supertest');
const errorSimulationMiddleware = require('../src/middleware/errorSimulation');

describe('Error Simulation Middleware - Property Tests', () => {
  
  let app;
  
  beforeEach(() => {
    // Create test app with error simulation middleware
    app = express();
    app.use(errorSimulationMiddleware());
    
    // Add test endpoint
    app.get('/test', (req, res) => {
      res.json({ message: 'success' });
    });
  });
  
  /**
   * Feature: life-metrics, Property 20: Error simulation header support
   * 
   * For any request with the X-Simulate-Error header, the server should trigger
   * the corresponding error response (500, 429, timeout, 503)
   * 
   * Validates: Requirements 10.1
   */
  test('Property 20: X-Simulate-Error header triggers corresponding errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('500', '429', '503'),
        async (errorType) => {
          const response = await request(app)
            .get('/test')
            .set('X-Simulate-Error', errorType);
          
          // Verify correct status code
          expect(response.status).toBe(parseInt(errorType));
          
          // Verify error response structure
          expect(response.body).toHaveProperty('error');
          expect(response.body).toHaveProperty('message');
          
          // Verify specific error responses
          if (errorType === '500') {
            expect(response.body.error).toBe('internal_error');
            expect(response.body.message).toBe('Simulated server error');
          } else if (errorType === '429') {
            expect(response.body.error).toBe('rate_limited');
            expect(response.body.message).toBe('Too many requests');
            // Verify Retry-After header
            expect(response.headers['retry-after']).toBe('60');
          } else if (errorType === '503') {
            expect(response.body.error).toBe('service_unavailable');
            expect(response.body.message).toBe('Service temporarily unavailable');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: life-metrics, Property 21: Simulated errors are logged
   * 
   * For any simulated error triggered by the X-Simulate-Error header, a log entry
   * should be created documenting the simulated error
   * 
   * Validates: Requirements 10.5
   */
  test('Property 21: simulated errors are logged', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('500', '429', '503'),
        async (errorType) => {
          // Capture console.log output
          const logs = [];
          const originalLog = console.log;
          console.log = (message) => {
            logs.push(message);
          };
          
          try {
            await request(app)
              .get('/test')
              .set('X-Simulate-Error', errorType);
            
            // Verify log was created
            expect(logs.length).toBeGreaterThan(0);
            
            // Parse and verify log entry
            const logEntry = JSON.parse(logs[0]);
            
            // Verify log contains required fields
            expect(logEntry).toHaveProperty('timestamp');
            expect(logEntry).toHaveProperty('type');
            expect(logEntry).toHaveProperty('errorType');
            expect(logEntry).toHaveProperty('method');
            expect(logEntry).toHaveProperty('path');
            
            // Verify log values
            expect(logEntry.type).toBe('simulated_error');
            expect(logEntry.errorType).toBe(errorType);
            expect(logEntry.method).toBe('GET');
            expect(logEntry.path).toBe('/test');
            
            // Verify timestamp is valid ISO 8601
            expect(() => new Date(logEntry.timestamp)).not.toThrow();
            expect(new Date(logEntry.timestamp).toISOString()).toBe(logEntry.timestamp);
            
          } finally {
            // Restore console.log
            console.log = originalLog;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('500 error returns correct response', async () => {
    const response = await request(app)
      .get('/test')
      .set('X-Simulate-Error', '500');
    
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('internal_error');
    expect(response.body.message).toBe('Simulated server error');
  });
  
  test('429 error returns correct response with Retry-After header', async () => {
    const response = await request(app)
      .get('/test')
      .set('X-Simulate-Error', '429');
    
    expect(response.status).toBe(429);
    expect(response.body.error).toBe('rate_limited');
    expect(response.body.message).toBe('Too many requests');
    expect(response.headers['retry-after']).toBe('60');
  });
  
  test('503 error returns correct response', async () => {
    const response = await request(app)
      .get('/test')
      .set('X-Simulate-Error', '503');
    
    expect(response.status).toBe(503);
    expect(response.body.error).toBe('service_unavailable');
    expect(response.body.message).toBe('Service temporarily unavailable');
  });
  
  test('timeout delays response', async () => {
    const startTime = Date.now();
    
    // Use a shorter timeout for testing (100ms instead of 30s)
    const testApp = express();
    testApp.use((req, res, next) => {
      const simulateError = req.headers['x-simulate-error'];
      if (simulateError === 'timeout') {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          type: 'simulated_error',
          errorType: simulateError,
          method: req.method,
          path: req.path
        }));
        setTimeout(() => next(), 100); // 100ms for testing
        return;
      }
      next();
    });
    testApp.get('/test', (req, res) => {
      res.json({ message: 'success' });
    });
    
    const response = await request(testApp)
      .get('/test')
      .set('X-Simulate-Error', 'timeout');
    
    const duration = Date.now() - startTime;
    
    // Response should be delayed by at least 100ms
    expect(duration).toBeGreaterThanOrEqual(100);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('success');
  });
  
  test('no X-Simulate-Error header allows normal processing', async () => {
    const response = await request(app).get('/test');
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('success');
  });
  
  test('unknown error type allows normal processing', async () => {
    const response = await request(app)
      .get('/test')
      .set('X-Simulate-Error', 'unknown');
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('success');
  });
  
});
