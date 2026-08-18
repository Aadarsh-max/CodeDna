import pandas as pd
import shap
from app.services.ml_service import get_model, FEATURE_NAMES

FEATURE_LABELS = {
    "complexity_score": "High Cyclomatic Complexity",
    "lines_of_code": "Large File Size",
    "import_count": "High Coupling / Too Many Dependencies",
    "function_count": "High Function Density",
}


def extract_positive_class_values(shap_values):
    if isinstance(shap_values, list):
        return shap_values[1]
    if shap_values.ndim == 3:
        return shap_values[:, :, 1]
    return shap_values


def explain_repository(metrics: list[dict]) -> list[dict]:
    model = get_model()
    data = pd.DataFrame(
        [[m["complexity_score"], m["lines_of_code"], m["import_count"], m["function_count"]] for m in metrics],
        columns=FEATURE_NAMES,
    )

    explainer = shap.TreeExplainer(model)
    raw_shap_values = explainer.shap_values(data)
    positive_class_values = extract_positive_class_values(raw_shap_values)

    probabilities = model.predict_proba(data)[:, 1]

    explanations = []
    for i, m in enumerate(metrics):
        values = positive_class_values[i]
        ranked = sorted(zip(FEATURE_NAMES, values), key=lambda x: abs(x[1]), reverse=True)
        top_reasons = [FEATURE_LABELS[name] for name, val in ranked[:2] if val > 0]

        explanations.append({
            "file_path": m["file_path"],
            "bug_probability": round(float(probabilities[i]), 3),
            "top_reasons": top_reasons if top_reasons else ["No significant risk factors"],
            "feature_contributions": {name: round(float(val), 4) for name, val in zip(FEATURE_NAMES, values)},
        })

    return explanations