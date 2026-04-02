// ─── Database Schema Types ────────────────────────────────────────────────────
// Mirrors the Neon DB `logs` table structure exactly.
// Import these in components and API routes instead of re-declaring inline.

export type Tag =
  | "work"
  | "dsa"
  | "sysdes"
  | "project"
  | "prep"
  | "workout"
  | "break"
  | "personal"
  | "sleep";

export type Log = {
  id: string;           // UUID — gen_random_uuid()
  date: string;         // ISO date string: YYYY-MM-DD
  hour: number;         // 0–23
  minute_from: number;  // 0–59
  minute_to: number;    // 0–59
  title: string;        // What was done
  note?: string;        // Optional notes
  tag: Tag;             // Activity category
  intensity: number;    // 1–5 focus/energy scale
  created_at?: string;
  updated_at?: string;
};

/** Shape for INSERT — no id or timestamps */
export type LogInsert = Omit<Log, "id" | "created_at" | "updated_at">;

/** Shape for PATCH — all fields optional except id/date */
export type LogUpdate = Partial<Omit<Log, "id" | "date" | "created_at" | "updated_at">>;
