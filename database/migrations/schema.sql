CREATE TABLE IF NOT EXISTS scans (
    id SERIAL PRIMARY KEY,
    scan_type VARCHAR(10),
    redacted_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS violations (
    id SERIAL PRIMARY KEY,
    scan_id INTEGER REFERENCES scans(id) ON DELETE CASCADE,
    type VARCHAR(20),
    value TEXT
);

select * from scans;