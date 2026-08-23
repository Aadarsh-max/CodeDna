from pydantic import BaseModel


class RiskPrediction(BaseModel):
    file_path: str
    bug_probability: float
    risk_level: str
    technical_debt_score: float
    confidence: float


class PredictResponse(BaseModel):
    repo_name: str
    average_bug_probability: float
    high_risk_file_count: int
    average_confidence: float
    predictions: list[RiskPrediction]