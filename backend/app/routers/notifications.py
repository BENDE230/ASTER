from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import resend
from ..database import get_db
from ..auth import get_current_user_id
from ..config import settings

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

CHECKIN_FEELINGS = [
    "Je suranalyse", "Je suis figé·e", "Je suis vidé·e",
    "Hypervigilance", "Je me sens trop", "Saturation mentale",
]

def get_email_html(user_name: str, app_url: str) -> str:
    greeting = f"Bonjour{' ' + user_name if user_name else ''}"
    font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Ton check-in ASTER</title>
</head>
<body style="margin:0;padding:0;background-color:#060912;font-family:{font};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#060912;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="width:100%;max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="{app_url}/email-logo.svg" width="120" height="36" alt="ASTER" style="display:block;border:0;" />
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#0f1629;border:1px solid #1e2d4a;border-radius:20px;overflow:hidden;">

              <!-- Top accent bar -->
              <tr>
                <td style="background:linear-gradient(90deg,#7c73e6,#a78bfa);height:3px;font-size:0;line-height:0;">&nbsp;</td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 32px;">
                  <p style="margin:0 0 6px 0;color:#7c73e6;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;font-family:{font};">Check-in émotionnel</p>
                  <h1 style="margin:0 0 20px 0;color:#f1f5f9;font-size:26px;font-weight:700;line-height:1.25;font-family:{font};">{greeting}</h1>
                  <p style="margin:0 0 28px 0;color:#94a3b8;font-size:15px;line-height:1.7;font-family:{font};">
                    Comment te sens-tu aujourd&apos;hui&nbsp;? Prends <strong style="color:#e2e8f0;">30 secondes</strong> pour faire ton check-in et recevoir un protocole adapté à ton état du moment.
                  </p>

                  <!-- Quote box -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td style="background-color:#131d35;border-left:3px solid #7c73e6;border-radius:0 12px 12px 0;padding:16px 20px;">
                        <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6;font-style:italic;font-family:{font};">
                          &ldquo;Nommer ce que tu ressens, c&apos;est déjà commencer à le réguler.&rdquo;
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                    <tr>
                      <td style="background-color:#7c73e6;border-radius:12px;">
                        <a href="{app_url}/checkin" style="display:inline-block;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:15px 36px;letter-spacing:0.02em;font-family:{font};">
                          Faire mon check-in &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px;border-top:1px solid #1e2d4a;">
                  <p style="margin:0;color:#374151;font-size:12px;text-align:center;line-height:1.6;">
                    Tu reçois cet email car tu as activé les rappels dans ASTER.<br>
                    <a href="{app_url}/profile" style="color:#4b5563;text-decoration:underline;">Gérer mes préférences</a>
                  </p>
                </td>
              </tr>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

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
    row = db.execute(
        text("SELECT notifications_enabled, notification_hour, notification_email FROM users WHERE id = :id"),
        {"id": user_id}
    ).fetchone()
    if not row:
        return {"enabled": False, "hour": 9, "email": None}
    return {
        "enabled": bool(row[0]) if row[0] is not None else False,
        "hour": row[1] if row[1] is not None else 9,
        "email": row[2],
    }

@router.patch("/settings")
async def update_settings(
    body: NotificationSettings,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    hour = max(0, min(23, body.hour))
    db.execute(
        text("""
            UPDATE users
            SET notifications_enabled = :enabled,
                notification_hour = :hour,
                notification_email = :email
            WHERE id = :id
        """),
        {"enabled": body.enabled, "hour": hour, "email": body.email, "id": user_id}
    )
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

class TestEmailRequest(BaseModel):
    email: str

@router.post("/test-email")
async def send_test_email(
    body: TestEmailRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Send a test notification to the current user."""
    if not settings.resend_api_key:
        raise HTTPException(status_code=503, detail="Service email non configuré (RESEND_API_KEY manquant)")

    resend.api_key = settings.resend_api_key
    row = db.execute(text("SELECT notification_email FROM users WHERE id = :id"), {"id": user_id}).fetchone()
    first_name = ""
    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": [body.email],
            "subject": "Test — Ton check-in du jour ✦ ASTER",
            "html": get_email_html(first_name, settings.app_url),
        })
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
