"""
Demo script showing how the Analytics Service works.

This demonstrates computing daily summaries from WHOOP data.
"""
import time
from datetime import datetime

from src.models.data_models import (
    SleepData,
    SleepStages,
    SleepNeeded,
    RecoveryData,
    CycleData,
    PhysiologicalData,
)
from src.services.analytics_service import AnalyticsService


def create_sample_data():
    """Create sample WHOOP data for demonstration."""
    current_time = int(time.time() * 1000)
    eight_hours_ms = 8 * 60 * 60 * 1000
    
    # Sample sleep data - good night's sleep
    sleep_data = SleepData(
        userId="demo-user",
        recordId="sleep#1234567890",
        sleepId="whoop-sleep-demo",
        startTime=current_time - eight_hours_ms,
        endTime=current_time,
        duration=eight_hours_ms,
        qualityDuration=eight_hours_ms * 0.92,  # 92% efficiency
        latency=300000,  # 5 minutes to fall asleep
        disturbanceCount=1,  # Only 1 disturbance
        sleepStages=SleepStages(
            light=eight_hours_ms * 0.45,
            deep=eight_hours_ms * 0.22,
            rem=eight_hours_ms * 0.25,
            awake=eight_hours_ms * 0.08,
        ),
        sleepNeeded=SleepNeeded(
            baseline=eight_hours_ms,
            debt=0,
            strain=0,
            total=eight_hours_ms,
        ),
        respiratoryRate=14.5,
        heartRate=52.0,
        hrv=72.0,
        ttl=current_time + 30 * 24 * 60 * 60,
        createdAt=current_time,
    )
    
    # Sample recovery data - good recovery
    recovery_data = RecoveryData(
        userId="demo-user",
        recordId="recovery#1234567890",
        cycleId="cycle-demo",
        recoveryScore=82.0,  # Good recovery
        hrv=72.0,
        restingHeartRate=52.0,
        hrvRmssd=48.0,
        spo2=98.5,
        skinTemp=35.2,
        ttl=current_time + 30 * 24 * 60 * 60,
        createdAt=current_time,
    )
    
    # Sample cycle data - moderate strain day
    cycle_data = CycleData(
        userId="demo-user",
        recordId="cycle#1234567890",
        cycleId="cycle-demo",
        startTime=current_time - 24 * 60 * 60 * 1000,
        endTime=current_time,
        days=["2024-02-06"],
        strain=14.2,  # Moderate strain
        kilojoules=9200.0,
        averageHeartRate=68.0,
        maxHeartRate=165.0,
        ttl=current_time + 30 * 24 * 60 * 60,
        createdAt=current_time,
    )
    
    # Sample physiological data - multiple readings throughout the day
    physiological_data = [
        PhysiologicalData(
            userId="demo-user",
            recordId=f"physiological#{current_time - i * 3600000}",
            timestamp=current_time - i * 3600000,
            heartRate=55.0 + i * 2,
            heartRateVariability=70.0 + i,
            respiratoryRate=14.5,
            skinTemp=35.2,
            spo2=98.0,
            ttl=current_time + 30 * 24 * 60 * 60,
            createdAt=current_time,
        )
        for i in range(8)  # 8 readings throughout the day
    ]
    
    return sleep_data, recovery_data, cycle_data, physiological_data


def main():
    """Run the analytics demo."""
    print("=" * 60)
    print("WHOOP Data Analytics Demo")
    print("=" * 60)
    print()
    
    # Create analytics service
    analytics = AnalyticsService()
    
    # Create sample data
    print("📊 Creating sample WHOOP data...")
    sleep_data, recovery_data, cycle_data, physiological_data = create_sample_data()
    print("✓ Sample data created")
    print()
    
    # Calculate sleep quality score
    print("😴 Analyzing Sleep Quality...")
    print(f"   Duration: {sleep_data.duration / (1000 * 60 * 60):.1f} hours")
    print(f"   Efficiency: {(sleep_data.qualityDuration / sleep_data.duration * 100):.1f}%")
    print(f"   Disturbances: {sleep_data.disturbanceCount}")
    
    sleep_score = analytics.calculate_sleep_quality_score(sleep_data)
    print(f"   → Sleep Quality Score: {sleep_score}/100")
    print()
    
    # Compute daily summary
    print("📈 Computing Daily Summary...")
    today = datetime.now().strftime('%Y-%m-%d')
    
    summary = analytics.compute_daily_summary(
        user_id="demo-user",
        date=today,
        sleep_data=sleep_data,
        recovery_data=recovery_data,
        cycle_data=cycle_data,
        physiological_data=physiological_data,
    )
    
    print(f"   Date: {summary.date}")
    print()
    print("   Core Metrics:")
    print(f"   • Recovery Score: {summary.recoveryScore}/100")
    print(f"   • Sleep Quality Score: {summary.sleepQualityScore}/100")
    print(f"   • Total Strain: {summary.totalStrain:.1f}/21")
    print(f"   • Sleep Duration: {summary.sleepDuration:.1f} hours")
    print()
    print("   Physiological Metrics:")
    print(f"   • Average HRV: {summary.averageHRV:.1f} ms")
    print(f"   • Resting Heart Rate: {summary.restingHeartRate:.0f} bpm")
    print(f"   • Respiratory Rate: {summary.respiratoryRate:.1f} breaths/min")
    print()
    print("   Data Completeness:")
    print(f"   • Sleep: {'✓' if summary.dataCompleteness.hasSleep else '✗'}")
    print(f"   • Recovery: {'✓' if summary.dataCompleteness.hasRecovery else '✗'}")
    print(f"   • Cycle: {'✓' if summary.dataCompleteness.hasCycle else '✗'}")
    print(f"   • Physiological: {'✓' if summary.dataCompleteness.hasPhysiological else '✗'}")
    print()
    
    # Interpretation
    print("💡 Interpretation:")
    if summary.recoveryScore and summary.recoveryScore >= 67:
        print("   • Recovery is in the GREEN zone - body is well recovered")
    elif summary.recoveryScore and summary.recoveryScore >= 34:
        print("   • Recovery is in the YELLOW zone - moderate recovery")
    else:
        print("   • Recovery is in the RED zone - body needs more rest")
    
    if summary.sleepQualityScore and summary.sleepQualityScore >= 80:
        print("   • Excellent sleep quality!")
    elif summary.sleepQualityScore and summary.sleepQualityScore >= 60:
        print("   • Good sleep quality")
    else:
        print("   • Sleep quality could be improved")
    
    if summary.totalStrain and summary.totalStrain >= 14:
        print("   • High strain day - good workout intensity")
    elif summary.totalStrain and summary.totalStrain >= 10:
        print("   • Moderate strain day")
    else:
        print("   • Low strain day - consider more activity")
    
    print()
    print("=" * 60)
    print("✓ Demo complete!")
    print()
    print("This daily summary would be displayed on the UI dashboard,")
    print("showing users their wellbeing snapshot at a glance.")
    print("=" * 60)


if __name__ == "__main__":
    main()
