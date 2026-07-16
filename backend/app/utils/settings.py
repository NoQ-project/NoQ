from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
    DB_CONNECTION:str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXP_TIME: int
    REFRESH_TOKEN_EXP_TIME: int
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_DB: int
    MAIL_USERNAME:str
    MAIL_PASSWORD : str
    MAIL_FROM : str
    MAIL_PORT : int
    MAIL_SERVER : str
    MAIL_FROM_NAME:str
    MAIL_STARTTLS : bool
    MAIL_SSL_TLS : bool
    USE_CREDENTIALS : bool
    VALIDATE_CERTS : bool
   
settings = Settings()
