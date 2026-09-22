import os
import re
from app.services.parser_service import SOURCE_EXTENSIONS

EXPRESS_ROUTE_PATTERN = re.compile(
    r'\b(?:app|\w*[Rr]out(?:er|e)s?)\.(get|post|put|delete|patch|all)\s*\(\s*[\'"`]([^\'"`]+)[\'"`]'
)

ROUTE_BUILDER_PATTERN = re.compile(
    r'\.route\s*\(\s*[\'"`]([^\'"`]+)[\'"`]\s*\)((?:\s*\.\s*(?:get|post|put|delete|patch|all)\s*\([^()]*(?:\([^()]*\)[^()]*)*\))+)',
    re.DOTALL
)
CHAIN_METHOD_PATTERN = re.compile(r'\.\s*(get|post|put|delete|patch|all)\s*\(')

NESTJS_CONTROLLER_PATTERN = re.compile(r"@Controller\s*\(\s*(?:['\"`]([^'\"`]*)['\"`])?\s*\)")
NESTJS_METHOD_PATTERN = re.compile(r"@(Get|Post|Put|Delete|Patch|All)\s*\(\s*(?:['\"`]([^'\"`]*)['\"`])?\s*\)")

FASTAPI_ROUTE_PATTERN = re.compile(
    r'@(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*[\'"`]([^\'"`]+)[\'"`]'
)

FLASK_ROUTE_PATTERN = re.compile(
    r'@\w+\.route\s*\(\s*[\'"`]([^\'"`]+)[\'"`](?:[^)]*methods\s*=\s*\[([^\]]*)\])?'
)

DJANGO_URL_PATTERN = re.compile(r"\b(?:path|re_path|url)\s*\(\s*r?['\"]([^'\"]*)['\"]")


def extract_express_and_builder_routes(file_path: str, content: str) -> list[dict]:
    routes = []
    lines = content.splitlines()

    for line_number, line in enumerate(lines, start=1):
        for match in EXPRESS_ROUTE_PATTERN.finditer(line):
            method, path = match.groups()
            routes.append({"file_path": file_path, "method": method.upper(), "path": path, "line": line_number})

    for match in ROUTE_BUILDER_PATTERN.finditer(content):
        path, chain = match.groups()
        line_number = content[:match.start()].count("\n") + 1
        for method in CHAIN_METHOD_PATTERN.findall(chain):
            routes.append({"file_path": file_path, "method": method.upper(), "path": path, "line": line_number})

    return routes


def extract_nestjs_routes(file_path: str, content: str) -> list[dict]:
    routes = []
    controller_prefix = ""
    lines = content.splitlines()

    for line_number, line in enumerate(lines, start=1):
        controller_match = NESTJS_CONTROLLER_PATTERN.search(line)
        if controller_match:
            controller_prefix = controller_match.group(1) or ""

        method_match = NESTJS_METHOD_PATTERN.search(line)
        if method_match:
            method, sub_path = method_match.groups()
            sub_path = sub_path or ""
            segments = [p.strip("/") for p in [controller_prefix, sub_path] if p]
            full_path = "/" + "/".join(segments) if segments else "/"
            routes.append({"file_path": file_path, "method": method.upper(), "path": full_path, "line": line_number})

    return routes


def extract_fastapi_flask_routes(file_path: str, content: str) -> list[dict]:
    routes = []
    lines = content.splitlines()

    for line_number, line in enumerate(lines, start=1):
        for match in FASTAPI_ROUTE_PATTERN.finditer(line):
            method, path = match.groups()
            routes.append({"file_path": file_path, "method": method.upper(), "path": path, "line": line_number})

        for match in FLASK_ROUTE_PATTERN.finditer(line):
            path, methods_str = match.groups()
            methods = [m.strip().strip("'\"") for m in methods_str.split(",")] if methods_str else ["GET"]
            for method in methods:
                routes.append({"file_path": file_path, "method": method.upper(), "path": path, "line": line_number})

    return routes


def extract_django_routes(file_path: str, content: str) -> list[dict]:
    routes = []
    lines = content.splitlines()

    for line_number, line in enumerate(lines, start=1):
        for match in DJANGO_URL_PATTERN.finditer(line):
            path = match.group(1)
            routes.append({"file_path": file_path, "method": "ANY", "path": "/" + path.lstrip("/"), "line": line_number})

    return routes


def extract_routes_from_file(file_path: str, content: str, language: str) -> list[dict]:
    routes = []

    if language in ("javascript", "typescript"):
        routes.extend(extract_express_and_builder_routes(file_path, content))
        routes.extend(extract_nestjs_routes(file_path, content))

    elif language == "python":
        routes.extend(extract_fastapi_flask_routes(file_path, content))
        routes.extend(extract_django_routes(file_path, content))

    return routes


def extract_all_routes(file_contents: dict[str, str]) -> list[dict]:
    all_routes = []
    for file_path, content in file_contents.items():
        extension = os.path.splitext(file_path)[1]
        language = SOURCE_EXTENSIONS.get(extension)
        if not language:
            continue
        all_routes.extend(extract_routes_from_file(file_path, content, language))
    return all_routes


def build_api_graph(routes: list[dict], dependency_graph: dict) -> dict:
    routes_by_file = {}
    for route in routes:
        routes_by_file.setdefault(route["file_path"], []).append(route)

    route_file_ids = set(routes_by_file.keys())

    nodes = [
        {"id": file_id, "route_count": len(routes_by_file[file_id]), "routes": routes_by_file[file_id]}
        for file_id in route_file_ids
    ]

    edges = [
        {"source": edge["source"], "target": edge["target"]}
        for edge in dependency_graph["edges"]
        if edge["source"] in route_file_ids and edge["target"] in route_file_ids
    ]

    return {
        "total_routes": len(routes),
        "route_file_count": len(route_file_ids),
        "nodes": nodes,
        "edges": edges,
        "all_routes": routes,
    }