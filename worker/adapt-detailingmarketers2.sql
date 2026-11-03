-- Rebuild "bookings" in D1 "detailing-bookings-detailingmarketers2" (account detailingmarketers2, WNAM)
-- to match the schema captured from "detailing-bookings" (see worker/schema.sql).
-- Safe to run: the table was verified EMPTY (0 rows) on 2026-10-22.
-- Run:  npx wrangler d1 execute detailing-bookings-detailingmarketers2 --remote --file worker/adapt-detailingmarketers2.sql

DROP TABLE IF EXISTS bookings;

CREATE TABLE bookings (
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
  payment_status  TEXT DEFAULT 'Paid',
  payment_intent_id TEXT            -- kept from the existing table; not in the source DB
);

CREATE INDEX idx_bookings_source_date ON bookings (source, date);
CREATE UNIQUE INDEX idx_bookings_payment_intent ON bookings (payment_intent_id);
