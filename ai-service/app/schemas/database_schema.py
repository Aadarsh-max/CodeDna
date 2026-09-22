from pydantic import BaseModel


class DbRelationship(BaseModel):
    field: str
    references: str


class DbEntity(BaseModel):
    name: str
    file_path: str
    fields: list[str]
    relationships: list[DbRelationship]


class DbRelationshipEdge(BaseModel):
    source: str
    target: str
    field: str


class DatabaseSchemaResponse(BaseModel):
    entity_count: int
    entities: list[DbEntity]
    relationships: list[DbRelationshipEdge]