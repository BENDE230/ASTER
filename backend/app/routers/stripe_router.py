import stripe
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db
from ..auth import get_current_user_id
from ..config import settings
from ..models.user import User

router = APIRouter(prefix="/api/stripe", tags=["stripe"])
stripe.api_key = settings.stripe_secret_key

@router.get("/user-status")
async def get_user_status(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    return {"is_premium": user.is_premium if user else False}

@router.get("/subscription")
async def get_subscription(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"is_premium": False, "plan": None, "ends_at": None}

    ends_at = None
    if user.subscription_ends_at:
        ends_at = user.subscription_ends_at.isoformat()
    elif user.stripe_customer_id and user.is_premium:
        # Fetch from Stripe if not cached
        try:
            subs = stripe.Subscription.list(customer=user.stripe_customer_id, limit=1, status="active")
            if subs.data:
                sub = subs.data[0]
                ts = sub.current_period_end
                ends_at = datetime.utcfromtimestamp(ts).isoformat()
                user.subscription_ends_at = datetime.utcfromtimestamp(ts)
                db.commit()
        except Exception:
            pass

    return {
        "is_premium": user.is_premium if user else False,
        "plan": user.subscription_plan if user else None,
        "ends_at": ends_at,
        "customer_id": user.stripe_customer_id if user else None,
    }

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
    plan: str = "monthly",
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    price_id = settings.stripe_price_id_yearly if plan == "yearly" else settings.stripe_price_id

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url="https://aster-amber.vercel.app/dashboard?upgraded=true",
        cancel_url="https://aster-amber.vercel.app/dashboard",
        client_reference_id=user_id,
        customer_email=user.email if user and user.email else None,
        metadata={"plan": plan},
    )
    return {"url": session.url}

@router.post("/portal")
async def create_portal(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.stripe_customer_id:
        raise HTTPException(status_code=404, detail="Aucun abonnement Stripe trouvé")

    session = stripe.billing_portal.Session.create(
        customer=user.stripe_customer_id,
        return_url="https://aster-amber.vercel.app/profile",
    )
    return {"url": session.url}

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()

    try:
        event = json.loads(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid webhook: {str(e)}")

    try:
        event_type = event.get("type")
        obj = event.get("data", {}).get("object", {})

        if event_type == "checkout.session.completed":
            user_id = obj.get("client_reference_id")
            customer_id = obj.get("customer")
            plan = obj.get("metadata", {}).get("plan", "monthly")

            if user_id:
                db.execute(
                    text("""
                        INSERT INTO users (id, email, is_premium, stripe_customer_id, subscription_plan, created_at)
                        VALUES (:id, :email, TRUE, :customer_id, :plan, NOW())
                        ON CONFLICT (id) DO UPDATE SET
                            is_premium = TRUE,
                            stripe_customer_id = EXCLUDED.stripe_customer_id,
                            subscription_plan = EXCLUDED.subscription_plan
                    """),
                    {
                        "id": user_id,
                        "email": f"stripe-{user_id}@aster.app",
                        "customer_id": customer_id,
                        "plan": plan,
                    }
                )
                db.commit()

        elif event_type in ("customer.subscription.deleted", "customer.subscription.updated"):
            customer_id = obj.get("customer")
            status = obj.get("status")
            cancel_at_period_end = obj.get("cancel_at_period_end", False)
            current_period_end = obj.get("current_period_end")

            if customer_id:
                user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
                if user:
                    if event_type == "customer.subscription.deleted" or status == "canceled":
                        user.is_premium = False
                        user.subscription_plan = None
                    if current_period_end:
                        user.subscription_ends_at = datetime.utcfromtimestamp(current_period_end)
                    db.commit()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error [{type(e).__name__}]: {str(e)}")

    return {"status": "ok"}
