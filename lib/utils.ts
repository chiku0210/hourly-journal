// ─── Date & Time Utilities ────────────────────────────────────────────────────

export function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function to24(h: number, ampm: "AM" | "PM"): number {
  if (ampm === "AM") return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

export function from24(h24: number): { h: number; ampm: "AM" | "PM" } {
  if (h24 === 0)  return { h: 12, ampm: "AM" };
  if (h24 < 12)   return { h: h24, ampm: "AM" };
  if (h24 === 12) return { h: 12, ampm: "PM" };
  return { h: h24 - 12, ampm: "PM" };
}

export function formatTime12(h24: number, min: number): string {
  const { h, ampm } = from24(h24);
  return `${pad(h)}:${pad(min)} ${ampm}`;
}

export function minsOf(h: number, m: number): number {
  return h * 60 + m;
}

export function durationLabel(
  startH: number,
  startM: number,
  endH: number,
  endM: number
): string | null {
  const mins = minsOf(endH, endM) - minsOf(startH, startM);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}m` : ""}`.trim();
}

/** Returns an array of the last `n` days as YYYY-MM-DD strings, newest first */
export function getRecentDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return toDateStr(d);
  });
}

/** Formats a date string (YYYY-MM-DD) into a human label like "Today", "Yesterday", or "Mon Apr 01" */
export function formatDayLabel(dateStr: string): string {
  const today     = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 86400000));
  if (dateStr === today)     return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
