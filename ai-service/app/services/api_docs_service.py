from app.services.llm_service import call_llm
from app.utils.logger import logger

MAX_ROUTES_FOR_DOCS = 40


def build_routes_context(repo_name: str, routes: list[dict]) -> str:
    limited = routes[:MAX_ROUTES_FOR_DOCS]
    lines = "\n".join(f"- {r['method']} {r['path']} (defined in {r['file_path']})" for r in limited)
    return f"Repository: {repo_name}\nDetected API routes:\n{lines}"


def generate_api_documentation(repo_name: str, routes: list[dict]) -> dict:
    if not routes:
        return {
            "repo_name": repo_name,
            "total_routes": 0,
            "documented_route_count": 0,
            "api_reference": "",
        }

    context = build_routes_context(repo_name, routes)
    limited_count = min(len(routes), MAX_ROUTES_FOR_DOCS)

    prompt = f"""You are a technical writer creating API reference documentation. Based on the detected routes below, write API reference documentation in markdown using this EXACT structure and nothing else:

For each logical group of related routes, write a ## heading naming the group, then IMMEDIATELY a markdown table with this exact header row:

| Method | Path | Description | Auth Required |
|--------|------|--------------|----------------|

Each row must have exactly four cells. Keep Description to one short sentence. Auth Required must be either "Yes" or "No" only, never a longer explanation. Do not write any paragraphs, bullet lists, or narrative text anywhere in the output — every route must appear as one row in one of these tables, with no exceptions. Do not add any text before the first heading or after the last table.

{context}"""

    try:
        content = call_llm(prompt)
    except Exception as error:
        logger.error(f"API documentation generation failed: {error}")
        content = "AI-generated API documentation is temporarily unavailable for this analysis."

    return {
        "repo_name": repo_name,
        "total_routes": len(routes),
        "documented_route_count": limited_count,
        "api_reference": content,
    }