from fastapi import APIRouter
from app.schemas.repo_schema import ParseRequest, ParseResponse
from app.services.parser_service import parse_repository

router = APIRouter()


@router.post("/parse", response_model=ParseResponse)
def parse(request: ParseRequest):
    result = parse_repository(
        source=request.source,
        github_url=request.github_url,
        zip_path=request.zip_path,
    )
    return result