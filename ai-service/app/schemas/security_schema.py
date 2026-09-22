from pydantic import BaseModel


class SecurityIssue(BaseModel):
    file_path: str
    line: int
    rule_id: str
    title: str
    severity: str
    description: str
    snippet: str


class SecurityScanResponse(BaseModel):
    total_issues: int
    high_severity_count: int
    medium_severity_count: int
    issues: list[SecurityIssue]