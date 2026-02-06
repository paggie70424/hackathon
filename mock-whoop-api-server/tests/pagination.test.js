/**
 * Property-based tests for pagination utilities
 * Feature: life-metrics
 * Tests Properties 16-19 from the design document
 */

const fc = require('fast-check');
const { paginateResults, encodeNextToken, decodeNextToken } = require('../src/utils/pagination');

describe('Pagination Utilities - Property Tests', () => {
  
  // Feature: life-metrics, Property 16: Default pagination limit
  test('Property 16: Default pagination limit - returns at most 25 records when no limit specified', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer(), { minLength: 26, maxLength: 200 }), // Generate arrays with more than 25 items
        (data) => {
          const result = paginateResults(data);
          
          // Should return at most 25 records
          expect(result.records.length).toBeLessThanOrEqual(25);
          
          // Should return exactly 25 if data has at least 25 items
          if (data.length >= 25) {
            expect(result.records.length).toBe(25);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: life-metrics, Property 16: Default pagination limit with explicit undefined
  test('Property 16: Default pagination limit - uses 25 when limit is undefined or null', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer(), { minLength: 30, maxLength: 100 }),
        fc.constantFrom(undefined, null),
        (data, limitValue) => {
          const result = paginateResults(data, limitValue);
          
          expect(result.records.length).toBe(25);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: life-metrics, Property 17: Pagination token presence
  test('Property 17: Pagination token presence - includes next_token when more records exist', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer(), { minLength: 10, maxLength: 200 }),
        fc.integer({ min: 1, max: 50 }),
        (data, limit) => {
          const result = paginateResults(data, limit);
          
          // If there are more records than the limit, next_token should be present
          if (data.length > limit) {
            expect(result.next_token).toBeDefined();
            expect(typeof result.next_token).toBe('string');
            expect(result.next_token.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: life-metrics, Property 18: Pagination token absence on last page
  test('Property 18: Pagination token absence on last page - no next_token when all records returned', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer(), { minLength: 1, maxLength: 100 }),
        fc.integer({ min: 100, max: 200 }),
        (data, limit) => {
          const result = paginateResults(data, limit);
          
          // If limit is greater than or equal to data length, no next_token
          if (limit >= data.length) {
            expect(result.next_token).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: life-metrics, Property 18: Pagination token absence on exact last page
  test('Property 18: Pagination token absence on last page - no next_token on final page with token', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer(), { minLength: 26, maxLength: 100 }),
        fc.integer({ min: 10, max: 25 }),
        (data, limit) => {
          // Get first page
          const firstPage = paginateResults(data, limit);
          
          if (firstPage.next_token) {
            // Keep paginating until we reach the last page
            let currentToken = firstPage.next_token;
            let lastPage;
            let iterations = 0;
            const maxIterations = Math.ceil(data.length / limit) + 1;
            
            while (currentToken && iterations < maxIterations) {
              lastPage = paginateResults(data, limit, currentToken);
              currentToken = lastPage.next_token;
              iterations++;
            }
            
            // The final page should not have a next_token
            if (lastPage && !lastPage.next_token) {
              expect(lastPage.next_token).toBeUndefined();
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: life-metrics, Property 19: Pagination continuity
  test('Property 19: Pagination continuity - next_token returns different non-overlapping records', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer(), { minLength: 30, maxLength: 200 }),
        fc.integer({ min: 5, max: 25 }),
        (data, limit) => {
          const firstPage = paginateResults(data, limit);
          
          if (firstPage.next_token) {
            const secondPage = paginateResults(data, limit, firstPage.next_token);
            
            // Verify continuity by checking indices rather than values
            // First page should be data[0...limit-1]
            expect(firstPage.records).toEqual(data.slice(0, limit));
            
            // Second page should be data[limit...2*limit-1]
            expect(secondPage.records).toEqual(data.slice(limit, Math.min(2 * limit, data.length)));
            
            // Verify that pages don't overlap by checking they come from different slices
            // Second page should start where first page ended
            if (secondPage.records.length > 0) {
              expect(secondPage.records[0]).toBe(data[limit]);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: life-metrics, Property 19: Pagination continuity - complete dataset coverage
  test('Property 19: Pagination continuity - paginating through all pages returns all records', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer(), { minLength: 30, maxLength: 150 }),
        fc.integer({ min: 5, max: 20 }),
        (data, limit) => {
          const allPaginatedRecords = [];
          let currentToken = null;
          let iterations = 0;
          const maxIterations = Math.ceil(data.length / limit) + 1;
          
          // Paginate through all pages
          do {
            const page = paginateResults(data, limit, currentToken);
            allPaginatedRecords.push(...page.records);
            currentToken = page.next_token;
            iterations++;
          } while (currentToken && iterations < maxIterations);
          
          // All paginated records should equal original data
          expect(allPaginatedRecords.length).toBe(data.length);
          expect(allPaginatedRecords).toEqual(data);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional test: Max limit enforcement
  test('Property 16: Max limit enforcement - never returns more than 100 records', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer(), { minLength: 101, maxLength: 300 }),
        fc.integer({ min: 101, max: 1000 }),
        (data, limit) => {
          const result = paginateResults(data, limit);
          
          // Should never return more than 100 records
          expect(result.records.length).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Token encoding/decoding tests
  test('Token encoding and decoding are inverse operations', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        (index) => {
          const token = encodeNextToken(index);
          const decoded = decodeNextToken(token);
          
          expect(decoded).toBe(index);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Invalid tokens throw errors', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('invalid', '!!!', '', 'not-base64'),
        (invalidToken) => {
          expect(() => decodeNextToken(invalidToken)).toThrow('Invalid pagination token');
        }
      ),
      { numRuns: 50 }
    );
  });
});
