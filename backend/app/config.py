from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "sqlite:///./aster.db"
    clerk_secret_key: str = ""
    clerk_publishable_key: str = ""
    allowed_origins: str = "*"
    stripe_secret_key: str = ""
    stripe_price_id: str = ""
    stripe_webhook_secret: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
