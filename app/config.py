from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    app_host: str = "127.0.0.1"
    app_port: int = 8000
    admin_port: int = 8001
    secret_key: str = "change-me"
    session_expire_minutes: int = 60 * 24 * 7

    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "gms_world_foods"
    db_user: str = "postgres"
    db_password: str = ""
    db_ssl: str = ""  # set to "require" for Neon / other managed Postgres

    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    cloudinary_upload_preset: str = "GMS_WORLD_FOODS"
    cloudinary_folder: str = "gms-world-foods"

    cors_origins: str = "http://127.0.0.1:8000,http://localhost:8000,http://127.0.0.1:3000,http://localhost:3000,http://127.0.0.1:8001,http://localhost:8001"

    @property
    def cloudinary_configured(self) -> bool:
        return bool(self.cloudinary_cloud_name and self.cloudinary_api_key and self.cloudinary_api_secret)

    @property
    def database_url(self) -> str:
        base = (
            f"postgresql+asyncpg://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )
        if self.db_ssl:
            return f"{base}?ssl={self.db_ssl}"
        return base

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
