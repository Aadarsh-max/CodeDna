from fastapi import APIRouter
from app.schemas.repo_schema import ParseResponse
from app.schemas.llm_schema import DocumentationResponse
from app.services.llm_service import generate_documentation

router = APIRouter()


@router.post("/llm", response_model=DocumentationResponse)
def generate_docs(parsed: ParseResponse):
    metrics_dicts = [m.model_dump() for m in parsed.metrics]
    return generate_documentation(parsed.repo_name, metrics_dicts)