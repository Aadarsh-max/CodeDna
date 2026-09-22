from fastapi import APIRouter, Request
from app.schemas.repo_schema import ParseRequest
from app.schemas.duplicate_schema import DuplicateScanResponse
from app.services.parser_service import read_repository_files
from app.services.duplicate_service import detect_duplicates
from app.utils.rate_limiter import limiter

router = APIRouter()


@router.post("/duplicates", response_model=DuplicateScanResponse)
@limiter.limit("15/minute")
def scan_duplicates(request: Request, payload: ParseRequest):
    file_contents = read_repository_files(
        source=payload.source,
        github_url=payload.github_url,
        zip_path=payload.zip_path,
    )
    return detect_duplicates(file_contents)