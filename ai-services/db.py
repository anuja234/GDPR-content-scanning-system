import psycopg2


def get_db_connection():

    conn = psycopg2.connect(
        host="localhost",
        database="gdpr_db",
        user="postgres",
        password="123456789"
    )

    return conn