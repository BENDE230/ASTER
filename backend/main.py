from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app.routers import onboarding, checkin, journal, insights
from app.routers import stripe_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ASTER API", version="0.1.0")

origins = settings.allowed_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in origins else origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(onboarding.router)
app.include_router(checkin.router)
app.include_router(journal.router)
app.include_router(insights.router)
app.include_router(stripe_router.router)

@app.get("/health")
def health():
    return {"status": "ok", "app": "ASTER"}
