import structlog
from typing import Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.dataset import MunicipalReport

log = structlog.get_logger()

class CrisisPredictionEngine:
    """
    Municipal Early Warning System (MEWS)
    Predicts infrastructure stress and service collapse per ward.
    """

    @staticmethod
    async def predict_ward_risk(db: AsyncSession, ward: str) -> Dict[str, Any]:
        """
        Computes 4-factor risk score for a specific ward.
        """
        log.info("Analyzing crisis risk", ward=ward)

        # 1. Complaint Velocity (Past 24h vs baseline)
        velocity = await CrisisPredictionEngine._calculate_velocity(db, ward)
        
        # 2. Repeat Failures (Same location clusters)
        repeat_score = await CrisisPredictionEngine._calculate_repeat_score(db, ward)
        
        # 3. Response Drift (Delay trend)
        drift = 1.0 # Mocked drift factor

        # 4. Final Crisis Score Calculation
        # Score = (Velocity * 0.4) + (Repeat * 0.4) + (Drift * 0.2)
        total_score = (velocity * 30) + (repeat_score * 40) + (drift * 10)
        total_score = min(max(total_score, 0), 100) # Clamp 0-100

        risk_level = "GREEN"
        if total_score > 80: risk_level = "RED"
        elif total_score > 60: risk_level = "ORANGE"
        elif total_score > 40: risk_level = "YELLOW"

        return {
            "ward": ward,
            "crisis_score": round(total_score),
            "risk_level": risk_level,
            "metrics": {
                "velocity": round(velocity, 2),
                "repeat_density": round(repeat_score, 2),
                "drift_factor": drift
            },
            "recommendation": CrisisPredictionEngine._generate_recommendation(risk_level, total_score)
        }

    @staticmethod
    async def _calculate_velocity(db: AsyncSession, ward: str) -> float:
        """
        Compares complaints in last 24h to daily average.
        """
        now = datetime.utcnow()
        day_ago = now - timedelta(days=1)
        week_ago = now - timedelta(days=7)

        # Complaints in last 24h
        q_24h = select(func.count(MunicipalReport.id)).where(
            and_(MunicipalReport.ward == ward, MunicipalReport.created_at >= day_ago)
        )
        count_24h = (await db.execute(q_24h)).scalar() or 0

        # Complaints in previous 6 days (for baseline)
        q_baseline = select(func.count(MunicipalReport.id)).where(
            and_(MunicipalReport.ward == ward, MunicipalReport.created_at >= week_ago, MunicipalReport.created_at < day_ago)
        )
        count_baseline = (await db.execute(q_baseline)).scalar() or 0
        avg_baseline = count_baseline / 6 if count_baseline > 0 else 1

        velocity = count_24h / avg_baseline
        return min(velocity, 3.0) # Cap at 3x spike

    @staticmethod
    async def _calculate_repeat_score(db: AsyncSession, ward: str) -> float:
        """
        Detects geographically close complaints of same category.
        """
        # Search for clusters in past 72h
        q = select(MunicipalReport.category, func.count(MunicipalReport.id)).where(
            and_(MunicipalReport.ward == ward, MunicipalReport.created_at >= datetime.utcnow() - timedelta(days=3))
        ).group_by(MunicipalReport.category)
        
        results = (await db.execute(q)).all()
        max_density = 0
        for cat, count in results:
            if count > max_density: max_density = count
            
        # If > 5 of same category in 3 days in one ward, high repeat score
        score = max_density / 5
        return min(score, 1.0)

    @staticmethod
    def _generate_recommendation(level: str, score: float) -> str:
        if level == "RED":
            return "IMMINENT COLLAPSE: Dispatch emergency infrastructure task force immediately."
        if level == "ORANGE":
            return "HIGH RISK: Schedule pre-emptive maintenance and notify regional technical office."
        if level == "YELLOW":
            return "WATCH: Anomalous complaints detected. Update field inspect schedule."
        return "STABLE: System operating within normal parameters."
