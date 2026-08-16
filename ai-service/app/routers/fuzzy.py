from fastapi import APIRouter
from app.schemas.repo_schema import FileMetric
from app.schemas.fuzzy_schema import FuzzyResponse
from app.services.fuzzy_service import compute_repo_maintainability

router = APIRouter()


@router.post("/fuzzy", response_model=FuzzyResponse)
def compute_fuzzy(metrics: list[FileMetric]):
    metrics_dicts = [m.model_dump() for m in metrics]
    return compute_repo_maintainability(metrics_dicts)