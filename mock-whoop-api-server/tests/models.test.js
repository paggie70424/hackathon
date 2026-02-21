/**
 * Unit Tests for Data Models and Constants
 * 
 * Tests that all constants are defined and have realistic values.
 * 
 * Requirements: 3.4, 4.3, 4.4, 5.3, 5.4, 6.3, 6.4, 7.3, 7.4, 9.3, 9.4
 */

const models = require('../src/models');

describe('Data Model Constants', () => {
  describe('Heart Rate Constants', () => {
    test('HEART_RATE_MIN should be 40 bpm', () => {
      expect(models.HEART_RATE_MIN).toBe(40);
    });

    test('HEART_RATE_MAX should be 200 bpm', () => {
      expect(models.HEART_RATE_MAX).toBe(200);
    });

    test('RESTING_HEART_RATE_MIN should be 40 bpm', () => {
      expect(models.RESTING_HEART_RATE_MIN).toBe(40);
    });

    test('RESTING_HEART_RATE_MAX should be 100 bpm', () => {
      expect(models.RESTING_HEART_RATE_MAX).toBe(100);
    });

    test('heart rate range should be valid', () => {
      expect(models.HEART_RATE_MIN).toBeLessThan(models.HEART_RATE_MAX);
      expect(models.RESTING_HEART_RATE_MIN).toBeLessThan(models.RESTING_HEART_RATE_MAX);
    });
  });

  describe('HRV Constants', () => {
    test('HRV_MIN should be 20 ms', () => {
      expect(models.HRV_MIN).toBe(20);
    });

    test('HRV_MAX should be 150 ms', () => {
      expect(models.HRV_MAX).toBe(150);
    });

    test('HRV range should be valid', () => {
      expect(models.HRV_MIN).toBeLessThan(models.HRV_MAX);
    });
  });

  describe('Strain and Recovery Constants', () => {
    test('STRAIN_MIN should be 0', () => {
      expect(models.STRAIN_MIN).toBe(0);
    });

    test('STRAIN_MAX should be 21', () => {
      expect(models.STRAIN_MAX).toBe(21);
    });

    test('RECOVERY_SCORE_MIN should be 0', () => {
      expect(models.RECOVERY_SCORE_MIN).toBe(0);
    });

    test('RECOVERY_SCORE_MAX should be 100', () => {
      expect(models.RECOVERY_SCORE_MAX).toBe(100);
    });

    test('strain and recovery ranges should be valid', () => {
      expect(models.STRAIN_MIN).toBeLessThan(models.STRAIN_MAX);
      expect(models.RECOVERY_SCORE_MIN).toBeLessThan(models.RECOVERY_SCORE_MAX);
    });
  });

  describe('Sleep Constants', () => {
    test('SLEEP_PERFORMANCE_MIN should be 0', () => {
      expect(models.SLEEP_PERFORMANCE_MIN).toBe(0);
    });

    test('SLEEP_PERFORMANCE_MAX should be 100', () => {
      expect(models.SLEEP_PERFORMANCE_MAX).toBe(100);
    });

    test('SLEEP_CONSISTENCY_MIN should be 0', () => {
      expect(models.SLEEP_CONSISTENCY_MIN).toBe(0);
    });

    test('SLEEP_CONSISTENCY_MAX should be 100', () => {
      expect(models.SLEEP_CONSISTENCY_MAX).toBe(100);
    });

    test('SLEEP_EFFICIENCY_MIN should be 0', () => {
      expect(models.SLEEP_EFFICIENCY_MIN).toBe(0);
    });

    test('SLEEP_EFFICIENCY_MAX should be 100', () => {
      expect(models.SLEEP_EFFICIENCY_MAX).toBe(100);
    });

    test('SLEEP_DURATION_MIN_HOURS should be 7', () => {
      expect(models.SLEEP_DURATION_MIN_HOURS).toBe(7);
    });

    test('SLEEP_DURATION_MAX_HOURS should be 9', () => {
      expect(models.SLEEP_DURATION_MAX_HOURS).toBe(9);
    });

    test('sleep ranges should be valid', () => {
      expect(models.SLEEP_PERFORMANCE_MIN).toBeLessThan(models.SLEEP_PERFORMANCE_MAX);
      expect(models.SLEEP_CONSISTENCY_MIN).toBeLessThan(models.SLEEP_CONSISTENCY_MAX);
      expect(models.SLEEP_EFFICIENCY_MIN).toBeLessThan(models.SLEEP_EFFICIENCY_MAX);
      expect(models.SLEEP_DURATION_MIN_HOURS).toBeLessThan(models.SLEEP_DURATION_MAX_HOURS);
    });
  });

  describe('Respiratory and Vitals Constants', () => {
    test('RESPIRATORY_RATE_MIN should be 12 breaths/min', () => {
      expect(models.RESPIRATORY_RATE_MIN).toBe(12);
    });

    test('RESPIRATORY_RATE_MAX should be 20 breaths/min', () => {
      expect(models.RESPIRATORY_RATE_MAX).toBe(20);
    });

    test('SPO2_MIN should be 95%', () => {
      expect(models.SPO2_MIN).toBe(95);
    });

    test('SPO2_MAX should be 100%', () => {
      expect(models.SPO2_MAX).toBe(100);
    });

    test('SKIN_TEMP_MIN should be 33°C', () => {
      expect(models.SKIN_TEMP_MIN).toBe(33);
    });

    test('SKIN_TEMP_MAX should be 36°C', () => {
      expect(models.SKIN_TEMP_MAX).toBe(36);
    });

    test('respiratory and vitals ranges should be valid', () => {
      expect(models.RESPIRATORY_RATE_MIN).toBeLessThan(models.RESPIRATORY_RATE_MAX);
      expect(models.SPO2_MIN).toBeLessThan(models.SPO2_MAX);
      expect(models.SKIN_TEMP_MIN).toBeLessThan(models.SKIN_TEMP_MAX);
    });
  });

  describe('Workout Constants', () => {
    test('WORKOUTS_PER_WEEK_MIN should be 3', () => {
      expect(models.WORKOUTS_PER_WEEK_MIN).toBe(3);
    });

    test('WORKOUTS_PER_WEEK_MAX should be 5', () => {
      expect(models.WORKOUTS_PER_WEEK_MAX).toBe(5);
    });

    test('workout frequency range should be valid', () => {
      expect(models.WORKOUTS_PER_WEEK_MIN).toBeLessThan(models.WORKOUTS_PER_WEEK_MAX);
    });
  });

  describe('All Constants Export', () => {
    test('should export all required constants', () => {
      const expectedConstants = [
        'HEART_RATE_MIN',
        'HEART_RATE_MAX',
        'RESTING_HEART_RATE_MIN',
        'RESTING_HEART_RATE_MAX',
        'HRV_MIN',
        'HRV_MAX',
        'STRAIN_MIN',
        'STRAIN_MAX',
        'RECOVERY_SCORE_MIN',
        'RECOVERY_SCORE_MAX',
        'SLEEP_PERFORMANCE_MIN',
        'SLEEP_PERFORMANCE_MAX',
        'SLEEP_CONSISTENCY_MIN',
        'SLEEP_CONSISTENCY_MAX',
        'SLEEP_EFFICIENCY_MIN',
        'SLEEP_EFFICIENCY_MAX',
        'SLEEP_DURATION_MIN_HOURS',
        'SLEEP_DURATION_MAX_HOURS',
        'RESPIRATORY_RATE_MIN',
        'RESPIRATORY_RATE_MAX',
        'SPO2_MIN',
        'SPO2_MAX',
        'SKIN_TEMP_MIN',
        'SKIN_TEMP_MAX',
        'WORKOUTS_PER_WEEK_MIN',
        'WORKOUTS_PER_WEEK_MAX',
      ];

      expectedConstants.forEach(constant => {
        expect(models).toHaveProperty(constant);
        expect(typeof models[constant]).toBe('number');
      });
    });
  });

  describe('Physiological Realism', () => {
    test('heart rate ranges should be physiologically realistic', () => {
      // Requirement 9.3: heart rate (40-200 bpm)
      expect(models.HEART_RATE_MIN).toBeGreaterThanOrEqual(40);
      expect(models.HEART_RATE_MAX).toBeLessThanOrEqual(200);
    });

    test('HRV ranges should be physiologically realistic', () => {
      // Requirement 9.4: HRV (20-150 ms)
      expect(models.HRV_MIN).toBeGreaterThanOrEqual(20);
      expect(models.HRV_MAX).toBeLessThanOrEqual(150);
    });

    test('strain ranges should match WHOOP specification', () => {
      // Requirement 6.5: strain values 0-21
      expect(models.STRAIN_MIN).toBe(0);
      expect(models.STRAIN_MAX).toBe(21);
    });

    test('recovery score should be percentage-based', () => {
      // Requirement 5.4: recovery_score (0-100)
      expect(models.RECOVERY_SCORE_MIN).toBe(0);
      expect(models.RECOVERY_SCORE_MAX).toBe(100);
    });

    test('sleep duration should match healthy adult ranges', () => {
      // Requirement 4.5: 7-9 hours per night
      expect(models.SLEEP_DURATION_MIN_HOURS).toBe(7);
      expect(models.SLEEP_DURATION_MAX_HOURS).toBe(9);
    });

    test('respiratory rate should be physiologically realistic', () => {
      // Property 13: respiratory rate (12-20 breaths/min)
      expect(models.RESPIRATORY_RATE_MIN).toBe(12);
      expect(models.RESPIRATORY_RATE_MAX).toBe(20);
    });

    test('SpO2 should be in healthy range', () => {
      // Property 13: SpO2 (95-100%)
      expect(models.SPO2_MIN).toBe(95);
      expect(models.SPO2_MAX).toBe(100);
    });

    test('skin temperature should be physiologically realistic', () => {
      // Property 13: skin temperature (33-36°C)
      expect(models.SKIN_TEMP_MIN).toBe(33);
      expect(models.SKIN_TEMP_MAX).toBe(36);
    });
  });
});
