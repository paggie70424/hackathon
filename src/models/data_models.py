"""
Data models for Personal Data Integration System.
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class SleepStages(BaseModel):
    """Sleep stages breakdown."""
    light: float = Field(ge=0, description="Light sleep duration in milliseconds")
    deep: float = Field(ge=0, description="Deep sleep duration in milliseconds")
    rem: float = Field(ge=0, description="REM sleep duration in milliseconds")
    awake: float = Field(ge=0, description="Awake duration in milliseconds")


class SleepNeeded(BaseModel):
    """Sleep need breakdown."""
    baseline: float = Field(ge=0, description="Baseline sleep need in milliseconds")
    debt: float = Field(description="Sleep debt in milliseconds")
    strain: float = Field(ge=0, description="Strain-based sleep need in milliseconds")
    total: float = Field(ge=0, description="Total sleep needed in milliseconds")


class SleepData(BaseModel):
    """Sleep data from WHOOP API."""
    userId: str
    recordId: str
    dataType: str = "sleep"
    sleepId: str
    startTime: int = Field(description="Unix timestamp in milliseconds")
    endTime: int = Field(description="Unix timestamp in milliseconds")
    duration: float = Field(ge=0, description="Total sleep duration in milliseconds")
    qualityDuration: float = Field(ge=0, description="Quality sleep duration in milliseconds")
    latency: float = Field(ge=0, description="Sleep latency in milliseconds")
    disturbanceCount: int = Field(ge=0, description="Number of disturbances")
    sleepStages: SleepStages
    sleepNeeded: SleepNeeded
    respiratoryRate: float = Field(gt=0, description="Respiratory rate in breaths/min")
    heartRate: float = Field(gt=0, description="Average heart rate in bpm")
    hrv: float = Field(gt=0, description="Heart rate variability in ms")
    rawData: Optional[Dict[str, Any]] = None
    ttl: int = Field(description="TTL for DynamoDB in Unix timestamp")
    createdAt: int = Field(description="Creation timestamp in Unix milliseconds")


class RecoveryData(BaseModel):
    """Recovery data from WHOOP API."""
    userId: str
    recordId: str
    dataType: str = "recovery"
    cycleId: str
    recoveryScore: float = Field(ge=0, le=100, description="Recovery score 0-100")
    hrv: float = Field(gt=0, description="Heart rate variability in ms")
    restingHeartRate: float = Field(gt=0, description="Resting heart rate in bpm")
    hrvRmssd: float = Field(gt=0, description="HRV RMSSD in ms")
    spo2: Optional[float] = Field(None, ge=0, le=100, description="Blood oxygen saturation %")
    skinTemp: Optional[float] = Field(None, description="Skin temperature in Celsius")
    rawData: Optional[Dict[str, Any]] = None
    ttl: int
    createdAt: int


class WorkoutData(BaseModel):
    """Workout data from WHOOP API."""
    userId: str
    recordId: str
    dataType: str = "workout"
    workoutId: str
    startTime: int
    endTime: int
    duration: float = Field(ge=0, description="Workout duration in milliseconds")
    strain: float = Field(ge=0, le=21, description="Workout strain 0-21")
    averageHeartRate: float = Field(gt=0, description="Average heart rate in bpm")
    maxHeartRate: float = Field(gt=0, description="Max heart rate in bpm")
    kilojoules: float = Field(ge=0, description="Energy expenditure in kJ")
    sportId: int
    sportName: str
    zones: Dict[str, float] = Field(description="Heart rate zones")
    rawData: Optional[Dict[str, Any]] = None
    ttl: int
    createdAt: int


class CycleData(BaseModel):
    """Cycle data from WHOOP API (24-hour period)."""
    userId: str
    recordId: str
    dataType: str = "cycle"
    cycleId: str
    startTime: int
    endTime: int
    days: list[str] = Field(description="Array of date strings")
    strain: float = Field(ge=0, le=21, description="Total strain for cycle")
    kilojoules: float = Field(ge=0)
    averageHeartRate: float = Field(gt=0)
    maxHeartRate: float = Field(gt=0)
    rawData: Optional[Dict[str, Any]] = None
    ttl: int
    createdAt: int


class PhysiologicalData(BaseModel):
    """Physiological data from WHOOP API."""
    userId: str
    recordId: str
    dataType: str = "physiological"
    timestamp: int
    heartRate: float = Field(gt=0, description="Heart rate in bpm")
    heartRateVariability: Optional[float] = Field(None, gt=0, description="HRV in ms")
    respiratoryRate: float = Field(gt=0, description="Respiratory rate in breaths/min")
    skinTemp: float = Field(description="Skin temperature in Celsius")
    spo2: Optional[float] = Field(None, ge=0, le=100, description="Blood oxygen %")
    rawData: Optional[Dict[str, Any]] = None
    ttl: int
    createdAt: int


class DataCompleteness(BaseModel):
    """Flags indicating which data types are available for a day."""
    hasSleep: bool = False
    hasRecovery: bool = False
    hasWorkout: bool = False
    hasCycle: bool = False
    hasPhysiological: bool = False


class DailySummary(BaseModel):
    """Daily summary with computed insights."""
    userId: str
    recordId: str = Field(description="Format: summary#{date}")
    date: str = Field(description="ISO date string YYYY-MM-DD")
    
    # Core metrics
    recoveryScore: Optional[float] = Field(None, ge=0, le=100)
    sleepQualityScore: Optional[float] = Field(None, ge=0, le=100)
    totalStrain: Optional[float] = Field(None, ge=0, le=21)
    sleepDuration: Optional[float] = Field(None, ge=0, description="Sleep duration in hours")
    
    # Physiological metrics
    averageHRV: Optional[float] = Field(None, gt=0, description="Average HRV in ms")
    restingHeartRate: Optional[float] = Field(None, gt=0, description="Resting HR in bpm")
    respiratoryRate: Optional[float] = Field(None, gt=0, description="Respiratory rate in breaths/min")
    
    # Data completeness
    dataCompleteness: DataCompleteness
    
    # Metadata
    computedAt: int = Field(description="Unix timestamp when computed")
    ttl: int = Field(description="TTL for DynamoDB")
    
    @field_validator('date')
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        """Validate date is in YYYY-MM-DD format."""
        from datetime import datetime
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')
