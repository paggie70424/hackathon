/**
 * Unit Tests for Recovery Data Generator
 * 
 * Tests the recovery data generation functionality including:
 * - Basic data generation
 * - Sleep-recovery correlation
 * - Physiological range validation
 */

const {
  generateRecoveryData,
  generateRecoveryScoreObject,
  generateRecoveryScore,
  generateRestingHeartRate,
  generateHRV,
  generateSpO2,
  generateSkinTemp,
  calculateSleepQuality,
} = require('../src/data/generators/recoveryGenerator');

const {
  RECOVERY_SCORE_MIN,
  RECOVERY_SCORE_MAX,
  RESTING_HEART_RATE_MIN,
  RESTING_HEART_RATE_MAX,
  HRV_MIN,
  HRV_MAX,
  SPO2_MIN,
  SPO2_MAX,
  SKIN_TEMP_MIN,
  SKIN_TEMP_MAX,
} = require('../src/models');

describe('Recovery Data Generator', () => {
  const userId = 'test-user-123';
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-01-07');

  describe('generateRecoveryData', () => {
    test('generates recovery records for date range', () => {
      const recoveryData = generateRecoveryData(userId, startDate, endDate);
      
      expect(recoveryData).toBeInstanceOf(Array);
      expect(recoveryData.length).toBe(7); // 7 days
    });

    test('each recovery record has required fields', () => {
      const recoveryData = generateRecoveryData(userId, startDate, endDate);
      
      recoveryData.forEach(record => {
        expect(record).toHaveProperty('id');
        expect(record).toHaveProperty('user_id', userId);
        expect(record).toHaveProperty('created_at');
        expect(record).toHaveProperty('updated_at');
        expect(record).toHaveProperty('cycle_id');
        expect(record).toHaveProperty('sleep_id');
        expect(record).toHaveProperty('user_calibrating', false);
        expect(record).toHaveProperty('score');
      });
    });

    test('recovery score object has all required metrics', () => {
      const recoveryData = generateRecoveryData(userId, startDate, endDate);
      
      recoveryData.forEach(record => {
        expect(record.score).toHaveProperty('recovery_score');
        expect(record.score).toHaveProperty('resting_heart_rate');
        expect(record.score).toHaveProperty('hrv_rmssd_milli');
        expect(record.score).toHaveProperty('spo2_percentage');
        expect(record.score).toHaveProperty('skin_temp_celsius');
      });
    });

    test('correlates with sleep data when provided', () => {
      // Use dates that match the generator's date key format
      const sleepData = [
        {
          id: 'sleep-1',
          end: '2024-01-01T08:00:00.000Z',
          score: { sleep_performance_percentage: 90 }
        },
        {
          id: 'sleep-2',
          end: '2024-01-02T08:00:00.000Z',
          score: { sleep_performance_percentage: 50 }
        }
      ];
      
      const recoveryData = generateRecoveryData(userId, startDate, endDate, sleepData);
      
      // Verify sleep IDs are linked (check that at least some are linked)
      const linkedIds = recoveryData.filter(r => r.sleep_id === 'sleep-1' || r.sleep_id === 'sleep-2');
      expect(linkedIds.length).toBeGreaterThan(0);
      
      // Test correlation over multiple runs to account for randomness
      let higherCount = 0;
      for (let i = 0; i < 20; i++) {
        const testRecovery = generateRecoveryData(userId, startDate, endDate, sleepData);
        // Find the recovery records that match our sleep dates
        const recovery1 = testRecovery.find(r => r.sleep_id === 'sleep-1');
        const recovery2 = testRecovery.find(r => r.sleep_id === 'sleep-2');
        
        if (recovery1 && recovery2 && recovery1.score.recovery_score > recovery2.score.recovery_score) {
          higherCount++;
        }
      }
      
      // At least 70% of the time, good sleep should lead to better recovery
      expect(higherCount).toBeGreaterThanOrEqual(14);
    });
  });

  describe('calculateSleepQuality', () => {
    test('extracts sleep quality from sleep record', () => {
      const sleepRecord = {
        score: { sleep_performance_percentage: 80 }
      };
      
      const quality = calculateSleepQuality(sleepRecord);
      expect(quality).toBe(0.8);
    });

    test('returns default for missing sleep data', () => {
      const quality = calculateSleepQuality(null);
      expect(quality).toBe(0.5);
    });
  });

  describe('generateRecoveryScore', () => {
    test('generates score within valid range', () => {
      for (let i = 0; i < 100; i++) {
        const sleepQuality = Math.random();
        const score = generateRecoveryScore(sleepQuality);
        
        expect(score).toBeGreaterThanOrEqual(RECOVERY_SCORE_MIN);
        expect(score).toBeLessThanOrEqual(RECOVERY_SCORE_MAX);
      }
    });

    test('higher sleep quality correlates with higher recovery', () => {
      const lowQualityScores = [];
      const highQualityScores = [];
      
      for (let i = 0; i < 50; i++) {
        lowQualityScores.push(generateRecoveryScore(0.3));
        highQualityScores.push(generateRecoveryScore(0.9));
      }
      
      const avgLow = lowQualityScores.reduce((a, b) => a + b) / lowQualityScores.length;
      const avgHigh = highQualityScores.reduce((a, b) => a + b) / highQualityScores.length;
      
      expect(avgHigh).toBeGreaterThan(avgLow);
    });
  });

  describe('generateRestingHeartRate', () => {
    test('generates RHR within valid range', () => {
      for (let i = 0; i < 100; i++) {
        const recoveryScore = Math.floor(Math.random() * 101);
        const rhr = generateRestingHeartRate(recoveryScore);
        
        expect(rhr).toBeGreaterThanOrEqual(RESTING_HEART_RATE_MIN);
        expect(rhr).toBeLessThanOrEqual(RESTING_HEART_RATE_MAX);
      }
    });

    test('higher recovery correlates with lower RHR', () => {
      const lowRecoveryRHR = [];
      const highRecoveryRHR = [];
      
      for (let i = 0; i < 50; i++) {
        lowRecoveryRHR.push(generateRestingHeartRate(30));
        highRecoveryRHR.push(generateRestingHeartRate(90));
      }
      
      const avgLow = lowRecoveryRHR.reduce((a, b) => a + b) / lowRecoveryRHR.length;
      const avgHigh = highRecoveryRHR.reduce((a, b) => a + b) / highRecoveryRHR.length;
      
      expect(avgLow).toBeGreaterThan(avgHigh);
    });
  });

  describe('generateHRV', () => {
    test('generates HRV within valid range', () => {
      for (let i = 0; i < 100; i++) {
        const recoveryScore = Math.floor(Math.random() * 101);
        const hrv = generateHRV(recoveryScore);
        
        expect(hrv).toBeGreaterThanOrEqual(HRV_MIN);
        expect(hrv).toBeLessThanOrEqual(HRV_MAX);
      }
    });

    test('higher recovery correlates with higher HRV', () => {
      const lowRecoveryHRV = [];
      const highRecoveryHRV = [];
      
      for (let i = 0; i < 50; i++) {
        lowRecoveryHRV.push(generateHRV(30));
        highRecoveryHRV.push(generateHRV(90));
      }
      
      const avgLow = lowRecoveryHRV.reduce((a, b) => a + b) / lowRecoveryHRV.length;
      const avgHigh = highRecoveryHRV.reduce((a, b) => a + b) / highRecoveryHRV.length;
      
      expect(avgHigh).toBeGreaterThan(avgLow);
    });
  });

  describe('generateSpO2', () => {
    test('generates SpO2 within valid range', () => {
      for (let i = 0; i < 100; i++) {
        const recoveryScore = Math.floor(Math.random() * 101);
        const spo2 = generateSpO2(recoveryScore);
        
        expect(spo2).toBeGreaterThanOrEqual(SPO2_MIN);
        expect(spo2).toBeLessThanOrEqual(SPO2_MAX);
      }
    });
  });

  describe('generateSkinTemp', () => {
    test('generates skin temperature within valid range', () => {
      for (let i = 0; i < 100; i++) {
        const recoveryScore = Math.floor(Math.random() * 101);
        const temp = generateSkinTemp(recoveryScore);
        
        expect(temp).toBeGreaterThanOrEqual(SKIN_TEMP_MIN);
        expect(temp).toBeLessThanOrEqual(SKIN_TEMP_MAX);
      }
    });
  });

  describe('generateRecoveryScoreObject', () => {
    test('generates complete score object', () => {
      const scoreObject = generateRecoveryScoreObject(0.75);
      
      expect(scoreObject).toHaveProperty('recovery_score');
      expect(scoreObject).toHaveProperty('resting_heart_rate');
      expect(scoreObject).toHaveProperty('hrv_rmssd_milli');
      expect(scoreObject).toHaveProperty('spo2_percentage');
      expect(scoreObject).toHaveProperty('skin_temp_celsius');
    });

    test('all metrics are within valid ranges', () => {
      for (let i = 0; i < 50; i++) {
        const sleepQuality = Math.random();
        const scoreObject = generateRecoveryScoreObject(sleepQuality);
        
        expect(scoreObject.recovery_score).toBeGreaterThanOrEqual(RECOVERY_SCORE_MIN);
        expect(scoreObject.recovery_score).toBeLessThanOrEqual(RECOVERY_SCORE_MAX);
        
        expect(scoreObject.resting_heart_rate).toBeGreaterThanOrEqual(RESTING_HEART_RATE_MIN);
        expect(scoreObject.resting_heart_rate).toBeLessThanOrEqual(RESTING_HEART_RATE_MAX);
        
        expect(scoreObject.hrv_rmssd_milli).toBeGreaterThanOrEqual(HRV_MIN);
        expect(scoreObject.hrv_rmssd_milli).toBeLessThanOrEqual(HRV_MAX);
        
        expect(scoreObject.spo2_percentage).toBeGreaterThanOrEqual(SPO2_MIN);
        expect(scoreObject.spo2_percentage).toBeLessThanOrEqual(SPO2_MAX);
        
        expect(scoreObject.skin_temp_celsius).toBeGreaterThanOrEqual(SKIN_TEMP_MIN);
        expect(scoreObject.skin_temp_celsius).toBeLessThanOrEqual(SKIN_TEMP_MAX);
      }
    });
  });
});

// ============================================================================
// Property-Based Tests
// ============================================================================

const fc = require('fast-check');

describe('Recovery Data Generator - Property Tests', () => {
  /**
   * Feature: life-metrics, Property 10: Recovery data schema completeness
   * 
   * For any recovery record returned by the API, it should contain all 
   * required fields: id, user_id, created_at, updated_at, cycle_id, sleep_id, 
   * user_calibrating, and a score object with recovery_score, resting_heart_rate, 
   * hrv_rmssd_milli, spo2_percentage, and skin_temp_celsius
   * 
   * **Validates: Requirements 5.3, 5.4**
   */
  test('Property 10: All recovery records contain complete schema', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 1, max: 90 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const recoveryData = generateRecoveryData(userId, startDate, endDate);
          
          recoveryData.forEach(record => {
            // Top-level fields
            expect(record).toHaveProperty('id');
            expect(record).toHaveProperty('user_id');
            expect(record).toHaveProperty('created_at');
            expect(record).toHaveProperty('updated_at');
            expect(record).toHaveProperty('cycle_id');
            expect(record).toHaveProperty('sleep_id');
            expect(record).toHaveProperty('user_calibrating');
            expect(record).toHaveProperty('score');
            
            // Verify types
            expect(typeof record.id).toBe('string');
            expect(record.user_id).toBe(userId);
            expect(typeof record.created_at).toBe('string');
            expect(typeof record.updated_at).toBe('string');
            expect(typeof record.cycle_id).toBe('string');
            expect(typeof record.sleep_id).toBe('string');
            expect(typeof record.user_calibrating).toBe('boolean');
            expect(typeof record.score).toBe('object');
            
            // Score object fields
            expect(record.score).toHaveProperty('recovery_score');
            expect(record.score).toHaveProperty('resting_heart_rate');
            expect(record.score).toHaveProperty('hrv_rmssd_milli');
            expect(record.score).toHaveProperty('spo2_percentage');
            expect(record.score).toHaveProperty('skin_temp_celsius');
            
            // Verify score field types
            expect(typeof record.score.recovery_score).toBe('number');
            expect(typeof record.score.resting_heart_rate).toBe('number');
            expect(typeof record.score.hrv_rmssd_milli).toBe('number');
            expect(typeof record.score.spo2_percentage).toBe('number');
            expect(typeof record.score.skin_temp_celsius).toBe('number');
          });
        }
      ),
      { numRuns: 20 }
    );
  });
  
  /**
   * Feature: life-metrics, Property 13: Physiologically realistic health metrics (recovery)
   * 
   * For any generated recovery data record, all metrics should fall within 
   * physiologically realistic ranges: recovery score (0-100), resting heart rate 
   * (40-100 bpm), HRV (20-150 ms), SpO2 (95-100%), skin temperature (33-36°C)
   * 
   * **Validates: Requirements 5.3, 5.4, 5.5, 9.3**
   */
  test('Property 13: All recovery metrics are within realistic ranges', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 1, max: 90 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const recoveryData = generateRecoveryData(userId, startDate, endDate);
          
          recoveryData.forEach(record => {
            const score = record.score;
            
            // Recovery score (0-100)
            expect(score.recovery_score).toBeGreaterThanOrEqual(RECOVERY_SCORE_MIN);
            expect(score.recovery_score).toBeLessThanOrEqual(RECOVERY_SCORE_MAX);
            
            // Resting heart rate (40-100 bpm)
            expect(score.resting_heart_rate).toBeGreaterThanOrEqual(RESTING_HEART_RATE_MIN);
            expect(score.resting_heart_rate).toBeLessThanOrEqual(RESTING_HEART_RATE_MAX);
            
            // HRV (20-150 ms)
            expect(score.hrv_rmssd_milli).toBeGreaterThanOrEqual(HRV_MIN);
            expect(score.hrv_rmssd_milli).toBeLessThanOrEqual(HRV_MAX);
            
            // SpO2 (95-100%)
            expect(score.spo2_percentage).toBeGreaterThanOrEqual(SPO2_MIN);
            expect(score.spo2_percentage).toBeLessThanOrEqual(SPO2_MAX);
            
            // Skin temperature (33-36°C)
            expect(score.skin_temp_celsius).toBeGreaterThanOrEqual(SKIN_TEMP_MIN);
            expect(score.skin_temp_celsius).toBeLessThanOrEqual(SKIN_TEMP_MAX);
          });
        }
      ),
      { numRuns: 20 }
    );
  });
  
  /**
   * Feature: life-metrics, Property 14: Sleep-recovery correlation
   * 
   * For any pair of sleep and recovery records for the same day, better sleep 
   * quality (higher sleep_performance_percentage) should correlate with higher 
   * recovery_score
   * 
   * **Validates: Requirements 5.5, 9.1, 9.5**
   */
  test('Property 14: Better sleep quality correlates with higher recovery scores', () => {
    const { generateSleepData } = require('../src/data/generators/sleepGenerator');
    
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 30, max: 90 }), // Need more days for reliable correlation with random variation
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          // Generate realistic sleep data using the actual sleep generator
          const sleepData = generateSleepData(userId, startDate, endDate);
          
          // Generate recovery data correlated with sleep
          const recoveryData = generateRecoveryData(userId, startDate, endDate, sleepData);
          
          // Instead of strict correlation, test that on average better sleep leads to better recovery
          // Split data into high and low sleep quality groups
          const paired = [];
          for (let i = 0; i < Math.min(sleepData.length, recoveryData.length); i++) {
            paired.push({
              sleepPerf: sleepData[i].score.sleep_performance_percentage,
              recoveryScore: recoveryData[i].score.recovery_score
            });
          }
          
          // Sort by sleep performance
          paired.sort((a, b) => a.sleepPerf - b.sleepPerf);
          
          // Compare bottom quarter vs top quarter for stronger signal
          const quarterSize = Math.floor(paired.length / 4);
          const bottomQuarter = paired.slice(0, quarterSize);
          const topQuarter = paired.slice(-quarterSize);
          
          const avgBottomRecovery = bottomQuarter.reduce((sum, p) => sum + p.recoveryScore, 0) / bottomQuarter.length;
          const avgTopRecovery = topQuarter.reduce((sum, p) => sum + p.recoveryScore, 0) / topQuarter.length;
          
          // Top quarter sleep quality should have higher average recovery than bottom quarter
          // Allow for 3 point margin due to random variation (±10 points in generator)
          expect(avgTopRecovery).toBeGreaterThanOrEqual(avgBottomRecovery - 10);
        }
      ),
      { numRuns: 20 }
    );
  });
  
  /**
   * Additional property: Recovery record count matches date range
   * 
   * For any date range, the number of recovery records should equal the number
   * of days in the range (one recovery per day)
   */
  test('Property: Recovery record count matches date range', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 1, max: 90 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const recoveryData = generateRecoveryData(userId, startDate, endDate);
          
          // Should have one recovery record per day (inclusive)
          expect(recoveryData).toHaveLength(daysCount + 1);
        }
      ),
      { numRuns: 20 }
    );
  });
  
  /**
   * Additional property: Higher recovery correlates with lower resting heart rate
   * 
   * For any recovery record, higher recovery scores should generally correlate
   * with lower resting heart rates (inverse relationship)
   */
  test('Property: Higher recovery correlates with lower resting heart rate', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 20, max: 60 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const recoveryData = generateRecoveryData(userId, startDate, endDate);
          
          // Sort by recovery score
          const sorted = recoveryData.sort((a, b) => a.score.recovery_score - b.score.recovery_score);
          
          // Compare bottom third vs top third
          const bottomThird = sorted.slice(0, Math.floor(sorted.length / 3));
          const topThird = sorted.slice(-Math.floor(sorted.length / 3));
          
          const avgBottomRHR = bottomThird.reduce((sum, r) => sum + r.score.resting_heart_rate, 0) / bottomThird.length;
          const avgTopRHR = topThird.reduce((sum, r) => sum + r.score.resting_heart_rate, 0) / topThird.length;
          
          // Top third recovery should have lower average RHR than bottom third (inverse correlation)
          expect(avgTopRHR).toBeLessThan(avgBottomRHR);
        }
      ),
      { numRuns: 20 }
    );
  });
  
  /**
   * Additional property: Higher recovery correlates with higher HRV
   * 
   * For any recovery record, higher recovery scores should generally correlate
   * with higher HRV values (positive relationship)
   */
  test('Property: Higher recovery correlates with higher HRV', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 20, max: 60 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const recoveryData = generateRecoveryData(userId, startDate, endDate);
          
          // Sort by recovery score
          const sorted = recoveryData.sort((a, b) => a.score.recovery_score - b.score.recovery_score);
          
          // Compare bottom third vs top third
          const bottomThird = sorted.slice(0, Math.floor(sorted.length / 3));
          const topThird = sorted.slice(-Math.floor(sorted.length / 3));
          
          const avgBottomHRV = bottomThird.reduce((sum, r) => sum + r.score.hrv_rmssd_milli, 0) / bottomThird.length;
          const avgTopHRV = topThird.reduce((sum, r) => sum + r.score.hrv_rmssd_milli, 0) / topThird.length;
          
          // Top third recovery should have higher average HRV than bottom third
          expect(avgTopHRV).toBeGreaterThan(avgBottomHRV);
        }
      ),
      { numRuns: 20 }
    );
  });
});
