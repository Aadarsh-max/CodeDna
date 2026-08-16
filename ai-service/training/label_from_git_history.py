import sys
import os
import re
import csv
import shutil
import subprocess
import tempfile

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.services.parser_service import collect_source_files, compute_file_metrics

TRAINING_REPOS = [
    "https://github.com/expressjs/express",
    "https://github.com/expressjs/cors",
    "https://github.com/expressjs/morgan",
    "https://github.com/expressjs/session",
    "https://github.com/jshttp/body-parser",
    "https://github.com/chalk/chalk",
    "https://github.com/axios/axios",
    "https://github.com/lodash/lodash",
    "https://github.com/sindresorhus/got",
    "https://github.com/visionmedia/debug",
    "https://github.com/mochajs/mocha",
    "https://github.com/chaijs/chai",
    "https://github.com/tj/commander.js",
    "https://github.com/moment/moment",
    "https://github.com/socketio/socket.io",
    "https://github.com/colinhacks/zod",
    "https://github.com/pmndrs/zustand",
    "https://github.com/typestack/class-validator",
]

FIX_KEYWORDS = re.compile(r"\b(fix|bug|error|crash|patch|issue|broken)\b", re.IGNORECASE)

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "data", "processed", "training_data.csv")


def clone_for_training(repo_url: str) -> str:
    temp_dir = tempfile.mkdtemp(prefix="codedna_train_")
    subprocess.run(
        ["git", "clone", "--depth", "1000", repo_url, temp_dir],
        check=True,
        capture_output=True,
    )
    return temp_dir


def get_file_commit_stats(repo_dir: str) -> dict:
    result = subprocess.run(
        ["git", "-C", repo_dir, "log", "--pretty=format:COMMIT|%s", "--name-only"],
        check=True,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
    )

    stats = {}
    current_is_fix = False

    for line in result.stdout.splitlines():
        if line.startswith("COMMIT|"):
            subject = line[len("COMMIT|"):]
            current_is_fix = bool(FIX_KEYWORDS.search(subject))
        elif line.strip():
            file_path = line.strip()
            if file_path not in stats:
                stats[file_path] = {"total": 0, "fixes": 0}
            stats[file_path]["total"] += 1
            if current_is_fix:
                stats[file_path]["fixes"] += 1

    return stats


def label_file(file_path: str, commit_stats: dict) -> int:
    stats = commit_stats.get(file_path)
    if not stats or stats["total"] == 0:
        return 0

    fix_ratio = stats["fixes"] / stats["total"]
    if stats["fixes"] >= 2 and fix_ratio >= 0.3:
        return 1
    return 0


def build_dataset_for_repo(repo_url: str) -> list[dict]:
    repo_dir = clone_for_training(repo_url)

    try:
        commit_stats = get_file_commit_stats(repo_dir)
        source_files = collect_source_files(repo_dir)

        rows = []
        for file_path in source_files:
            metrics = compute_file_metrics(file_path, repo_dir)
            label = label_file(metrics["file_path"], commit_stats)
            rows.append({
                "complexity_score": metrics["complexity_score"],
                "lines_of_code": metrics["lines_of_code"],
                "import_count": metrics["import_count"],
                "function_count": metrics["function_count"],
                "label": label,
            })

        return rows
    finally:
        shutil.rmtree(repo_dir, ignore_errors=True)


def main():
    all_rows = []

    for repo_url in TRAINING_REPOS:
        print(f"Processing {repo_url}...")
        try:
            rows = build_dataset_for_repo(repo_url)
            print(f"  collected {len(rows)} files")
            all_rows.extend(rows)
        except subprocess.CalledProcessError as error:
            print(f"  skipped, clone failed: {error}")

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    with open(OUTPUT_PATH, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["complexity_score", "lines_of_code", "import_count", "function_count", "label"])
        writer.writeheader()
        writer.writerows(all_rows)

    risky_count = sum(1 for r in all_rows if r["label"] == 1)
    print(f"\nTotal rows: {len(all_rows)}")
    print(f"Risky (label=1): {risky_count}")
    print(f"Clean (label=0): {len(all_rows) - risky_count}")
    print(f"Saved to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()