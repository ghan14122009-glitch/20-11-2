-- Chạy tệp này một lần trên Cloudflare D1.
CREATE TABLE IF NOT EXISTS recipients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  greeting TEXT NOT NULL,
  code_hash TEXT UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_recipients_sort ON recipients(sort_order, created_at);
