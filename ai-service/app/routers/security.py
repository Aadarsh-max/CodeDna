from fastapi import APIRouter, Request
from app.schemas.repo_schema import ParseRequest
from app.schemas.security_schema import SecurityScanResponse
from app.services.parser_service import read_repository_files
from app.services.security_service import scan_repository
from app.utils.rate_limiter import limiter

router = APIRouter()


@router.post("/security", response_model=SecurityScanResponse)
@limiter.limit("15/minute")
def scan_security(request: Request, payload: ParseRequest):
    file_contents = read_repository_files(
        source=payload.source,
        github_url=payload.github_url,
        zip_path=payload.zip_path,
    )
    return scan_repository(file_contents)