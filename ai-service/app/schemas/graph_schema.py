from pydantic import BaseModel


class GraphNode(BaseModel):
    id: str
    language: str
    lines_of_code: int
    function_count: int
    complexity_score: int


class GraphEdge(BaseModel):
    source: str
    target: str


class GraphResponse(BaseModel):
    repo_name: str
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    circular_dependencies: list[list[str]]