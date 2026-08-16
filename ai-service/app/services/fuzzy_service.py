import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

complexity = ctrl.Antecedent(np.arange(0, 41, 1), 'complexity')
coupling = ctrl.Antecedent(np.arange(0, 21, 1), 'coupling')
maintainability = ctrl.Consequent(np.arange(0, 101, 1), 'maintainability')

complexity['low'] = fuzz.trimf(complexity.universe, [0, 0, 15])
complexity['medium'] = fuzz.trimf(complexity.universe, [5, 17, 30])
complexity['high'] = fuzz.trimf(complexity.universe, [20, 40, 40])

coupling['low'] = fuzz.trimf(coupling.universe, [0, 0, 7])
coupling['medium'] = fuzz.trimf(coupling.universe, [3, 9, 15])
coupling['high'] = fuzz.trimf(coupling.universe, [10, 20, 20])

maintainability['low'] = fuzz.trimf(maintainability.universe, [0, 0, 40])
maintainability['medium'] = fuzz.trimf(maintainability.universe, [25, 50, 75])
maintainability['high'] = fuzz.trimf(maintainability.universe, [60, 100, 100])

rules = [
    ctrl.Rule(complexity['low'] & coupling['low'], maintainability['high']),
    ctrl.Rule(complexity['low'] & coupling['medium'], maintainability['high']),
    ctrl.Rule(complexity['low'] & coupling['high'], maintainability['medium']),
    ctrl.Rule(complexity['medium'] & coupling['low'], maintainability['high']),
    ctrl.Rule(complexity['medium'] & coupling['medium'], maintainability['medium']),
    ctrl.Rule(complexity['medium'] & coupling['high'], maintainability['low']),
    ctrl.Rule(complexity['high'] & coupling['low'], maintainability['medium']),
    ctrl.Rule(complexity['high'] & coupling['medium'], maintainability['low']),
    ctrl.Rule(complexity['high'] & coupling['high'], maintainability['low']),
]

maintainability_ctrl = ctrl.ControlSystem(rules)


def classify_level(value: int, low_max: int, high_min: int) -> str:
    if value <= low_max:
        return "Low"
    if value >= high_min:
        return "High"
    return "Medium"


def compute_file_score(complexity_score: int, coupling_score: int) -> dict:
    simulation = ctrl.ControlSystemSimulation(maintainability_ctrl)
    simulation.input['complexity'] = min(complexity_score, 40)
    simulation.input['coupling'] = min(coupling_score, 20)
    simulation.compute()
    score = round(simulation.output['maintainability'], 2)

    return {
        "maintainability_score": score,
        "complexity_level": classify_level(complexity_score, 8, 20),
        "coupling_level": classify_level(coupling_score, 4, 10),
    }


def compute_repo_maintainability(metrics: list[dict]) -> dict:
    file_scores = []
    total_score = 0

    for m in metrics:
        result = compute_file_score(m["complexity_score"], m["import_count"])
        file_scores.append({"file_path": m["file_path"], **result})
        total_score += result["maintainability_score"]

    average_score = round(total_score / len(metrics), 2) if metrics else 0

    return {
        "average_maintainability": average_score,
        "file_scores": file_scores,
    }