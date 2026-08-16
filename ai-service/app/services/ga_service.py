import random
from deap import base, creator, tools, algorithms

ACTION_RULES = [
    {
        "condition": lambda m: m["complexity_score"] > 20,
        "action": "Extract Method",
        "description_template": "Break down complex logic in {file} into smaller functions",
        "impact_fn": lambda m: m["complexity_score"],
        "effort_fn": lambda m: m["complexity_score"] * 1.2,
    },
    {
        "condition": lambda m: m["lines_of_code"] > 200 or m["function_count"] > 15,
        "action": "Split Class",
        "description_template": "Split {file} into smaller, focused modules",
        "impact_fn": lambda m: m["lines_of_code"] / 10,
        "effort_fn": lambda m: m["lines_of_code"] / 8,
    },
    {
        "condition": lambda m: m["import_count"] > 10,
        "action": "Reduce Coupling",
        "description_template": "Reduce the number of dependencies {file} relies on",
        "impact_fn": lambda m: m["import_count"] * 2,
        "effort_fn": lambda m: m["import_count"] * 1.5,
    },
    {
        "condition": lambda m: 5 <= m["complexity_score"] <= 20,
        "action": "Rename Variables",
        "description_template": "Improve naming clarity in {file} for easier readability",
        "impact_fn": lambda m: 5,
        "effort_fn": lambda m: 2,
    },
]


def generate_candidate_actions(metrics: list[dict]) -> list[dict]:
    actions = []
    for m in metrics:
        for rule in ACTION_RULES:
            if rule["condition"](m):
                actions.append({
                    "target": m["file_path"],
                    "action": rule["action"],
                    "description": rule["description_template"].format(file=m["file_path"]),
                    "impact": round(rule["impact_fn"](m), 2),
                    "effort": round(rule["effort_fn"](m), 2),
                })
    return actions


if not hasattr(creator, "FitnessMax"):
    creator.create("FitnessMax", base.Fitness, weights=(1.0,))
if not hasattr(creator, "Individual"):
    creator.create("Individual", list, fitness=creator.FitnessMax)


def evaluate_order(individual, actions, discount=0.9):
    total_score = 0
    for position, action_index in enumerate(individual):
        action = actions[action_index]
        efficiency = action["impact"] - (action["effort"] * 0.5)
        total_score += efficiency * (discount ** position)
    return (total_score,)


def run_genetic_algorithm(metrics: list[dict], generations: int = 40, population_size: int = 30) -> list[dict]:
    actions = generate_candidate_actions(metrics)

    if not actions:
        return []

    if len(actions) == 1:
        return [{
            "target": actions[0]["target"],
            "action": actions[0]["action"],
            "description": actions[0]["description"],
            "impactScore": actions[0]["impact"],
        }]

    toolbox = base.Toolbox()
    toolbox.register("indices", random.sample, range(len(actions)), len(actions))
    toolbox.register("individual", tools.initIterate, creator.Individual, toolbox.indices)
    toolbox.register("population", tools.initRepeat, list, toolbox.individual)

    toolbox.register("evaluate", evaluate_order, actions=actions)
    toolbox.register("mate", tools.cxOrdered)
    toolbox.register("mutate", tools.mutShuffleIndexes, indpb=0.2)
    toolbox.register("select", tools.selTournament, tournsize=3)

    population = toolbox.population(n=population_size)

    population, _logbook = algorithms.eaSimple(
        population,
        toolbox,
        cxpb=0.7,
        mutpb=0.3,
        ngen=generations,
        verbose=False,
    )

    best_individual = tools.selBest(population, k=1)[0]

    ordered_steps = []
    for action_index in best_individual:
        action = actions[action_index]
        ordered_steps.append({
            "target": action["target"],
            "action": action["action"],
            "description": action["description"],
            "impactScore": action["impact"],
        })

    return ordered_steps