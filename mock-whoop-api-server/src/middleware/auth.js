/**
 * Authentication Middleware for Mock WHOOP API Server
 * 
 * This middleware validates Bearer tokens from the Authorization header,
 * returns 401 for missing or invalid tokens, and attaches userId to the
 * request object for valid tokens.
 * 
 * Requirements: 2.4, 2.5
 */

/**
 * Create authentication middleware
 * 
 * Validates OAuth Bearer tokens and attaches userId to request object.
 * Returns 401 Unauthorized for missing or invalid tokens.
 * 
 * @param {import('../data/DataStore')} dataStore - The data store instance
 * @returns {Function} Express middleware function
 * 
 * Requirements: 2.4, 2.5
 */
function authMiddleware(dataStore) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header is present
    if (!authHeader) {
      return res.status(401).json({
        error: 'missing_token',
        message: 'Authorization header required'
      });
    }
    
    // Check if Authorization header uses Bearer scheme
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'malformed_token',
        message: 'Token format is invalid'
      });
    }
    
    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);
    
    // Validate token and get userId
    const userId = dataStore.validateToken(token);
    
    if (!userId) {
      return res.status(401).json({
        error: 'invalid_token',
        message: 'Invalid or expired token'
      });
    }
    
    // Attach userId to request object for use in route handlers
    req.userId = userId;
    
    next();
  };
}

module.exports = authMiddleware;
