-- Schema captured from the original shared D1 database "detailing-bookings"
-- Dumped:  2026-10-22
--
-- Apply to another account's database:
--   npx wrangler d1 create detailing-bookings
--   npx wrangler d1 execute detailing-bookings --remote --file worker/schema.sql

CREATE TABLE IF NOT EXISTS bookings (
  id              TEXT PRIMARY KEY,
  date            TEXT NOT NULL,
  time            TEXT NOT NULL,
  service         TEXT,
  name            TEXT,
  phone           TEXT,
  email           TEXT,
  vehicle         TEXT,
  address         TEXT,
  notes           TEXT,
  source          TEXT DEFAULT 'imperial-shine',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  status          TEXT DEFAULT 'Confirmed',
  reschedule_date TEXT,
  reschedule_time TEXT,
  notes2          TEXT,
  original_date   TEXT,
  original_time   TEXT,
  payment_status  TEXT DEFAULT 'Paid'
);

-- Defined in worker/highend-detailing-worker.js (ensureSchema) but NOT yet present on the live DB
CREATE INDEX IF NOT EXISTS idx_bookings_source_date ON bookings (source, date);
