# Mock WHOOP API Server

A self-contained HTTP REST API server that simulates the WHOOP API for development and testing purposes. This server generates realistic synthetic health data (sleep, recovery, cycles, workouts) and serves it through endpoints compatible with the official WHOOP API specification.

## Features

- **Self-Contained**: Single Node.js process with in-memory data storage
- **Realistic Data**: Generates physiologically realistic health metrics with proper correlations
- **Full API Coverage**: Implements all major WHOOP API endpoints
- **Error Simulation**: Test error handling with special headers
- **Fast**: Responds to requests within 200ms
- **Easy Setup**: No database or cloud dependencies required

## Installation

```bash
npm install
```

## Usage

### Start the Server

```bash
npm start
```

The server will start on port 8080 by default. You can configure the port using the `PORT` environment variable:

```bash
PORT=3000 npm start
```

### Development Mode

Run the server with auto-reload on file changes:

```bash
npm dev
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Configuration

Create a `.env` file in the project root to configure the server:

```env
PORT=8080
LOG_LEVEL=info
JWT_SECRET=mock-secret
```

## API Endpoints

All endpoints use the base path `/developer/v1/` and require authentication (except OAuth token endpoint).

### Authentication

#### Get OAuth Token

```bash
POST /oauth/token
```

Request any client credentials to receive a mock authentication token:

```bash
curl -X POST http://localhost:8080/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "client_credentials",
    "client_id": "your_client_id",
    "client_secret": "your_client_secret"
  }'
```

Response:

```json
{
  "access_token": "mock-token-abc123",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### User Profile

#### Get User Profile

```bash
GET /developer/v1/user/profile/basic
```

Returns basic user profile information:

```bash
curl http://localhost:8080/developer/v1/user/profile/basic \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Sleep Data

#### Get Sleep Records

```bash
GET /developer/v1/activity/sleep
```

Returns paginated sleep data with optional date filtering:

```bash
# Get all sleep data
curl http://localhost:8080/developer/v1/activity/sleep \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by date range
curl "http://localhost:8080/developer/v1/activity/sleep?start=2024-01-01T00:00:00Z&end=2024-01-31T23:59:59Z" \
  -H "Authorization: Bearer YOUR_TOKEN"

# With pagination
curl "http://localhost:8080/developer/v1/activity/sleep?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:

```json
{
  "records": [
    {
      "id": "sleep-123",
      "user_id": "user-456",
      "created_at": "2024-01-15T08:00:00Z",
      "updated_at": "2024-01-15T08:00:00Z",
      "start": "2024-01-14T22:30:00Z",
      "end": "2024-01-15T07:00:00Z",
      "timezone_offset": "-08:00",
      "nap": false,
      "score_state": "SCORED",
      "score": {
        "stage_summary": {
          "total_in_bed_time_milli": 30600000,
          "total_awake_time_milli": 1530000,
          "total_light_sleep_time_milli": 15300000,
          "total_slow_wave_sleep_time_milli": 6120000,
          "total_rem_sleep_time_milli": 7650000,
          "sleep_cycle_count": 5,
          "disturbance_count": 3
        },
        "sleep_needed": {
          "baseline_milli": 28800000,
          "need_from_sleep_debt_milli": 0,
          "need_from_recent_strain_milli": 0,
          "need_from_recent_nap_milli": 0
        },
        "respiratory_rate": 15.2,
        "sleep_performance_percentage": 92,
        "sleep_consistency_percentage": 85,
        "sleep_efficiency_percentage": 95
      }
    }
  ],
  "next_token": "eyJpbmRleCI6MjV9"
}
```

### Recovery Data

#### Get Recovery Records

```bash
GET /developer/v1/recovery
```

Returns paginated recovery data with optional date filtering:

```bash
curl "http://localhost:8080/developer/v1/recovery?start=2024-01-01T00:00:00Z&end=2024-01-31T23:59:59Z" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:

```json
{
  "records": [
    {
      "id": "recovery-123",
      "user_id": "user-456",
      "created_at": "2024-01-15T08:00:00Z",
      "updated_at": "2024-01-15T08:00:00Z",
      "cycle_id": "cycle-789",
      "sleep_id": "sleep-123",
      "user_calibrating": false,
      "score": {
        "recovery_score": 85,
        "resting_heart_rate": 52,
        "hrv_rmssd_milli": 75,
        "spo2_percentage": 97.5,
        "skin_temp_celsius": 34.2
      }
    }
  ]
}
```

### Cycle Data

#### Get Cycle Records

```bash
GET /developer/v1/cycle
```

Returns paginated daily cycle data with optional date filtering:

```bash
curl "http://localhost:8080/developer/v1/cycle?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:

```json
{
  "records": [
    {
      "id": "cycle-789",
      "user_id": "user-456",
      "created_at": "2024-01-15T08:00:00Z",
      "updated_at": "2024-01-15T08:00:00Z",
      "start": "2024-01-14T08:00:00Z",
      "end": "2024-01-15T08:00:00Z",
      "timezone_offset": "-08:00",
      "score": {
        "strain": 12.5,
        "kilojoule": 8500,
        "average_heart_rate": 68,
        "max_heart_rate": 145
      }
    }
  ]
}
```

### Workout Data

#### Get Workout Records

```bash
GET /developer/v1/activity/workout
```

Returns paginated workout data with optional date filtering:

```bash
curl "http://localhost:8080/developer/v1/activity/workout?start=2024-01-01T00:00:00Z" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:

```json
{
  "records": [
    {
      "id": "workout-321",
      "user_id": "user-456",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z",
      "start": "2024-01-15T06:00:00Z",
      "end": "2024-01-15T07:00:00Z",
      "timezone_offset": "-08:00",
      "sport_id": 1,
      "score": {
        "strain": 15.2,
        "average_heart_rate": 145,
        "max_heart_rate": 178,
        "kilojoule": 2500,
        "percent_recorded": 100,
        "distance_meter": 8000,
        "altitude_gain_meter": 150,
        "altitude_change_meter": 150,
        "zone_duration": {
          "zone_zero_milli": 0,
          "zone_one_milli": 600000,
          "zone_two_milli": 1200000,
          "zone_three_milli": 900000,
          "zone_four_milli": 600000,
          "zone_five_milli": 300000
        }
      }
    }
  ]
}
```

## Query Parameters

All collection endpoints support the following query parameters:

- `start` - ISO 8601 timestamp for start of date range (optional)
- `end` - ISO 8601 timestamp for end of date range (optional)
- `limit` - Number of records per page (default: 25, max: 100)
- `nextToken` - Pagination token from previous response (optional)

## Error Simulation

Test error handling in your client by using the `X-Simulate-Error` header:

### Simulate 500 Internal Server Error

```bash
curl http://localhost:8080/developer/v1/user/profile/basic \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Simulate-Error: 500"
```

Response:

```json
{
  "error": "internal_error",
  "message": "Simulated server error"
}
```

### Simulate 429 Rate Limit

```bash
curl http://localhost:8080/developer/v1/user/profile/basic \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Simulate-Error: 429"
```

Response:

```json
{
  "error": "rate_limited",
  "message": "Too many requests"
}
```

Headers include: `Retry-After: 60`

### Simulate 503 Service Unavailable

```bash
curl http://localhost:8080/developer/v1/user/profile/basic \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Simulate-Error: 503"
```

Response:

```json
{
  "error": "service_unavailable",
  "message": "Service temporarily unavailable"
}
```

### Simulate Timeout

```bash
curl http://localhost:8080/developer/v1/user/profile/basic \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Simulate-Error: timeout"
```

This will delay the response by 30 seconds before returning the normal response.

## Error Responses

### Authentication Errors

**401 Unauthorized** - Missing or invalid token:

```json
{
  "error": "invalid_token",
  "message": "Invalid or expired token"
}
```

### Validation Errors

**400 Bad Request** - Invalid date format:

```json
{
  "error": "invalid_date",
  "message": "Date must be in ISO 8601 format"
}
```

**400 Bad Request** - Invalid limit:

```json
{
  "error": "invalid_limit",
  "message": "Limit must be between 1 and 100"
}
```

## Data Generation

The server pre-generates 90 days of synthetic data for 5 users at startup:

- **Sleep Data**: 7-9 hours per night with realistic stage distributions
- **Recovery Data**: Correlated with sleep quality, includes HRV and resting heart rate
- **Cycle Data**: Daily physiological cycles with strain values
- **Workout Data**: 3-5 workouts per week with varied activities

All data follows physiologically realistic patterns and correlations.

## Architecture

- **Express.js**: HTTP server framework
- **In-Memory Storage**: Fast data access with no database required
- **Synthetic Data Generators**: Create realistic health metrics
- **Middleware**: Request logging, authentication, CORS, error simulation

## Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Test individual components and endpoints
- **Property-Based Tests**: Verify universal correctness properties using fast-check
- **Integration Tests**: Test complete request/response flows

Run the test suite:

```bash
npm test
```

## License

MIT
