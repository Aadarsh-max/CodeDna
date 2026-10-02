from pydantic import BaseModel


class PseudocodeExample(BaseModel):
    before: str
    after: str


class RefactorStep(BaseModel):
    target: str
    action: str
    description: str
    problem: str
    pseudocode: PseudocodeExample
    impactScore: float