/**
 * Tests for Sleep Data Generator
 * 
 * Includes both unit tests and property-based tests to validate:
 * - Sleep data schema completeness (Property 9)
 * - Physiologically realistic metrics (Property 13)
 * - No overlapping sleep periods (Property 15)
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.2, 9.3
 */

const fc = require('fast-check');
const {
  generateSleepData,
  generateSleepScore,
  generateSleepStages,
  generateSleepNeeded,
} = require('../src/data/generators/sleepGenerator');
const {
  SLEEP_DURATION_MIN_HOURS,
  SLEEP_DURATION_MAX_HOURS,
  RESPIRATORY_RATE_MIN,
  RESPIRATORY_RATE_MAX,
  SLEEP_PERFORMANCE_MIN,
  SLEEP_PERFORMANCE_MAX,
  SLEEP_CONSISTENCY_MIN,
  SLEEP_CONSISTENCY_MAX,
  SLEEP_EFFICIENCY_MIN,
  SLEEP_EFFICIENCY_MAX,
} = require('../src/models');

// ============================================================================
// Unit Tests
// ============================================================================

describe('Sleep Data Generator - Unit Tests', () => {
  describe('generateSleepStages', () => {
    test('should generate sleep stages for 480 minutes (8 hours)', () => {
      const stages = generateSleepStages(480);
      
      expect(stages).toHaveProperty('total_in_bed_time_milli');
      expect(stages).toHaveProperty('total_awake_time_milli');
      expect(stages).toHaveProperty('total_no_data_time_milli');
      expect(stages).toHaveProperty('total_light_sleep_time_milli');
      expect(stages).toHaveProperty('total_slow_wave_sleep_time_milli');
      expect(stages).toHaveProperty('total_rem_sleep_time_milli');
      expect(stages).toHaveProperty('sleep_cycle_count');
      expect(stages).toHaveProperty('disturbance_count');
      
      // Total time should be 8 hours in milliseconds
      expect(stages.total_in_bed_time_milli).toBe(480 * 60 * 1000);
      
      // Sleep cycles should be approximately 480/90 = 5
      expect(stages.sleep_cycle_count).toBeGreaterThanOrEqual(4);
      expect(stages.sleep_cycle_count).toBeLessThanOrEqual(6);
      
      // Disturbances should be reasonable
      expect(stages.disturbance_count).toBeGreaterThanOrEqual(0);
      expect(stages.disturbance_count).toBeLessThan(15);
    });
    
    test('should have stage times sum close to total time', () => {
      const stages = generateSleepStages(480);
      
      const stageSum = stages.total_awake_time_milli +
                      stages.total_light_sleep_time_milli +
                      stages.total_slow_wave_sleep_time_milli +
                      stages.total_rem_sleep_time_milli +
                      stages.total_no_data_time_milli;
      
      // Should be very close to total (within rounding)
      expect(Math.abs(stageSum - stages.total_in_bed_time_milli)).toBeLessThan(1000);
    });
  });
  
  describe('generateSleepNeeded', () => {
    test('should generate sleep needed with baseline of 8 hours', () => {
      const needed = generateSleepNeeded();
      
      expect(needed).toHaveProperty('baseline_milli');
      expect(needed).toHaveProperty('need_from_sleep_debt_milli');
      expect(needed).toHaveProperty('need_from_recent_strain_milli');
      expect(needed).toHaveProperty('need_from_recent_nap_milli');
      
      // Baseline should be 8 hours
      expect(needed.baseline_milli).toBe(8 * 60 * 60 * 1000);
      
      // Additional needs should be non-negative
      expect(needed.need_from_sleep_debt_milli).toBeGreaterThanOrEqual(0);
      expect(needed.need_from_recent_strain_milli).toBeGreaterThanOrEqual(0);
      expect(needed.need_from_recent_nap_milli).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('generateSleepScore', () => {
    test('should generate complete sleep score for 8 hours', () => {
      const score = generateSleepScore(8);
      
      expect(score).toHaveProperty('stage_summary');
      expect(score).toHaveProperty('sleep_needed');
      expect(score).toHaveProperty('respiratory_rate');
      expect(score).toHaveProperty('sleep_performance_percentage');
      expect(score).toHaveProperty('sleep_consistency_percentage');
      expect(score).toHaveProperty('sleep_efficiency_percentage');
      
      // Respiratory rate should be in realistic range
      expect(score.respiratory_rate).toBeGreaterThanOrEqual(RESPIRATORY_RATE_MIN);
      expect(score.respiratory_rate).toBeLessThanOrEqual(RESPIRATORY_RATE_MAX);
      
      // Percentages should be in valid ranges
      expect(score.sleep_performance_percentage).toBeGreaterThanOrEqual(SLEEP_PERFORMANCE_MIN);
      expect(score.sleep_performance_percentage).toBeLessThanOrEqual(SLEEP_PERFORMANCE_MAX);
      expect(score.sleep_consistency_percentage).toBeGreaterThanOrEqual(SLEEP_CONSISTENCY_MIN);
      expect(score.sleep_consistency_percentage).toBeLessThanOrEqual(SLEEP_CONSISTENCY_MAX);
      expect(score.sleep_efficiency_percentage).toBeGreaterThanOrEqual(SLEEP_EFFICIENCY_MIN);
      expect(score.sleep_efficiency_percentage).toBeLessThanOrEqual(SLEEP_EFFICIENCY_MAX);
    });
    
    test('should correlate better scores with longer sleep duration', () => {
      const shortSleepScore = generateSleepScore(6);
      const longSleepScore = generateSleepScore(9);
      
      // On average, longer sleep should have better performance
      // Run multiple times to account for randomness
      let longBetterCount = 0;
      for (let i = 0; i < 10; i++) {
        const short = generateSleepScore(6);
        const long = generateSleepScore(9);
        if (long.sleep_performance_percentage > short.sleep_performance_percentage) {
          longBetterCount++;
        }
      }
      
      // At least 60% of the time, longer sleep should have better performance
      expect(longBetterCount).toBeGreaterThanOrEqual(6);
    });
  });
  
  describe('generateSleepData', () => {
    test('should generate sleep data for a single day', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01');
      
      const sleepData = generateSleepData(userId, startDate, endDate);
      
      expect(sleepData).toHaveLength(1);
      expect(sleepData[0].user_id).toBe(userId);
    });
    
    test('should generate sleep data for multiple days', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07');
      
      const sleepData = generateSleepData(userId, startDate, endDate);
      
      expect(sleepData).toHaveLength(7);
      sleepData.forEach(record => {
        expect(record.user_id).toBe(userId);
      });
    });
    
    test('should generate sleep records with all required fields', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01');
      
      const sleepData = generateSleepData(userId, startDate, endDate);
      const record = sleepData[0];
      
      // Check all required fields exist
      expect(record).toHaveProperty('id');
      expect(record).toHaveProperty('user_id');
      expect(record).toHaveProperty('created_at');
      expect(record).toHaveProperty('updated_at');
      expect(record).toHaveProperty('start');
      expect(record).toHaveProperty('end');
      expect(record).toHaveProperty('timezone_offset');
      expect(record).toHaveProperty('nap');
      expect(record).toHaveProperty('score_state');
      expect(record).toHaveProperty('score');
      
      // Check field types and values
      expect(typeof record.id).toBe('string');
      expect(record.user_id).toBe(userId);
      expect(record.nap).toBe(false);
      expect(record.score_state).toBe('SCORED');
      expect(record.timezone_offset).toBe('-08:00');
    });
    
    test('should generate sleep with start time between 10pm-12am', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05');
      
      const sleepData = generateSleepData(userId, startDate, endDate);
      
      sleepData.forEach(record => {
        const sleepStart = new Date(record.start);
        const hour = sleepStart.getHours();
        
        // Should be between 22:00 (10pm) and 23:59 (just before midnight)
        // or 0:00-0:59 (just after midnight)
        expect(hour >= 22 || hour <= 1).toBe(true);
      });
    });
    
    test('should generate sleep duration between 7-9 hours', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05');
      
      const sleepData = generateSleepData(userId, startDate, endDate);
      
      sleepData.forEach(record => {
        const sleepStart = new Date(record.start);
        const sleepEnd = new Date(record.end);
        const durationHours = (sleepEnd - sleepStart) / (1000 * 60 * 60);
        
        expect(durationHours).toBeGreaterThanOrEqual(SLEEP_DURATION_MIN_HOURS);
        expect(durationHours).toBeLessThanOrEqual(SLEEP_DURATION_MAX_HOURS);
      });
    });
    
    test('should generate non-overlapping sleep periods', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-10');
      
      const sleepData = generateSleepData(userId, startDate, endDate);
      
      // Sort by start time
      const sortedSleep = sleepData.sort((a, b) => 
        new Date(a.start) - new Date(b.start)
      );
      
      // Check each consecutive pair
      for (let i = 0; i < sortedSleep.length - 1; i++) {
        const currentEnd = new Date(sortedSleep[i].end);
        const nextStart = new Date(sortedSleep[i + 1].start);
        
        // Next sleep should start after current sleep ends
        expect(nextStart.getTime()).toBeGreaterThan(currentEnd.getTime());
      }
    });
  });
});

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Sleep Data Generator - Property Tests', () => {
  /**
   * Feature: life-metrics, Property 9: Sleep data schema completeness
   * 
   * For any sleep record returned by the generator, it should contain all 
   * required fields: id, user_id, created_at, updated_at, start, end, 
   * timezone_offset, nap, score_state, and a score object with stage_summary, 
   * sleep_needed, respiratory_rate, sleep_performance_percentage, 
   * sleep_consistency_percentage, and sleep_efficiency_percentage
   * 
   * **Validates: Requirements 4.3, 4.4**
   */
  test('Property 9: All sleep records contain complete schema', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 1, max: 90 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const sleepData = generateSleepData(userId, startDate, endDate);
          
          sleepData.forEach(record => {
            // Top-level fields
            expect(record).toHaveProperty('id');
            expect(record).toHaveProperty('user_id');
            expect(record).toHaveProperty('created_at');
            expect(record).toHaveProperty('updated_at');
            expect(record).toHaveProperty('start');
            expect(record).toHaveProperty('end');
            expect(record).toHaveProperty('timezone_offset');
            expect(record).toHaveProperty('nap');
            expect(record).toHaveProperty('score_state');
            expect(record).toHaveProperty('score');
            
            // Score object fields
            expect(record.score).toHaveProperty('stage_summary');
            expect(record.score).toHaveProperty('sleep_needed');
            expect(record.score).toHaveProperty('respiratory_rate');
            expect(record.score).toHaveProperty('sleep_performance_percentage');
            expect(record.score).toHaveProperty('sleep_consistency_percentage');
            expect(record.score).toHaveProperty('sleep_efficiency_percentage');
            
            // Stage summary fields
            expect(record.score.stage_summary).toHaveProperty('total_in_bed_time_milli');
            expect(record.score.stage_summary).toHaveProperty('total_awake_time_milli');
            expect(record.score.stage_summary).toHaveProperty('total_no_data_time_milli');
            expect(record.score.stage_summary).toHaveProperty('total_light_sleep_time_milli');
            expect(record.score.stage_summary).toHaveProperty('total_slow_wave_sleep_time_milli');
            expect(record.score.stage_summary).toHaveProperty('total_rem_sleep_time_milli');
            expect(record.score.stage_summary).toHaveProperty('sleep_cycle_count');
            expect(record.score.stage_summary).toHaveProperty('disturbance_count');
            
            // Sleep needed fields
            expect(record.score.sleep_needed).toHaveProperty('baseline_milli');
            expect(record.score.sleep_needed).toHaveProperty('need_from_sleep_debt_milli');
            expect(record.score.sleep_needed).toHaveProperty('need_from_recent_strain_milli');
            expect(record.score.sleep_needed).toHaveProperty('need_from_recent_nap_milli');
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: life-metrics, Property 13: Physiologically realistic health metrics (sleep)
   * 
   * For any generated sleep data record, all metrics should fall within 
   * physiologically realistic ranges: respiratory rate (12-20 breaths/min), 
   * sleep performance (0-100), sleep consistency (0-100), sleep efficiency (0-100)
   * 
   * **Validates: Requirements 4.5, 9.3**
   */
  test('Property 13: All sleep metrics are within realistic ranges', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 1, max: 90 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const sleepData = generateSleepData(userId, startDate, endDate);
          
          sleepData.forEach(record => {
            const score = record.score;
            
            // Respiratory rate
            expect(score.respiratory_rate).toBeGreaterThanOrEqual(RESPIRATORY_RATE_MIN);
            expect(score.respiratory_rate).toBeLessThanOrEqual(RESPIRATORY_RATE_MAX);
            
            // Sleep performance percentage
            expect(score.sleep_performance_percentage).toBeGreaterThanOrEqual(SLEEP_PERFORMANCE_MIN);
            expect(score.sleep_performance_percentage).toBeLessThanOrEqual(SLEEP_PERFORMANCE_MAX);
            
            // Sleep consistency percentage
            expect(score.sleep_consistency_percentage).toBeGreaterThanOrEqual(SLEEP_CONSISTENCY_MIN);
            expect(score.sleep_consistency_percentage).toBeLessThanOrEqual(SLEEP_CONSISTENCY_MAX);
            
            // Sleep efficiency percentage
            expect(score.sleep_efficiency_percentage).toBeGreaterThanOrEqual(SLEEP_EFFICIENCY_MIN);
            expect(score.sleep_efficiency_percentage).toBeLessThanOrEqual(SLEEP_EFFICIENCY_MAX);
            
            // Sleep duration (7-9 hours)
            const sleepStart = new Date(record.start);
            const sleepEnd = new Date(record.end);
            const durationHours = (sleepEnd - sleepStart) / (1000 * 60 * 60);
            expect(durationHours).toBeGreaterThanOrEqual(SLEEP_DURATION_MIN_HOURS);
            expect(durationHours).toBeLessThanOrEqual(SLEEP_DURATION_MAX_HOURS);
            
            // Sleep cycles should be reasonable (1 cycle per ~90 minutes)
            const expectedCycles = durationHours * 60 / 90;
            expect(score.stage_summary.sleep_cycle_count).toBeGreaterThanOrEqual(Math.floor(expectedCycles) - 1);
            expect(score.stage_summary.sleep_cycle_count).toBeLessThanOrEqual(Math.ceil(expectedCycles) + 1);
            
            // Disturbances should be reasonable
            expect(score.stage_summary.disturbance_count).toBeGreaterThanOrEqual(0);
            expect(score.stage_summary.disturbance_count).toBeLessThan(15);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: life-metrics, Property 15: No overlapping sleep periods
   * 
   * For any user's sleep data, no two sleep periods should overlap in time 
   * (one sleep's start should be after the previous sleep's end)
   * 
   * **Validates: Requirements 9.2**
   */
  test('Property 15: No overlapping sleep periods', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 2, max: 90 }), // At least 2 days to check overlaps
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const sleepData = generateSleepData(userId, startDate, endDate);
          
          // Sort by start time
          const sortedSleep = sleepData.sort((a, b) => 
            new Date(a.start) - new Date(b.start)
          );
          
          // Check each consecutive pair for overlaps
          for (let i = 0; i < sortedSleep.length - 1; i++) {
            const currentEnd = new Date(sortedSleep[i].end);
            const nextStart = new Date(sortedSleep[i + 1].start);
            
            // Next sleep must start after current sleep ends (no overlap)
            expect(nextStart.getTime()).toBeGreaterThan(currentEnd.getTime());
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Additional property: Sleep stage times sum to total time
   * 
   * For any sleep record, the sum of all sleep stage times should equal
   * the total in bed time (within rounding tolerance)
   */
  test('Property: Sleep stage times sum to total time', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 1, max: 30 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const sleepData = generateSleepData(userId, startDate, endDate);
          
          sleepData.forEach(record => {
            const stages = record.score.stage_summary;
            
            const stageSum = stages.total_awake_time_milli +
                            stages.total_light_sleep_time_milli +
                            stages.total_slow_wave_sleep_time_milli +
                            stages.total_rem_sleep_time_milli +
                            stages.total_no_data_time_milli;
            
            // Should be very close to total (within 1 second for rounding)
            const difference = Math.abs(stageSum - stages.total_in_bed_time_milli);
            expect(difference).toBeLessThan(1000);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Additional property: Generated data count matches date range
   * 
   * For any date range, the number of sleep records should equal the number
   * of days in the range (one sleep per night)
   */
  test('Property: Sleep record count matches date range', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 1, max: 90 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const sleepData = generateSleepData(userId, startDate, endDate);
          
          // Should have one sleep record per day (inclusive)
          expect(sleepData).toHaveLength(daysCount + 1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
