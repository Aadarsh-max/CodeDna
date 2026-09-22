from fastapi import APIRouter, Request
from app.schemas.repo_schema import ParseRequest
from app.schemas.dead_code_schema import DeadCodeResponse
from app.services.parser_service import read_repository_files
from app.services.dead_code_service import find_dead_exports
from app.utils.rate_limiter import limiter

router = APIRouter()


@router.post("/dead-code", response_model=DeadCodeResponse)
@limiter.limit("15/minute")
def scan_dead_code(request: Request, payload: ParseRequest):
    file_contents = read_repository_files(
        source=payload.source,
        github_url=payload.github_url,
        zip_path=payload.zip_path,
    )
    return find_dead_exports(file_contents)