from fastapi import APIRouter, Request
from app.schemas.repo_schema import FileMetric
from app.schemas.explain_schema import FileExplanation
from app.services.explain_service import explain_repository
from app.utils.rate_limiter import limiter

router = APIRouter()


@router.post("/explain", response_model=list[FileExplanation])
@limiter.limit("30/minute")
def explain(request: Request, payload: list[FileMetric]):
    metrics_dicts = [m.model_dump() for m in payload]
    return explain_repository(metrics_dicts)