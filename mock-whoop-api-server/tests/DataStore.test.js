/**
 * Unit Tests for DataStore
 * 
 * Tests user retrieval, token validation, and date range filtering
 * for all health data types.
 * 
 * Requirements: 3.1, 3.2, 3.3, 2.4
 */

const DataStore = require('../src/data/DataStore');

describe('DataStore', () => {
  let dataStore;

  beforeEach(() => {
    dataStore = new DataStore();
  });

  describe('User Management', () => {
    test('should add and retrieve a user', () => {
      const user = {
        user_id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };

      dataStore.addUser(user);
      const retrieved = dataStore.getUser('user-123');

      expect(retrieved).toEqual(user);
    });

    test('should return undefined for non-existent user', () => {
      const retrieved = dataStore.getUser('non-existent');
      expect(retrieved).toBeUndefined();
    });

    test('should get all user IDs', () => {
      const user1 = { user_id: 'user-1', email: 'user1@example.com', first_name: 'User', last_name: 'One' };
      const user2 = { user_id: 'user-2', email: 'user2@example.com', first_name: 'User', last_name: 'Two' };

      dataStore.addUser(user1);
      dataStore.addUser(user2);

      const userIds = dataStore.getAllUserIds();
      expect(userIds).toHaveLength(2);
      expect(userIds).toContain('user-1');
      expect(userIds).toContain('user-2');
    });
  });

  describe('Token Management', () => {
    test('should create a token for a user', () => {
      const user = {
        user_id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };
      dataStore.addUser(user);

      const token = dataStore.createToken('user-123', 3600);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    test('should validate a valid token', () => {
      const user = {
        user_id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };
      dataStore.addUser(user);

      const token = dataStore.createToken('user-123', 3600);
      const userId = dataStore.validateToken(token);

      expect(userId).toBe('user-123');
    });

    test('should return null for invalid token', () => {
      const userId = dataStore.validateToken('invalid-token');
      expect(userId).toBeNull();
    });

    test('should return null for expired token', () => {
      const user = {
        user_id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };
      dataStore.addUser(user);

      // Create token that expires immediately
      const token = dataStore.createToken('user-123', 0);

      // Wait a bit to ensure expiration
      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        const userId = dataStore.validateToken(token);
        expect(userId).toBeNull();
      });
    });

    test('should get user by valid token', () => {
      const user = {
        user_id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };
      dataStore.addUser(user);

      const token = dataStore.createToken('user-123', 3600);
      const retrieved = dataStore.getUserByToken(token);

      expect(retrieved).toEqual(user);
    });

    test('should return null when getting user by invalid token', () => {
      const retrieved = dataStore.getUserByToken('invalid-token');
      expect(retrieved).toBeNull();
    });

    test('should return null when getting user by expired token', () => {
      const user = {
        user_id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };
      dataStore.addUser(user);

      // Create token that expires immediately
      const token = dataStore.createToken('user-123', 0);

      // Wait a bit to ensure expiration
      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        const retrieved = dataStore.getUserByToken(token);
        expect(retrieved).toBeNull();
      });
    });

    test('should create unique tokens for same user', () => {
      const user = {
        user_id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };
      dataStore.addUser(user);

      const token1 = dataStore.createToken('user-123', 3600);
      const token2 = dataStore.createToken('user-123', 3600);

      expect(token1).not.toBe(token2);
      expect(dataStore.validateToken(token1)).toBe('user-123');
      expect(dataStore.validateToken(token2)).toBe('user-123');
    });
  });

  describe('Sleep Data Management', () => {
    test('should add and retrieve sleep data', () => {
      const sleepRecords = [
        {
          id: 'sleep-1',
          user_id: 'user-123',
          start: '2024-01-01T22:00:00Z',
          end: '2024-01-02T06:00:00Z',
          created_at: '2024-01-02T06:00:00Z',
          updated_at: '2024-01-02T06:00:00Z'
        }
      ];

      dataStore.addSleepData('user-123', sleepRecords);
      const retrieved = dataStore.getSleepData(
        'user-123',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].id).toBe('sleep-1');
    });

    test('should filter sleep data by date range', () => {
      const sleepRecords = [
        {
          id: 'sleep-1',
          user_id: 'user-123',
          start: '2024-01-01T22:00:00Z',
          end: '2024-01-02T06:00:00Z',
          created_at: '2024-01-02T06:00:00Z',
          updated_at: '2024-01-02T06:00:00Z'
        },
        {
          id: 'sleep-2',
          user_id: 'user-123',
          start: '2024-01-15T22:00:00Z',
          end: '2024-01-16T06:00:00Z',
          created_at: '2024-01-16T06:00:00Z',
          updated_at: '2024-01-16T06:00:00Z'
        },
        {
          id: 'sleep-3',
          user_id: 'user-123',
          start: '2024-02-01T22:00:00Z',
          end: '2024-02-02T06:00:00Z',
          created_at: '2024-02-02T06:00:00Z',
          updated_at: '2024-02-02T06:00:00Z'
        }
      ];

      dataStore.addSleepData('user-123', sleepRecords);
      const retrieved = dataStore.getSleepData(
        'user-123',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(retrieved).toHaveLength(2);
      expect(retrieved.map(r => r.id)).toEqual(['sleep-1', 'sleep-2']);
    });

    test('should return empty array for user with no sleep data', () => {
      const retrieved = dataStore.getSleepData(
        'user-123',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(retrieved).toEqual([]);
    });

    test('should sort sleep data by start date', () => {
      const sleepRecords = [
        {
          id: 'sleep-2',
          user_id: 'user-123',
          start: '2024-01-15T22:00:00Z',
          end: '2024-01-16T06:00:00Z',
          created_at: '2024-01-16T06:00:00Z',
          updated_at: '2024-01-16T06:00:00Z'
        },
        {
          id: 'sleep-1',
          user_id: 'user-123',
          start: '2024-01-01T22:00:00Z',
          end: '2024-01-02T06:00:00Z',
          created_at: '2024-01-02T06:00:00Z',
          updated_at: '2024-01-02T06:00:00Z'
        }
      ];

      dataStore.addSleepData('user-123', sleepRecords);
      const retrieved = dataStore.getSleepData(
        'user-123',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(retrieved[0].id).toBe('sleep-1');
      expect(retrieved[1].id).toBe('sleep-2');
    });
  });

  describe('Recovery Data Management', () => {
    test('should add and retrieve recovery data', () => {
      const recoveryRecords = [
        {
          id: 'recovery-1',
          user_id: 'user-123',
          created_at: '2024-01-02T06:00:00Z',
          updated_at: '2024-01-02T06:00:00Z',
          cycle_id: 'cycle-1',
          sleep_id: 'sleep-1'
        }
      ];

      dataStore.addRecoveryData('user-123', recoveryRecords);
      const retrieved = dataStore.getRecoveryData(
        'user-123',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].id).toBe('recovery-1');
    });

    test('should filter recovery data by date range', () => {
      const recoveryRecords = [
        {
          id: 'recovery-1',
          user_id: 'user-123',
          created_at: '2024-01-02T06:00:00Z',
          updated_at: '2024-01-02T06:00:00Z',
          cycle_id: 'cycle-1',
          sleep_id: 'sleep-1'
        },
        {
          id: 'recovery-2',
          user_id: 'user-123',
          created_at: '2024-01-16T06:00:00Z',
          updated_at: '2024-01-16T06:00:00Z',
          cycle_id: 'cycle-2',
          sleep_id: 'sleep-2'
        },
        {
          id: 'recovery-3',
          user_id: 'user-123',
          created_at: '2024-02-02T06:00:00Z',
          updated_at: '2024-02-02T06:00:00Z',
          cycle_id: 'cycle-3',
          sleep_id: 'sleep-3'
        }
      ];

      dataStore.addRecoveryData('user-123', recoveryRecords);
      const retrieved = dataStore.getRecoveryData(
        'user-123',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(retrieved).toHaveLength(2);
      expect(retrieved.map(r => r.id)).toEqual(['recovery-1', 'recovery-2']);
    });

    test('should return empty array for user with no recovery data', () => {
      const retrieved = dataStore.getRecoveryData(
        'user-123',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(retrieved).toEqual([]);
    });
  });

  describe('Cycle Data Management', () => {
    test('should add and retrieve cycle data', () => {
      const cycleRecords = [
        {
          id: 'cycle-1',
          user_id: 'user-123',
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }
      ];

      dataStore.addCycleData('user-123', cycleRecords);
      const retrieved = dataStore.getCycleData(
        'user-123',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].id).toBe('cycle-1');
    });

    test('should filter cycle data by date range', () => {
      const cycleRecords = [
        {
          id: 'cycle-1',
          user_id: 'user-123',
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-02T00:00:00Z',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        },
        {
          id: 'cycle-2',
          user_id: 'user-123',
          start: '2024-01-15T00:00:00Z',
          end: '2024-01-16T00:00:00Z',
          created_at: '2024-01-16T00:00:00Z',
          updated_at: '2024-01-16T00:00:00Z'
        },
        {
          id: 'cycle-3',
          user_id: 'user-123',
          start: '2024-02-01T00:00:00Z',
          end: '2024-02-02T00:00:00Z',
          created_at: '2024-02-02T00:00:00Z',
          updated_at: '2024-02-02T00:00:00Z'
        }
      ];

      dataStore.addCycleData('user-123', cycleRecords);
      const retrieved = dataStore.getCycleData(
        'user-123',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(retrieved).toHaveLength(2);
      expect(retrieved.map(r => r.id)).toEqual(['cycle-1', 'cycle-2']);
    });

    test('should return empty array for user with no cycle data', () => {
      const retrieved = dataStore.getCycleData(
        'user-123',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(retrieved).toEqual([]);
    });
  });

  describe('Workout Data Management', () => {
    test('should add and retrieve workout data', () => {
      const workoutRecords = [
        {
          id: 'workout-1',
          user_id: 'user-123',
          start: '2024-01-01T10:00:00Z',
          end: '2024-01-01T11:00:00Z',
          created_at: '2024-01-01T11:00:00Z',
          updated_at: '2024-01-01T11:00:00Z',
          sport_id: 1
        }
      ];

      dataStore.addWorkoutData('user-123', workoutRecords);
      const retrieved = dataStore.getWorkoutData(
        'user-123',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].id).toBe('workout-1');
    });

    test('should filter workout data by date range', () => {
      const workoutRecords = [
        {
          id: 'workout-1',
          user_id: 'user-123',
          start: '2024-01-01T10:00:00Z',
          end: '2024-01-01T11:00:00Z',
          created_at: '2024-01-01T11:00:00Z',
          updated_at: '2024-01-01T11:00:00Z',
          sport_id: 1
        },
        {
          id: 'workout-2',
          user_id: 'user-123',
          start: '2024-01-15T10:00:00Z',
          end: '2024-01-15T11:00:00Z',
          created_at: '2024-01-15T11:00:00Z',
          updated_at: '2024-01-15T11:00:00Z',
          sport_id: 2
        },
        {
          id: 'workout-3',
          user_id: 'user-123',
          start: '2024-02-01T10:00:00Z',
          end: '2024-02-01T11:00:00Z',
          created_at: '2024-02-01T11:00:00Z',
          updated_at: '2024-02-01T11:00:00Z',
          sport_id: 1
        }
      ];

      dataStore.addWorkoutData('user-123', workoutRecords);
      const retrieved = dataStore.getWorkoutData(
        'user-123',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(retrieved).toHaveLength(2);
      expect(retrieved.map(r => r.id)).toEqual(['workout-1', 'workout-2']);
    });

    test('should return empty array for user with no workout data', () => {
      const retrieved = dataStore.getWorkoutData(
        'user-123',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(retrieved).toEqual([]);
    });
  });

  describe('Data Isolation Between Users', () => {
    test('should isolate sleep data between different users', () => {
      const sleepRecords1 = [
        {
          id: 'sleep-user1',
          user_id: 'user-1',
          start: '2024-01-01T22:00:00Z',
          end: '2024-01-02T06:00:00Z',
          created_at: '2024-01-02T06:00:00Z',
          updated_at: '2024-01-02T06:00:00Z'
        }
      ];

      const sleepRecords2 = [
        {
          id: 'sleep-user2',
          user_id: 'user-2',
          start: '2024-01-01T22:00:00Z',
          end: '2024-01-02T06:00:00Z',
          created_at: '2024-01-02T06:00:00Z',
          updated_at: '2024-01-02T06:00:00Z'
        }
      ];

      dataStore.addSleepData('user-1', sleepRecords1);
      dataStore.addSleepData('user-2', sleepRecords2);

      const user1Data = dataStore.getSleepData(
        'user-1',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );
      const user2Data = dataStore.getSleepData(
        'user-2',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(user1Data).toHaveLength(1);
      expect(user1Data[0].id).toBe('sleep-user1');
      expect(user2Data).toHaveLength(1);
      expect(user2Data[0].id).toBe('sleep-user2');
    });

    test('should isolate tokens between different users', () => {
      const user1 = {
        user_id: 'user-1',
        email: 'user1@example.com',
        first_name: 'User',
        last_name: 'One'
      };
      const user2 = {
        user_id: 'user-2',
        email: 'user2@example.com',
        first_name: 'User',
        last_name: 'Two'
      };

      dataStore.addUser(user1);
      dataStore.addUser(user2);

      const token1 = dataStore.createToken('user-1', 3600);
      const token2 = dataStore.createToken('user-2', 3600);

      expect(dataStore.validateToken(token1)).toBe('user-1');
      expect(dataStore.validateToken(token2)).toBe('user-2');
      expect(dataStore.getUserByToken(token1)).toEqual(user1);
      expect(dataStore.getUserByToken(token2)).toEqual(user2);
    });
  });

  describe('Date Range Boundary Cases', () => {
    test('should include records at exact start boundary', () => {
      const sleepRecords = [
        {
          id: 'sleep-1',
          user_id: 'user-123',
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-01T08:00:00Z',
          created_at: '2024-01-01T08:00:00Z',
          updated_at: '2024-01-01T08:00:00Z'
        }
      ];

      dataStore.addSleepData('user-123', sleepRecords);
      const retrieved = dataStore.getSleepData(
        'user-123',
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-31T23:59:59Z')
      );

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].id).toBe('sleep-1');
    });

    test('should include records at exact end boundary', () => {
      const sleepRecords = [
        {
          id: 'sleep-1',
          user_id: 'user-123',
          start: '2024-01-31T22:00:00Z',
          end: '2024-02-01T06:00:00Z',
          created_at: '2024-02-01T06:00:00Z',
          updated_at: '2024-02-01T06:00:00Z'
        }
      ];

      dataStore.addSleepData('user-123', sleepRecords);
      const retrieved = dataStore.getSleepData(
        'user-123',
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-31T22:00:00Z')
      );

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].id).toBe('sleep-1');
    });

    test('should exclude records outside date range', () => {
      const sleepRecords = [
        {
          id: 'sleep-before',
          user_id: 'user-123',
          start: '2023-12-31T22:00:00Z',
          end: '2024-01-01T06:00:00Z',
          created_at: '2024-01-01T06:00:00Z',
          updated_at: '2024-01-01T06:00:00Z'
        },
        {
          id: 'sleep-after',
          user_id: 'user-123',
          start: '2024-02-01T22:00:00Z',
          end: '2024-02-02T06:00:00Z',
          created_at: '2024-02-02T06:00:00Z',
          updated_at: '2024-02-02T06:00:00Z'
        }
      ];

      dataStore.addSleepData('user-123', sleepRecords);
      const retrieved = dataStore.getSleepData(
        'user-123',
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-31T23:59:59Z')
      );

      expect(retrieved).toHaveLength(0);
    });
  });

  describe('Token Expiration Edge Cases', () => {
    test('should handle token with custom expiration time', () => {
      const user = {
        user_id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };
      dataStore.addUser(user);

      // Create token with 1 second expiration
      const token = dataStore.createToken('user-123', 1);
      
      // Should be valid immediately
      expect(dataStore.validateToken(token)).toBe('user-123');
      
      // Wait for expiration
      return new Promise(resolve => setTimeout(resolve, 1100)).then(() => {
        expect(dataStore.validateToken(token)).toBeNull();
      });
    });

    test('should clean up expired token on validation', () => {
      const user = {
        user_id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };
      dataStore.addUser(user);

      const token = dataStore.createToken('user-123', 0);
      
      // Wait for expiration
      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        // First validation should clean up the token
        expect(dataStore.validateToken(token)).toBeNull();
        
        // Second validation should still return null (token was removed)
        expect(dataStore.validateToken(token)).toBeNull();
      });
    });
  });

  describe('Clear Method', () => {
    test('should clear all data from the store', () => {
      const user = {
        user_id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };
      dataStore.addUser(user);
      const token = dataStore.createToken('user-123', 3600);

      dataStore.clear();

      expect(dataStore.getUser('user-123')).toBeUndefined();
      expect(dataStore.validateToken(token)).toBeNull();
      expect(dataStore.getAllUserIds()).toHaveLength(0);
    });
  });
});
