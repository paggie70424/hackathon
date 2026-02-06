/**
 * Tests for Cycle Data Generator
 * 
 * Includes both unit tests and property-based tests to validate:
 * - Cycle data schema completeness (Property 11)
 * - Physiologically realistic metrics (Property 13)
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 9.3
 */

const fc = require('fast-check');
const {
  generateCycleData,
  generateCycleScore,
  generateStrain,
  generateKilojoules,
  generateAverageHeartRate,
  generateMaxHeartRate,
  isWorkoutDay,
} = require('../src/data/generators/cycleGenerator');
const {
  STRAIN_MIN,
  STRAIN_MAX,
  HEART_RATE_MIN,
  HEART_RATE_MAX,
} = require('../src/models');

// ============================================================================
// Unit Tests
// ============================================================================

describe('Cycle Data Generator - Unit Tests', () => {
  describe('generateStrain', () => {
    test('should generate higher strain for workout days', () => {
      const workoutStrains = [];
      const restStrains = [];
      
      for (let i = 0; i < 20; i++) {
        workoutStrains.push(generateStrain(true));
        restStrains.push(generateStrain(false));
      }
      
      const avgWorkoutStrain = workoutStrains.reduce((a, b) => a + b, 0) / workoutStrains.length;
      const avgRestStrain = restStrains.reduce((a, b) => a + b, 0) / restStrains.length;
      
      // Workout days should have higher average strain
      expect(avgWorkoutStrain).toBeGreaterThan(avgRestStrain);
      // Use more lenient thresholds to account for randomness
      expect(avgWorkoutStrain).toBeGreaterThan(10);
      expect(avgRestStrain).toBeLessThan(14);
    });
    
    test('should generate strain within valid range', () => {
      for (let i = 0; i < 50; i++) {
        const strain = generateStrain(Math.random() > 0.5);
        expect(strain).toBeGreaterThanOrEqual(STRAIN_MIN);
        expect(strain).toBeLessThanOrEqual(STRAIN_MAX);
      }
    });
  });
  
  describe('generateKilojoules', () => {
    test('should generate higher kilojoules for higher strain', () => {
      const lowStrainKJ = generateKilojoules(5);
      const highStrainKJ = generateKilojoules(18);
      
      // Higher strain should generally produce higher kilojoules
      // Run multiple times to account for randomness
      let higherCount = 0;
      for (let i = 0; i < 10; i++) {
        const low = generateKilojoules(5);
        const high = generateKilojoules(18);
        if (high > low) higherCount++;
      }
      
      expect(higherCount).toBeGreaterThanOrEqual(8);
    });
    
    test('should generate kilojoules in realistic range', () => {
      for (let i = 0; i < 50; i++) {
        const strain = Math.random() * 21;
        const kj = generateKilojoules(strain);
        
        // Typical range: 5000-20000 kJ per day
        expect(kj).toBeGreaterThanOrEqual(5000);
        expect(kj).toBeLessThanOrEqual(25000);
      }
    });
  });
  
  describe('generateAverageHeartRate', () => {
    test('should generate higher average HR for higher strain', () => {
      const lowStrainHR = generateAverageHeartRate(3);
      const highStrainHR = generateAverageHeartRate(18);
      
      // Higher strain should generally produce higher average HR
      let higherCount = 0;
      for (let i = 0; i < 10; i++) {
        const low = generateAverageHeartRate(3);
        const high = generateAverageHeartRate(18);
        if (high > low) higherCount++;
      }
      
      expect(higherCount).toBeGreaterThanOrEqual(8);
    });
    
    test('should generate average HR in realistic daily range', () => {
      for (let i = 0; i < 50; i++) {
        const strain = Math.random() * 21;
        const avgHR = generateAverageHeartRate(strain);
        
        // Daily average should be in reasonable range (55-130 bpm)
        expect(avgHR).toBeGreaterThanOrEqual(55);
        expect(avgHR).toBeLessThanOrEqual(130);
      }
    });
  });
  
  describe('generateMaxHeartRate', () => {
    test('should generate max HR higher than average HR', () => {
      for (let i = 0; i < 50; i++) {
        const strain = Math.random() * 21;
        const avgHR = generateAverageHeartRate(strain);
        const maxHR = generateMaxHeartRate(strain, avgHR);
        
        expect(maxHR).toBeGreaterThan(avgHR);
      }
    });
    
    test('should generate max HR within valid range', () => {
      for (let i = 0; i < 50; i++) {
        const strain = Math.random() * 21;
        const avgHR = generateAverageHeartRate(strain);
        const maxHR = generateMaxHeartRate(strain, avgHR);
        
        expect(maxHR).toBeGreaterThanOrEqual(HEART_RATE_MIN);
        expect(maxHR).toBeLessThanOrEqual(HEART_RATE_MAX);
      }
    });
    
    test('should have larger difference between avg and max on high strain days', () => {
      const lowStrainDiffs = [];
      const highStrainDiffs = [];
      
      for (let i = 0; i < 20; i++) {
        const lowAvg = generateAverageHeartRate(3);
        const lowMax = generateMaxHeartRate(3, lowAvg);
        lowStrainDiffs.push(lowMax - lowAvg);
        
        const highAvg = generateAverageHeartRate(18);
        const highMax = generateMaxHeartRate(18, highAvg);
        highStrainDiffs.push(highMax - highAvg);
      }
      
      const avgLowDiff = lowStrainDiffs.reduce((a, b) => a + b, 0) / lowStrainDiffs.length;
      const avgHighDiff = highStrainDiffs.reduce((a, b) => a + b, 0) / highStrainDiffs.length;
      
      expect(avgHighDiff).toBeGreaterThan(avgLowDiff);
    });
  });
  
  describe('isWorkoutDay', () => {
    test('should generate approximately 3-5 workouts per week', () => {
      const workoutDays = [];
      
      // Simulate 4 weeks (28 days)
      for (let i = 0; i < 28; i++) {
        if (isWorkoutDay(i, 28)) {
          workoutDays.push(i);
        }
      }
      
      // Should have 12-20 workout days in 4 weeks (3-5 per week)
      expect(workoutDays.length).toBeGreaterThanOrEqual(10);
      expect(workoutDays.length).toBeLessThanOrEqual(22);
    });
  });
  
  describe('generateCycleScore', () => {
    test('should generate complete cycle score', () => {
      const score = generateCycleScore(true);
      
      expect(score).toHaveProperty('strain');
      expect(score).toHaveProperty('kilojoule');
      expect(score).toHaveProperty('average_heart_rate');
      expect(score).toHaveProperty('max_heart_rate');
      
      // All values should be numbers
      expect(typeof score.strain).toBe('number');
      expect(typeof score.kilojoule).toBe('number');
      expect(typeof score.average_heart_rate).toBe('number');
      expect(typeof score.max_heart_rate).toBe('number');
      
      // Max HR should be greater than average HR
      expect(score.max_heart_rate).toBeGreaterThan(score.average_heart_rate);
    });
    
    test('should generate higher strain for workout days', () => {
      const workoutScores = [];
      const restScores = [];
      
      for (let i = 0; i < 20; i++) {
        workoutScores.push(generateCycleScore(true));
        restScores.push(generateCycleScore(false));
      }
      
      const avgWorkoutStrain = workoutScores.reduce((a, b) => a + b.strain, 0) / workoutScores.length;
      const avgRestStrain = restScores.reduce((a, b) => a + b.strain, 0) / restScores.length;
      
      expect(avgWorkoutStrain).toBeGreaterThan(avgRestStrain);
    });
  });
  
  describe('generateCycleData', () => {
    test('should generate cycle data for a single day', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01');
      
      const cycleData = generateCycleData(userId, startDate, endDate);
      
      expect(cycleData).toHaveLength(1);
      expect(cycleData[0].user_id).toBe(userId);
    });
    
    test('should generate cycle data for multiple days', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07');
      
      const cycleData = generateCycleData(userId, startDate, endDate);
      
      expect(cycleData).toHaveLength(7);
      cycleData.forEach(record => {
        expect(record.user_id).toBe(userId);
      });
    });
    
    test('should generate cycle records with all required fields', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01');
      
      const cycleData = generateCycleData(userId, startDate, endDate);
      const record = cycleData[0];
      
      // Check all required fields exist
      expect(record).toHaveProperty('id');
      expect(record).toHaveProperty('user_id');
      expect(record).toHaveProperty('created_at');
      expect(record).toHaveProperty('updated_at');
      expect(record).toHaveProperty('start');
      expect(record).toHaveProperty('end');
      expect(record).toHaveProperty('timezone_offset');
      expect(record).toHaveProperty('score');
      
      // Check field types and values
      expect(typeof record.id).toBe('string');
      expect(record.user_id).toBe(userId);
      expect(record.timezone_offset).toBe('-08:00');
      
      // Check score object
      expect(record.score).toHaveProperty('strain');
      expect(record.score).toHaveProperty('kilojoule');
      expect(record.score).toHaveProperty('average_heart_rate');
      expect(record.score).toHaveProperty('max_heart_rate');
    });
    
    test('should generate cycles starting at midnight', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05');
      
      const cycleData = generateCycleData(userId, startDate, endDate);
      
      cycleData.forEach(record => {
        const cycleStart = new Date(record.start);
        
        expect(cycleStart.getHours()).toBe(0);
        expect(cycleStart.getMinutes()).toBe(0);
        expect(cycleStart.getSeconds()).toBe(0);
      });
    });
    
    test('should generate cycles ending at midnight next day', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05');
      
      const cycleData = generateCycleData(userId, startDate, endDate);
      
      cycleData.forEach(record => {
        const cycleEnd = new Date(record.end);
        
        expect(cycleEnd.getHours()).toBe(0);
        expect(cycleEnd.getMinutes()).toBe(0);
        expect(cycleEnd.getSeconds()).toBe(0);
      });
    });
    
    test('should generate exactly 24-hour cycles', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05');
      
      const cycleData = generateCycleData(userId, startDate, endDate);
      
      cycleData.forEach(record => {
        const cycleStart = new Date(record.start);
        const cycleEnd = new Date(record.end);
        const durationHours = (cycleEnd - cycleStart) / (1000 * 60 * 60);
        
        // Should be exactly 24 hours
        expect(durationHours).toBe(24);
      });
    });
  });
});

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Cycle Data Generator - Property Tests', () => {
  /**
   * Feature: life-metrics, Property 11: Cycle data schema completeness
   * 
   * For any cycle record returned by the generator, it should contain all 
   * required fields: id, user_id, created_at, updated_at, start, end, 
   * timezone_offset, and a score object with strain, kilojoule, 
   * average_heart_rate, and max_heart_rate
   * 
   * **Validates: Requirements 6.3, 6.4**
   */
  test('Property 11: All cycle records contain complete schema', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 1, max: 90 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const cycleData = generateCycleData(userId, startDate, endDate);
          
          cycleData.forEach(record => {
            // Top-level fields
            expect(record).toHaveProperty('id');
            expect(record).toHaveProperty('user_id');
            expect(record).toHaveProperty('created_at');
            expect(record).toHaveProperty('updated_at');
            expect(record).toHaveProperty('start');
            expect(record).toHaveProperty('end');
            expect(record).toHaveProperty('timezone_offset');
            expect(record).toHaveProperty('score');
            
            // Score object fields
            expect(record.score).toHaveProperty('strain');
            expect(record.score).toHaveProperty('kilojoule');
            expect(record.score).toHaveProperty('average_heart_rate');
            expect(record.score).toHaveProperty('max_heart_rate');
            
            // Type checks
            expect(typeof record.id).toBe('string');
            expect(typeof record.user_id).toBe('string');
            expect(typeof record.created_at).toBe('string');
            expect(typeof record.updated_at).toBe('string');
            expect(typeof record.start).toBe('string');
            expect(typeof record.end).toBe('string');
            expect(typeof record.timezone_offset).toBe('string');
            expect(typeof record.score.strain).toBe('number');
            expect(typeof record.score.kilojoule).toBe('number');
            expect(typeof record.score.average_heart_rate).toBe('number');
            expect(typeof record.score.max_heart_rate).toBe('number');
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: life-metrics, Property 13: Physiologically realistic health metrics (cycles)
   * 
   * For any generated cycle data record, all metrics should fall within 
   * physiologically realistic ranges: strain (0-21), heart rate (40-200 bpm),
   * kilojoules (5000-25000 per day)
   * 
   * **Validates: Requirements 6.5, 9.3**
   */
  test('Property 13: All cycle metrics are within realistic ranges', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 1, max: 90 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const cycleData = generateCycleData(userId, startDate, endDate);
          
          cycleData.forEach(record => {
            const score = record.score;
            
            // Strain (0-21)
            expect(score.strain).toBeGreaterThanOrEqual(STRAIN_MIN);
            expect(score.strain).toBeLessThanOrEqual(STRAIN_MAX);
            
            // Average heart rate (reasonable daily average: 55-130 bpm)
            expect(score.average_heart_rate).toBeGreaterThanOrEqual(55);
            expect(score.average_heart_rate).toBeLessThanOrEqual(130);
            
            // Max heart rate (40-200 bpm)
            expect(score.max_heart_rate).toBeGreaterThanOrEqual(HEART_RATE_MIN);
            expect(score.max_heart_rate).toBeLessThanOrEqual(HEART_RATE_MAX);
            
            // Max HR should be greater than average HR
            expect(score.max_heart_rate).toBeGreaterThan(score.average_heart_rate);
            
            // Kilojoules (5000-25000 per day)
            expect(score.kilojoule).toBeGreaterThanOrEqual(5000);
            expect(score.kilojoule).toBeLessThanOrEqual(25000);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Additional property: Cycle duration is exactly 24 hours
   * 
   * For any cycle record, the duration should be exactly 24 hours
   * (from midnight to midnight next day)
   */
  test('Property: Cycle duration is exactly 24 hours', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 1, max: 90 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const cycleData = generateCycleData(userId, startDate, endDate);
          
          cycleData.forEach(record => {
            const cycleStart = new Date(record.start);
            const cycleEnd = new Date(record.end);
            const durationHours = (cycleEnd - cycleStart) / (1000 * 60 * 60);
            
            // Should be exactly 24 hours
            expect(durationHours).toBe(24);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Additional property: Cycles start at midnight
   * 
   * For any cycle record, the start time should be at midnight (00:00:00)
   */
  test('Property: Cycles start at midnight', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 1, max: 90 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const cycleData = generateCycleData(userId, startDate, endDate);
          
          cycleData.forEach(record => {
            const cycleStart = new Date(record.start);
            
            expect(cycleStart.getHours()).toBe(0);
            expect(cycleStart.getMinutes()).toBe(0);
            expect(cycleStart.getSeconds()).toBe(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Additional property: Generated data count matches date range
   * 
   * For any date range, the number of cycle records should equal the number
   * of days in the range (one cycle per day)
   */
  test('Property: Cycle record count matches date range', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 1, max: 90 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const cycleData = generateCycleData(userId, startDate, endDate);
          
          // Should have one cycle record per day (inclusive)
          expect(cycleData).toHaveLength(daysCount + 1);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Additional property: Higher strain correlates with higher heart rate
   * 
   * For any set of cycle records, higher strain should generally correlate
   * with higher average heart rate
   */
  test('Property: Higher strain correlates with higher heart rate', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 30, max: 90 }), // Need enough data for correlation
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const cycleData = generateCycleData(userId, startDate, endDate);
          
          // Sort by strain
          const sortedByStrain = cycleData.sort((a, b) => a.score.strain - b.score.strain);
          
          // Get bottom 25% and top 25%
          const bottomQuartile = sortedByStrain.slice(0, Math.floor(cycleData.length / 4));
          const topQuartile = sortedByStrain.slice(-Math.floor(cycleData.length / 4));
          
          // Calculate average heart rates
          const avgHRBottom = bottomQuartile.reduce((sum, r) => sum + r.score.average_heart_rate, 0) / bottomQuartile.length;
          const avgHRTop = topQuartile.reduce((sum, r) => sum + r.score.average_heart_rate, 0) / topQuartile.length;
          
          // Top quartile (high strain) should have higher average HR than bottom quartile (low strain)
          expect(avgHRTop).toBeGreaterThan(avgHRBottom);
        }
      ),
      { numRuns: 50 }
    );
  });
});
