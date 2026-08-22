from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    MYSQL_DATABASE: Optional[str] = None
    JWT_SECRET: str = "dev-secret-change-me"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24
    MYSQL_PUBLIC_URL: Optional[str] = None
    MYSQL_ROOT_PASSWORD: Optional[str] = None
    MYSQL_URL: Optional[str] = None
    MYSQLDATABASE: Optional[str] = None
    MYSQLHOST: Optional[str] = None
    MYSQLPASSWORD: Optional[str] = None
    MYSQLPORT: Optional[int] = None
    MYSQLUSER: Optional[str] = None
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    CLOUDINARY_URL: Optional[str] = None
    ENVIRONMENT: str = "local"

    class Config:
        env_file = ".env"      # ✅ Load from .env
        env_file_encoding = "utf-8"
        extra = "ignore"       # ✅ Ignore extra fields

settings = Settings()
