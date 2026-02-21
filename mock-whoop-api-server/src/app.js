/**
 * Express App Configuration for Mock WHOOP API Server
 * 
 * Sets up Express app with all middleware in correct order, registers all
 * route handlers, and adds error handling middleware.
 * 
 * Requirements: 1.1, 1.3
 */

const express = require('express');
const requestLoggingMiddleware = require('./middleware/requestLogger');
const corsMiddleware = require('./middleware/cors');
const errorSimulationMiddleware = require('./middleware/errorSimulation');
const authMiddleware = require('./middleware/auth');
const createOAuthTokenHandler = require('./routes/oauth');
const createUserProfileHandler = require('./routes/userProfile');
const createSleepDataHandler = require('./routes/sleep');
const createRecoveryDataHandler = require('./routes/recovery');
const createCycleDataHandler = require('./routes/cycle');
const createWorkoutDataHandler = require('./routes/workout');

/**
 * Create and configure Express application
 * 
 * Sets up middleware stack in correct order:
 * 1. JSON body parser
 * 2. CORS middleware
 * 3. Request logging middleware
 * 4. Error simulation middleware
 * 
 * Registers all route handlers:
 * - POST /oauth/token - OAuth token endpoint (no auth required)
 * - GET /developer/v1/user/profile/basic - User profile (auth required)
 * - GET /developer/v1/activity/sleep - Sleep data (auth required)
 * - GET /developer/v1/recovery - Recovery data (auth required)
 * - GET /developer/v1/cycle - Cycle data (auth required)
 * - GET /developer/v1/activity/workout - Workout data (auth required)
 * 
 * @param {import('./data/DataStore')} dataStore - The data store instance
 * @returns {express.Application} Configured Express app
 * 
 * Requirements: 1.1, 1.3
 */
function createApp(dataStore) {
  const app = express();
  
  // ============================================================================
  // Middleware Stack (order matters!)
  // ============================================================================
  
  // 1. JSON body parser - must be first to parse request bodies
  app.use(express.json());
  
  // 2. CORS middleware - enable cross-origin requests
  app.use(corsMiddleware());
  
  // 3. Request logging middleware - log all requests
  app.use(requestLoggingMiddleware());
  
  // 4. Error simulation middleware - check for X-Simulate-Error header
  app.use(errorSimulationMiddleware());
  
  // ============================================================================
  // Route Handlers
  // ============================================================================
  
  // OAuth token endpoint (no authentication required)
  app.post('/oauth/token', createOAuthTokenHandler(dataStore));
  
  // User profile endpoint (authentication required)
  app.get('/developer/v1/user/profile/basic', 
    authMiddleware(dataStore), 
    createUserProfileHandler(dataStore)
  );
  
  // Sleep data endpoint (authentication required)
  app.get('/developer/v1/activity/sleep', 
    authMiddleware(dataStore), 
    createSleepDataHandler(dataStore)
  );
  
  // Recovery data endpoint (authentication required)
  app.get('/developer/v1/recovery', 
    authMiddleware(dataStore), 
    createRecoveryDataHandler(dataStore)
  );
  
  // Cycle data endpoint (authentication required)
  app.get('/developer/v1/cycle', 
    authMiddleware(dataStore), 
    createCycleDataHandler(dataStore)
  );
  
  // Workout data endpoint (authentication required)
  app.get('/developer/v1/activity/workout', 
    authMiddleware(dataStore), 
    createWorkoutDataHandler(dataStore)
  );
  
  // ============================================================================
  // Error Handling Middleware (must be last!)
  // ============================================================================
  
  // 404 handler for unknown routes
  app.use((req, res) => {
    res.status(404).json({
      error: 'not_found',
      message: `Route ${req.method} ${req.path} not found`
    });
  });
  
  // Global error handler
  app.use((err, req, res, next) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      type: 'error',
      error: err.message,
      stack: err.stack,
      method: req.method,
      path: req.path
    }));
    
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred'
    });
  });
  
  return app;
}

module.exports = createApp;
