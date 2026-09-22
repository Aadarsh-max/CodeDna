import re

SEVERITY_HIGH = "High"
SEVERITY_MEDIUM = "Medium"

SECURITY_RULES = [
    {
        "id": "hardcoded_secret",
        "title": "Hardcoded Secret or API Key",
        "severity": SEVERITY_HIGH,
        "pattern": re.compile(r'(?i)\b(api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token)\s*[:=]\s*["\'][A-Za-z0-9_\-]{16,}["\']'),
        "description": "A secret or API key appears to be hardcoded directly in source code instead of loaded from an environment variable.",
    },
    {
        "id": "hardcoded_password",
        "title": "Hardcoded Password",
        "severity": SEVERITY_HIGH,
        "pattern": re.compile(r'(?i)\bpassword\s*[:=]\s*["\'][^"\']{4,}["\']'),
        "description": "A password appears to be hardcoded directly in source code.",
    },
    {
        "id": "aws_key",
        "title": "AWS Access Key Exposed",
        "severity": SEVERITY_HIGH,
        "pattern": re.compile(r'\bAKIA[0-9A-Z]{16}\b'),
        "description": "A string matching the format of an AWS access key was found in source code.",
    },
    {
        "id": "eval_usage",
        "title": "Use of eval()",
        "severity": SEVERITY_HIGH,
        "pattern": re.compile(r'\beval\s*\('),
        "description": "eval() executes arbitrary code from a string and is a common source of code injection vulnerabilities.",
    },
    {
        "id": "command_injection",
        "title": "Potential Command Injection",
        "severity": SEVERITY_HIGH,
        "pattern": re.compile(r'\b(exec|execSync|os\.system|os\.popen)\s*\(\s*[`"\'][^`"\']*\$\{|\b(exec|execSync)\s*\(\s*[a-zA-Z_]\w*\s*\+'),
        "description": "A shell command appears to be built using string interpolation or concatenation, which can allow command injection if the input is not sanitized.",
    },
    {
        "id": "sql_injection",
        "title": "Potential SQL Injection",
        "severity": SEVERITY_HIGH,
        "pattern": re.compile(r'(?i)(SELECT|INSERT|UPDATE|DELETE)\b[^;"\']*["\'`]\s*\+'),
        "description": "A SQL query appears to be built using string concatenation instead of parameterized queries, which can allow SQL injection.",
    },
    {
        "id": "dangerous_html",
        "title": "dangerouslySetInnerHTML Usage",
        "severity": SEVERITY_MEDIUM,
        "pattern": re.compile(r'dangerouslySetInnerHTML'),
        "description": "Rendering raw HTML can expose the application to cross-site scripting (XSS) if the content is not properly sanitized.",
    },
    {
        "id": "fallback_secret",
        "title": "Hardcoded Fallback Secret",
        "severity": SEVERITY_MEDIUM,
        "pattern": re.compile(r'process\.env\.\w*(SECRET|KEY|TOKEN)\w*\s*\|\|\s*["\'][^"\']+["\']'),
        "description": "An environment variable for a secret has a hardcoded fallback value, which can be used if the real secret is missing.",
    },
]


def scan_file_content(file_path: str, content: str) -> list[dict]:
    issues = []
    lines = content.splitlines()

    for rule in SECURITY_RULES:
        for line_number, line in enumerate(lines, start=1):
            if rule["pattern"].search(line):
                issues.append({
                    "file_path": file_path,
                    "line": line_number,
                    "rule_id": rule["id"],
                    "title": rule["title"],
                    "severity": rule["severity"],
                    "description": rule["description"],
                    "snippet": line.strip()[:120],
                })

    return issues


def scan_repository(file_contents: dict[str, str]) -> dict:
    all_issues = []

    for file_path, content in file_contents.items():
        all_issues.extend(scan_file_content(file_path, content))

    high_count = sum(1 for i in all_issues if i["severity"] == SEVERITY_HIGH)
    medium_count = sum(1 for i in all_issues if i["severity"] == SEVERITY_MEDIUM)

    return {
        "total_issues": len(all_issues),
        "high_severity_count": high_count,
        "medium_severity_count": medium_count,
        "issues": all_issues,
    }