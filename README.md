# ASTER — Ton espace calme

Application de bien-être mental avec check-ins quotidiens, journal émotionnel et protocoles de régulation.

## Stack

| Couche     | Tech                                      |
|------------|-------------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS            |
| Auth       | Clerk                                     |
| Backend    | Python + FastAPI                          |
| Base de données | PostgreSQL + SQLAlchemy              |

## Démarrage

### 1. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # ajoute ta clé Clerk
npm run dev                 # http://localhost:5173
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
cp .env.example .env        # remplis DATABASE_URL et CLERK_SECRET_KEY
uvicorn main:app --reload   # http://localhost:8000
```

### 3. Base de données

```bash
# Créer la base PostgreSQL
psql -U postgres -c "CREATE DATABASE aster_db;"
# Les tables sont créées automatiquement au démarrage du backend
```

## Pages

| Route          | Description                        | Auth |
|----------------|------------------------------------|------|
| `/`            | Landing page                       | —    |
| `/onboarding`  | Questionnaire 3 étapes             | —    |
| `/space-ready` | Confirmation espace personnalisé   | —    |
| `/dashboard`   | Tableau de bord principal          | ✓    |
| `/checkin`     | Check-in émotionnel quotidien      | ✓    |
| `/journal`     | Journal émotionnel                 | ✓    |
| `/protocols`   | Bibliothèque de protocoles         | ✓    |
| `/insights`    | Patterns & analytics               | ✓    |

## Modèle freemium

- **Gratuit** : 5 jours d'essai, 3 protocoles, 1 entrée journal visible, graphique états dominants
- **Premium** : historique complet, analyse IA du journal, 6 protocoles, graphiques avancés, note hebdomadaire IA
