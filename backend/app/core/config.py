import json
from pydantic_settings import BaseSettings
from pydantic import Field, computed_field
from typing import List


class Settings(BaseSettings):
    app_name: str = "Smart Notes"
    database_url: str = Field(..., alias="DATABASE_URL")
    jwt_secret_key: str = Field(..., alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field("HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(60 * 24, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    _cors_origins_raw: str | None = Field(None, alias="CORS_ORIGINS", exclude=True)
    reminder_enabled: bool = Field(False, alias="REMINDER_ENABLED")
    smtp_host: str | None = Field(None, alias="SMTP_HOST")
    smtp_port: int | None = Field(None, alias="SMTP_PORT")
    smtp_user: str | None = Field(None, alias="SMTP_USER")
    smtp_password: str | None = Field(None, alias="SMTP_PASSWORD")
    smtp_from: str | None = Field(None, alias="SMTP_FROM")
    smtp_use_tls: bool = Field(True, alias="SMTP_USE_TLS")
    smtp_use_ssl: bool = Field(False, alias="SMTP_USE_SSL")

    @computed_field
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS_ORIGINS từ env var"""
        if self._cors_origins_raw is None:
            return ["*"]
        
        cors_str = self._cors_origins_raw.strip()
        if not cors_str:
            return ["*"]
        
        # Thử parse JSON
        try:
            parsed = json.loads(cors_str)
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            pass
        
        # Split bằng comma
        origins = [origin.strip() for origin in cors_str.split(",") if origin.strip()]
        return origins if origins else ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()

