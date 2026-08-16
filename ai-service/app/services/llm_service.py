import json
import ollama
from app.utils.config import settings


def build_repo_context(repo_name: str, metrics: list[dict]) -> str:
    total_files = len(metrics)
    avg_complexity = round(sum(m["complexity_score"] for m in metrics) / total_files, 2) if total_files else 0
    avg_loc = round(sum(m["lines_of_code"] for m in metrics) / total_files, 2) if total_files else 0

    languages = {}
    for m in metrics:
        languages[m["language"]] = languages.get(m["language"], 0) + 1

    top_complex = sorted(metrics, key=lambda m: m["complexity_score"], reverse=True)[:5]
    top_complex_lines = "\n".join(
        f"- {m['file_path']} (complexity: {m['complexity_score']}, lines: {m['lines_of_code']})"
        for m in top_complex
    )

    return f"""Repository: {repo_name}
Total files analyzed: {total_files}
Average complexity score: {avg_complexity}
Average lines of code per file: {avg_loc}
Language breakdown: {languages}

Most complex files:
{top_complex_lines}"""


def generate_documentation(repo_name: str, metrics: list[dict]) -> dict:
    context = build_repo_context(repo_name, metrics)

    prompt = f"""You are a senior software engineer analyzing a codebase. Based on the data below, respond ONLY with valid JSON, no markdown formatting, no extra text, in this exact shape:
{{"summary": "a 2-3 sentence project summary", "readme": "a short README style description in markdown", "insights": ["insight 1", "insight 2", "insight 3"]}}

Codebase data:
{context}"""

    response = ollama.chat(
        model=settings.ollama_model,
        messages=[{"role": "user", "content": prompt}],
    )

    content = response["message"]["content"].strip()

    try:
        parsed = json.loads(content)
        return {
            "repo_name": repo_name,
            "summary": parsed.get("summary", ""),
            "readme": parsed.get("readme", ""),
            "insights": parsed.get("insights", []),
        }
    except json.JSONDecodeError:
        return {
            "repo_name": repo_name,
            "summary": content,
            "readme": "",
            "insights": [],
        }