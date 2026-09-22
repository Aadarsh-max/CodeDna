import re

FIELD_LINE_PATTERN = re.compile(r'^\s*([A-Za-z_]\w*)\s*:')

MONGOOSE_SCHEMA_DECLARATION_PATTERN = re.compile(
    r'(?:const|let|var)\s+(\w+)\s*=\s*new\s+(?:mongoose\.)?Schema\s*\('
)
MONGOOSE_MODEL_PATTERN = re.compile(r'mongoose\.model\s*\(\s*[\'"](\w+)[\'"]\s*,\s*(\w+)\s*\)')
MONGOOSE_REF_PATTERN = re.compile(r'ref\s*:\s*[\'"](\w+)[\'"]')

SEQUELIZE_DEFINE_PATTERN = re.compile(r'\w+\.define\s*\(\s*[\'"](\w+)[\'"]\s*,\s*\{')
SEQUELIZE_CLASS_PATTERN = re.compile(r'class\s+(\w+)\s+extends\s+Model\b')
SEQUELIZE_ASSOCIATION_PATTERN = re.compile(r'\b(\w+)\.(belongsTo|hasMany|hasOne|belongsToMany)\s*\(\s*(\w+)')

DJANGO_MODEL_CLASS_PATTERN = re.compile(r'class\s+(\w+)\s*\(\s*models\.Model\s*\)\s*:')
DJANGO_FIELD_PATTERN = re.compile(r'^\s*(\w+)\s*=\s*models\.(\w+)\s*\(([^)]*)\)', re.MULTILINE)
DJANGO_RELATION_TYPES = {"ForeignKey", "OneToOneField", "ManyToManyField"}
DJANGO_TARGET_PATTERN = re.compile(r"^\s*['\"]?(\w+)['\"]?")

SQLALCHEMY_CLASS_PATTERN = re.compile(r'class\s+(\w+)\s*\(\s*Base\s*\)\s*:')
SQLALCHEMY_COLUMN_PATTERN = re.compile(r'^\s*(\w+)\s*=\s*Column\s*\(', re.MULTILINE)
SQLALCHEMY_RELATIONSHIP_PATTERN = re.compile(r"relationship\s*\(\s*['\"](\w+)['\"]")
SQLALCHEMY_FK_PATTERN = re.compile(r"ForeignKey\s*\(\s*['\"](\w+)\.")


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


def extract_python_class_body(content: str, class_line_start: int) -> str:
    lines = content[class_line_start:].splitlines()
    if not lines:
        return ""
    header_indent = len(lines[0]) - len(lines[0].lstrip())
    body_lines = [lines[0]]
    for line in lines[1:]:
        if not line.strip():
            body_lines.append(line)
            continue
        if len(line) - len(line.lstrip()) <= header_indent:
            break
        body_lines.append(line)
    return "\n".join(body_lines)


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

        ref_match = MONGOOSE_REF_PATTERN.search(line)
        if ref_match and current_field:
            relationships.append({"field": current_field, "references": ref_match.group(1)})

    return fields, relationships


def extract_mongoose_entities(file_path: str, content: str) -> list[dict]:
    if "Schema" not in content:
        return []

    entities = []
    schema_bodies = {}
    for match in MONGOOSE_SCHEMA_DECLARATION_PATTERN.finditer(content):
        var_name = match.group(1)
        brace_start = content.find("{", match.end() - 1)
        if brace_start == -1:
            continue
        body = extract_balanced_braces(content, brace_start)
        if body:
            schema_bodies[var_name] = body

    model_mappings = {}
    for match in MONGOOSE_MODEL_PATTERN.finditer(content):
        model_name, var_name = match.groups()
        model_mappings[var_name] = model_name

    for var_name, body in schema_bodies.items():
        model_name = model_mappings.get(var_name, var_name)
        fields, relationships = extract_fields_and_relationships(body)
        if fields:
            entities.append({"name": model_name, "file_path": file_path, "fields": fields, "relationships": relationships})

    return entities


def extract_sequelize_entities(file_path: str, content: str) -> list[dict]:
    if ".define(" not in content and "extends Model" not in content:
        return []

    entities = []
    seen_names = set()

    for match in SEQUELIZE_DEFINE_PATTERN.finditer(content):
        model_name = match.group(1)
        brace_start = content.find("{", match.end() - 1)
        if brace_start == -1:
            continue
        body = extract_balanced_braces(content, brace_start)
        if not body:
            continue
        fields, _ = extract_fields_and_relationships(body)
        if fields and model_name not in seen_names:
            entities.append({"name": model_name, "file_path": file_path, "fields": fields, "relationships": []})
            seen_names.add(model_name)

    for match in SEQUELIZE_CLASS_PATTERN.finditer(content):
        name = match.group(1)
        if name not in seen_names:
            entities.append({"name": name, "file_path": file_path, "fields": [], "relationships": []})
            seen_names.add(name)

    for match in SEQUELIZE_ASSOCIATION_PATTERN.finditer(content):
        source, assoc_type, target = match.groups()
        for entity in entities:
            if entity["name"] == source:
                entity["relationships"].append({"field": assoc_type, "references": target})

    return entities


def extract_django_entities(file_path: str, content: str) -> list[dict]:
    if "models.Model" not in content:
        return []

    entities = []
    for match in DJANGO_MODEL_CLASS_PATTERN.finditer(content):
        name = match.group(1)
        body = extract_python_class_body(content, match.start())
        fields = []
        relationships = []

        for field_match in DJANGO_FIELD_PATTERN.finditer(body):
            field_name, field_type, field_args = field_match.groups()
            fields.append(field_name)
            if field_type in DJANGO_RELATION_TYPES:
                target_match = DJANGO_TARGET_PATTERN.match(field_args)
                if target_match:
                    target = target_match.group(1)
                    if target not in ("self", "settings"):
                        relationships.append({"field": field_name, "references": target})

        if fields:
            entities.append({"name": name, "file_path": file_path, "fields": fields, "relationships": relationships})

    return entities


def extract_sqlalchemy_entities(file_path: str, content: str) -> list[dict]:
    if "Column(" not in content or "Base" not in content:
        return []

    entities = []
    for match in SQLALCHEMY_CLASS_PATTERN.finditer(content):
        name = match.group(1)
        body = extract_python_class_body(content, match.start())
        fields = [m.group(1) for m in SQLALCHEMY_COLUMN_PATTERN.finditer(body)]
        relationships = []

        for rel_match in SQLALCHEMY_RELATIONSHIP_PATTERN.finditer(body):
            relationships.append({"field": "relationship", "references": rel_match.group(1)})
        for fk_match in SQLALCHEMY_FK_PATTERN.finditer(body):
            relationships.append({"field": "foreign_key", "references": fk_match.group(1)})

        if fields:
            entities.append({"name": name, "file_path": file_path, "fields": fields, "relationships": relationships})

    return entities


def detect_database_schema(file_contents: dict[str, str]) -> dict:
    entities = []

    for file_path, content in file_contents.items():
        extension = file_path.rsplit(".", 1)[-1] if "." in file_path else ""

        if extension in ("js", "jsx", "ts", "tsx"):
            entities.extend(extract_mongoose_entities(file_path, content))
            entities.extend(extract_sequelize_entities(file_path, content))
        elif extension == "py":
            entities.extend(extract_django_entities(file_path, content))
            entities.extend(extract_sqlalchemy_entities(file_path, content))

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