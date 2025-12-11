import json
import os
from pydantic_settings import BaseSettings
from pydantic import Field, model_validator
from typing import List, Union


class Settings(BaseSettings):
    app_name: str = "Smart Notes"
    database_url: str = Field(..., alias="DATABASE_URL")
    jwt_secret_key: str = Field(..., alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field("HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(60 * 24, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    cors_origins: List[str] = Field(default_factory=lambda: ["*"], alias="CORS_ORIGINS")
    reminder_enabled: bool = Field(False, alias="REMINDER_ENABLED")
    smtp_host: str | None = Field(None, alias="SMTP_HOST")
    smtp_port: int | None = Field(None, alias="SMTP_PORT")
    smtp_user: str | None = Field(None, alias="SMTP_USER")
    smtp_password: str | None = Field(None, alias="SMTP_PASSWORD")
    smtp_from: str | None = Field(None, alias="SMTP_FROM")
    smtp_use_tls: bool = Field(True, alias="SMTP_USE_TLS")
    smtp_use_ssl: bool = Field(False, alias="SMTP_USE_SSL")

    @model_validator(mode="before")
    @classmethod
    def parse_cors_origins(cls, data: Union[dict, object]) -> dict:
        """Parse CORS_ORIGINS từ env var trước khi validation"""
        if isinstance(data, dict):
            cors_value = data.get("CORS_ORIGINS") or data.get("cors_origins")
            
            # Nếu không có giá trị, dùng default
            if cors_value is None:
                data["CORS_ORIGINS"] = ["*"]
                return data
            
            # Nếu đã là list, giữ nguyên
            if isinstance(cors_value, list):
                data["CORS_ORIGINS"] = cors_value
                return data
            
            # Parse từ string
            if isinstance(cors_value, str):
                cors_str = cors_value.strip()
                if not cors_str:
                    data["CORS_ORIGINS"] = ["*"]
                    return data
                
                # Thử parse JSON
                try:
                    parsed = json.loads(cors_str)
                    if isinstance(parsed, list):
                        data["CORS_ORIGINS"] = parsed
                        return data
                except json.JSONDecodeError:
                    pass
                
                # Split bằng comma
                origins = [origin.strip() for origin in cors_str.split(",") if origin.strip()]
                data["CORS_ORIGINS"] = origins if origins else ["*"]
                return data
        
        return data

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()

