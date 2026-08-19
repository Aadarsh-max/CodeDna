import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self):
        self.port = int(os.getenv("PORT", 8000))
        self.env = os.getenv("ENV", "development")
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")
        self.llm_provider = os.getenv("LLM_PROVIDER", "ollama")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "qwen2.5-coder")
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


settings = Settings()