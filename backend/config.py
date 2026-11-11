import os
from pathlib import Path
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load .env if present (check backend/.env and root .env)
_backend_dir = Path(__file__).resolve().parent
_root_dir = _backend_dir.parent

if (_root_dir / ".env").exists():
    load_dotenv(dotenv_path=_root_dir / ".env", override=False)
if (_backend_dir / ".env").exists():
    load_dotenv(dotenv_path=_backend_dir / ".env", override=False)

def _get_cors_origins() -> list[str]:
    defaults = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
    ]
    env_cors = os.getenv("CORS_ORIGINS", "")
    if env_cors:
        custom_origins = [o.strip() for o in env_cors.split(",") if o.strip()]
        return list(dict.fromkeys(defaults + custom_origins))
    return defaults

class Settings(BaseModel):
    PROJECT_NAME: str = "HostelIQ AI"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # AI / Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    EMBEDDING_MODEL: str = "text-embedding-004"
    GENERATIVE_MODEL: str = "gemini-2.5-flash"
    
    # MongoDB Database Configuration
    MONGO_URI: str = os.getenv("MONGO_URI", os.getenv("MONGODB_URI", "mongodb://localhost:27017/hosteliq"))
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "hosteliq")
    
    # Server & CORS
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    CORS_ORIGINS: list[str] = Field(default_factory=_get_cors_origins)

settings = Settings()
