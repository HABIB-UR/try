"""
Application configuration using Pydantic Settings.

This module provides centralized configuration management for the FastAPI backend.
All settings are loaded from environment variables with sensible defaults for development.

Usage:
    from .config import settings

    database_url = settings.DATABASE_URL
    debug_mode = settings.DEBUG
"""

from functools import lru_cache
from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Attributes:
        DATABASE_URL: PostgreSQL connection string (Neon Serverless format)
        JWT_SECRET: Secret key for JWT token signing (must be changed in production)
        JWT_ALGORITHM: Algorithm used for JWT encoding (default: HS256)
        JWT_EXPIRATION_MINUTES: Token expiration time in minutes (default: 1440 = 24 hours)
        CORS_ORIGINS: List of allowed CORS origins
        DEBUG: Enable debug mode (default: False)
        APP_ENV: Application environment (development/staging/production)
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Database Configuration
    DATABASE_URL: str = Field(
        default="sqlite:///./todo_app.db",
        description="PostgreSQL connection string in Neon Serverless format"
    )

    @property
    def database_url_sync(self) -> str:
        """Get the database URL formatted for SQLAlchemy/SQLModel with psycopg3."""
        url = self.DATABASE_URL
        # Remove quotes if present
        url = url.strip("'\"")
        # Convert postgresql:// to postgresql+psycopg:// for psycopg3
        if url.startswith("postgresql://") and "+psycopg" not in url:
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

    # Better Auth / JWT Configuration (shared secret)
    BETTER_AUTH_SECRET: str = Field(
        default="your-default-secret-key-change-in-production",
        description="Shared secret for Better Auth JWT signing (must match frontend)"
    )

    # Alias for backwards compatibility
    @property
    def JWT_SECRET(self) -> str:
        """JWT_SECRET is now an alias for BETTER_AUTH_SECRET for shared auth."""
        return self.BETTER_AUTH_SECRET
    JWT_ALGORITHM: str = Field(
        default="HS256",
        description="Algorithm used for JWT encoding"
    )
    JWT_EXPIRATION_MINUTES: int = Field(
        default=1440,
        description="Token expiration time in minutes (default: 24 hours)",
        ge=1,
        le=43200  # Max 30 days
    )

    # CORS Configuration
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000",
        description="Comma-separated list of allowed CORS origins"
    )

    # Application Configuration
    DEBUG: bool = Field(
        default=False,
        description="Enable debug mode"
    )
    APP_ENV: str = Field(
        default="development",
        description="Application environment (development/staging/production)"
    )

    # Better Auth Configuration (optional, for frontend integration)
    BETTER_AUTH_SECRET: str = Field(
        default="your-super-secret-key-here",
        description="Better Auth secret key"
    )
    BETTER_AUTH_URL: str = Field(
        default="http://localhost:3000",
        description="Better Auth URL"
    )

    @field_validator("APP_ENV")
    @classmethod
    def validate_app_env(cls, v: str) -> str:
        """Validate that APP_ENV is one of the allowed values."""
        allowed = {"development", "staging", "production"}
        if v.lower() not in allowed:
            raise ValueError(f"APP_ENV must be one of: {', '.join(allowed)}")
        return v.lower()

    @field_validator("JWT_SECRET")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        """Warn if using default JWT secret in non-development mode."""
        if v == "your-default-secret-key-change-in-production":
            import warnings
            warnings.warn(
                "Using default JWT_SECRET. This is insecure for production use.",
                UserWarning
            )
        return v

    @property
    def cors_origins_list(self) -> List[str]:
        """
        Parse CORS_ORIGINS string into a list of origins.

        Returns:
            List of allowed CORS origin URLs
        """
        if not self.CORS_ORIGINS:
            return []
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.APP_ENV == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.APP_ENV == "development"

    @property
    def is_staging(self) -> bool:
        """Check if running in staging environment."""
        return self.APP_ENV == "staging"


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.

    Uses lru_cache to ensure settings are only loaded once per application lifecycle.

    Returns:
        Settings instance with all configuration values
    """
    return Settings()


# Global settings instance for convenient access
settings = get_settings()
