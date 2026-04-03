"use client";

import { Log, Tag } from "@/lib/types";
import { TAG_CONFIG } from "@/lib/constants";
import { sortLogsByStartTime, minsOf, formatTime12 } from "@/lib/utils";

interface TimelineBarProps {
  logs: Log[];
  dominantTag?: Tag;
}

export default function TimelineBar({ logs, dominantTag }: TimelineBarProps) {
  const sorted = sortLogsByStartTime(logs);

  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase" }}>Day Timeline</p>
        {dominantTag && (
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: TAG_CONFIG[dominantTag].bg, color: TAG_CONFIG[dominantTag].color, fontWeight: 600 }}>
            {TAG_CONFIG[dominantTag].emoji} {TAG_CONFIG[dominantTag].label}
          </span>
        )}
      </div>
      <div style={{ position: "relative", height: 32, background: "var(--color-surface-offset)", borderRadius: 8, overflow: "hidden" }}>
        {sorted.map((log) => {
          const startPct = (minsOf(log.hour, log.minute_from) / 1440) * 100;
          const wPct     = (Math.max(1, minsOf(log.hour, log.minute_to) - minsOf(log.hour, log.minute_from)) / 1440) * 100;
          return (
            <div key={log.id} title={`${formatTime12(log.hour, log.minute_from)} – ${formatTime12(log.hour, log.minute_to)}\n${log.title}`} style={{
              position: "absolute", left: `${startPct}%`, width: `${Math.max(wPct, 0.4)}%`,
              top: 2, bottom: 2, borderRadius: 4,
              background: TAG_CONFIG[log.tag].color, opacity: 0.85,
            }} />
          );
        })}
        {(() => {
          const n   = new Date();
          const pct = (minsOf(n.getHours(), n.getMinutes()) / 1440) * 100;
          return <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pct}%`, width: 2, background: "#fff", opacity: 0.6, borderRadius: 1 }} />;
        })()}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        {["12a","3a","6a","9a","12p","3p","6p","9p",""].map((l, i) => (
          <span key={i} style={{ fontSize: 9, color: "var(--color-text-faint)", fontFamily: "'Geist Mono', monospace" }}>{l}</span>
        ))}
      </div>
    </div>
  );
}