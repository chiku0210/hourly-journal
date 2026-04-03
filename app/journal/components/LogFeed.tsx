"use client";

import { Log } from "@/lib/types";
import { sortLogsByStartTime } from "@/lib/utils";
import LogItem from "./LogItem";

interface LogFeedProps {
  logs: Log[];
  onDelete: (id: string) => Promise<void>;
  deletingId: string | null;
}

export default function LogFeed({ logs, onDelete, deletingId }: LogFeedProps) {
  const sorted = sortLogsByStartTime(logs);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase", marginBottom: 4 }}>
        {sorted.length} {sorted.length === 1 ? "entry" : "entries"} logged
      </p>

      {sorted.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-text-faint)", fontSize: 13 }}>
          No entries yet. Start logging ↑
        </div>
      )}

      {sorted.map((log) => (
        <LogItem key={log.id} log={log} onDelete={onDelete} deletingId={deletingId} />
      ))}
    </div>
  );
}