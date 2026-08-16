from pydantic import BaseModel


class RefactorStep(BaseModel):
    target: str
    action: str
    description: str
    impactScore: float