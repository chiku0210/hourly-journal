"use client";

import { Log, Tag } from "@/lib/types";
import { PREP_TAGS, TAG_CONFIG } from "@/lib/constants";
import { 
  calculateTotalMinutes, 
  calculateAvgIntensity, 
  getMinutesByTag, 
  sortLogsByStartTime, 
  getMaxGap,
  getPeakHour,
  groupLogsByHour
} from "@/lib/utils";

interface DayScoreProps {
  logs: Log[];
}

export default function DayScore({ logs }: DayScoreProps) {
  if (logs.length === 0) return null;

  const totalMins = calculateTotalMinutes(logs);
  const avgInt = calculateAvgIntensity(logs);
  const tagMins = getMinutesByTag(logs);
  
  const prepMins = PREP_TAGS.reduce((a, t) => a + (tagMins[t] || 0), 0);
  const prepScore = totalMins ? Math.round((prepMins / totalMins) * 100) : 0;
  
  const coveredHours = new Set(logs.map(l => l.hour)).size;
  const coverage = Math.min(coveredHours / 16, 1) * 100;
  
  const sorted = sortLogsByStartTime(logs);
  const maxGap = getMaxGap(sorted);
  
  const score = Math.round(prepScore * 0.4 + (avgInt / 5 * 100) * 0.3 + coverage * 0.2 + (maxGap < 60 ? 100 : 50) * 0.1);
  const grade = score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D";
  const gradeColor = score >= 80 ? "#6daa45" : score >= 65 ? "#4f98a3" : score >= 50 ? "#e8af34" : "#dd6974";
  const intensityColor = avgInt >= 4 ? "#6daa45" : avgInt >= 3 ? "#4f98a3" : avgInt >= 2 ? "#e8af34" : "#dd6974";
  
  const items = [
    { label: "Job Prep %",    val: prepScore,               color: "#a86fdf" },
    { label: "Focus Level",   val: Math.round(avgInt / 5 * 100), color: intensityColor },
    { label: "Hour Coverage", val: Math.round(coverage),    color: "#5591c7" },
  ];

  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 14 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase", marginBottom: 12 }}>Day Score</p>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 36, fontWeight: 700, color: gradeColor, lineHeight: 1 }}>{grade}</div>
          <div style={{ fontSize: 10, color: "var(--color-text-faint)", marginTop: 4 }}>{score}/100</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
          {items.map(item => (
            <div key={item.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: "var(--color-text-faint)" }}>{item.label}</span>
                <span style={{ fontSize: 10, color: item.color, fontFamily: "'Geist Mono', monospace", fontWeight: 600 }}>{item.val}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "var(--color-surface-offset)" }}>
                <div style={{ height: "100%", width: `${item.val}%`, borderRadius: 2, background: item.color, transition: "width 400ms ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}