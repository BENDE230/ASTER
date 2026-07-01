from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..auth import get_current_user_id
from ..models.checkin import CheckIn
from ..models.user import User

router = APIRouter(prefix="/api/insights", tags=["insights"])

@router.get("")
async def get_insights(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    is_premium = user.is_premium if user else False

    # Dominant states from last 7 days check-ins
    rows = (
        db.query(CheckIn.feeling, func.count(CheckIn.id).label("count"))
        .filter(CheckIn.user_id == user_id)
        .group_by(CheckIn.feeling)
        .order_by(func.count(CheckIn.id).desc())
        .all()
    )

    total = sum(r.count for r in rows) or 1
    dominant_states = [
        {"name": r.feeling, "value": round(r.count / total * 100)} for r in rows
    ]

    return {
        "is_premium": is_premium,
        "dominant_states": dominant_states,
        "patterns": [
            {"label": "Rumination fréquente", "premium": False},
            {"label": "Fatigue de régulation", "premium": True},
            {"label": "Surcharge sociale", "premium": True},
        ] if is_premium else [{"label": "Rumination fréquente", "premium": False}],
    }
