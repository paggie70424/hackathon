/**
 * Property-Based Tests for Request Logging Middleware
 * 
 * Feature: life-metrics
 * Property 2: Request logging completeness
 * 
 * Validates: Requirements 1.5
 */

const fc = require('fast-check');
const express = require('express');
const request = require('supertest');
const requestLoggingMiddleware = require('../src/middleware/requestLogger');

describe('Request Logging Middleware - Property Tests', () => {
  
  /**
   * Feature: life-metrics, Property 2: Request logging completeness
   * 
   * For any HTTP request to the server, a log entry should be created containing
   * timestamp, method, path, and response code
   * 
   * Validates: Requirements 1.5
   */
  test('Property 2: all requests generate complete log entries', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
        fc.constantFrom('/test', '/api/data', '/health', '/status', '/v1/endpoint'),
        fc.constantFrom(200, 201, 400, 401, 404, 500),
        async (method, path, statusCode) => {
          // Capture console.log output
          const logs = [];
          const originalLog = console.log;
          console.log = (message) => {
            logs.push(message);
          };
          
          try {
            // Create test app with logging middleware
            const app = express();
            app.use(requestLoggingMiddleware());
            
            // Add route that returns the specified status code
            app.all('*', (req, res) => {
              res.status(statusCode).json({ message: 'test' });
            });
            
            // Make request
            const response = await request(app)[method.toLowerCase()](path);
            
            // Verify response status
            expect(response.status).toBe(statusCode);
            
            // Verify log was created
            expect(logs.length).toBeGreaterThan(0);
            
            // Parse and verify log structure
            const logEntry = JSON.parse(logs[0]);
            
            // Verify all required fields are present
            expect(logEntry).toHaveProperty('timestamp');
            expect(logEntry).toHaveProperty('method');
            expect(logEntry).toHaveProperty('path');
            expect(logEntry).toHaveProperty('statusCode');
            expect(logEntry).toHaveProperty('duration');
            
            // Verify field values
            expect(logEntry.method).toBe(method);
            expect(logEntry.path).toBe(path);
            expect(logEntry.statusCode).toBe(statusCode);
            
            // Verify timestamp is valid ISO 8601
            expect(() => new Date(logEntry.timestamp)).not.toThrow();
            expect(new Date(logEntry.timestamp).toISOString()).toBe(logEntry.timestamp);
            
            // Verify duration format
            expect(logEntry.duration).toMatch(/^\d+ms$/);
            
          } finally {
            // Restore console.log
            console.log = originalLog;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('log entries contain valid timestamps', async () => {
    const logs = [];
    const originalLog = console.log;
    console.log = (message) => {
      logs.push(message);
    };
    
    try {
      const app = express();
      app.use(requestLoggingMiddleware());
      app.get('/test', (req, res) => res.json({ ok: true }));
      
      await request(app).get('/test');
      
      expect(logs.length).toBe(1);
      const logEntry = JSON.parse(logs[0]);
      
      // Timestamp should be recent (within last 5 seconds)
      const logTime = new Date(logEntry.timestamp);
      const now = new Date();
      const diffMs = now - logTime;
      expect(diffMs).toBeLessThan(5000);
      expect(diffMs).toBeGreaterThanOrEqual(0);
      
    } finally {
      console.log = originalLog;
    }
  });
  
  test('duration is measured accurately', async () => {
    const logs = [];
    const originalLog = console.log;
    console.log = (message) => {
      logs.push(message);
    };
    
    try {
      const app = express();
      app.use(requestLoggingMiddleware());
      
      // Add route with artificial delay
      app.get('/slow', async (req, res) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        res.json({ ok: true });
      });
      
      await request(app).get('/slow');
      
      expect(logs.length).toBe(1);
      const logEntry = JSON.parse(logs[0]);
      
      // Duration should be at least 50ms
      const durationMs = parseInt(logEntry.duration.replace('ms', ''));
      expect(durationMs).toBeGreaterThanOrEqual(50);
      
    } finally {
      console.log = originalLog;
    }
  });
  
});
