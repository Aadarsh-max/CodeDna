from fastapi import APIRouter, Request
from app.schemas.repo_schema import ParseResponse
from app.schemas.llm_schema import DocumentationResponse
from app.services.llm_service import generate_documentation
from app.utils.rate_limiter import limiter

router = APIRouter()


@router.post("/llm", response_model=DocumentationResponse)
@limiter.limit("10/minute")
def generate_docs(request: Request, payload: ParseResponse):
    metrics_dicts = [m.model_dump() for m in payload.metrics]
    return generate_documentation(payload.repo_name, metrics_dicts)