/**
 * CORS Middleware for Mock WHOOP API Server
 * 
 * This middleware enables cross-origin requests by setting appropriate CORS headers.
 * Allows GET, POST, OPTIONS methods and Authorization, Content-Type, X-Simulate-Error headers.
 * 
 * Requirements: 1.1
 */

/**
 * Create CORS middleware
 * 
 * Enables cross-origin resource sharing (CORS) for the API server.
 * Allows all origins (*) and specific HTTP methods and headers.
 * 
 * @returns {Function} Express middleware function
 * 
 * Requirements: 1.1
 */
function corsMiddleware() {
  return (req, res, next) => {
    // Allow requests from any origin
    res.header('Access-Control-Allow-Origin', '*');
    
    // Allow specific HTTP methods
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    // Allow specific headers
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Simulate-Error');
    
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  };
}

module.exports = corsMiddleware;
