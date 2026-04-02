/**
 * DB Migration — run once via: npx ts-node lib/migrate.ts
 * Or paste the SQL directly into Neon SQL Editor.
 *
 * Creates the `logs` table with all required columns.
 */

import sql from "./db";

async function migrate() {
  console.log("⏳ Running migration...");

  await sql`
    CREATE TABLE IF NOT EXISTS logs (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date        DATE NOT NULL,
      hour        SMALLINT NOT NULL CHECK (hour >= 0 AND hour <= 23),
      minute_from SMALLINT NOT NULL DEFAULT 0,
      minute_to   SMALLINT NOT NULL DEFAULT 59,
      title       TEXT NOT NULL,
      note        TEXT,
      tag         TEXT NOT NULL DEFAULT 'general',
      intensity   SMALLINT NOT NULL DEFAULT 3 CHECK (intensity >= 1 AND intensity <= 5),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_logs_date ON logs(date)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_logs_date_hour ON logs(date, hour)
  `;

  console.log("✅ Migration complete. Table `logs` is ready.");

  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
