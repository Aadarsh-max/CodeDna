from fastapi import APIRouter, Request
from app.schemas.repo_schema import ParseRequest
from app.schemas.api_graph_schema import ApiGraphResponse
from app.services.parser_service import parse_repository, read_repository_files
from app.services.graph_service import build_graph, graph_to_json
from app.services.api_service import extract_all_routes, build_api_graph
from app.utils.rate_limiter import limiter

router = APIRouter()


@router.post("/api-graph", response_model=ApiGraphResponse)
@limiter.limit("15/minute")
def get_api_graph(request: Request, payload: ParseRequest):
    parsed = parse_repository(
        source=payload.source,
        github_url=payload.github_url,
        zip_path=payload.zip_path,
    )
    file_contents = read_repository_files(
        source=payload.source,
        github_url=payload.github_url,
        zip_path=payload.zip_path,
    )

    dependency_graph = build_graph(parsed["metrics"])
    dependency_graph_json = graph_to_json(dependency_graph)

    routes = extract_all_routes(file_contents)
    return build_api_graph(routes, dependency_graph_json)