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

    prompt = f"""You are a technical writer creating API reference documentation. Based on the detected routes below, write a clear API reference in markdown. For each route, infer its likely purpose from its HTTP method and path naming, using ## headings for each route grouped logically, showing the method and path, a one-sentence description of its likely purpose, and noting if it appears to require authentication (based on path naming like /auth, /login, or similar). Respond with ONLY the markdown documentation, no extra commentary before or after it.

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