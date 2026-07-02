import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user_id
from ..config import settings
from ..models.user import User

router = APIRouter(prefix="/api/stripe", tags=["stripe"])
stripe.api_key = settings.stripe_secret_key

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
        if settings.stripe_webhook_secret:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.stripe_webhook_secret
            )
        else:
            import json
            event = json.loads(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid webhook: {str(e)}")

    try:
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            user_id = session.get("client_reference_id")
            customer_email = session.get("customer_details", {}).get("email") or session.get("customer_email")
            if user_id:
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    user = User(
                        id=user_id,
                        email=customer_email or "",
                        is_premium=True,
                    )
                    db.add(user)
                else:
                    user.is_premium = True
                db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {str(e)}")

    return {"status": "ok"}
