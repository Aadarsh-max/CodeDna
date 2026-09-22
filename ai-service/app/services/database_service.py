import re

SCHEMA_DECLARATION_PATTERN = re.compile(
    r'(?:const|let|var)\s+(\w+)\s*=\s*new\s+(?:mongoose\.)?Schema\s*\('
)

MODEL_DECLARATION_PATTERN = re.compile(
    r'mongoose\.model\s*\(\s*[\'"](\w+)[\'"]\s*,\s*(\w+)\s*\)'
)

FIELD_LINE_PATTERN = re.compile(r'^\s*([A-Za-z_]\w*)\s*:')
REF_PATTERN = re.compile(r'ref\s*:\s*[\'"](\w+)[\'"]')


def extract_balanced_braces(content: str, start_index: int) -> str | None:
    depth = 0
    for i in range(start_index, len(content)):
        if content[i] == "{":
            depth += 1
        elif content[i] == "}":
            depth -= 1
            if depth == 0:
                return content[start_index:i + 1]
    return None


def find_schema_bodies(content: str) -> dict[str, str]:
    bodies = {}
    for match in SCHEMA_DECLARATION_PATTERN.finditer(content):
        var_name = match.group(1)
        brace_start = content.find("{", match.end() - 1)
        if brace_start == -1:
            continue
        body = extract_balanced_braces(content, brace_start)
        if body:
            bodies[var_name] = body
    return bodies


def find_model_mappings(content: str) -> dict[str, str]:
    mappings = {}
    for match in MODEL_DECLARATION_PATTERN.finditer(content):
        model_name, var_name = match.groups()
        mappings[var_name] = model_name
    return mappings


def extract_fields_and_relationships(body: str) -> tuple[list[str], list[dict]]:
    fields = []
    relationships = []
    current_field = None

    for line in body.splitlines():
        field_match = FIELD_LINE_PATTERN.match(line)
        if field_match:
            current_field = field_match.group(1)
            if current_field not in fields:
                fields.append(current_field)

        ref_match = REF_PATTERN.search(line)
        if ref_match and current_field:
            relationships.append({"field": current_field, "references": ref_match.group(1)})

    return fields, relationships


def detect_database_schema(file_contents: dict[str, str]) -> dict:
    entities = []

    for file_path, content in file_contents.items():
        if "Schema" not in content:
            continue

        schema_bodies = find_schema_bodies(content)
        model_mappings = find_model_mappings(content)

        for var_name, body in schema_bodies.items():
            model_name = model_mappings.get(var_name, var_name)
            fields, relationships = extract_fields_and_relationships(body)
            if not fields:
                continue
            entities.append({
                "name": model_name,
                "file_path": file_path,
                "fields": fields,
                "relationships": relationships,
            })

    entity_names = {e["name"] for e in entities}
    edges = []
    for entity in entities:
        for rel in entity["relationships"]:
            if rel["references"] in entity_names:
                edges.append({"source": entity["name"], "target": rel["references"], "field": rel["field"]})

    return {
        "entity_count": len(entities),
        "entities": entities,
        "relationships": edges,
    }