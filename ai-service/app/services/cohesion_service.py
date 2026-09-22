import os
import re
from app.services.parser_service import SOURCE_EXTENSIONS

FUNCTION_PATTERNS = [
    re.compile(r'function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{'),
    re.compile(r'(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*\w+\s*)?=>\s*\{'),
    re.compile(r'(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?function\s*\([^)]*\)\s*\{'),
]

MODULE_VAR_PATTERN = re.compile(r'^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=', re.MULTILINE)

COHESION_SUPPORTED_LANGUAGES = {"javascript", "typescript"}
MIN_FUNCTIONS_REQUIRED = 2
MIN_SHARED_VARS_REQUIRED = 1


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


def extract_functions(content: str) -> list[dict]:
    functions = []
    seen_spans = []

    for pattern in FUNCTION_PATTERNS:
        for match in pattern.finditer(content):
            name = match.group(1)
            brace_start = match.end() - 1
            if any(brace_start >= s and brace_start < e for s, e in seen_spans):
                continue
            body = extract_balanced_braces(content, brace_start)
            if body:
                functions.append({"name": name, "body": body})
                seen_spans.append((brace_start, brace_start + len(body)))

    return functions


def extract_module_vars(content: str, before_index: int) -> list[str]:
    header = content[:before_index] if before_index > 0 else content
    return sorted(set(MODULE_VAR_PATTERN.findall(header)))


def compute_file_cohesion(file_path: str, content: str, language: str) -> dict | None:
    if language not in COHESION_SUPPORTED_LANGUAGES:
        return None

    functions = extract_functions(content)
    if len(functions) < MIN_FUNCTIONS_REQUIRED:
        return None

    first_function_index = content.find(functions[0]["name"])
    shared_vars = extract_module_vars(content, first_function_index)
    if len(shared_vars) < MIN_SHARED_VARS_REQUIRED:
        return None

    usage_sets = []
    for func in functions:
        used = {var for var in shared_vars if re.search(r'\b' + re.escape(var) + r'\b', func["body"])}
        usage_sets.append(used)

    sharing_pairs = 0
    total_pairs = 0
    for i in range(len(usage_sets)):
        for j in range(i + 1, len(usage_sets)):
            total_pairs += 1
            if usage_sets[i] & usage_sets[j]:
                sharing_pairs += 1

    if total_pairs == 0:
        return None

    cohesion_score = round((sharing_pairs / total_pairs) * 100, 1)

    return {
        "file_path": file_path,
        "function_count": len(functions),
        "shared_state_vars": len(shared_vars),
        "cohesion_score": cohesion_score,
    }


def analyze_cohesion(file_contents: dict[str, str]) -> dict:
    results = []
    skipped_count = 0

    for file_path, content in file_contents.items():
        extension = os.path.splitext(file_path)[1]
        language = SOURCE_EXTENSIONS.get(extension)
        if not language:
            continue

        result = compute_file_cohesion(file_path, content, language)
        if result:
            results.append(result)
        else:
            skipped_count += 1

    results.sort(key=lambda r: r["cohesion_score"])
    low_cohesion_files = [r for r in results if r["cohesion_score"] < 25]

    return {
        "analyzed_file_count": len(results),
        "skipped_file_count": skipped_count,
        "low_cohesion_file_count": len(low_cohesion_files),
        "files": results,
    }