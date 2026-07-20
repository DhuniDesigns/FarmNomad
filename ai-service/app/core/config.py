from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    environment: str = "local"
    model_version: str = "stub-v0"

    model_config = SettingsConfigDict(env_prefix="FARMNOMAD_AI_", env_file=".env")


@lru_cache
def get_settings() -> Settings:
    return Settings()
