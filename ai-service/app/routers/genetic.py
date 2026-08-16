from fastapi import APIRouter
from app.schemas.repo_schema import FileMetric
from app.schemas.genetic_schema import RefactorStep
from app.services.ga_service import run_genetic_algorithm

router = APIRouter()


@router.post("/genetic", response_model=list[RefactorStep])
def get_refactor_plan(metrics: list[FileMetric]):
    metrics_dicts = [m.model_dump() for m in metrics]
    return run_genetic_algorithm(metrics_dicts)