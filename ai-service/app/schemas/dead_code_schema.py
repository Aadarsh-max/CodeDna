from pydantic import BaseModel


class UnusedExport(BaseModel):
    file_path: str
    export_name: str


class DeadCodeResponse(BaseModel):
    possibly_unused_count: int
    possibly_unused_exports: list[UnusedExport]