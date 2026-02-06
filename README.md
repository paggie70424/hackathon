# Personal Data Integration System - Analytics Service

A serverless system for collecting, analyzing, and visualizing WHOOP wearable device data.

## Overview

This project implements an analytics service that computes daily summaries and insights from WHOOP health data. The system calculates key metrics like sleep quality scores, recovery scores, and strain levels to provide users with actionable wellbeing insights.

## Features Implemented (Task 12)

### ✅ Analytics Service
- **Sleep Quality Score Calculation**: Computes a 0-100 score based on:
  - Duration (optimal 7-9 hours): 40 points
  - Efficiency (quality/total duration): 40 points
  - Disturbances (fewer is better): 20 points

- **Daily Summary Computation**: Aggregates data from multiple sources:
  - Recovery score (from WHOOP)
  - Sleep quality score (calculated)
  - Total strain (from WHOOP)
  - Sleep duration
  - Average HRV
  - Resting heart rate
  - Respiratory rate

- **Data Completeness Tracking**: Indicates which data types are available for each day

### 📊 Data Models
- `SleepData`: Sleep metrics including stages, duration, and quality
- `RecoveryData`: Recovery score, HRV, resting heart rate
- `CycleData`: 24-hour strain and activity data
- `PhysiologicalData`: Heart rate, HRV, respiratory rate, skin temperature
- `DailySummary`: Computed daily insights and metrics

## Project Structure

```
hackathon/
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   └── data_models.py          # Pydantic models for all data types
│   └── services/
│       ├── __init__.py
│       └── analytics_service.py    # Analytics computation logic
├── tests/
│   ├── __init__.py
│   └── test_analytics_service.py   # Unit tests (12 tests, all passing)
├── examples/
│   ├── __init__.py
│   └── analytics_demo.py           # Demo showing analytics in action
├── requirements.txt                # Python dependencies
└── README.md                       # This file
```

## Installation

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Run the Demo

See the analytics service in action:

```bash
python3 examples/analytics_demo.py
```

This will show:
- Sleep quality score calculation
- Daily summary computation
- Interpretation of metrics (green/yellow/red zones)

### Run Tests

Execute the test suite:

```bash
python3 -m pytest tests/test_analytics_service.py -v
```

All 12 tests should pass:
- ✅ Sleep quality score calculation (6 tests)
- ✅ Daily summary computation (5 tests)
- ✅ Date range utilities (1 test)

### Using the Analytics Service

```python
from src.services.analytics_service import AnalyticsService
from src.models.data_models import SleepData, RecoveryData

# Create service
analytics = AnalyticsService()

# Calculate sleep quality score
sleep_score = analytics.calculate_sleep_quality_score(sleep_data)
print(f"Sleep Quality: {sleep_score}/100")

# Compute daily summary
summary = analytics.compute_daily_summary(
    user_id="user-123",
    date="2024-02-06",
    sleep_data=sleep_data,
    recovery_data=recovery_data,
    cycle_data=cycle_data,
    physiological_data=physiological_data_list,
)

print(f"Recovery: {summary.recoveryScore}/100")
print(f"Sleep Quality: {summary.sleepQualityScore}/100")
print(f"Strain: {summary.totalStrain}/21")
```

## Sleep Quality Score Formula

The sleep quality score (0-100) is calculated using three components:

1. **Duration Score (0-40 points)**:
   - 7-9 hours: 40 points (optimal)
   - 6-7 hours: 30 points
   - 5-6 hours: 20 points
   - 9-10 hours: 30 points
   - Other: 10 points

2. **Efficiency Score (0-40 points)**:
   - Based on quality duration / total duration
   - 100% efficiency = 40 points
   - Scales linearly

3. **Disturbance Score (0-20 points)**:
   - Starts at 20 points
   - -2 points per disturbance
   - Minimum 0 points

**Example**: 8 hours sleep, 92% efficiency, 1 disturbance = 40 + 36.8 + 18 = 95/100

## UI Dashboard Concept

The daily summaries would be displayed on a dashboard with:

### Daily Snapshot Card
```
┌─────────────────────────────────────┐
│  Today's Wellbeing - Feb 6, 2024   │
├─────────────────────────────────────┤
│  🟢 Recovery: 82/100                │
│  😴 Sleep Quality: 95/100           │
│  💪 Strain: 14.2/21                 │
│  ⏰ Sleep: 8.0 hours                │
├─────────────────────────────────────┤
│  ❤️  HRV: 73.5 ms                   │
│  💓 Resting HR: 52 bpm              │
│  🫁 Respiratory: 14.5 br/min        │
└─────────────────────────────────────┘
```

### 30-Day Trend Charts
- Line chart showing recovery score over time
- Bar chart showing daily strain
- Sleep quality trend line
- HRV variability chart

### Insights Panel
- "Your recovery is in the green zone - great job!"
- "Sleep quality has improved 15% this week"
- "Consider a rest day - strain has been high for 3 days"

## Next Steps

To complete the full system:

1. **Storage Integration** (Task 12.6): Connect to DynamoDB for storing/retrieving summaries
2. **Lambda Handler** (Task 13): Create EventBridge-triggered Lambda for automatic computation
3. **API Endpoints** (Task 15.4): Add REST endpoints for fetching summaries
4. **UI Implementation**: Build React/Vue dashboard to display insights
5. **Advanced Analytics**: Add trend analysis, predictions, correlations

## Testing

The test suite covers:
- Sleep quality score edge cases (short sleep, long sleep, poor efficiency, many disturbances)
- Daily summary with complete data
- Daily summary with missing data types
- Average calculations from multiple data points
- Date range utilities

Run with coverage:
```bash
python3 -m pytest tests/test_analytics_service.py --cov=src/services --cov-report=html
```

## Architecture

The analytics service follows a clean architecture:
- **Models**: Pydantic models with validation
- **Services**: Business logic for computations
- **Tests**: Comprehensive unit tests
- **Examples**: Demonstration scripts

Future integration:
- **Storage Layer**: DynamoDB for persistence
- **Event Layer**: EventBridge for triggering computations
- **API Layer**: FastAPI endpoints for UI access

## License

MIT License - See LICENSE file for details

## Contributing

This is part of the Personal Data Integration System spec. See `.kiro/specs/personal-data-integration/` for full requirements and design documents.
