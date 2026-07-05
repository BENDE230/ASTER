from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "sqlite:///./aster.db"
    clerk_secret_key: str = ""
    clerk_publishable_key: str = ""
    allowed_origins: str = "*"
    stripe_secret_key: str = ""
    stripe_price_id: str = ""
    stripe_price_id_yearly: str = ""
    stripe_webhook_secret: str = ""
    openai_api_key: str = ""
    resend_api_key: str = ""
    app_url: str = "https://aster-amber.vercel.app"
    cron_secret: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
