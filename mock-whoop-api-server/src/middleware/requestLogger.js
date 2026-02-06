/**
 * Request Logging Middleware for Mock WHOOP API Server
 * 
 * This middleware logs all incoming HTTP requests with structured JSON logging,
 * including timestamp, method, path, status code, and request duration.
 * 
 * Requirements: 1.5
 */

/**
 * Create request logging middleware
 * 
 * Logs all HTTP requests in structured JSON format with:
 * - timestamp: ISO 8601 timestamp
 * - method: HTTP method (GET, POST, etc.)
 * - path: Request path
 * - statusCode: HTTP response status code
 * - duration: Request processing time in milliseconds
 * 
 * @returns {Function} Express middleware function
 * 
 * Requirements: 1.5
 */
function requestLoggingMiddleware() {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Listen for response finish event to log after response is sent
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      // Structured JSON logging
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      }));
    });
    
    next();
  };
}

module.exports = requestLoggingMiddleware;
