from pydantic import BaseModel


class FileExplanation(BaseModel):
    file_path: str
    bug_probability: float
    top_reasons: list[str]
    feature_contributions: dict[str, float]