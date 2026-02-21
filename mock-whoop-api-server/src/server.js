/**
 * Server Startup Script for Mock WHOOP API Server
 * 
 * Loads environment variables, initializes data store, and starts the
 * Express server on the configured port.
 * 
 * Requirements: 1.3, 1.4
 */

const createApp = require('./app');
const { initializeDataStore } = require('./data/initialize');

/**
 * Load environment variables
 * 
 * Loads configuration from environment variables with sensible defaults.
 * 
 * @returns {Object} Configuration object
 */
function loadConfig() {
  // Try to load .env file if it exists (optional)
  try {
    require('dotenv').config();
  } catch (error) {
    // dotenv is optional, continue without it
  }
  
  return {
    port: process.env.PORT || 8080,
    logLevel: process.env.LOG_LEVEL || 'info',
    jwtSecret: process.env.JWT_SECRET || 'mock-secret',
  };
}

/**
 * Start the Mock WHOOP API Server
 * 
 * Initializes data store with pre-generated synthetic data and starts
 * the Express server on the configured port.
 * 
 * Requirements: 1.3, 1.4
 */
function startServer() {
  console.log('='.repeat(60));
  console.log('Mock WHOOP API Server');
  console.log('='.repeat(60));
  console.log('');
  
  // Load configuration
  const config = loadConfig();
  console.log('Configuration:');
  console.log(`  - Port: ${config.port}`);
  console.log(`  - Log Level: ${config.logLevel}`);
  console.log('');
  
  // Initialize data store with pre-generated data
  const dataStore = initializeDataStore();
  console.log('');
  
  // Create Express app
  const app = createApp(dataStore);
  
  // Start server
  const server = app.listen(config.port, () => {
    console.log('='.repeat(60));
    console.log(`✓ Server is running!`);
    console.log('');
    console.log(`  URL: http://localhost:${config.port}`);
    console.log('');
    console.log('Available endpoints:');
    console.log(`  POST   /oauth/token`);
    console.log(`  GET    /developer/v1/user/profile/basic`);
    console.log(`  GET    /developer/v1/activity/sleep`);
    console.log(`  GET    /developer/v1/recovery`);
    console.log(`  GET    /developer/v1/cycle`);
    console.log(`  GET    /developer/v1/activity/workout`);
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('='.repeat(60));
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM signal, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT signal, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
  
  return server;
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = startServer;
