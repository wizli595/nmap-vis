from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    nmap_image: str = "nmap-vis-nmap"
    scan_timeout: int = 600
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"]

    class Config:
        env_prefix = ""


settings = Settings()
