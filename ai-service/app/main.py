from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.utils.config import settings
from app.utils.rate_limiter import limiter
from app.utils.logger import log_requests
from app.utils.exceptions import (
    RepositoryProcessingError,
    InvalidRequestError,
    repository_processing_error_handler,
    invalid_request_error_handler,
    general_exception_handler,
)
from app.routers import parse, graph, fuzzy, genetic, predict, explain, llm

app = FastAPI(
    title="CodeDNA AI Service",
    docs_url=None if settings.env == "production" else "/docs",
    redoc_url=None if settings.env == "production" else "/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_exception_handler(RepositoryProcessingError, repository_processing_error_handler)
app.add_exception_handler(InvalidRequestError, invalid_request_error_handler)
app.add_exception_handler(Exception, general_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.backend_url],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.add_middleware(SlowAPIMiddleware)

app.middleware("http")(log_requests)

app.include_router(parse.router)
app.include_router(graph.router)
app.include_router(fuzzy.router)
app.include_router(genetic.router)
app.include_router(predict.router)
app.include_router(explain.router)
app.include_router(llm.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}