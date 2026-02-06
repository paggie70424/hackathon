"""
Unit tests for Analytics Service.
"""
import pytest
from datetime import datetime
import time

from src.models.data_models import (
    SleepData,
    SleepStages,
    SleepNeeded,
    RecoveryData,
    CycleData,
    PhysiologicalData,
    DailySummary,
    DataCompleteness,
)
from src.services.analytics_service import AnalyticsService


@pytest.fixture
def analytics_service():
    """Create analytics service instance."""
    return AnalyticsService()


@pytest.fixture
def sample_sleep_data():
    """Create sample sleep data with optimal sleep (8 hours, good efficiency, few disturbances)."""
    current_time = int(time.time() * 1000)
    eight_hours_ms = 8 * 60 * 60 * 1000
    
    return SleepData(
        userId="test-user-123",
        recordId="sleep#1234567890",
        sleepId="whoop-sleep-123",
        startTime=current_time - eight_hours_ms,
        endTime=current_time,
        duration=eight_hours_ms,
        qualityDuration=eight_hours_ms * 0.9,  # 90% efficiency
        latency=300000,  # 5 minutes
        disturbanceCount=2,
        sleepStages=SleepStages(
            light=eight_hours_ms * 0.45,
            deep=eight_hours_ms * 0.20,
            rem=eight_hours_ms * 0.25,
            awake=eight_hours_ms * 0.10,
        ),
        sleepNeeded=SleepNeeded(
            baseline=eight_hours_ms,
            debt=0,
            strain=0,
            total=eight_hours_ms,
        ),
        respiratoryRate=15.0,
        heartRate=55.0,
        hrv=65.0,
        ttl=current_time + 30 * 24 * 60 * 60,
        createdAt=current_time,
    )


@pytest.fixture
def sample_recovery_data():
    """Create sample recovery data."""
    current_time = int(time.time() * 1000)
    
    return RecoveryData(
        userId="test-user-123",
        recordId="recovery#1234567890",
        cycleId="cycle-123",
        recoveryScore=75.0,
        hrv=65.0,
        restingHeartRate=55.0,
        hrvRmssd=45.0,
        spo2=98.0,
        skinTemp=35.5,
        ttl=current_time + 30 * 24 * 60 * 60,
        createdAt=current_time,
    )


@pytest.fixture
def sample_cycle_data():
    """Create sample cycle data."""
    current_time = int(time.time() * 1000)
    
    return CycleData(
        userId="test-user-123",
        recordId="cycle#1234567890",
        cycleId="cycle-123",
        startTime=current_time - 24 * 60 * 60 * 1000,
        endTime=current_time,
        days=["2024-02-06"],
        strain=12.5,
        kilojoules=8500.0,
        averageHeartRate=70.0,
        maxHeartRate=150.0,
        ttl=current_time + 30 * 24 * 60 * 60,
        createdAt=current_time,
    )


@pytest.fixture
def sample_physiological_data():
    """Create sample physiological data points."""
    current_time = int(time.time() * 1000)
    
    return [
        PhysiologicalData(
            userId="test-user-123",
            recordId=f"physiological#{current_time - i * 3600000}",
            timestamp=current_time - i * 3600000,
            heartRate=60.0 + i,
            heartRateVariability=65.0 + i * 2,
            respiratoryRate=15.0,
            skinTemp=35.5,
            spo2=98.0,
            ttl=current_time + 30 * 24 * 60 * 60,
            createdAt=current_time,
        )
        for i in range(5)
    ]


class TestSleepQualityScore:
    """Tests for sleep quality score calculation."""
    
    def test_optimal_sleep_high_score(self, analytics_service, sample_sleep_data):
        """Test that optimal sleep (8 hours, 90% efficiency, 2 disturbances) gets high score."""
        score = analytics_service.calculate_sleep_quality_score(sample_sleep_data)
        
        # Expected: 40 (duration) + 36 (90% efficiency) + 16 (2 disturbances) = 92
        assert 90 <= score <= 95, f"Expected score around 92, got {score}"
    
    def test_short_sleep_lower_score(self, analytics_service, sample_sleep_data):
        """Test that short sleep duration reduces score."""
        # Modify to 5 hours
        sample_sleep_data.duration = 5 * 60 * 60 * 1000
        sample_sleep_data.qualityDuration = sample_sleep_data.duration * 0.9
        
        score = analytics_service.calculate_sleep_quality_score(sample_sleep_data)
        
        # Expected: 20 (5 hours) + 36 (90% efficiency) + 16 (2 disturbances) = 72
        assert 70 <= score <= 75, f"Expected score around 72, got {score}"
    
    def test_long_sleep_moderate_score(self, analytics_service, sample_sleep_data):
        """Test that oversleep (10 hours) gets moderate score."""
        # Modify to 10 hours
        sample_sleep_data.duration = 10 * 60 * 60 * 1000
        sample_sleep_data.qualityDuration = sample_sleep_data.duration * 0.9
        
        score = analytics_service.calculate_sleep_quality_score(sample_sleep_data)
        
        # Expected: 30 (10 hours) + 36 (90% efficiency) + 16 (2 disturbances) = 82
        assert 80 <= score <= 85, f"Expected score around 82, got {score}"
    
    def test_poor_efficiency_lower_score(self, analytics_service, sample_sleep_data):
        """Test that poor sleep efficiency reduces score."""
        # Set efficiency to 50%
        sample_sleep_data.qualityDuration = sample_sleep_data.duration * 0.5
        
        score = analytics_service.calculate_sleep_quality_score(sample_sleep_data)
        
        # Expected: 40 (8 hours) + 20 (50% efficiency) + 16 (2 disturbances) = 76
        assert 74 <= score <= 78, f"Expected score around 76, got {score}"
    
    def test_many_disturbances_lower_score(self, analytics_service, sample_sleep_data):
        """Test that many disturbances reduce score."""
        # Set 10 disturbances
        sample_sleep_data.disturbanceCount = 10
        
        score = analytics_service.calculate_sleep_quality_score(sample_sleep_data)
        
        # Expected: 40 (8 hours) + 36 (90% efficiency) + 0 (10 disturbances) = 76
        assert 74 <= score <= 78, f"Expected score around 76, got {score}"
    
    def test_score_bounds(self, analytics_service, sample_sleep_data):
        """Test that score is always between 0 and 100."""
        # Test with extreme values
        sample_sleep_data.duration = 2 * 60 * 60 * 1000  # 2 hours
        sample_sleep_data.qualityDuration = sample_sleep_data.duration * 0.3  # 30% efficiency
        sample_sleep_data.disturbanceCount = 20  # Many disturbances
        
        score = analytics_service.calculate_sleep_quality_score(sample_sleep_data)
        
        assert 0 <= score <= 100, f"Score {score} is out of bounds"


class TestDailySummaryComputation:
    """Tests for daily summary computation."""
    
    def test_complete_data_summary(
        self,
        analytics_service,
        sample_sleep_data,
        sample_recovery_data,
        sample_cycle_data,
        sample_physiological_data,
    ):
        """Test summary computation with all data types present."""
        summary = analytics_service.compute_daily_summary(
            user_id="test-user-123",
            date="2024-02-06",
            sleep_data=sample_sleep_data,
            recovery_data=sample_recovery_data,
            cycle_data=sample_cycle_data,
            physiological_data=sample_physiological_data,
        )
        
        # Verify all fields are populated
        assert summary.userId == "test-user-123"
        assert summary.date == "2024-02-06"
        assert summary.recordId == "summary#2024-02-06"
        
        # Core metrics
        assert summary.recoveryScore == 75.0
        assert summary.sleepQualityScore is not None
        assert 90 <= summary.sleepQualityScore <= 95
        assert summary.totalStrain == 12.5
        assert summary.sleepDuration is not None
        assert 7.9 <= summary.sleepDuration <= 8.1  # ~8 hours
        
        # Physiological metrics
        assert summary.averageHRV is not None
        assert summary.restingHeartRate == 55.0
        assert summary.respiratoryRate == 15.0
        
        # Data completeness
        assert summary.dataCompleteness.hasSleep is True
        assert summary.dataCompleteness.hasRecovery is True
        assert summary.dataCompleteness.hasCycle is True
        assert summary.dataCompleteness.hasPhysiological is True
        
        # Metadata
        assert summary.computedAt > 0
        assert summary.ttl > summary.computedAt
    
    def test_missing_sleep_data(
        self,
        analytics_service,
        sample_recovery_data,
        sample_cycle_data,
    ):
        """Test summary computation with missing sleep data."""
        summary = analytics_service.compute_daily_summary(
            user_id="test-user-123",
            date="2024-02-06",
            sleep_data=None,
            recovery_data=sample_recovery_data,
            cycle_data=sample_cycle_data,
            physiological_data=None,
        )
        
        # Sleep-related fields should be None
        assert summary.sleepQualityScore is None
        assert summary.sleepDuration is None
        
        # Other fields should be populated
        assert summary.recoveryScore == 75.0
        assert summary.totalStrain == 12.5
        
        # Data completeness flags
        assert summary.dataCompleteness.hasSleep is False
        assert summary.dataCompleteness.hasRecovery is True
        assert summary.dataCompleteness.hasCycle is True
    
    def test_missing_recovery_data(
        self,
        analytics_service,
        sample_sleep_data,
    ):
        """Test summary computation with missing recovery data."""
        summary = analytics_service.compute_daily_summary(
            user_id="test-user-123",
            date="2024-02-06",
            sleep_data=sample_sleep_data,
            recovery_data=None,
            cycle_data=None,
            physiological_data=None,
        )
        
        # Recovery-related fields should be None
        assert summary.recoveryScore is None
        assert summary.restingHeartRate is None
        
        # Sleep fields should be populated
        assert summary.sleepQualityScore is not None
        assert summary.sleepDuration is not None
        
        # Data completeness flags
        assert summary.dataCompleteness.hasSleep is True
        assert summary.dataCompleteness.hasRecovery is False
    
    def test_empty_physiological_data(
        self,
        analytics_service,
        sample_sleep_data,
    ):
        """Test summary computation with empty physiological data list."""
        summary = analytics_service.compute_daily_summary(
            user_id="test-user-123",
            date="2024-02-06",
            sleep_data=sample_sleep_data,
            recovery_data=None,
            cycle_data=None,
            physiological_data=[],
        )
        
        # Physiological metrics should be None
        assert summary.averageHRV is None
        assert summary.respiratoryRate is None
        
        # Data completeness should be False for empty list
        assert summary.dataCompleteness.hasPhysiological is False
    
    def test_average_hrv_calculation(
        self,
        analytics_service,
        sample_physiological_data,
    ):
        """Test that average HRV is calculated correctly from multiple data points."""
        summary = analytics_service.compute_daily_summary(
            user_id="test-user-123",
            date="2024-02-06",
            sleep_data=None,
            recovery_data=None,
            cycle_data=None,
            physiological_data=sample_physiological_data,
        )
        
        # Calculate expected average: (65, 67, 69, 71, 73) / 5 = 69
        assert summary.averageHRV is not None
        assert 68 <= summary.averageHRV <= 70


class TestDateRangeUtility:
    """Tests for date range utility function."""
    
    def test_date_range_for_summary(self, analytics_service):
        """Test that date range returns correct start and end timestamps."""
        start_ms, end_ms = analytics_service.get_date_range_for_summary("2024-02-06")
        
        # Verify it's a 24-hour range
        assert end_ms - start_ms == 24 * 60 * 60 * 1000
        
        # Verify timestamps are reasonable (after 2024-01-01)
        assert start_ms > datetime(2024, 1, 1).timestamp() * 1000



class TestDailySummaryStorage:
    """Tests for daily summary storage and retrieval."""
    
    def test_store_daily_summary(self, analytics_service, sample_sleep_data, sample_recovery_data):
        """Test storing a daily summary (mock DynamoDB)."""
        # Create a mock DynamoDB client
        mock_dynamodb = type('MockDynamoDB', (), {
            'put_item': lambda self, **kwargs: None,
            'items_stored': []
        })()
        
        # Track stored items
        def mock_put_item(**kwargs):
            mock_dynamodb.items_stored.append(kwargs['Item'])
        
        mock_dynamodb.put_item = mock_put_item
        analytics_service.dynamodb_client = mock_dynamodb
        
        # Compute and store summary
        summary = analytics_service.compute_daily_summary(
            user_id="test-user",
            date="2024-02-06",
            sleep_data=sample_sleep_data,
            recovery_data=sample_recovery_data,
        )
        
        result = analytics_service.store_daily_summary(summary)
        
        assert result is True
        assert len(mock_dynamodb.items_stored) == 1
        
        stored_item = mock_dynamodb.items_stored[0]
        assert stored_item['userId'] == "test-user"
        assert stored_item['date'] == "2024-02-06"
        assert stored_item['recordId'] == "summary#2024-02-06"
        assert 'recoveryScore' in stored_item
        assert 'sleepQualityScore' in stored_item
    
    def test_store_summary_without_dynamodb(self, analytics_service):
        """Test that storing without DynamoDB client raises error."""
        summary = DailySummary(
            userId="test-user",
            recordId="summary#2024-02-06",
            date="2024-02-06",
            dataCompleteness=DataCompleteness(),
            computedAt=int(time.time()),
            ttl=int(time.time()) + 30 * 24 * 60 * 60,
        )
        
        with pytest.raises(ValueError, match="DynamoDB client not configured"):
            analytics_service.store_daily_summary(summary)
    
    def test_get_daily_summaries_without_dynamodb(self, analytics_service):
        """Test that retrieving without DynamoDB client raises error."""
        with pytest.raises(ValueError, match="DynamoDB client not configured"):
            analytics_service.get_daily_summaries("test-user")
