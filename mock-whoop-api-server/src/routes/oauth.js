/**
 * OAuth Token Endpoint for Mock WHOOP API Server
 * 
 * This module provides the OAuth 2.0 token endpoint that accepts any client
 * credentials and returns a valid authentication token for mock purposes.
 * 
 * Requirements: 2.1, 2.2, 2.3
 */

/**
 * Create OAuth token route handler
 * 
 * Accepts any client credentials and generates a valid authentication token
 * with 3600 second expiration.
 * 
 * @param {import('../data/DataStore')} dataStore - The data store instance
 * @returns {Function} Express route handler
 * 
 * Requirements: 2.1, 2.2, 2.3
 */
function createOAuthTokenHandler(dataStore) {
  return (req, res) => {
    const { grant_type, client_id, client_secret } = req.body;
    
    // Validate required parameters
    if (!grant_type || !client_id || !client_secret) {
      return res.status(400).json({
        error: 'invalid_request',
        message: 'Missing required parameters: grant_type, client_id, client_secret'
      });
    }
    
    // For mock purposes, accept any credentials and generate a token
    // In a real implementation, we would validate the credentials
    
    // Get a random user ID from the data store
    const userIds = dataStore.getAllUserIds();
    
    if (userIds.length === 0) {
      return res.status(500).json({
        error: 'server_error',
        message: 'No users available in data store'
      });
    }
    
    // Select a random user (or use a deterministic approach based on client_id)
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    
    // Generate token with 3600 second expiration
    const token = dataStore.createToken(userId, 3600);
    
    // Return OAuth token response
    res.json({
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600
    });
  };
}

module.exports = createOAuthTokenHandler;
