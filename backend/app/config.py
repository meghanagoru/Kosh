from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """App settings; override via environment or backend/.env."""

    model_config = SettingsConfigDict(
        env_file=_BACKEND_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    secret_key: str = "dev-only-change-in-production"
    mongodb_uri: str = "mongodb://localhost:27017/kosh"


@lru_cache
def get_settings() -> Settings:
    return Settings()
