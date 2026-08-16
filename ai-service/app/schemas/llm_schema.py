from pydantic import BaseModel


class DocumentationResponse(BaseModel):
    repo_name: str
    summary: str
    readme: str
    insights: list[str]