import random
from deap import base, creator, tools, algorithms

PSEUDOCODE_EXAMPLES = {
    "Extract Method": {
        "before": "function processOrder(order):\n    if order.hasDiscount:\n        ... 15 lines of discount logic ...\n    if order.hasTax:\n        ... 10 lines of tax logic ...\n    if order.hasShipping:\n        ... 12 lines of shipping logic ...\n    return total",
        "after": "function processOrder(order):\n    total = applyDiscount(order)\n    total = applyTax(total, order)\n    total = applyShipping(total, order)\n    return total\n\nfunction applyDiscount(order): ...\nfunction applyTax(total, order): ...\nfunction applyShipping(total, order): ...",
    },
    "Split Class": {
        "before": "class UserManager:\n    createUser()\n    deleteUser()\n    sendEmail()\n    generateInvoice()\n    logAnalyticsEvent()",
        "after": "class UserService:\n    createUser()\n    deleteUser()\n\nclass EmailService:\n    sendEmail()\n\nclass InvoiceService:\n    generateInvoice()\n\nclass AnalyticsService:\n    logAnalyticsEvent()",
    },
    "Reduce Coupling": {
        "before": "import ModuleA\nimport ModuleB\nimport ModuleC\nimport ModuleD\n... (12 more imports)\n\nfunction doWork():\n    use ModuleA directly\n    use ModuleB directly\n    ...",
        "after": "import WorkflowService  // one focused dependency\n\nfunction doWork():\n    WorkflowService.run()\n    // internally coordinates A, B, C, D",
    },
    "Rename Variables": {
        "before": "function calc(x, y, z):\n    a = x * 0.18\n    b = y - a\n    return b + z",
        "after": "function calculateFinalPrice(basePrice, discount, shippingFee):\n    taxAmount = basePrice * TAX_RATE\n    priceAfterTax = discount - taxAmount\n    return priceAfterTax + shippingFee",
    },
}

ACTION_RULES = [
    {
        "condition": lambda m: m["complexity_score"] > 20,
        "action": "Extract Method",
        "description_template": "Break down complex logic in {file} into smaller functions",
        "problem_fn": lambda m: (
            f"This file has a cyclomatic complexity score of {m['complexity_score']}, meaning there are "
            f"many independent decision paths (if/else branches, loops, conditions) packed together. "
            f"High complexity in one place makes every path harder to test and increases the chance that "
            f"a change breaks logic you didn't mean to touch."
        ),
        "impact_fn": lambda m: m["complexity_score"],
        "effort_fn": lambda m: m["complexity_score"] * 1.2,
    },
    {
        "condition": lambda m: m["lines_of_code"] > 200 or m["function_count"] > 15,
        "action": "Split Class",
        "description_template": "Split {file} into smaller, focused modules",
        "problem_fn": lambda m: (
            f"This file is {m['lines_of_code']} lines long and contains {m['function_count']} functions — "
            f"a sign it may be handling several unrelated responsibilities in one place (sometimes called "
            f"a \"God File\"). This makes it harder to navigate, test in isolation, and reuse individual pieces."
        ),
        "impact_fn": lambda m: m["lines_of_code"] / 10,
        "effort_fn": lambda m: m["lines_of_code"] / 8,
    },
    {
        "condition": lambda m: m["import_count"] > 10,
        "action": "Reduce Coupling",
        "description_template": "Reduce the number of dependencies {file} relies on",
        "problem_fn": lambda m: (
            f"This file imports from {m['import_count']} other files, making it tightly coupled to much of "
            f"the codebase. Changes made elsewhere are more likely to break it, and it's harder to reuse "
            f"or test this file on its own."
        ),
        "impact_fn": lambda m: m["import_count"] * 2,
        "effort_fn": lambda m: m["import_count"] * 1.5,
    },
    {
        "condition": lambda m: 5 <= m["complexity_score"] <= 20,
        "action": "Rename Variables",
        "description_template": "Improve naming clarity in {file} for easier readability",
        "problem_fn": lambda m: (
            f"This file has moderate complexity (score {m['complexity_score']}), where unclear naming can "
            f"make the logic harder to follow at a glance, even though the underlying structure isn't "
            f"necessarily wrong."
        ),
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
                    "problem": rule["problem_fn"](m),
                    "pseudocode": PSEUDOCODE_EXAMPLES[rule["action"]],
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

    def to_step(action):
        return {
            "target": action["target"],
            "action": action["action"],
            "description": action["description"],
            "problem": action["problem"],
            "pseudocode": action["pseudocode"],
            "impactScore": action["impact"],
        }

    if len(actions) == 1:
        return [to_step(actions[0])]

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

    return [to_step(actions[action_index]) for action_index in best_individual]