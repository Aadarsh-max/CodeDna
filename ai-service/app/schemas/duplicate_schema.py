from pydantic import BaseModel


class DuplicateOccurrence(BaseModel):
    file_path: str
    start_line: int
    end_line: int


class DuplicateBlock(BaseModel):
    lines_duplicated: int
    occurrences: list[DuplicateOccurrence]


class DuplicateScanResponse(BaseModel):
    duplicate_block_count: int
    duplicates: list[DuplicateBlock]