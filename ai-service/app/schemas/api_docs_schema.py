from pydantic import BaseModel


class ApiDocsResponse(BaseModel):
    repo_name: str
    total_routes: int
    documented_route_count: int
    api_reference: str