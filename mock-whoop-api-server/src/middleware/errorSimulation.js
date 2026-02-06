/**
 * Error Simulation Middleware for Mock WHOOP API Server
 * 
 * This middleware checks for the X-Simulate-Error header and triggers
 * specific error responses for testing error handling in client applications.
 * Supports 500, 429, 503, and timeout simulation.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

/**
 * Create error simulation middleware
 * 
 * Checks for X-Simulate-Error header and triggers corresponding error responses:
 * - "500": Returns HTTP 500 Internal Server Error
 * - "429": Returns HTTP 429 Rate Limit Exceeded with Retry-After header
 * - "503": Returns HTTP 503 Service Unavailable
 * - "timeout": Delays response by 30 seconds
 * 
 * All simulated errors are logged for debugging purposes.
 * 
 * @returns {Function} Express middleware function
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */
function errorSimulationMiddleware() {
  return (req, res, next) => {
    const simulateError = req.headers['x-simulate-error'];
    
    // If no error simulation header, continue normally
    if (!simulateError) {
      return next();
    }
    
    // Log the simulated error
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      type: 'simulated_error',
      errorType: simulateError,
      method: req.method,
      path: req.path
    }));
    
    // Handle different error types
    switch (simulateError) {
      case '500':
        // Simulate internal server error
        return res.status(500).json({
          error: 'internal_error',
          message: 'Simulated server error'
        });
      
      case '429':
        // Simulate rate limit exceeded
        res.set('Retry-After', '60');
        return res.status(429).json({
          error: 'rate_limited',
          message: 'Too many requests'
        });
      
      case '503':
        // Simulate service unavailable
        return res.status(503).json({
          error: 'service_unavailable',
          message: 'Service temporarily unavailable'
        });
      
      case 'timeout':
        // Simulate timeout by delaying response
        setTimeout(() => next(), 30000);
        return;
      
      default:
        // Unknown error type, continue normally
        return next();
    }
  };
}

module.exports = errorSimulationMiddleware;
