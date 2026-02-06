/**
 * User Profile Endpoint for Mock WHOOP API Server
 * 
 * This module provides the user profile endpoint that returns basic user
 * information for authenticated requests.
 * 
 * Requirements: 3.2, 3.3, 3.4
 */

/**
 * Create user profile route handler
 * 
 * Returns basic user profile information (user_id, email, first_name, last_name)
 * for the authenticated user.
 * 
 * @param {import('../data/DataStore')} dataStore - The data store instance
 * @returns {Function} Express route handler
 * 
 * Requirements: 3.2, 3.3, 3.4
 */
function createUserProfileHandler(dataStore) {
  return (req, res) => {
    // userId is attached by auth middleware
    const user = dataStore.getUser(req.userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'user_not_found',
        message: 'User not found'
      });
    }
    
    // Return basic user profile
    res.json({
      user_id: user.user_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    });
  };
}

module.exports = createUserProfileHandler;
