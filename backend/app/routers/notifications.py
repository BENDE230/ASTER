from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import resend
from ..database import get_db
from ..auth import get_current_user_id
from ..config import settings
from ..models.user import User

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

CHECKIN_FEELINGS = [
    "Je suranalyse", "Je suis figé·e", "Je suis vidé·e",
    "Hypervigilance", "Je me sens trop", "Saturation mentale",
]

def get_email_html(user_name: str, app_url: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ton check-in ASTER</title>
</head>
<body style="margin:0;padding:0;background:#0a0d1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0d1a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#111827;border:1px solid #1e2640;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px;border-bottom:1px solid #1e2640;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#7c73e6;width:28px;height:28px;border-radius:50%;text-align:center;vertical-align:middle;">
                    <span style="color:white;font-size:14px;">◗</span>
                  </td>
                  <td style="padding-left:10px;color:#e2e8f0;font-size:14px;font-weight:600;letter-spacing:0.1em;">ASTER</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Check-in émotionnel</p>
              <h1 style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">
                Bonjour{' ' + user_name if user_name else ''} 🌿
              </h1>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
                Comment te sens-tu aujourd'hui ? Prends 30 secondes pour faire ton check-in
                et recevoir un protocole adapté à ton état.
              </p>
              <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
                <tr>
                  <td style="background:#1e2640;border-radius:12px;padding:16px;">
                    <p style="margin:0 0 10px;color:#7c73e6;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">Rappel</p>
                    <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.5;">
                      Nommer ce que tu ressens, c'est déjà le réguler. Le check-in prend 30 secondes.
                    </p>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td align="center">
                    <a href="{app_url}/checkin" style="display:inline-block;background:#7c73e6;color:white;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:12px;">
                      Faire mon check-in →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #1e2640;">
              <p style="margin:0;color:#334155;font-size:12px;text-align:center;">
                Tu reçois cet email car tu as activé les rappels dans ASTER.
                <br>
                <a href="{app_url}/profile" style="color:#475569;text-decoration:underline;">Gérer mes préférences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

class NotificationSettings(BaseModel):
    enabled: bool
    hour: int = 9
    email: Optional[str] = None

class NotificationSettingsResponse(BaseModel):
    enabled: bool
    hour: int
    email: Optional[str]

@router.get("/settings", response_model=NotificationSettingsResponse)
async def get_settings(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"enabled": False, "hour": 9, "email": None}
    return {
        "enabled": user.notifications_enabled or False,
        "hour": user.notification_hour or 9,
        "email": user.notification_email,
    }

@router.patch("/settings")
async def update_settings(
    body: NotificationSettings,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    user.notifications_enabled = body.enabled
    user.notification_hour = max(0, min(23, body.hour))
    if body.email:
        user.notification_email = body.email
    db.commit()
    return {"ok": True}

@router.post("/send-daily")
async def send_daily_reminders(
    db: Session = Depends(get_db),
    x_cron_secret: Optional[str] = Header(None),
):
    """Called by external cron job (e.g. cron-job.org) every hour."""
    if settings.resend_api_key:
        # Validate cron secret if configured
        cron_secret = getattr(settings, 'cron_secret', '')
        if cron_secret and x_cron_secret != cron_secret:
            raise HTTPException(status_code=401, detail="Unauthorized")

    current_hour = datetime.utcnow().hour

    users = (
        db.query(User)
        .filter(
            User.notifications_enabled == True,
            User.notification_hour == current_hour,
            User.notification_email.isnot(None),
        )
        .all()
    )

    if not users:
        return {"sent": 0, "message": "Aucun utilisateur à notifier cette heure-ci"}

    if not settings.resend_api_key:
        return {"sent": 0, "message": "RESEND_API_KEY non configuré"}

    resend.api_key = settings.resend_api_key
    sent = 0
    errors = []

    for user in users:
        try:
            first_name = (user.first_name or "").strip()
            resend.Emails.send({
                "from": "ASTER <onboarding@resend.dev>",
                "to": [user.notification_email],
                "subject": "Ton check-in du jour ✦ ASTER",
                "html": get_email_html(first_name, settings.app_url),
            })
            sent += 1
        except Exception as e:
            errors.append({"user_id": user.id, "error": str(e)})

    return {"sent": sent, "errors": errors}

@router.post("/test-email")
async def send_test_email(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Send a test notification to the current user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.notification_email:
        raise HTTPException(status_code=400, detail="Aucun email de notification configuré")

    if not settings.resend_api_key:
        raise HTTPException(status_code=503, detail="Service email non configuré")

    resend.api_key = settings.resend_api_key
    first_name = (user.first_name or "").strip()
    try:
        resend.Emails.send({
            "from": "ASTER <onboarding@resend.dev>",
            "to": [user.notification_email],
            "subject": "Test — Ton check-in du jour ✦ ASTER",
            "html": get_email_html(first_name, settings.app_url),
        })
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
