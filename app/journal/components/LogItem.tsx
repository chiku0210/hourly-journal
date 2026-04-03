"use client";

import { Log } from "@/lib/types";
import { TAG_CONFIG } from "@/lib/constants";
import { formatTime12, from24, durationLabel } from "@/lib/utils";

interface LogItemProps {
  log: Log;
  onDelete: (id: string) => Promise<void>;
  deletingId: string | null;
}

export default function LogItem({ log, onDelete, deletingId }: LogItemProps) {
  const cfg = TAG_CONFIG[log.tag];
  const dur = durationLabel(log.hour, log.minute_from, log.hour, log.minute_to) || "–";

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "52px 1fr 36px", gap: 10,
      alignItems: "center", padding: "12px 12px",
      borderRadius: 12, background: "var(--color-surface)", border: "1px solid var(--color-border)",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: cfg.color, fontWeight: 700 }}>
          {formatTime12(log.hour, log.minute_from).split(" ")[0]}
        </div>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: "var(--color-text-faint)" }}>
          {from24(log.hour).ampm}
        </div>
        <div style={{ fontSize: 9, color: "var(--color-text-faint)", marginTop: 1 }}>{dur}</div>
      </div>
      <div style={{ overflow: "hidden", minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{log.title}</div>
        <div style={{ display: "flex", gap: 5, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: cfg.bg, color: cfg.color, fontWeight: 600, flexShrink: 0 }}>
            {cfg.emoji} {cfg.label}
          </span>
          <div style={{ display: "flex", gap: 2 }}>
            {[1,2,3,4,5].map((n) => (
              <div key={n} style={{ width: 6, height: 6, borderRadius: "50%", background: n <= log.intensity ? cfg.color : "var(--color-border)" }} />
            ))}
          </div>
        </div>
        {log.note && (
          <div style={{ fontSize: 11, color: "var(--color-text-faint)", fontStyle: "italic", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.note}</div>
        )}
      </div>
      <button
        onClick={() => onDelete(log.id)}
        disabled={deletingId === log.id}
        style={{
          width: 36, height: 36, borderRadius: 8, border: "1px solid var(--color-border)",
          background: "transparent", color: "var(--color-text-faint)", cursor: "pointer",
          fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "all 150ms ease",
          WebkitTapHighlightColor: "transparent",
        } as React.CSSProperties}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--color-error)"; el.style.color = "var(--color-error)"; }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--color-border)"; el.style.color = "var(--color-text-faint)"; }}
      >×</button>
    </div>
  );
}