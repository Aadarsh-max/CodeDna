import os
from fastapi import APIRouter, Request
from app.schemas.repo_schema import ParseRequest
from app.schemas.api_docs_schema import ApiDocsResponse
from app.services.parser_service import read_repository_files
from app.services.api_service import extract_all_routes
from app.services.api_docs_service import generate_api_documentation
from app.utils.rate_limiter import limiter

router = APIRouter()


@router.post("/api-docs", response_model=ApiDocsResponse)
@limiter.limit("10/minute")
def get_api_docs(request: Request, payload: ParseRequest):
    file_contents = read_repository_files(
        source=payload.source,
        github_url=payload.github_url,
        zip_path=payload.zip_path,
    )
    routes = extract_all_routes(file_contents)

    if payload.github_url:
        repo_name = os.path.basename(payload.github_url.rstrip("/"))
    elif payload.zip_path:
        repo_name = os.path.basename(payload.zip_path)
    else:
        repo_name = "repository"

    return generate_api_documentation(repo_name, routes)