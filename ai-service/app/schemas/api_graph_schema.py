from pydantic import BaseModel


class ApiRoute(BaseModel):
    file_path: str
    method: str
    path: str
    line: int


class ApiGraphNode(BaseModel):
    id: str
    route_count: int
    routes: list[ApiRoute]


class ApiGraphEdge(BaseModel):
    source: str
    target: str


class ApiGraphResponse(BaseModel):
    total_routes: int
    route_file_count: int
    nodes: list[ApiGraphNode]
    edges: list[ApiGraphEdge]
    all_routes: list[ApiRoute]