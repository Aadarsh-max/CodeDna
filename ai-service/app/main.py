from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.config import settings

app = FastAPI(title="CodeDNA AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.backend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}