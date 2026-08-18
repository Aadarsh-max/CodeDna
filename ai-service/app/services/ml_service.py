import os
import joblib
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "bug_predictor.pkl")

FEATURE_NAMES = ["complexity_score", "lines_of_code", "import_count", "function_count"]

_model = None


def get_model():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model


def compute_bug_probability(metric: dict) -> float:
    model = get_model()
    features = pd.DataFrame([[
        metric["complexity_score"],
        metric["lines_of_code"],
        metric["import_count"],
        metric["function_count"],
    ]], columns=FEATURE_NAMES)
    probability = model.predict_proba(features)[0][1]
    return round(float(probability), 3)


def classify_risk(probability: float) -> str:
    if probability < 0.35:
        return "Low"
    if probability < 0.65:
        return "Medium"
    return "High"


def compute_technical_debt(metric: dict, bug_probability: float) -> float:
    debt = (
        metric["complexity_score"] * 0.5
        + metric["lines_of_code"] * 0.05
        + metric["import_count"] * 1.5
    ) * (1 + bug_probability)
    return round(debt, 2)


def predict_repository_risk(repo_name: str, metrics: list[dict]) -> dict:
    predictions = []
    total_probability = 0
    high_risk_count = 0

    for metric in metrics:
        bug_probability = compute_bug_probability(metric)
        risk_level = classify_risk(bug_probability)
        technical_debt_score = compute_technical_debt(metric, bug_probability)

        if risk_level == "High":
            high_risk_count += 1

        total_probability += bug_probability

        predictions.append({
            "file_path": metric["file_path"],
            "bug_probability": bug_probability,
            "risk_level": risk_level,
            "technical_debt_score": technical_debt_score,
        })

    average_bug_probability = round(total_probability / len(metrics), 3) if metrics else 0

    return {
        "repo_name": repo_name,
        "average_bug_probability": average_bug_probability,
        "high_risk_file_count": high_risk_count,
        "predictions": predictions,
    }