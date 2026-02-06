"""
Analytics Service for computing daily summaries and insights.
"""
from datetime import datetime, timedelta
from typing import Optional, List
import time

from ..models.data_models import (
    SleepData,
    RecoveryData,
    CycleData,
    PhysiologicalData,
    DailySummary,
    DataCompleteness,
)


class AnalyticsService:
    """Service for computing analytics and insights from WHOOP data."""
    
    def __init__(self, storage_service=None, dynamodb_client=None):
        """
        Initialize Analytics Service.
        
        Args:
            storage_service: Storage service for querying data (optional for testing)
            dynamodb_client: boto3 DynamoDB client (optional, for testing)
        """
        self.storage_service = storage_service
        self.dynamodb_client = dynamodb_client
        self.summaries_table = "daily_summaries"  # DynamoDB table name
    
    def calculate_sleep_quality_score(self, sleep_data: SleepData) -> float:
        """
        Calculate sleep quality score (0-100) based on duration, efficiency, and disturbances.
        
        Formula:
        - Duration score (0-40 points): Optimal 7-9 hours
        - Efficiency score (0-40 points): qualityDuration / duration
        - Disturbance score (0-20 points): Fewer disturbances = higher score
        
        Args:
            sleep_data: Sleep data from WHOOP
            
        Returns:
            Sleep quality score (0-100)
        """
        # Convert duration from milliseconds to hours
        duration_hours = sleep_data.duration / (1000 * 60 * 60)
        
        # Duration score (0-40 points)
        if 7 <= duration_hours <= 9:
            duration_score = 40
        elif 6 <= duration_hours < 7:
            duration_score = 30
        elif 5 <= duration_hours < 6:
            duration_score = 20
        elif 9 < duration_hours <= 10:
            duration_score = 30
        else:
            duration_score = 10
        
        # Efficiency score (0-40 points)
        efficiency = sleep_data.qualityDuration / sleep_data.duration if sleep_data.duration > 0 else 0
        efficiency_score = min(40, efficiency * 40)
        
        # Disturbance score (0-20 points): -2 points per disturbance
        disturbance_score = max(0, 20 - sleep_data.disturbanceCount * 2)
        
        # Total score clamped to 0-100
        total_score = duration_score + efficiency_score + disturbance_score
        return round(min(100, max(0, total_score)))
    
    def compute_daily_summary(
        self,
        user_id: str,
        date: str,
        sleep_data: Optional[SleepData] = None,
        recovery_data: Optional[RecoveryData] = None,
        cycle_data: Optional[CycleData] = None,
        physiological_data: Optional[List[PhysiologicalData]] = None,
    ) -> DailySummary:
        """
        Compute daily summary for a specific date.
        
        Args:
            user_id: User ID
            date: ISO date string (YYYY-MM-DD)
            sleep_data: Sleep data for the day (optional)
            recovery_data: Recovery data for the day (optional)
            cycle_data: Cycle data for the day (optional)
            physiological_data: List of physiological data points for the day (optional)
            
        Returns:
            DailySummary with computed metrics
        """
        # Initialize data completeness
        completeness = DataCompleteness(
            hasSleep=sleep_data is not None,
            hasRecovery=recovery_data is not None,
            hasWorkout=False,  # Not used in daily summary yet
            hasCycle=cycle_data is not None,
            hasPhysiological=physiological_data is not None and len(physiological_data) > 0,
        )
        
        # Extract recovery score
        recovery_score = recovery_data.recoveryScore if recovery_data else None
        
        # Calculate sleep quality score
        sleep_quality_score = None
        sleep_duration = None
        if sleep_data:
            sleep_quality_score = self.calculate_sleep_quality_score(sleep_data)
            sleep_duration = sleep_data.duration / (1000 * 60 * 60)  # Convert to hours
        
        # Extract total strain from cycle data
        total_strain = cycle_data.strain if cycle_data else None
        
        # Calculate average HRV from physiological data
        average_hrv = None
        if physiological_data:
            hrv_values = [p.heartRateVariability for p in physiological_data if p.heartRateVariability]
            if hrv_values:
                average_hrv = sum(hrv_values) / len(hrv_values)
        
        # Get resting heart rate from recovery data
        resting_heart_rate = recovery_data.restingHeartRate if recovery_data else None
        
        # Calculate average respiratory rate from physiological data
        respiratory_rate = None
        if physiological_data:
            resp_values = [p.respiratoryRate for p in physiological_data]
            if resp_values:
                respiratory_rate = sum(resp_values) / len(resp_values)
        
        # Create summary
        current_time = int(time.time())
        ttl = current_time + (30 * 24 * 60 * 60)  # 30 days from now
        
        return DailySummary(
            userId=user_id,
            recordId=f"summary#{date}",
            date=date,
            recoveryScore=recovery_score,
            sleepQualityScore=sleep_quality_score,
            totalStrain=total_strain,
            sleepDuration=sleep_duration,
            averageHRV=average_hrv,
            restingHeartRate=resting_heart_rate,
            respiratoryRate=respiratory_rate,
            dataCompleteness=completeness,
            computedAt=current_time,
            ttl=ttl,
        )
    
    def get_date_range_for_summary(self, date_str: str) -> tuple[int, int]:
        """
        Get Unix timestamp range for a specific date (start of day to end of day).
        
        Args:
            date_str: ISO date string (YYYY-MM-DD)
            
        Returns:
            Tuple of (start_timestamp_ms, end_timestamp_ms)
        """
        date = datetime.strptime(date_str, '%Y-%m-%d')
        start_of_day = int(date.timestamp() * 1000)
        end_of_day = int((date + timedelta(days=1)).timestamp() * 1000)
        return start_of_day, end_of_day

    
    def store_daily_summary(self, summary: DailySummary) -> bool:
        """
        Store daily summary in DynamoDB.
        
        Args:
            summary: DailySummary to store
            
        Returns:
            True if successful, False otherwise
        """
        if not self.dynamodb_client:
            raise ValueError("DynamoDB client not configured")
        
        try:
            # Convert summary to DynamoDB item
            item = {
                'userId': summary.userId,
                'recordId': summary.recordId,
                'date': summary.date,
                'computedAt': summary.computedAt,
                'ttl': summary.ttl,
            }
            
            # Add optional core metrics
            if summary.recoveryScore is not None:
                item['recoveryScore'] = int(summary.recoveryScore * 100) / 100  # Round to 2 decimals
            if summary.sleepQualityScore is not None:
                item['sleepQualityScore'] = int(summary.sleepQualityScore * 100) / 100
            if summary.totalStrain is not None:
                item['totalStrain'] = int(summary.totalStrain * 100) / 100
            if summary.sleepDuration is not None:
                item['sleepDuration'] = int(summary.sleepDuration * 100) / 100
            
            # Add optional physiological metrics
            if summary.averageHRV is not None:
                item['averageHRV'] = int(summary.averageHRV * 100) / 100
            if summary.restingHeartRate is not None:
                item['restingHeartRate'] = int(summary.restingHeartRate * 100) / 100
            if summary.respiratoryRate is not None:
                item['respiratoryRate'] = int(summary.respiratoryRate * 100) / 100
            
            # Add data completeness
            item['dataCompleteness'] = {
                'hasSleep': summary.dataCompleteness.hasSleep,
                'hasRecovery': summary.dataCompleteness.hasRecovery,
                'hasWorkout': summary.dataCompleteness.hasWorkout,
                'hasCycle': summary.dataCompleteness.hasCycle,
                'hasPhysiological': summary.dataCompleteness.hasPhysiological,
            }
            
            # Store in DynamoDB
            self.dynamodb_client.put_item(
                TableName=self.summaries_table,
                Item=item
            )
            
            return True
            
        except Exception as e:
            print(f"Error storing daily summary: {e}")
            return False
    
    def get_daily_summaries(
        self,
        user_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = 30,
    ) -> List[DailySummary]:
        """
        Retrieve daily summaries for a user within a date range.
        
        Args:
            user_id: User ID
            start_date: Start date (YYYY-MM-DD), defaults to 30 days ago
            end_date: End date (YYYY-MM-DD), defaults to today
            limit: Maximum number of summaries to return (default 30)
            
        Returns:
            List of DailySummary objects
        """
        if not self.dynamodb_client:
            raise ValueError("DynamoDB client not configured")
        
        try:
            # Set default date range if not provided
            if not end_date:
                end_date = datetime.now().strftime('%Y-%m-%d')
            if not start_date:
                start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            
            # Query DynamoDB
            # Note: This is a simplified version. In production, you'd use a GSI or scan with filter
            response = self.dynamodb_client.query(
                TableName=self.summaries_table,
                KeyConditionExpression='userId = :userId AND recordId BETWEEN :start AND :end',
                ExpressionAttributeValues={
                    ':userId': user_id,
                    ':start': f'summary#{start_date}',
                    ':end': f'summary#{end_date}',
                },
                Limit=limit,
                ScanIndexForward=False,  # Most recent first
            )
            
            # Convert DynamoDB items to DailySummary objects
            summaries = []
            for item in response.get('Items', []):
                summary = self._item_to_summary(item)
                if summary:
                    summaries.append(summary)
            
            return summaries
            
        except Exception as e:
            print(f"Error retrieving daily summaries: {e}")
            return []
    
    def _item_to_summary(self, item: dict) -> Optional[DailySummary]:
        """
        Convert DynamoDB item to DailySummary object.
        
        Args:
            item: DynamoDB item
            
        Returns:
            DailySummary object or None if conversion fails
        """
        try:
            # Extract data completeness
            completeness_data = item.get('dataCompleteness', {})
            completeness = DataCompleteness(
                hasSleep=completeness_data.get('hasSleep', False),
                hasRecovery=completeness_data.get('hasRecovery', False),
                hasWorkout=completeness_data.get('hasWorkout', False),
                hasCycle=completeness_data.get('hasCycle', False),
                hasPhysiological=completeness_data.get('hasPhysiological', False),
            )
            
            # Create DailySummary
            return DailySummary(
                userId=item['userId'],
                recordId=item['recordId'],
                date=item['date'],
                recoveryScore=item.get('recoveryScore'),
                sleepQualityScore=item.get('sleepQualityScore'),
                totalStrain=item.get('totalStrain'),
                sleepDuration=item.get('sleepDuration'),
                averageHRV=item.get('averageHRV'),
                restingHeartRate=item.get('restingHeartRate'),
                respiratoryRate=item.get('respiratoryRate'),
                dataCompleteness=completeness,
                computedAt=item['computedAt'],
                ttl=item['ttl'],
            )
            
        except Exception as e:
            print(f"Error converting item to summary: {e}")
            return None
