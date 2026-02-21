/**
 * Tests for Workout Data Generator
 * 
 * Includes both unit tests and property-based tests to validate:
 * - Workout data schema completeness (Property 12)
 * - Physiologically realistic metrics (Property 13)
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 9.3, 9.4
 */

const fc = require('fast-check');
const {
  generateWorkoutData,
  generateWorkoutScore,
  generateWorkoutStrain,
  generateWorkoutAverageHeartRate,
  generateWorkoutMaxHeartRate,
  generateWorkoutKilojoules,
  generateDistance,
  generateAltitude,
  generateZoneDuration,
  determineWorkoutDays,
  SPORT_TYPES,
} = require('../src/data/generators/workoutGenerator');
const {
  STRAIN_MIN,
  STRAIN_MAX,
  HEART_RATE_MIN,
  HEART_RATE_MAX,
  WORKOUTS_PER_WEEK_MIN,
  WORKOUTS_PER_WEEK_MAX,
} = require('../src/models');

// ============================================================================
// Unit Tests
// ============================================================================

describe('Workout Data Generator - Unit Tests', () => {
  describe('generateWorkoutStrain', () => {
    test('should generate strain within valid range', () => {
      for (let i = 0; i < 50; i++) {
        const duration = 20 + Math.random() * 70; // 20-90 minutes
        const sportId = SPORT_TYPES.RUNNING;
        const strain = generateWorkoutStrain(duration, sportId);
        
        expect(strain).toBeGreaterThanOrEqual(STRAIN_MIN);
        expect(strain).toBeLessThanOrEqual(STRAIN_MAX);
      }
    });
    
    test('should generate higher strain for longer workouts', () => {
      const shortStrains = [];
      const longStrains = [];
      
      for (let i = 0; i < 20; i++) {
        shortStrains.push(generateWorkoutStrain(20, SPORT_TYPES.RUNNING));
        longStrains.push(generateWorkoutStrain(90, SPORT_TYPES.RUNNING));
      }
      
      const avgShort = shortStrains.reduce((a, b) => a + b, 0) / shortStrains.length;
      const avgLong = longStrains.reduce((a, b) => a + b, 0) / longStrains.length;
      
      expect(avgLong).toBeGreaterThan(avgShort);
    });
    
    test('should generate higher strain for high-intensity sports', () => {
      const lowIntensityStrains = [];
      const highIntensityStrains = [];
      
      for (let i = 0; i < 20; i++) {
        lowIntensityStrains.push(generateWorkoutStrain(60, SPORT_TYPES.YOGA));
        highIntensityStrains.push(generateWorkoutStrain(60, SPORT_TYPES.HIIT));
      }
      
      const avgLow = lowIntensityStrains.reduce((a, b) => a + b, 0) / lowIntensityStrains.length;
      const avgHigh = highIntensityStrains.reduce((a, b) => a + b, 0) / highIntensityStrains.length;
      
      expect(avgHigh).toBeGreaterThan(avgLow);
    });
  });
  
  describe('generateWorkoutAverageHeartRate', () => {
    test('should generate average HR within realistic workout range', () => {
      for (let i = 0; i < 50; i++) {
        const strain = Math.random() * 21;
        const sportId = SPORT_TYPES.RUNNING;
        const avgHR = generateWorkoutAverageHeartRate(strain, sportId);
        
        // Workout average HR should be in range 80-185 bpm
        expect(avgHR).toBeGreaterThanOrEqual(80);
        expect(avgHR).toBeLessThanOrEqual(185);
      }
    });
    
    test('should generate higher average HR for higher strain', () => {
      const lowStrainHRs = [];
      const highStrainHRs = [];
      
      for (let i = 0; i < 20; i++) {
        lowStrainHRs.push(generateWorkoutAverageHeartRate(5, SPORT_TYPES.RUNNING));
        highStrainHRs.push(generateWorkoutAverageHeartRate(18, SPORT_TYPES.RUNNING));
      }
      
      const avgLow = lowStrainHRs.reduce((a, b) => a + b, 0) / lowStrainHRs.length;
      const avgHigh = highStrainHRs.reduce((a, b) => a + b, 0) / highStrainHRs.length;
      
      expect(avgHigh).toBeGreaterThan(avgLow);
    });
  });
  
  describe('generateWorkoutMaxHeartRate', () => {
    test('should generate max HR higher than average HR', () => {
      for (let i = 0; i < 50; i++) {
        const strain = Math.random() * 21;
        const avgHR = generateWorkoutAverageHeartRate(strain, SPORT_TYPES.RUNNING);
        const maxHR = generateWorkoutMaxHeartRate(avgHR, strain);
        
        expect(maxHR).toBeGreaterThan(avgHR);
      }
    });
    
    test('should generate max HR within valid range', () => {
      for (let i = 0; i < 50; i++) {
        const strain = Math.random() * 21;
        const avgHR = generateWorkoutAverageHeartRate(strain, SPORT_TYPES.RUNNING);
        const maxHR = generateWorkoutMaxHeartRate(avgHR, strain);
        
        expect(maxHR).toBeGreaterThanOrEqual(HEART_RATE_MIN);
        expect(maxHR).toBeLessThanOrEqual(HEART_RATE_MAX);
      }
    });
  });
  
  describe('generateWorkoutKilojoules', () => {
    test('should generate kilojoules in realistic range', () => {
      for (let i = 0; i < 50; i++) {
        const duration = 20 + Math.random() * 70;
        const strain = Math.random() * 21;
        const kj = generateWorkoutKilojoules(duration, strain);
        
        expect(kj).toBeGreaterThanOrEqual(500);
        expect(kj).toBeLessThanOrEqual(8000);
      }
    });
    
    test('should generate higher kilojoules for longer/higher strain workouts', () => {
      const lowKJs = [];
      const highKJs = [];
      
      for (let i = 0; i < 20; i++) {
        lowKJs.push(generateWorkoutKilojoules(20, 5));
        highKJs.push(generateWorkoutKilojoules(90, 18));
      }
      
      const avgLow = lowKJs.reduce((a, b) => a + b, 0) / lowKJs.length;
      const avgHigh = highKJs.reduce((a, b) => a + b, 0) / highKJs.length;
      
      expect(avgHigh).toBeGreaterThan(avgLow);
    });
  });
  
  describe('generateDistance', () => {
    test('should generate distance for distance-based sports', () => {
      const distanceSports = [
        SPORT_TYPES.RUNNING,
        SPORT_TYPES.CYCLING,
        SPORT_TYPES.SWIMMING,
        SPORT_TYPES.WALKING,
        SPORT_TYPES.ROWING,
      ];
      
      distanceSports.forEach(sportId => {
        const distance = generateDistance(sportId, 60);
        expect(distance).toBeGreaterThan(0);
      });
    });
    
    test('should return zero distance for non-distance sports', () => {
      const nonDistanceSports = [
        SPORT_TYPES.WEIGHTLIFTING,
        SPORT_TYPES.YOGA,
        SPORT_TYPES.BASKETBALL,
      ];
      
      nonDistanceSports.forEach(sportId => {
        const distance = generateDistance(sportId, 60);
        expect(distance).toBe(0);
      });
    });
  });
  
  describe('generateAltitude', () => {
    test('should generate altitude for outdoor sports with distance', () => {
      const outdoorSports = [SPORT_TYPES.RUNNING, SPORT_TYPES.CYCLING, SPORT_TYPES.WALKING];
      
      outdoorSports.forEach(sportId => {
        const altitude = generateAltitude(sportId, 5000);
        expect(altitude.altitude_gain_meter).toBeGreaterThan(0);
      });
    });
    
    test('should return zero altitude for indoor sports', () => {
      const altitude = generateAltitude(SPORT_TYPES.WEIGHTLIFTING, 0);
      expect(altitude.altitude_gain_meter).toBe(0);
      expect(altitude.altitude_change_meter).toBe(0);
    });
  });
  
  describe('generateZoneDuration', () => {
    test('should generate zone durations that sum to total workout time', () => {
      const duration = 60; // 60 minutes
      const strain = 12;
      const avgHR = 140;
      
      const zones = generateZoneDuration(duration, strain, avgHR);
      
      const totalMillis = duration * 60 * 1000;
      const zoneSum = zones.zone_zero_milli + zones.zone_one_milli + 
                     zones.zone_two_milli + zones.zone_three_milli +
                     zones.zone_four_milli + zones.zone_five_milli;
      
      // Should be very close (within 1 second for rounding)
      expect(Math.abs(zoneSum - totalMillis)).toBeLessThan(1000);
    });
    
    test('should have all zone fields', () => {
      const zones = generateZoneDuration(60, 12, 140);
      
      expect(zones).toHaveProperty('zone_zero_milli');
      expect(zones).toHaveProperty('zone_one_milli');
      expect(zones).toHaveProperty('zone_two_milli');
      expect(zones).toHaveProperty('zone_three_milli');
      expect(zones).toHaveProperty('zone_four_milli');
      expect(zones).toHaveProperty('zone_five_milli');
    });
  });
  
  describe('determineWorkoutDays', () => {
    test('should generate approximately 3-5 workouts per week', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-28'); // 4 weeks
      
      const workoutDays = determineWorkoutDays(startDate, endDate);
      
      // Should have 12-20 workout days in 4 weeks (3-5 per week)
      expect(workoutDays.size).toBeGreaterThanOrEqual(10);
      expect(workoutDays.size).toBeLessThanOrEqual(22);
    });
  });
  
  describe('generateWorkoutScore', () => {
    test('should generate complete workout score', () => {
      const score = generateWorkoutScore(60, SPORT_TYPES.RUNNING);
      
      expect(score).toHaveProperty('strain');
      expect(score).toHaveProperty('average_heart_rate');
      expect(score).toHaveProperty('max_heart_rate');
      expect(score).toHaveProperty('kilojoule');
      expect(score).toHaveProperty('percent_recorded');
      expect(score).toHaveProperty('distance_meter');
      expect(score).toHaveProperty('altitude_gain_meter');
      expect(score).toHaveProperty('altitude_change_meter');
      expect(score).toHaveProperty('zone_duration');
      
      // Max HR should be greater than average HR
      expect(score.max_heart_rate).toBeGreaterThan(score.average_heart_rate);
      
      // Percent recorded should be high (95-100%)
      expect(score.percent_recorded).toBeGreaterThanOrEqual(95);
      expect(score.percent_recorded).toBeLessThanOrEqual(100);
    });
  });
  
  describe('generateWorkoutData', () => {
    test('should generate workout data for date range', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31'); // 31 days
      
      const workoutData = generateWorkoutData(userId, startDate, endDate);
      
      expect(workoutData).toBeInstanceOf(Array);
      // Should have roughly 12-20 workouts in a month (3-5 per week)
      expect(workoutData.length).toBeGreaterThanOrEqual(10);
      expect(workoutData.length).toBeLessThanOrEqual(25);
    });
    
    test('should generate workouts with all required fields', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07');
      
      const workoutData = generateWorkoutData(userId, startDate, endDate);
      
      workoutData.forEach(record => {
        expect(record).toHaveProperty('id');
        expect(record).toHaveProperty('user_id', userId);
        expect(record).toHaveProperty('created_at');
        expect(record).toHaveProperty('updated_at');
        expect(record).toHaveProperty('start');
        expect(record).toHaveProperty('end');
        expect(record).toHaveProperty('timezone_offset');
        expect(record).toHaveProperty('sport_id');
        expect(record).toHaveProperty('score');
      });
    });
    
    test('should generate workouts with varied sport types', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-03-31'); // 3 months for variety
      
      const workoutData = generateWorkoutData(userId, startDate, endDate);
      
      const uniqueSports = new Set(workoutData.map(w => w.sport_id));
      
      // Should have at least 2 different sport types
      expect(uniqueSports.size).toBeGreaterThanOrEqual(2);
    });
    
    test('should generate workouts with duration between 20-90 minutes', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      const workoutData = generateWorkoutData(userId, startDate, endDate);
      
      workoutData.forEach(record => {
        const start = new Date(record.start);
        const end = new Date(record.end);
        const durationMinutes = (end - start) / (1000 * 60);
        
        expect(durationMinutes).toBeGreaterThanOrEqual(20);
        expect(durationMinutes).toBeLessThanOrEqual(90);
      });
    });
    
    test('should sort workouts by start time', () => {
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      const workoutData = generateWorkoutData(userId, startDate, endDate);
      
      for (let i = 0; i < workoutData.length - 1; i++) {
        const currentStart = new Date(workoutData[i].start);
        const nextStart = new Date(workoutData[i + 1].start);
        
        expect(nextStart.getTime()).toBeGreaterThanOrEqual(currentStart.getTime());
      }
    });
  });
});

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Workout Data Generator - Property Tests', () => {
  /**
   * Feature: life-metrics, Property 12: Workout data schema completeness
   * 
   * For any workout record returned by the API, it should contain all 
   * required fields: id, user_id, created_at, updated_at, start, end, 
   * timezone_offset, sport_id, and a score object with strain, average_heart_rate, 
   * max_heart_rate, kilojoule, percent_recorded, and zone_duration object
   * 
   * **Validates: Requirements 7.3, 7.4**
   */
  test('Property 12: All workout records contain complete schema', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 7, max: 90 }), // At least a week to get some workouts
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const workoutData = generateWorkoutData(userId, startDate, endDate);
          
          workoutData.forEach(record => {
            // Top-level fields
            expect(record).toHaveProperty('id');
            expect(record).toHaveProperty('user_id');
            expect(record).toHaveProperty('created_at');
            expect(record).toHaveProperty('updated_at');
            expect(record).toHaveProperty('start');
            expect(record).toHaveProperty('end');
            expect(record).toHaveProperty('timezone_offset');
            expect(record).toHaveProperty('sport_id');
            expect(record).toHaveProperty('score');
            
            // Type checks
            expect(typeof record.id).toBe('string');
            expect(record.user_id).toBe(userId);
            expect(typeof record.created_at).toBe('string');
            expect(typeof record.updated_at).toBe('string');
            expect(typeof record.start).toBe('string');
            expect(typeof record.end).toBe('string');
            expect(typeof record.timezone_offset).toBe('string');
            expect(typeof record.sport_id).toBe('number');
            expect(typeof record.score).toBe('object');
            
            // Score object fields
            expect(record.score).toHaveProperty('strain');
            expect(record.score).toHaveProperty('average_heart_rate');
            expect(record.score).toHaveProperty('max_heart_rate');
            expect(record.score).toHaveProperty('kilojoule');
            expect(record.score).toHaveProperty('percent_recorded');
            expect(record.score).toHaveProperty('distance_meter');
            expect(record.score).toHaveProperty('altitude_gain_meter');
            expect(record.score).toHaveProperty('altitude_change_meter');
            expect(record.score).toHaveProperty('zone_duration');
            
            // Score field types
            expect(typeof record.score.strain).toBe('number');
            expect(typeof record.score.average_heart_rate).toBe('number');
            expect(typeof record.score.max_heart_rate).toBe('number');
            expect(typeof record.score.kilojoule).toBe('number');
            expect(typeof record.score.percent_recorded).toBe('number');
            expect(typeof record.score.distance_meter).toBe('number');
            expect(typeof record.score.altitude_gain_meter).toBe('number');
            expect(typeof record.score.altitude_change_meter).toBe('number');
            expect(typeof record.score.zone_duration).toBe('object');
            
            // Zone duration fields
            expect(record.score.zone_duration).toHaveProperty('zone_zero_milli');
            expect(record.score.zone_duration).toHaveProperty('zone_one_milli');
            expect(record.score.zone_duration).toHaveProperty('zone_two_milli');
            expect(record.score.zone_duration).toHaveProperty('zone_three_milli');
            expect(record.score.zone_duration).toHaveProperty('zone_four_milli');
            expect(record.score.zone_duration).toHaveProperty('zone_five_milli');
            
            // Zone duration field types
            expect(typeof record.score.zone_duration.zone_zero_milli).toBe('number');
            expect(typeof record.score.zone_duration.zone_one_milli).toBe('number');
            expect(typeof record.score.zone_duration.zone_two_milli).toBe('number');
            expect(typeof record.score.zone_duration.zone_three_milli).toBe('number');
            expect(typeof record.score.zone_duration.zone_four_milli).toBe('number');
            expect(typeof record.score.zone_duration.zone_five_milli).toBe('number');
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: life-metrics, Property 13: Physiologically realistic health metrics (workouts)
   * 
   * For any generated workout data record, all metrics should fall within 
   * physiologically realistic ranges: strain (0-21), heart rate (40-200 bpm),
   * percent recorded (95-100%), workout duration (20-90 minutes)
   * 
   * **Validates: Requirements 7.3, 7.4, 7.5, 9.3, 9.4**
   */
  test('Property 13: All workout metrics are within realistic ranges', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 7, max: 90 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const workoutData = generateWorkoutData(userId, startDate, endDate);
          
          workoutData.forEach(record => {
            const score = record.score;
            
            // Strain (0-21)
            expect(score.strain).toBeGreaterThanOrEqual(STRAIN_MIN);
            expect(score.strain).toBeLessThanOrEqual(STRAIN_MAX);
            
            // Average heart rate (80-185 bpm for workouts)
            expect(score.average_heart_rate).toBeGreaterThanOrEqual(80);
            expect(score.average_heart_rate).toBeLessThanOrEqual(185);
            
            // Max heart rate (40-200 bpm)
            expect(score.max_heart_rate).toBeGreaterThanOrEqual(HEART_RATE_MIN);
            expect(score.max_heart_rate).toBeLessThanOrEqual(HEART_RATE_MAX);
            
            // Max HR should be greater than average HR
            expect(score.max_heart_rate).toBeGreaterThan(score.average_heart_rate);
            
            // Kilojoules (500-8000 per workout)
            expect(score.kilojoule).toBeGreaterThanOrEqual(500);
            expect(score.kilojoule).toBeLessThanOrEqual(8000);
            
            // Percent recorded (95-100%)
            expect(score.percent_recorded).toBeGreaterThanOrEqual(95);
            expect(score.percent_recorded).toBeLessThanOrEqual(100);
            
            // Distance (0 or positive)
            expect(score.distance_meter).toBeGreaterThanOrEqual(0);
            
            // Altitude gain (0 or positive)
            expect(score.altitude_gain_meter).toBeGreaterThanOrEqual(0);
            
            // Workout duration (20-90 minutes)
            const start = new Date(record.start);
            const end = new Date(record.end);
            const durationMinutes = (end - start) / (1000 * 60);
            expect(durationMinutes).toBeGreaterThanOrEqual(20);
            expect(durationMinutes).toBeLessThanOrEqual(90);
            
            // Zone durations should sum to total workout time
            const totalMillis = durationMinutes * 60 * 1000;
            const zoneSum = score.zone_duration.zone_zero_milli +
                           score.zone_duration.zone_one_milli +
                           score.zone_duration.zone_two_milli +
                           score.zone_duration.zone_three_milli +
                           score.zone_duration.zone_four_milli +
                           score.zone_duration.zone_five_milli;
            
            // Should be very close (within 1 second for rounding)
            expect(Math.abs(zoneSum - totalMillis)).toBeLessThan(1000);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Additional property: Workout frequency is 3-5 per week
   * 
   * For any date range of at least 4 weeks, the number of workouts should
   * average between 3-5 per week
   */
  test('Property: Workout frequency is 3-5 per week', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-01') }),
        fc.integer({ min: 28, max: 90 }), // At least 4 weeks
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const workoutData = generateWorkoutData(userId, startDate, endDate);
          
          const weeks = daysCount / 7;
          const workoutsPerWeek = workoutData.length / weeks;
          
          // Should average 3-5 workouts per week (allow some variance)
          expect(workoutsPerWeek).toBeGreaterThanOrEqual(WORKOUTS_PER_WEEK_MIN - 0.5);
          expect(workoutsPerWeek).toBeLessThanOrEqual(WORKOUTS_PER_WEEK_MAX + 0.5);
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Additional property: Workouts are sorted by start time
   * 
   * For any workout data, records should be sorted in chronological order
   * by start time
   */
  test('Property: Workouts are sorted by start time', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 7, max: 90 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const workoutData = generateWorkoutData(userId, startDate, endDate);
          
          // Check each consecutive pair
          for (let i = 0; i < workoutData.length - 1; i++) {
            const currentStart = new Date(workoutData[i].start);
            const nextStart = new Date(workoutData[i + 1].start);
            
            expect(nextStart.getTime()).toBeGreaterThanOrEqual(currentStart.getTime());
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Additional property: Higher strain correlates with higher heart rate
   * 
   * For any set of workout records, higher strain should generally correlate
   * with higher average heart rate
   */
  test('Property: Higher strain correlates with higher heart rate', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-01') }),
        fc.integer({ min: 30, max: 90 }), // Need enough workouts for correlation
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const workoutData = generateWorkoutData(userId, startDate, endDate);
          
          // Need at least 8 workouts for meaningful comparison
          if (workoutData.length < 8) {
            return true; // Skip this test case
          }
          
          // Sort by strain
          const sortedByStrain = workoutData.sort((a, b) => a.score.strain - b.score.strain);
          
          // Get bottom 25% and top 25%
          const bottomQuartile = sortedByStrain.slice(0, Math.floor(workoutData.length / 4));
          const topQuartile = sortedByStrain.slice(-Math.floor(workoutData.length / 4));
          
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
  
  /**
   * Additional property: Distance-based sports have non-zero distance
   * 
   * For any workout with a distance-based sport (running, cycling, swimming, etc.),
   * the distance_meter field should be greater than zero
   */
  test('Property: Distance-based sports have non-zero distance', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 30, max: 90 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const workoutData = generateWorkoutData(userId, startDate, endDate);
          
          const distanceSports = [
            SPORT_TYPES.RUNNING,
            SPORT_TYPES.CYCLING,
            SPORT_TYPES.SWIMMING,
            SPORT_TYPES.WALKING,
            SPORT_TYPES.ROWING,
          ];
          
          workoutData.forEach(record => {
            if (distanceSports.includes(record.sport_id)) {
              expect(record.score.distance_meter).toBeGreaterThan(0);
            }
          });
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Additional property: Workout start times are during waking hours
   * 
   * For any workout, the start time should be between 6am and 8pm
   * (reasonable workout hours)
   */
  test('Property: Workout start times are during waking hours', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 7, max: 90 }),
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const workoutData = generateWorkoutData(userId, startDate, endDate);
          
          workoutData.forEach(record => {
            const start = new Date(record.start);
            const hour = start.getHours();
            
            // Should be between 6am (6) and 8pm (20)
            expect(hour).toBeGreaterThanOrEqual(6);
            expect(hour).toBeLessThan(20);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Additional property: Varied sport types across workouts
   * 
   * For any date range of at least 60 days, there should be at least
   * 2 different sport types to ensure variety
   */
  test('Property: Varied sport types across workouts', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2024-10-31') }),
        fc.integer({ min: 60, max: 90 }), // At least 60 days for variety
        (userId, startDate, daysCount) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysCount);
          
          const workoutData = generateWorkoutData(userId, startDate, endDate);
          
          // Need at least a few workouts to check variety
          if (workoutData.length < 5) {
            return true; // Skip this test case
          }
          
          const uniqueSports = new Set(workoutData.map(w => w.sport_id));
          
          // Should have at least 2 different sport types
          expect(uniqueSports.size).toBeGreaterThanOrEqual(2);
        }
      ),
      { numRuns: 50 }
    );
  });
});
