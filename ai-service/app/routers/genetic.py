from fastapi import APIRouter, Request
from app.schemas.repo_schema import FileMetric
from app.schemas.genetic_schema import RefactorStep
from app.services.ga_service import run_genetic_algorithm
from app.utils.rate_limiter import limiter

router = APIRouter()


@router.post("/genetic", response_model=list[RefactorStep])
@limiter.limit("30/minute")
def get_refactor_plan(request: Request, payload: list[FileMetric]):
    metrics_dicts = [m.model_dump() for m in payload]
    return run_genetic_algorithm(metrics_dicts)