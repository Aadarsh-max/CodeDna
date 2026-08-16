from fastapi import APIRouter, Request
from app.schemas.repo_schema import ParseRequest, ParseResponse
from app.services.parser_service import parse_repository
from app.utils.rate_limiter import limiter

router = APIRouter()


@router.post("/parse", response_model=ParseResponse)
@limiter.limit("15/minute")
def parse(request: Request, payload: ParseRequest):
    result = parse_repository(
        source=payload.source,
        github_url=payload.github_url,
        zip_path=payload.zip_path,
    )
    return result