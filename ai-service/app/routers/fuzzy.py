from fastapi import APIRouter, Request
from app.schemas.repo_schema import FileMetric
from app.schemas.fuzzy_schema import FuzzyResponse
from app.services.fuzzy_service import compute_repo_maintainability
from app.utils.rate_limiter import limiter

router = APIRouter()


@router.post("/fuzzy", response_model=FuzzyResponse)
@limiter.limit("30/minute")
def compute_fuzzy(request: Request, payload: list[FileMetric]):
    metrics_dicts = [m.model_dump() for m in payload]
    return compute_repo_maintainability(metrics_dicts)