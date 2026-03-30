import psycopg2
from psycopg2.extras import RealDictCursor


def get_db_connection():

    conn = psycopg2.connect(
        host="localhost",
        database="gdpr_db",
        user="postgres",
        password="123456789",

    )

    return conn


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