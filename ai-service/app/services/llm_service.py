import json
from groq import Groq
import ollama
from app.utils.config import settings
from app.utils.logger import logger

_groq_client = None


def get_groq_client():
    global _groq_client
    if _groq_client is None:
        if not settings.groq_api_key:
            raise ValueError("GROQ_API_KEY is not set")
        _groq_client = Groq(api_key=settings.groq_api_key)
    return _groq_client


def call_llm(prompt: str) -> str:
    if settings.llm_provider == "groq":
        client = get_groq_client()
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2048,
        )
        return response.choices[0].message.content.strip()

    response = ollama.chat(
        model=settings.ollama_model,
        messages=[{"role": "user", "content": prompt}],
        options={"num_predict": 1500},
    )
    return response["message"]["content"].strip()


def build_repo_context(
    repo_name: str,
    metrics: list[dict],
    average_bug_probability: float,
    high_risk_file_count: int,
    average_maintainability: float,
    top_refactor_actions: list[str],
) -> str:
    total_files = len(metrics)
    avg_complexity = round(sum(m["complexity_score"] for m in metrics) / total_files, 2) if total_files else 0
    avg_loc = round(sum(m["lines_of_code"] for m in metrics) / total_files, 2) if total_files else 0

    languages = {}
    for m in metrics:
        languages[m["language"]] = languages.get(m["language"], 0) + 1

    top_complex = sorted(metrics, key=lambda m: m["complexity_score"], reverse=True)[:8]
    top_complex_lines = "\n".join(
        f"- {m['file_path']} (complexity: {m['complexity_score']}, lines: {m['lines_of_code']})"
        for m in top_complex
    )

    refactor_lines = "\n".join(f"- {action}" for action in top_refactor_actions) or "None"

    return f"""Repository: {repo_name}
Total files analyzed: {total_files}
Average complexity score: {avg_complexity}
Average lines of code per file: {avg_loc}
Language breakdown: {languages}
Average bug probability across repository: {round(average_bug_probability * 100, 1)}%
High risk files: {high_risk_file_count}
Average maintainability score (0-100): {average_maintainability}

Most complex files:
{top_complex_lines}

Top suggested refactoring actions:
{refactor_lines}"""


def generate_documentation(
    repo_name: str,
    metrics: list[dict],
    average_bug_probability: float,
    high_risk_file_count: int,
    average_maintainability: float,
    top_refactor_actions: list[str],
) -> dict:
    context = build_repo_context(
        repo_name, metrics, average_bug_probability, high_risk_file_count, average_maintainability, top_refactor_actions
    )

    prompt = f"""You are a senior software architect writing a detailed technical report on a codebase. Based on the data below, respond ONLY with valid JSON, no markdown formatting, no extra text, in this exact shape:

{{
  "summary": "a detailed 4-6 sentence overview of what this project is, its purpose, and its overall structure",
  "architecture_overview": "10-15 sentences describing how the codebase is organized, based on the file and language data given",
  "quality_assessment": "5-10 sentences honestly assessing code quality, maintainability, and risk based on the specific numbers given, referencing the actual maintainability score and bug probability",
  "readme": "a full README in markdown with ## headings for Overview, Features, Installation, Usage, and Project Structure",
  "insights": ["at least 6 specific, detailed insights about this codebase, each 1-2 sentences, referencing actual file names and numbers where relevant"],
  "recommendations": "10-15 sentences of prioritized, actionable recommendations for improving this codebase, referencing the suggested refactoring actions given"
}}

Codebase data:
{context}"""

    try:
        content = call_llm(prompt)
    except Exception as error:
        logger.error(f"LLM generation failed, returning fallback: {error}")
        return {
            "repo_name": repo_name,
            "summary": "AI-generated documentation is temporarily unavailable for this analysis.",
            "architecture_overview": "",
            "quality_assessment": "",
            "readme": "",
            "insights": [],
            "recommendations": "",
        }

    try:
        parsed = json.loads(content)
        return {
            "repo_name": repo_name,
            "summary": parsed.get("summary", ""),
            "architecture_overview": parsed.get("architecture_overview", ""),
            "quality_assessment": parsed.get("quality_assessment", ""),
            "readme": parsed.get("readme", ""),
            "insights": parsed.get("insights", []),
            "recommendations": parsed.get("recommendations", ""),
        }
    except json.JSONDecodeError:
        return {
            "repo_name": repo_name,
            "summary": content,
            "architecture_overview": "",
            "quality_assessment": "",
            "readme": "",
            "insights": [],
            "recommendations": "",
        }