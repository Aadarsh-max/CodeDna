import os
import re
from app.services.parser_service import SOURCE_EXTENSIONS

EXPORT_PATTERNS = {
    "javascript": [
        re.compile(r'export\s+function\s+([A-Za-z_$][\w$]*)'),
        re.compile(r'export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*='),
        re.compile(r'export\s+class\s+([A-Za-z_$][\w$]*)'),
        re.compile(r'module\.exports\.([A-Za-z_$][\w$]*)\s*='),
        re.compile(r'exports\.([A-Za-z_$][\w$]*)\s*='),
    ],
    "typescript": [
        re.compile(r'export\s+function\s+([A-Za-z_$][\w$]*)'),
        re.compile(r'export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*='),
        re.compile(r'export\s+class\s+([A-Za-z_$][\w$]*)'),
        re.compile(r'export\s+interface\s+([A-Za-z_$][\w$]*)'),
    ],
    "python": [
        re.compile(r'^def\s+([A-Za-z_]\w*)\s*\(', re.MULTILINE),
    ],
}

EXCLUDED_NAMES = {"default", "handler", "index", "main"}


def extract_exports(content: str, language: str) -> list[str]:
    patterns = EXPORT_PATTERNS.get(language, [])
    names = set()
    for pattern in patterns:
        for match in pattern.finditer(content):
            name = match.group(1)
            if name and name not in EXCLUDED_NAMES and len(name) > 1:
                names.add(name)
    return sorted(names)


def find_dead_exports(file_contents: dict[str, str]) -> dict:
    exports_by_file = {}
    for file_path, content in file_contents.items():
        extension = os.path.splitext(file_path)[1]
        language = SOURCE_EXTENSIONS.get(extension)
        if not language:
            continue
        exports = extract_exports(content, language)
        if exports:
            exports_by_file[file_path] = exports

    dead_exports = []

    for file_path, names in exports_by_file.items():
        for name in names:
            usage_pattern = re.compile(r'\b' + re.escape(name) + r'\b')
            used_elsewhere = any(
                usage_pattern.search(other_content)
                for other_path, other_content in file_contents.items()
                if other_path != file_path
            )
            if not used_elsewhere:
                dead_exports.append({"file_path": file_path, "export_name": name})

    return {
        "possibly_unused_count": len(dead_exports),
        "possibly_unused_exports": dead_exports,
    }