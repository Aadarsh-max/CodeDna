from pydantic import BaseModel


class FileCohesion(BaseModel):
    file_path: str
    function_count: int
    shared_state_vars: int
    cohesion_score: float


class CohesionResponse(BaseModel):
    analyzed_file_count: int
    skipped_file_count: int
    low_cohesion_file_count: int
    files: list[FileCohesion]