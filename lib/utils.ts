// Utility functions for the Hourly Journal application

// Convert Date to ISO date string (YYYY-MM-DD)
export function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

// Pad a number with leading zero
export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Convert 12-hour format to 24-hour format
export function to24(h: number, ampm: "AM" | "PM"): number {
  if (ampm === "AM") return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

// Convert 24-hour format to 12-hour format
export function from24(h24: number): { h: number; ampm: "AM" | "PM" } {
  if (h24 === 0)  return { h: 12, ampm: "AM" };
  if (h24 < 12)   return { h: h24, ampm: "AM" };
  if (h24 === 12) return { h: 12, ampm: "PM" };
  return { h: h24 - 12, ampm: "PM" };
}

// Format time in 12-hour format (HH:MM AM/PM)
export function formatTime12(h24: number, min: number): string {
  const { h, ampm } = from24(h24);
  return `${pad(h)}:${pad(min)} ${ampm}`;
}

// Convert hours and minutes to total minutes
export function minsOf(h: number, m: number): number {
  return h * 60 + m;
}

// Generate duration label from start and end times
export function durationLabel(startH: number, startM: number, endH: number, endM: number): string | null {
  const mins = minsOf(endH, endM) - minsOf(startH, startM);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}m` : ""}`.trim();
}

// Sort logs by start time
export function sortLogsByStartTime<T extends { hour: number; minute_from: number }>(logs: T[]): T[] {
  return [...logs].sort((a, b) => minsOf(a.hour, a.minute_from) - minsOf(b.hour, b.minute_from));
}

// Sort logs by end time
export function sortLogsByEndTime<T extends { hour: number; minute_to: number }>(logs: T[]): T[] {
  return [...logs].sort((a, b) => minsOf(a.hour, a.minute_to) - minsOf(b.hour, b.minute_to));
}

// Calculate total minutes from logs
export function calculateTotalMinutes<T extends { hour: number; minute_from: number; minute_to: number }>(logs: T[]): number {
  return logs.reduce((acc, l) => acc + Math.max(0, minsOf(l.hour, l.minute_to) - minsOf(l.hour, l.minute_from)), 0);
}

// Calculate average intensity from logs
export function calculateAvgIntensity(logs: { intensity: number }[]): number {
  return logs.length ? logs.reduce((a, l) => a + l.intensity, 0) / logs.length : 0;
}

// Get minutes per tag
export function getMinutesByTag<T extends { tag: string; hour: number; minute_from: number; minute_to: number }>(
  logs: T[]
): Record<string, number> {
  return logs.reduce((acc, l) => {
    acc[l.tag] = (acc[l.tag] || 0) + Math.max(0, minsOf(l.hour, l.minute_to) - minsOf(l.hour, l.minute_from));
    return acc;
  }, {} as Record<string, number>);
}

// Get the dominant tag by total minutes
export function getDominantTag(tagMins: Record<string, number>): string | undefined {
  return Object.entries(tagMins).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0];
}

// Get the longest log by duration
export function getLongestLog<T extends { hour: number; minute_from: number; minute_to: number }>(logs: T[]): T | undefined {
  return [...logs].sort((a, b) => 
    (minsOf(b.hour, b.minute_to) - minsOf(b.hour, b.minute_from)) - 
    (minsOf(a.hour, a.minute_to) - minsOf(a.hour, a.minute_from))
  )[0];
}

// Calculate the largest gap between logs
export function getMaxGap(sortedLogs: { hour: number; minute_from: number; minute_to: number }[]): number {
  let maxGap = 0;
  for (let i = 1; i < sortedLogs.length; i++) {
    const gap = minsOf(sortedLogs[i].hour, sortedLogs[i].minute_from) - minsOf(sortedLogs[i-1].hour, sortedLogs[i-1].minute_to);
    if (gap > maxGap) maxGap = gap;
  }
  return maxGap;
}

// Group logs by hour
export function groupLogsByHour<T extends { hour: number }>(logs: T[]): Record<number, T[]> {
  const hourMap: Record<number, T[]> = {};
  for (let h = 0; h < 24; h++) hourMap[h] = [];
  logs.forEach((l) => { if (hourMap[l.hour]) hourMap[l.hour].push(l); });
  return hourMap;
}

// Get peak hour (hour with highest intensity score)
export function getPeakHour(hourMap: Record<number, { intensity: number }[]>): { h: number; score: number } | undefined {
  return Object.entries(hourMap)
    .map(([h, ls]) => ({ h: Number(h), score: ls.reduce((a, l) => a + l.intensity, 0) }))
    .sort((a, b) => b.score - a.score)[0];
}

// Get day options for the last N days
export function getDayOptions(daysBack: number = 6): { label: string; sub: string; val: string }[] {
  const days: { label: string; sub: string; val: string }[] = [];
  for (let i = daysBack; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const val   = toDateStr(d);
    const label = i === 0 ? "Today" : i === 1 ? "Yest." : d.toLocaleDateString("en-IN", { weekday: "short" });
    const sub   = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    days.push({ label, sub, val });
  }
  return days;
}