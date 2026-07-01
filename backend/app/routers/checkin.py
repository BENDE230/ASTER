from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from pydantic import BaseModel
from datetime import datetime, date, timedelta
from ..database import get_db
from ..auth import get_current_user_id
from ..models.checkin import CheckIn
from ..models.user import User

router = APIRouter(prefix="/api/checkins", tags=["checkins"])

def ensure_user(db: Session, user_id: str) -> User:
    """Create user row if it doesn't exist yet."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(
            id=user_id,
            email=f"{user_id}@aster.app",
            trial_ends_at=datetime.utcnow() + timedelta(days=5),
        )
        db.add(user)
        db.commit()
    return user

class CheckInCreate(BaseModel):
    feeling: str
    calm_score: int | None = None

@router.post("")
async def create_checkin(
    data: CheckInCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    ensure_user(db, user_id)
    checkin = CheckIn(user_id=user_id, feeling=data.feeling, calm_score=data.calm_score)
    db.add(checkin)
    db.commit()
    db.refresh(checkin)
    return {"id": checkin.id, "feeling": checkin.feeling, "created_at": checkin.created_at}

@router.get("")
async def list_checkins(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
    limit: int = 30,
):
    checkins = (
        db.query(CheckIn)
        .filter(CheckIn.user_id == user_id)
        .order_by(CheckIn.created_at.desc())
        .limit(limit)
        .all()
    )
    return checkins

@router.get("/stats")
async def checkin_stats(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    today = date.today()
    month_start = today.replace(day=1).isoformat()

    # Total this month — SQLite compatible
    total_this_month = (
        db.query(func.count(CheckIn.id))
        .filter(
            CheckIn.user_id == user_id,
            func.date(CheckIn.created_at) >= month_start,
        )
        .scalar()
    ) or 0

    # Streak calculation
    streak = 0
    for i in range(60):
        day = today - timedelta(days=i)
        count = (
            db.query(func.count(CheckIn.id))
            .filter(
                CheckIn.user_id == user_id,
                func.date(CheckIn.created_at) == day.isoformat(),
            )
            .scalar()
        ) or 0
        if count:
            streak += 1
        elif i > 0:
            break

    # Weekly data
    week_data = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = (
            db.query(func.count(CheckIn.id))
            .filter(
                CheckIn.user_id == user_id,
                func.date(CheckIn.created_at) == day.isoformat(),
            )
            .scalar()
        ) or 0
        week_data.append({"date": str(day), "calm_avg": 5.0 if count > 0 else None})

    return {
        "streak": streak,
        "total_this_month": total_this_month,
        "week": week_data,
    }
