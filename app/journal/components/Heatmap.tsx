"use client";

import { Log } from "@/lib/types";
import { TAG_CONFIG } from "@/lib/constants";
import { groupLogsByHour, formatTime12 } from "@/lib/utils";

interface HeatmapProps {
  logs: Log[];
}

export default function Heatmap({ logs }: HeatmapProps) {
  const hourMap = groupLogsByHour(logs);

  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 14 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase", marginBottom: 10 }}>24h Heatmap</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 2 }}>
        {Array.from({ length: 24 }, (_, h) => {
          const hLogs  = hourMap[h];
          const topTag = [...hLogs].sort((a, b) => b.intensity - a.intensity)[0]?.tag;
          const fill   = hLogs.length > 0 ? (hLogs.reduce((a, l) => a + l.intensity, 0) / hLogs.length / 5) : 0;
          return (
            <div key={h} title={`${formatTime12(h, 0)} — ${hLogs.length} entries`} style={{
              height: 32, borderRadius: 3, overflow: "hidden",
              background: "var(--color-surface-offset)",
              border: `1px solid ${hLogs.length ? TAG_CONFIG[topTag!].color + "50" : "var(--color-divider)"}`,
              position: "relative", display: "flex", alignItems: "flex-end",
            }}>
              {fill > 0 && <div style={{ width: "100%", height: `${fill * 100}%`, background: TAG_CONFIG[topTag!].color, opacity: 0.75, borderRadius: 2 }} />}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        {["12a","","","","","6a","","","","","","12p","","","","","","6p","","","","","","11p"].map((l, i) => (
          <span key={i} style={{ fontSize: 8, color: "var(--color-text-faint)", fontFamily: "'Geist Mono', monospace", width: "4.16%", textAlign: "center" }}>{l}</span>
        ))}
      </div>
    </div>
  );
}