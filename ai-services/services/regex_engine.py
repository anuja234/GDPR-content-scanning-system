import re
from psycopg2.extras import RealDictCursor
from config.db import get_db_connection


def fetch_enabled_rules():

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT id, rule_name, regex_pattern
        FROM rules
        WHERE enabled = TRUE
    """)

    rules = cur.fetchall()

    cur.close()
    conn.close()

    return rules

def run_regex_detection(text: str,rule_ids):

    violations = []

    all_rules = fetch_enabled_rules()
    rules = [
        r for r in all_rules
        if r.get("id") is not None and int(r["id"]) in rule_ids
    ]
    for rule in rules:

        rule_id = rule["id"]
        rule_name = rule["rule_name"]
        pattern = rule["regex_pattern"]

        try:

            matches = re.findall(pattern, text)

            for match in matches:

                violations.append({
                    "rule_id": rule_id,
                    "type": rule_name,
                    "value": match
                })

        except re.error:
            continue

    return violations