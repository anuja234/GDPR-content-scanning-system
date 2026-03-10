from services.regex_engine import run_regex_detection


def detect_pii(text: str):

    violations = run_regex_detection(text)

    return violations


def redact_text(text: str, violations: list):

    redacted = text

    for v in violations:

        value = v["value"]

        if len(value) > 6:
            masked = "*" * (len(value)-4) + value[-4:]
        else:
            masked = "****"

        redacted = redacted.replace(value, masked)

    return redacted