import os
import re
import hashlib
from app.services.parser_service import SOURCE_EXTENSIONS

CHUNK_SIZE = 6
MIN_CHUNK_CHARS = 100
MAX_RESULTS = 100


def normalize_content(content: str, language: str) -> list[tuple[str, int]]:
    lines = content.splitlines()
    normalized = []
    for line_number, line in enumerate(lines, start=1):
        stripped = line.strip()
        if not stripped:
            continue
        if language == "python" and stripped.startswith("#"):
            continue
        if language in ("javascript", "typescript") and stripped.startswith("//"):
            continue
        collapsed = re.sub(r"\s+", " ", stripped)
        normalized.append((collapsed, line_number))
    return normalized


def hash_chunk(lines: list[str]) -> str:
    joined = "\n".join(lines)
    return hashlib.md5(joined.encode("utf-8")).hexdigest()


def extract_chunks(normalized: list[tuple[str, int]]) -> list[dict]:
    chunks = []
    for i in range(len(normalized) - CHUNK_SIZE + 1):
        window = normalized[i:i + CHUNK_SIZE]
        texts = [w[0] for w in window]
        if sum(len(t) for t in texts) < MIN_CHUNK_CHARS:
            continue
        chunks.append({
            "hash": hash_chunk(texts),
            "start_line": window[0][1],
            "end_line": window[-1][1],
        })
    return chunks


def detect_duplicates(file_contents: dict[str, str]) -> dict:
    hash_locations = {}

    for file_path, content in file_contents.items():
        extension = os.path.splitext(file_path)[1]
        language = SOURCE_EXTENSIONS.get(extension)
        if not language:
            continue

        normalized = normalize_content(content, language)
        for chunk in extract_chunks(normalized):
            hash_locations.setdefault(chunk["hash"], []).append({
                "file_path": file_path,
                "start_line": chunk["start_line"],
                "end_line": chunk["end_line"],
            })

    duplicate_groups = []
    for locations in hash_locations.values():
        if len(locations) < 2:
            continue
        distinct_files = {loc["file_path"] for loc in locations}
        if len(distinct_files) < 2:
            continue
        duplicate_groups.append({
            "lines_duplicated": CHUNK_SIZE,
            "occurrences": locations,
        })

    duplicate_groups.sort(key=lambda g: len(g["occurrences"]), reverse=True)

    return {
        "duplicate_block_count": len(duplicate_groups),
        "duplicates": duplicate_groups[:MAX_RESULTS],
    }