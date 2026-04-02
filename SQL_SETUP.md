# Neon DB Setup

Paste the following SQL into your **Neon SQL Editor** to initialize the database.

## Schema

```sql
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
);

CREATE INDEX IF NOT EXISTS idx_logs_date      ON logs(date);
CREATE INDEX IF NOT EXISTS idx_logs_date_hour ON logs(date, hour);
```

## Environment Variable

Create `.env.local` in the project root:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

Also add `DATABASE_URL` to your **Vercel project → Settings → Environment Variables** for Production, Preview, and Development.

## Tag Reference

| Tag | Emoji | Group |
|---|---|---|
| work | 💼 | Job |
| dsa | 🧩 | Job Prep |
| sysdes | 🏗️ | Job Prep |
| project | 🚀 | Job Prep |
| prep | 📚 | Job Prep |
| workout | 💪 | Life |
| break | ☕ | Life |
| personal | 🌱 | Life |
| sleep | 🌙 | Life |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/logs?date=YYYY-MM-DD` | Fetch all logs for a day |
| POST | `/api/logs` | Create a new log entry |
| PATCH | `/api/logs/:id` | Update an existing log |
| DELETE | `/api/logs/:id` | Delete a log |
