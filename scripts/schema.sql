CREATE TABLE IF NOT EXISTS meditations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    legacy_id TEXT UNIQUE,
    date TEXT,
    bible_book TEXT,
    title TEXT,
    scripture TEXT,
    reflection TEXT,
    prayer TEXT,
    raw_content TEXT,
    spiritual_stage TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meditations_date ON meditations(date);
CREATE INDEX IF NOT EXISTS idx_meditations_bible_book ON meditations(bible_book);
