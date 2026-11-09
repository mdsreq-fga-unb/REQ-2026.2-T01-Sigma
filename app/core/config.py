from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SIGMA"
    app_env: str = "development"
    debug: bool = False

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/sigma"

    # Configurações de Autenticação JWT (UC01 / RF06 / RN17)
    jwt_secret_key: str = "estacao-vida-sigma-jwt-secret-key-super-segura-2026"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Header HTTP retornado em requisições autenticadas para renovação de sessão por inatividade
    renewed_token_header_name: str = "X-Renewed-Token"

    # Regras de Bloqueio (RN16)
    max_login_failed_attempts: int = 5
    lockout_duration_minutes: int = 15

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
