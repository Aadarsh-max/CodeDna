def normalize(value: float, max_value: float) -> float:
    return min(value / max_value, 1.0) if max_value else 0.0


def compute_bug_probability(metric: dict) -> float:
    complexity_factor = normalize(metric["complexity_score"], 40)
    size_factor = normalize(metric["lines_of_code"], 300)
    coupling_factor = normalize(metric["import_count"], 20)
    function_density = normalize(metric["function_count"], 30)

    score = (
        complexity_factor * 0.4
        + size_factor * 0.25
        + coupling_factor * 0.2
        + function_density * 0.15
    )
    return round(score, 3)


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