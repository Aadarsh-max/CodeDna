from fastapi import APIRouter, Request
from app.schemas.repo_schema import ParseResponse
from app.schemas.predict_schema import PredictResponse
from app.services.ml_service import predict_repository_risk
from app.utils.rate_limiter import limiter

router = APIRouter()


@router.post("/predict", response_model=PredictResponse)
@limiter.limit("30/minute")
def predict(request: Request, payload: ParseResponse):
    metrics_dicts = [m.model_dump() for m in payload.metrics]
    return predict_repository_risk(payload.repo_name, metrics_dicts)