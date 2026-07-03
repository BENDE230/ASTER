from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from ..database import get_db
from ..auth import get_current_user_id
from ..models.checkin import CheckIn

router = APIRouter(prefix="/api/insights", tags=["insights"])

FEELING_PATTERNS: dict[str, dict] = {
    'Je suranalyse':      {'label': 'Tendance à la rumination',    'desc': 'Ton esprit a tendance à tourner en boucle sur les mêmes pensées.'},
    'Je suis figé·e':    {'label': 'Blocage décisionnel',          'desc': 'Tu as du mal à te mettre en action quand la charge est trop lourde.'},
    'Je suis vidé·e':    {'label': 'Fatigue de régulation',        'desc': 'Ton énergie émotionnelle est souvent en bas de cycle.'},
    'Hypervigilance':    {'label': 'Système nerveux en alerte',    'desc': 'Ton corps reste en mode surveillance plus souvent que la moyenne.'},
    'Je me sens trop':   {'label': 'Hypersensibilité émotionnelle','desc': 'Tes émotions sont intenses — c\'est une force qui demande de l\'espace.'},
    'Saturation mentale':{'label': 'Surcharge cognitive',          'desc': 'Ton cerveau signale régulièrement qu\'il est à pleine capacité.'},
}

FEELING_COLORS: dict[str, str] = {
    'Je suranalyse':      '#a78bfa',
    'Je suis figé·e':    '#94a3b8',
    'Je suis vidé·e':    '#60a5fa',
    'Hypervigilance':    '#f87171',
    'Je me sens trop':   '#818cf8',
    'Saturation mentale':'#fbbf24',
}

@router.get("")
async def get_insights(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    today = date.today()
    since_30 = (today - timedelta(days=30)).isoformat()
    since_7  = (today - timedelta(days=7)).isoformat()

    # All check-ins last 30 days
    checkins_30 = (
        db.query(CheckIn.feeling)
        .filter(
            CheckIn.user_id == user_id,
            func.date(CheckIn.created_at) >= since_30,
        )
        .all()
    )
    feelings_30 = [c.feeling for c in checkins_30]

    # Feeling distribution
    counts: dict[str, int] = {}
    for f in feelings_30:
        counts[f] = counts.get(f, 0) + 1

    total = sum(counts.values()) or 1
    distribution = sorted(
        [
            {
                'name': feeling,
                'value': round(count / total * 100),
                'count': count,
                'color': FEELING_COLORS.get(feeling, '#64748b'),
            }
            for feeling, count in counts.items()
        ],
        key=lambda x: -x['value']
    )

    # Week presence
    week_data = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_checkins = (
            db.query(CheckIn.feeling)
            .filter(
                CheckIn.user_id == user_id,
                func.date(CheckIn.created_at) == day.isoformat(),
            )
            .all()
        )
        feelings = [c.feeling for c in day_checkins]
        dominant = max(set(feelings), key=feelings.count) if feelings else None
        week_data.append({
            "date": str(day),
            "count": len(feelings),
            "feeling": dominant,
        })

    # Dominant patterns (top 3 feelings over 30 days)
    top_feelings = sorted(counts.items(), key=lambda x: -x[1])[:3]
    patterns = []
    for i, (feeling, count) in enumerate(top_feelings):
        p = FEELING_PATTERNS.get(feeling)
        if p:
            patterns.append({
                'label': p['label'],
                'desc': p['desc'],
                'feeling': feeling,
                'count': count,
                'premium': i > 0,  # first pattern free, rest premium
            })

    # Stats
    checkins_7 = (
        db.query(func.count(CheckIn.id))
        .filter(
            CheckIn.user_id == user_id,
            func.date(CheckIn.created_at) >= since_7,
        )
        .scalar()
    ) or 0

    return {
        'distribution': distribution,
        'week': week_data,
        'patterns': patterns,
        'total_30': len(feelings_30),
        'total_7': checkins_7,
        'has_data': len(feelings_30) > 0,
    }
