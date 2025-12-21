import json
from pydantic_settings import BaseSettings
from pydantic import Field, computed_field, field_validator
from typing import List, Optional


class Settings(BaseSettings):
    app_name: str = "Smart Notes"
    database_url: str = Field(..., alias="DATABASE_URL")
    jwt_secret_key: str = Field(..., alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field("HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(60 * 24, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    cors_origins_raw: str | None = Field(None, alias="CORS_ORIGINS", exclude=True)
    reminder_enabled: bool = Field(False, alias="REMINDER_ENABLED")
    smtp_host: str | None = Field(None, alias="SMTP_HOST")
    smtp_port: int | None = Field(None, alias="SMTP_PORT")
    smtp_user: str | None = Field(None, alias="SMTP_USER")
    smtp_password: str | None = Field(None, alias="SMTP_PASSWORD")
    smtp_from: str | None = Field(None, alias="SMTP_FROM")
    smtp_use_tls: bool = Field(True, alias="SMTP_USE_TLS")
    smtp_use_ssl: bool = Field(False, alias="SMTP_USE_SSL")
    aws_access_key_id: Optional[str] = Field(None, alias="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = Field(None, alias="AWS_SECRET_ACCESS_KEY")
    aws_region: Optional[str] = Field(None, alias="AWS_REGION")
    s3_bucket: Optional[str] = Field(None, alias="S3_BUCKET")

    @field_validator('smtp_port', mode='before')
    @classmethod
    def parse_smtp_port(cls, v):
        if v == '' or v is None:
            return None
        if isinstance(v, str):
            try:
                return int(v)
            except ValueError:
                return None
        return v

    @computed_field
    @property
    def cors_origins(self) -> List[str]:
        if self.cors_origins_raw is None:
            return ["*"]
        
        cors_str = self.cors_origins_raw.strip()
        if not cors_str:
            return ["*"]
        
        try:
            parsed = json.loads(cors_str)
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            pass
        
        origins = [origin.strip() for origin in cors_str.split(",") if origin.strip()]
        return origins if origins else ["*"]

    @computed_field
    @property
    def s3_enabled(self) -> bool:
        return bool(self.aws_access_key_id and self.aws_secret_access_key and self.aws_region and self.s3_bucket)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()

