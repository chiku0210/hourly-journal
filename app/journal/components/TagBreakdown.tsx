"use client";

import { Log, Tag } from "@/lib/types";
import { TAG_CONFIG } from "@/lib/constants";
import { getMinutesByTag, calculateTotalMinutes } from "@/lib/utils";

interface TagBreakdownProps {
  logs: Log[];
}

export default function TagBreakdown({ logs }: TagBreakdownProps) {
  const tagMins = getMinutesByTag(logs);
  const totalMins = calculateTotalMinutes(logs);

  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 14 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase", marginBottom: 12 }}>Time by Category</p>
      {logs.length === 0 ? (
        <div style={{ color: "var(--color-text-faint)", fontSize: 12, textAlign: "center", padding: "12px 0" }}>No data yet</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {(Object.keys(TAG_CONFIG) as Tag[]).filter(t => tagMins[t]).sort((a, b) => (tagMins[b] || 0) - (tagMins[a] || 0)).map((t) => {
            const mins = tagMins[t] || 0;
            const pct  = totalMins ? (mins / totalMins) * 100 : 0;
            const cfg  = TAG_CONFIG[t];
            return (
              <div key={t}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13 }}>{cfg.emoji}</span>
                    <span style={{ fontSize: 13, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "'Geist Mono', monospace" }}>
                      {Math.floor(mins/60) > 0 ? `${Math.floor(mins/60)}h ` : ""}{mins%60}m
                    </span>
                    <span style={{ fontSize: 10, color: "var(--color-text-faint)", fontFamily: "'Geist Mono', monospace" }}>{pct.toFixed(0)}%</span>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--color-surface-offset)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: cfg.color, transition: "width 400ms ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}