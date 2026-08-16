import numpy as np
import shap
from app.services.ml_service import compute_bug_probability

FEATURE_NAMES = ["complexity_score", "lines_of_code", "import_count", "function_count"]

FEATURE_LABELS = {
    "complexity_score": "High Cyclomatic Complexity",
    "lines_of_code": "Large File Size",
    "import_count": "High Coupling / Too Many Dependencies",
    "function_count": "High Function Density",
}


def metrics_to_array(metrics: list[dict]) -> np.ndarray:
    return np.array([
        [m["complexity_score"], m["lines_of_code"], m["import_count"], m["function_count"]]
        for m in metrics
    ], dtype=float)


def predict_from_array(data: np.ndarray) -> np.ndarray:
    predictions = []
    for row in data:
        metric = {
            "complexity_score": row[0],
            "lines_of_code": row[1],
            "import_count": row[2],
            "function_count": row[3],
        }
        predictions.append(compute_bug_probability(metric))
    return np.array(predictions)


def explain_repository(metrics: list[dict]) -> list[dict]:
    data = metrics_to_array(metrics)

    background = data if len(data) <= 20 else shap.sample(data, 20)
    explainer = shap.Explainer(predict_from_array, background, feature_names=FEATURE_NAMES)
    shap_values = explainer(data)

    explanations = []
    for i, m in enumerate(metrics):
        values = shap_values.values[i]
        ranked = sorted(zip(FEATURE_NAMES, values), key=lambda x: abs(x[1]), reverse=True)
        top_reasons = [FEATURE_LABELS[name] for name, val in ranked[:2] if val > 0]

        explanations.append({
            "file_path": m["file_path"],
            "bug_probability": round(float(compute_bug_probability(m)), 3),
            "top_reasons": top_reasons if top_reasons else ["No significant risk factors"],
            "feature_contributions": {name: round(float(val), 4) for name, val in zip(FEATURE_NAMES, values)},
        })

    return explanations