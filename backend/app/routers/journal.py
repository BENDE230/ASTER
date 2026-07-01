from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..auth import get_current_user_id
from ..models.journal import JournalEntry
from ..models.user import User

router = APIRouter(prefix="/api/journal", tags=["journal"])

class JournalCreate(BaseModel):
    content: str

def ensure_user(db: Session, user_id: str):
    from ..models.user import User
    from datetime import datetime, timedelta
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, email=f"{user_id}@aster.app",
                    trial_ends_at=datetime.utcnow() + timedelta(days=5))
        db.add(user)
        db.commit()

@router.post("")
async def create_entry(
    data: JournalCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    ensure_user(db, user_id)
    entry = JournalEntry(user_id=user_id, content=data.content)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"id": entry.id, "created_at": entry.created_at}

@router.get("")
async def list_entries(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
    limit: int = 10,
):
    user = db.query(User).filter(User.id == user_id).first()
    is_premium = user.is_premium if user else False

    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user_id)
        .order_by(JournalEntry.created_at.desc())
        .limit(None if is_premium else 1)
        .all()
    )
    return {
        "entries": [{"id": e.id, "content": e.content, "created_at": e.created_at} for e in entries],
        "is_premium": is_premium,
    }
