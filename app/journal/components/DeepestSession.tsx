"use client";

import { Log } from "@/lib/types";
import { TAG_CONFIG } from "@/lib/constants";
import { getLongestLog, formatTime12, durationLabel } from "@/lib/utils";

interface DeepestSessionProps {
  logs: Log[];
}

export default function DeepestSession({ logs }: DeepestSessionProps) {
  const longestLog = getLongestLog(logs);
  
  if (!longestLog) return null;

  const cfg = TAG_CONFIG[longestLog.tag];

  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 14 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase", marginBottom: 8 }}>Deepest Session</p>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
          {cfg.emoji}
        </div>
        <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{longestLog.title}</div>
          <div style={{ fontSize: 11, color: "var(--color-text-faint)", marginTop: 2 }}>
            {formatTime12(longestLog.hour, longestLog.minute_from)} · {durationLabel(longestLog.hour, longestLog.minute_from, longestLog.hour, longestLog.minute_to)} · {longestLog.intensity}/5
          </div>
        </div>
      </div>
    </div>
  );
}