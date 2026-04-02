// ─── Database Schema Types ───────────────────────────────────────────────────
// Mirrors the Neon DB table structure exactly.

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
  id: string;            // UUID
  date: string;          // ISO date string: YYYY-MM-DD
  hour: number;          // 0–23
  minute_from: number;   // 0–59
  minute_to: number;     // 0–59
  title: string;         // What was done
  note?: string;         // Optional notes
  tag: Tag;              // Activity category
  intensity: number;     // 1–5 focus/energy scale
  created_at?: string;
  updated_at?: string;
};

export type LogInsert = Omit<Log, "id" | "created_at" | "updated_at">;
export type LogUpdate = Partial<Omit<Log, "id" | "date" | "created_at" | "updated_at">>;
