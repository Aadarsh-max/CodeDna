from fastapi import APIRouter, Request
from app.schemas.repo_schema import ParseRequest
from app.schemas.cohesion_schema import CohesionResponse
from app.services.parser_service import read_repository_files
from app.services.cohesion_service import analyze_cohesion
from app.utils.rate_limiter import limiter

router = APIRouter()


@router.post("/cohesion", response_model=CohesionResponse)
@limiter.limit("15/minute")
def scan_cohesion(request: Request, payload: ParseRequest):
    file_contents = read_repository_files(
        source=payload.source,
        github_url=payload.github_url,
        zip_path=payload.zip_path,
    )
    return analyze_cohesion(file_contents)