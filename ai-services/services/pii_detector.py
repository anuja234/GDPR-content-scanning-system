from services.regex_engine import run_regex_detection

def detect_pii(text: str, rule_ids: list = None):
    """
    Scans text for PII based on a specific set of selected rule IDs.
    """
    if not rule_ids:
        return []

    # Pass rule_ids to the engine to filter SQL query
    violations = run_regex_detection(text, rule_ids)

    return violations


def redact_text(text: str, violations: list):
    """
    Replaces sensitive values with masked versions.
    """
    redacted = text
    
    # Sort violations by length descending to prevent partial replacement issues
    # (e.g., replacing '123' inside '12345')
    sorted_violations = sorted(violations, key=lambda x: len(x["value"]), reverse=True)

    for v in sorted_violations:
        value = v["value"]

        # Simple masking logic: keep last 4 digits if long enough
        if len(value) > 6:
            masked = "*" * (len(value) - 4) + value[-4:]
        else:
            masked = "****"

        redacted = redacted.replace(value, masked)

    return redacted