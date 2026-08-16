from fastapi import APIRouter
from app.schemas.repo_schema import FileMetric
from app.schemas.explain_schema import FileExplanation
from app.services.explain_service import explain_repository

router = APIRouter()


@router.post("/explain", response_model=list[FileExplanation])
def explain(metrics: list[FileMetric]):
    metrics_dicts = [m.model_dump() for m in metrics]
    return explain_repository(metrics_dicts)