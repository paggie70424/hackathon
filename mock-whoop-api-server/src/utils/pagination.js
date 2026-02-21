/**
 * Pagination utilities for the Mock WHOOP API Server
 * Handles pagination of large result sets with token-based continuation
 */

/**
 * Paginates an array of results with token-based continuation
 * 
 * @param {Array} data - The full array of data to paginate
 * @param {number} [limit=25] - Number of records per page (default: 25, max: 100)
 * @param {string} [nextToken] - Optional token to continue from a previous page
 * @returns {{records: Array, next_token?: string}} Paginated results with optional next_token
 * 
 * @example
 * const { records, next_token } = paginateResults(allData, 25);
 * // Returns first 25 records and a token if more exist
 */
function paginateResults(data, limit = 25, nextToken = null) {
  // Enforce default limit of 25 and max of 100
  const effectiveLimit = Math.min(Math.max(1, limit || 25), 100);
  
  // Determine starting index
  let startIndex = 0;
  if (nextToken) {
    startIndex = decodeNextToken(nextToken);
  }
  
  // Calculate end index
  const endIndex = startIndex + effectiveLimit;
  
  // Slice the data for this page
  const records = data.slice(startIndex, endIndex);
  
  // Build response object
  const response = { records };
  
  // Add next_token if more records exist
  if (endIndex < data.length) {
    response.next_token = encodeNextToken(endIndex);
  }
  
  return response;
}

/**
 * Encodes a numeric index into a base64 pagination token
 * 
 * @param {number} index - The starting index for the next page
 * @returns {string} Base64-encoded pagination token
 * 
 * @example
 * const token = encodeNextToken(25);
 * // Returns "MjU=" (base64 of "25")
 */
function encodeNextToken(index) {
  return Buffer.from(index.toString()).toString('base64');
}

/**
 * Decodes a base64 pagination token back to a numeric index
 * 
 * @param {string} token - Base64-encoded pagination token
 * @returns {number} The starting index for the next page
 * @throws {Error} If token is invalid or cannot be decoded
 * 
 * @example
 * const index = decodeNextToken("MjU=");
 * // Returns 25
 */
function decodeNextToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const index = parseInt(decoded, 10);
    
    if (isNaN(index) || index < 0) {
      throw new Error('Invalid pagination token');
    }
    
    return index;
  } catch (error) {
    throw new Error('Invalid pagination token');
  }
}

module.exports = {
  paginateResults,
  encodeNextToken,
  decodeNextToken
};
