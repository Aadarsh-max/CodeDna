from fastapi import APIRouter, Request
from app.schemas.repo_schema import ParseRequest
from app.schemas.graph_schema import GraphResponse
from app.services.parser_service import parse_repository
from app.services.graph_service import build_graph, graph_to_json, detect_circular_dependencies
from app.utils.rate_limiter import limiter

router = APIRouter()


@router.post("/graph", response_model=GraphResponse)
@limiter.limit("15/minute")
def get_graph(request: Request, payload: ParseRequest):
    parsed = parse_repository(
        source=payload.source,
        github_url=payload.github_url,
        zip_path=payload.zip_path,
    )
    graph = build_graph(parsed["metrics"])
    graph_data = graph_to_json(graph)
    cycles = detect_circular_dependencies(graph)

    return {
        "repo_name": parsed["repo_name"],
        "nodes": graph_data["nodes"],
        "edges": graph_data["edges"],
        "circular_dependencies": cycles,
    }