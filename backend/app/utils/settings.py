from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
    DB_CONNECTION:str
    SECRET_KEY: str
    ALGORITHM: str
    REFRESH_TOKEN_EXP_TIME:int
    ACCESS_TOKEN_EXP_TIME:int
    MAIL_USERNAME: int
    MAIL_PASSWORD: int
    MAIL_FROM: int
    MAIL_PORT: int
    MAIL_SERVER: int
    MAIL_FROM_NAME: int
    MAIL_STARTTLS: int
    MAIL_SSL_TLS: int
    USE_CREDENTIALS: int
    VALIDATE_CERTS: int
    REDIS_HOST: int
    REDIS_PORT: int
    REDIS_DB: int

settings = Settings()
