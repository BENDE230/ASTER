from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json
from ..database import get_db
from ..auth import get_current_user_id
from ..models.journal import JournalEntry
from ..models.user import User

router = APIRouter(prefix="/api/journal", tags=["journal"])

class JournalCreate(BaseModel):
    content: str

class JournalAnalysisSave(BaseModel):
    analysis: dict

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
    def parse_analysis(e):
        if e.ai_analysis:
            try:
                return json.loads(e.ai_analysis)
            except Exception:
                return None
        return None

    return {
        "entries": [
            {"id": e.id, "content": e.content, "created_at": e.created_at, "ai_analysis": parse_analysis(e)}
            for e in entries
        ],
        "is_premium": is_premium,
    }

@router.patch("/{entry_id}/analysis")
async def save_analysis(
    entry_id: int,
    data: JournalAnalysisSave,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id, JournalEntry.user_id == user_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entrée introuvable")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_premium:
        raise HTTPException(status_code=403, detail="Premium uniquement")
    entry.ai_analysis = json.dumps(data.analysis)
    db.commit()
    return {"ok": True}

@router.delete("/{entry_id}")
async def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id, JournalEntry.user_id == user_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entrée introuvable")
    db.delete(entry)
    db.commit()
    return {"ok": True}
