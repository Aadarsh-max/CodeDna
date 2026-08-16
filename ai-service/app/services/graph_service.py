import posixpath
import networkx as nx


def resolve_js_import(source_file: str, import_target: str, known_files: set[str]) -> str | None:
    if not import_target.startswith("."):
        return None

    source_dir = posixpath.dirname(source_file)
    resolved = posixpath.normpath(posixpath.join(source_dir, import_target))

    candidates = [
        resolved,
        f"{resolved}.js", f"{resolved}.jsx", f"{resolved}.ts", f"{resolved}.tsx",
        f"{resolved}/index.js", f"{resolved}/index.jsx", f"{resolved}/index.ts", f"{resolved}/index.tsx",
    ]

    for candidate in candidates:
        if candidate in known_files:
            return candidate
    return None


def resolve_python_import(source_file: str, import_target: str, known_files: set[str]) -> str | None:
    if not import_target.startswith("."):
        return None

    source_dir = posixpath.dirname(source_file)
    level = len(import_target) - len(import_target.lstrip("."))
    module_part = import_target.lstrip(".").replace(".", "/")

    base_dir = source_dir
    for _ in range(level - 1):
        base_dir = posixpath.dirname(base_dir)

    resolved = posixpath.normpath(posixpath.join(base_dir, module_part)) if module_part else base_dir

    candidates = [f"{resolved}.py", f"{resolved}/__init__.py"]

    for candidate in candidates:
        if candidate in known_files:
            return candidate
    return None


def build_graph(metrics: list[dict]) -> nx.DiGraph:
    graph = nx.DiGraph()
    known_files = {m["file_path"] for m in metrics}

    for m in metrics:
        graph.add_node(
            m["file_path"],
            language=m["language"],
            lines_of_code=m["lines_of_code"],
            function_count=m["function_count"],
            complexity_score=m["complexity_score"],
        )

    for m in metrics:
        for target in m.get("imports", []):
            resolved = None
            if m["language"] in ("javascript", "typescript"):
                resolved = resolve_js_import(m["file_path"], target, known_files)
            elif m["language"] == "python":
                resolved = resolve_python_import(m["file_path"], target, known_files)

            if resolved and resolved != m["file_path"]:
                graph.add_edge(m["file_path"], resolved)

    return graph


def graph_to_json(graph: nx.DiGraph) -> dict:
    nodes = [{"id": node, **data} for node, data in graph.nodes(data=True)]
    edges = [{"source": source, "target": target} for source, target in graph.edges()]
    return {"nodes": nodes, "edges": edges}


def get_dependencies(graph: nx.DiGraph, file_path: str) -> list[str]:
    return list(graph.successors(file_path))


def get_dependents(graph: nx.DiGraph, file_path: str) -> list[str]:
    return list(graph.predecessors(file_path))


def find_impact_path(graph: nx.DiGraph, source: str, target: str) -> list[str]:
    try:
        return nx.shortest_path(graph, source=source, target=target)
    except (nx.NetworkXNoPath, nx.NodeNotFound):
        return []


def detect_circular_dependencies(graph: nx.DiGraph) -> list[list[str]]:
    return list(nx.simple_cycles(graph))