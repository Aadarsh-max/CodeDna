from fastapi import APIRouter
from app.schemas.repo_schema import ParseResponse
from app.schemas.predict_schema import PredictResponse
from app.services.ml_service import predict_repository_risk

router = APIRouter()


@router.post("/predict", response_model=PredictResponse)
def predict(parsed: ParseResponse):
    metrics_dicts = [m.model_dump() for m in parsed.metrics]
    return predict_repository_risk(parsed.repo_name, metrics_dicts)