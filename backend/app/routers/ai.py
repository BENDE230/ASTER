from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from openai import OpenAI
from ..database import get_db
from ..auth import get_current_user_id
from ..config import settings
from ..models.user import User

router = APIRouter(prefix="/api/ai", tags=["ai"])

class JournalAnalysisRequest(BaseModel):
    content: str

class WeeklyNoteRequest(BaseModel):
    entries: list[str]

def get_openai_client():
    if not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="OpenAI non configuré")
    return OpenAI(api_key=settings.openai_api_key)

def check_premium(user_id: str, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_premium:
        raise HTTPException(status_code=403, detail="Fonctionnalité Premium uniquement")

@router.post("/analyze-journal")
async def analyze_journal(
    body: JournalAnalysisRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    check_premium(user_id, db)
    client = get_openai_client()

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "Tu es un assistant bienveillant spécialisé en bien-être émotionnel. "
                    "Analyse l'entrée de journal de l'utilisateur et fournis : "
                    "1) L'émotion dominante détectée, "
                    "2) Le besoin émotionnel sous-jacent, "
                    "3) Une reformulation bienveillante en 1-2 phrases, "
                    "4) Un exercice court recommandé (max 3 phrases). "
                    "Réponds en français, de façon chaleureuse et non clinique. "
                    "Format JSON: {\"emotion\": \"...\", \"besoin\": \"...\", \"reformulation\": \"...\", \"exercice\": \"...\"}"
                )
            },
            {"role": "user", "content": body.content}
        ],
        response_format={"type": "json_object"},
        max_tokens=400,
    )

    import json
    result = json.loads(response.choices[0].message.content)
    return result

@router.post("/weekly-note")
async def weekly_note(
    body: WeeklyNoteRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    check_premium(user_id, db)
    client = get_openai_client()

    entries_text = "\n---\n".join(body.entries) if body.entries else "Aucune entrée cette semaine."

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "Tu es un assistant bienveillant en bien-être émotionnel. "
                    "Analyse les entrées de journal de la semaine et écris une note de synthèse personnalisée. "
                    "La note doit : identifier les patterns émotionnels de la semaine, "
                    "souligner les progrès ou moments difficiles, "
                    "proposer une intention pour la semaine suivante. "
                    "Ton chaleureux, bienveillant, non clinique. Maximum 150 mots. En français."
                )
            },
            {"role": "user", "content": f"Entrées de journal cette semaine :\n{entries_text}"}
        ],
        max_tokens=300,
    )

    return {"note": response.choices[0].message.content}
