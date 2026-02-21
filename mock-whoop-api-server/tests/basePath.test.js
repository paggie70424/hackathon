/**
 * Property Test: Base Path Validation
 * 
 * Feature: life-metrics, Property 1: All API endpoints use correct base path
 * 
 * This test validates that all API endpoints (except OAuth) use the correct
 * base path /developer/v1/ as specified in Requirement 1.2.
 * 
 * Validates: Requirements 1.2
 */

const request = require('supertest');
const fc = require('fast-check');
const createApp = require('../src/app');
const DataStore = require('../src/data/DataStore');

describe('Feature: life-metrics, Property 1: All API endpoints use correct base path', () => {
  let app;
  let dataStore;
  let validToken;
  
  beforeAll(() => {
    // Create data store and app
    dataStore = new DataStore();
    
    // Add a test user
    const testUser = {
      user_id: 'test-user-id',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
    };
    dataStore.addUser(testUser);
    
    // Create a valid token
    validToken = dataStore.createToken(testUser.user_id, 3600);
    
    // Add some test data
    const testSleepData = [{
      id: 'sleep-1',
      user_id: testUser.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      start: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
      timezone_offset: '-08:00',
      nap: false,
      score_state: 'SCORED',
      score: {
        stage_summary: {
          total_in_bed_time_milli: 28800000,
          total_awake_time_milli: 1440000,
          total_no_data_time_milli: 0,
          total_light_sleep_time_milli: 14400000,
          total_slow_wave_sleep_time_milli: 5760000,
          total_rem_sleep_time_milli: 7200000,
          sleep_cycle_count: 5,
          disturbance_count: 3,
        },
        sleep_needed: {
          baseline_milli: 28800000,
          need_from_sleep_debt_milli: 0,
          need_from_recent_strain_milli: 0,
          need_from_recent_nap_milli: 0,
        },
        respiratory_rate: 16,
        sleep_performance_percentage: 85,
        sleep_consistency_percentage: 80,
        sleep_efficiency_percentage: 90,
      },
    }];
    dataStore.addSleepData(testUser.user_id, testSleepData);
    
    const testRecoveryData = [{
      id: 'recovery-1',
      user_id: testUser.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cycle_id: 'cycle-1',
      sleep_id: 'sleep-1',
      user_calibrating: false,
      score: {
        recovery_score: 75,
        resting_heart_rate: 60,
        hrv_rmssd_milli: 80,
        spo2_percentage: 98,
        skin_temp_celsius: 34.5,
      },
    }];
    dataStore.addRecoveryData(testUser.user_id, testRecoveryData);
    
    const testCycleData = [{
      id: 'cycle-1',
      user_id: testUser.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
      timezone_offset: '-08:00',
      score: {
        strain: 12.5,
        kilojoule: 10000,
        average_heart_rate: 75,
        max_heart_rate: 150,
      },
    }];
    dataStore.addCycleData(testUser.user_id, testCycleData);
    
    const testWorkoutData = [{
      id: 'workout-1',
      user_id: testUser.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      start: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      timezone_offset: '-08:00',
      sport_id: 1,
      score: {
        strain: 15.0,
        average_heart_rate: 140,
        max_heart_rate: 180,
        kilojoule: 2500,
        percent_recorded: 100,
        distance_meter: 5000,
        altitude_gain_meter: 50,
        altitude_change_meter: 0,
        zone_duration: {
          zone_zero_milli: 0,
          zone_one_milli: 600000,
          zone_two_milli: 1200000,
          zone_three_milli: 1200000,
          zone_four_milli: 600000,
          zone_five_milli: 0,
        },
      },
    }];
    dataStore.addWorkoutData(testUser.user_id, testWorkoutData);
    
    app = createApp(dataStore);
  });
  
  /**
   * Property 1: All API endpoints use correct base path
   * 
   * For any API endpoint (except OAuth), the URL path should start with /developer/v1/
   * 
   * This property validates Requirement 1.2: "THE Mock_WHOOP_Server SHALL use base URL 
   * path `/developer/v1/` for all API endpoints"
   */
  test('all API endpoints (except OAuth) use /developer/v1/ base path', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          '/developer/v1/user/profile/basic',
          '/developer/v1/activity/sleep',
          '/developer/v1/recovery',
          '/developer/v1/cycle',
          '/developer/v1/activity/workout'
        ),
        async (endpoint) => {
          // Make request to endpoint
          const response = await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${validToken}`);
          
          // Endpoint should respond (not 404)
          // Valid responses are 200 (success) or other status codes for valid endpoints
          // 404 would indicate the endpoint doesn't exist
          expect(response.status).not.toBe(404);
          
          // Verify the endpoint path starts with /developer/v1/
          expect(endpoint).toMatch(/^\/developer\/v1\//);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('OAuth endpoint does not use /developer/v1/ base path', async () => {
    // OAuth endpoint is an exception - it uses /oauth/token
    const response = await request(app)
      .post('/oauth/token')
      .send({
        grant_type: 'client_credentials',
        client_id: 'test-client',
        client_secret: 'test-secret',
      });
    
    // Should respond successfully (not 404)
    expect(response.status).not.toBe(404);
    expect(response.status).toBe(200);
  });
  
  test('endpoints without /developer/v1/ prefix return 404', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          '/user/profile/basic',
          '/activity/sleep',
          '/recovery',
          '/cycle',
          '/activity/workout'
        ),
        async (endpoint) => {
          // These endpoints without the base path should not exist
          const response = await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${validToken}`);
          
          // Should return 404 Not Found
          expect(response.status).toBe(404);
        }
      ),
      { numRuns: 100 }
    );
  });
});
