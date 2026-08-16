import os
import re
import shutil
import subprocess
import tempfile
import zipfile

SOURCE_EXTENSIONS = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".py": "python",
}

IGNORED_DIRS = {"node_modules", ".git", "dist", "build", "__pycache__", "venv", ".venv"}

FUNCTION_PATTERNS = {
    "javascript": r"function\s+\w+|\w+\s*=\s*\([^)]*\)\s*=>|\w+\s*\([^)]*\)\s*{",
    "typescript": r"function\s+\w+|\w+\s*=\s*\([^)]*\)\s*=>|\w+\s*\([^)]*\)\s*{",
    "python": r"def\s+\w+",
}

IMPORT_PATTERNS = {
    "javascript": r"^\s*(import\s+.+from|require\()",
    "typescript": r"^\s*(import\s+.+from|require\()",
    "python": r"^\s*(import\s+\w+|from\s+\w+\s+import)",
}

COMPLEXITY_KEYWORDS = [
    r"\bif\b", r"\belse\b", r"\bfor\b", r"\bwhile\b", r"\bcase\b",
    r"\bcatch\b", r"\belif\b", r"&&", r"\|\|", r"\?",
]


def clone_repository(github_url: str) -> str:
    temp_dir = tempfile.mkdtemp(prefix="codedna_")
    subprocess.run(
        ["git", "clone", "--depth", "1", github_url, temp_dir],
        check=True,
        capture_output=True,
    )
    return temp_dir


def extract_zip(zip_path: str) -> str:
    temp_dir = tempfile.mkdtemp(prefix="codedna_")
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(temp_dir)
    return temp_dir


def collect_source_files(root_dir: str) -> list[str]:
    matched_files = []
    for current_dir, sub_dirs, files in os.walk(root_dir):
        sub_dirs[:] = [d for d in sub_dirs if d not in IGNORED_DIRS]
        for file_name in files:
            extension = os.path.splitext(file_name)[1]
            if extension in SOURCE_EXTENSIONS:
                matched_files.append(os.path.join(current_dir, file_name))
    return matched_files

def extract_import_targets(content: str, language: str) -> list[str]:
    if language in ("javascript", "typescript"):
        pattern = r'''(?:import\s+(?:[\w*{}\s,]+from\s+)?|require\(\s*)['"]([^'"]+)['"]'''
        return re.findall(pattern, content)
    if language == "python":
        targets = []
        for match in re.finditer(r"^\s*from\s+([.\w]+)\s+import", content, re.MULTILINE):
            targets.append(match.group(1))
        for match in re.finditer(r"^\s*import\s+([.\w]+)", content, re.MULTILINE):
            targets.append(match.group(1))
        return targets
    return []

def compute_file_metrics(file_path: str, root_dir: str) -> dict:
    extension = os.path.splitext(file_path)[1]
    language = SOURCE_EXTENSIONS[extension]

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()

    code_lines = [line for line in lines if line.strip()]
    content = "".join(lines)

    function_count = len(re.findall(FUNCTION_PATTERNS[language], content))
    import_count = len(re.findall(IMPORT_PATTERNS[language], content, re.MULTILINE))
    import_targets = extract_import_targets(content, language)

    complexity_score = 1
    for pattern in COMPLEXITY_KEYWORDS:
        complexity_score += len(re.findall(pattern, content))

    relative_path = os.path.relpath(file_path, root_dir)

    return {
        "file_path": relative_path.replace("\\", "/"),
        "language": language,
        "lines_of_code": len(code_lines),
        "function_count": function_count,
        "import_count": import_count,
        "imports": import_targets,
        "complexity_score": complexity_score,
    }


def parse_repository(source: str, github_url: str | None, zip_path: str | None) -> dict:
    if source == "github":
        root_dir = clone_repository(github_url)
    elif source == "zip":
        root_dir = extract_zip(zip_path)
    else:
        raise ValueError("Invalid source type")

    try:
        source_files = collect_source_files(root_dir)
        metrics = [compute_file_metrics(f, root_dir) for f in source_files]
        repo_name = os.path.basename(github_url.rstrip("/")) if github_url else os.path.basename(zip_path)

        return {
            "repo_name": repo_name,
            "total_files": len(metrics),
            "metrics": metrics,
        }
    finally:
        shutil.rmtree(root_dir, ignore_errors=True)