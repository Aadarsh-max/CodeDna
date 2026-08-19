from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from app.schemas.repo_schema import FileMetric


class DocumentationRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    repo_name: str
    metrics: list[FileMetric]
    average_bug_probability: float
    high_risk_file_count: int
    average_maintainability: float
    top_refactor_actions: list[str] = []


class DocumentationResponse(BaseModel):
    repo_name: str
    summary: str
    architecture_overview: str
    quality_assessment: str
    readme: str
    insights: list[str]
    recommendations: str