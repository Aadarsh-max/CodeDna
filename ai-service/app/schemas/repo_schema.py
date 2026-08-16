from typing import Optional
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ParseRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    github_url: Optional[str] = None
    zip_path: Optional[str] = None
    source: str


class FileMetric(BaseModel):
    file_path: str
    language: str
    lines_of_code: int
    function_count: int
    import_count: int
    imports: list[str] = []
    complexity_score: int


class ParseResponse(BaseModel):
    repo_name: str
    total_files: int
    metrics: list[FileMetric]