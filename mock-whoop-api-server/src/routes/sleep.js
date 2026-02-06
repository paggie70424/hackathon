/**
 * Sleep Data Endpoint for Mock WHOOP API Server
 * 
 * This module provides the sleep data endpoint that returns paginated sleep
 * records with optional date range filtering.
 * 
 * Requirements: 4.1, 4.2
 */

const { paginateResults } = require('../utils/pagination');

/**
 * Create sleep data route handler
 * 
 * Returns paginated sleep data with optional start/end date filtering.
 * Supports pagination with limit and nextToken query parameters.
 * 
 * @param {import('../data/DataStore')} dataStore - The data store instance
 * @returns {Function} Express route handler
 * 
 * Requirements: 4.1, 4.2
 */
function createSleepDataHandler(dataStore) {
  return (req, res) => {
    const { start, end, limit, nextToken } = req.query;
    
    // Parse and validate date parameters
    let startDate, endDate;
    
    if (start) {
      startDate = new Date(start);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          error: 'invalid_date',
          message: 'Start date must be in ISO 8601 format'
        });
      }
    } else {
      // Default to 90 days ago
      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    }
    
    if (end) {
      endDate = new Date(end);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({
          error: 'invalid_date',
          message: 'End date must be in ISO 8601 format'
        });
      }
    } else {
      // Default to now
      endDate = new Date();
    }
    
    // Validate date range
    if (startDate > endDate) {
      return res.status(400).json({
        error: 'invalid_date_range',
        message: 'Start date must be before end date'
      });
    }
    
    // Validate limit parameter
    let parsedLimit = 25; // Default limit
    if (limit) {
      parsedLimit = parseInt(limit, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return res.status(400).json({
          error: 'invalid_limit',
          message: 'Limit must be between 1 and 100'
        });
      }
    }
    
    // Get sleep data from store
    const allData = dataStore.getSleepData(req.userId, startDate, endDate);
    
    // Paginate results
    try {
      const paginatedResponse = paginateResults(allData, parsedLimit, nextToken);
      res.json(paginatedResponse);
    } catch (error) {
      return res.status(400).json({
        error: 'invalid_token',
        message: 'Pagination token is invalid'
      });
    }
  };
}

module.exports = createSleepDataHandler;
