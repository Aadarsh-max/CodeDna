from fastapi import APIRouter
from app.schemas.repo_schema import ParseRequest
from app.schemas.graph_schema import GraphResponse
from app.services.parser_service import parse_repository
from app.services.graph_service import build_graph, graph_to_json, detect_circular_dependencies

router = APIRouter()


@router.post("/graph", response_model=GraphResponse)
def get_graph(request: ParseRequest):
    parsed = parse_repository(
        source=request.source,
        github_url=request.github_url,
        zip_path=request.zip_path,
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