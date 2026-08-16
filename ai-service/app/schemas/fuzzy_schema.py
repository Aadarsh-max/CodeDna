from pydantic import BaseModel


class FileMaintainability(BaseModel):
    file_path: str
    maintainability_score: float
    complexity_level: str
    coupling_level: str


class FuzzyResponse(BaseModel):
    average_maintainability: float
    file_scores: list[FileMaintainability]