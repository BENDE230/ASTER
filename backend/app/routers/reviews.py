from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from ..database import get_db
from ..models.review import Review

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


class ReviewCreate(BaseModel):
    author_name: str = Field(..., min_length=1, max_length=60)
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=10, max_length=800)
    user_id: Optional[str] = None


@router.get("")
async def list_reviews(db: Session = Depends(get_db), limit: int = 30):
    """Public: approved reviews, newest first."""
    rows = (
        db.query(Review)
        .filter(Review.approved == True)  # noqa: E712
        .order_by(Review.created_at.desc())
        .limit(min(limit, 50))
        .all()
    )
    return [
        {
            "id": r.id,
            "author_name": r.author_name,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.post("")
async def create_review(data: ReviewCreate, db: Session = Depends(get_db)):
    name = data.author_name.strip()
    comment = data.comment.strip()
    if not name or len(comment) < 10:
        raise HTTPException(status_code=400, detail="Avis incomplet")

    review = Review(
        user_id=data.user_id,
        author_name=name[:60],
        rating=data.rating,
        comment=comment[:800],
        approved=True,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return {
        "id": review.id,
        "author_name": review.author_name,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": review.created_at.isoformat() if review.created_at else None,
    }
