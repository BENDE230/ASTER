import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user_id
from ..config import settings
from ..models.user import User

router = APIRouter(prefix="/api/stripe", tags=["stripe"])
stripe.api_key = settings.stripe_secret_key

@router.post("/activate-premium")
async def activate_premium(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, email="", is_premium=True)
        db.add(user)
    else:
        user.is_premium = True
    db.commit()
    return {"status": "ok", "is_premium": True}

@router.post("/create-checkout")
async def create_checkout(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{"price": settings.stripe_price_id, "quantity": 1}],
        mode="subscription",
        success_url="https://aster-ambre.vercel.app/dashboard?upgraded=true",
        cancel_url="https://aster-ambre.vercel.app/dashboard",
        client_reference_id=user_id,
        customer_email=user.email,
    )
    return {"url": session.url}

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        import json
        event = json.loads(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid webhook: {str(e)}")

    try:
        if event.get("type") == "checkout.session.completed":
            session_obj = event.get("data", {}).get("object", {})
            user_id = session_obj.get("client_reference_id")
            if user_id:
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    user = User(id=user_id, email="", is_premium=True)
                    db.add(user)
                else:
                    user.is_premium = True
                db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {str(e)}")

    return {"status": "ok"}
