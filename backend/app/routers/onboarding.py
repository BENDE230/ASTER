from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..auth import get_current_user_id
from ..models.onboarding import OnboardingProfile
from ..models.user import User
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

class OnboardingData(BaseModel):
    feeling: str
    duration: str
    reason: str
    email: str | None = None
    first_name: str | None = None

@router.post("")
async def save_onboarding(
    data: OnboardingData,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    # Upsert user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(
            id=user_id,
            email=data.email or f"{user_id}@aster.app",
            first_name=data.first_name,
            trial_ends_at=datetime.utcnow() + timedelta(days=5),
        )
        db.add(user)

    # Upsert onboarding profile
    profile = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == user_id).first()
    if profile:
        profile.feeling = data.feeling
        profile.duration = data.duration
        profile.reason = data.reason
    else:
        profile = OnboardingProfile(
            user_id=user_id,
            feeling=data.feeling,
            duration=data.duration,
            reason=data.reason,
        )
        db.add(profile)

    db.commit()
    return {"status": "ok"}

@router.get("")
async def get_onboarding(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    profile = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="No onboarding found")
    return profile
