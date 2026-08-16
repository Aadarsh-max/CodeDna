import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self):
        self.port = int(os.getenv("PORT", 8000))
        self.env = os.getenv("ENV", "development")
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "qwen2.5-coder")


settings = Settings()