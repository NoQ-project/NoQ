from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
    DB_CONNECTION:str
    SECRET_KEY: str
    ALGORITHM: str
    REFRESH_TOKEN_EXP_TIME:int
    ACCESS_TOKEN_EXP_TIME:int
settings = Settings()