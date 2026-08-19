from fastapi import APIRouter, Request
from app.schemas.llm_schema import DocumentationRequest, DocumentationResponse
from app.services.llm_service import generate_documentation
from app.utils.rate_limiter import limiter

router = APIRouter()


@router.post("/llm", response_model=DocumentationResponse)
@limiter.limit("10/minute")
def generate_docs(request: Request, payload: DocumentationRequest):
    metrics_dicts = [m.model_dump() for m in payload.metrics]
    return generate_documentation(
        repo_name=payload.repo_name,
        metrics=metrics_dicts,
        average_bug_probability=payload.average_bug_probability,
        high_risk_file_count=payload.high_risk_file_count,
        average_maintainability=payload.average_maintainability,
        top_refactor_actions=payload.top_refactor_actions,
    )