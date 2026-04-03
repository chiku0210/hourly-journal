"use client";

import { Log, Tag } from "@/lib/types";
import { PREP_TAGS, TAG_CONFIG } from "@/lib/constants";
import { 
  calculateTotalMinutes, 
  calculateAvgIntensity, 
  getMinutesByTag, 
  getDominantTag,
  getLongestLog,
  sortLogsByStartTime,
  getMaxGap,
  getPeakHour,
  groupLogsByHour,
  formatTime12
} from "@/lib/utils";
import StatCard from "./StatCard";
import TimelineBar from "./TimelineBar";
import Heatmap from "./Heatmap";
import TagBreakdown from "./TagBreakdown";
import DayScore from "./DayScore";
import DeepestSession from "./DeepestSession";

interface DashboardPanelProps {
  logs: Log[];
}

export default function DashboardPanel({ logs }: DashboardPanelProps) {
  const totalMins = calculateTotalMinutes(logs);
  const totalHrs = (totalMins / 60).toFixed(1);
  const tagMins = getMinutesByTag(logs);
  const avgInt = calculateAvgIntensity(logs);
  const dominantTag = getDominantTag(tagMins) as Tag | undefined;
  const longestLog = getLongestLog(logs);

  const prepMins = PREP_TAGS.reduce((a, t) => a + (tagMins[t] || 0), 0);
  const prepScore = totalMins ? Math.round((prepMins / totalMins) * 100) : 0;
  const workMins = tagMins["work"] || 0;

  const hourMap = groupLogsByHour(logs);
  const peakHour = getPeakHour(hourMap);

  const sorted = sortLogsByStartTime(logs);
  let maxGap = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = sortLogsByStartTime.length > 1 ? 
      (sorted[i].hour * 60 + sorted[i].minute_from) - (sorted[i-1].hour * 60 + sorted[i-1].minute_to) : 0;
    if (gap > maxGap) maxGap = gap;
  }

  const intensityColor = avgInt >= 4 ? "#6daa45" : avgInt >= 3 ? "#4f98a3" : avgInt >= 2 ? "#e8af34" : "#dd6974";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <StatCard label="Hrs Logged"  value={totalHrs}        color="var(--color-primary)" sub={`${logs.length} entries`} />
        <StatCard label="Avg Focus"   value={avgInt ? `${avgInt.toFixed(1)}/5` : "—"} color={intensityColor} sub={avgInt >= 4 ? "🔥 Deep work" : avgInt >= 3 ? "✅ Good focus" : avgInt > 0 ? "⚡ Light day" : undefined} />
        <StatCard label="Job Prep"    value={`${Math.floor(prepMins/60)}h ${prepMins%60}m`} color="#a86fdf" sub={`${prepScore}% of day`} />
        <StatCard label="Work"        value={`${Math.floor(workMins/60)}h ${workMins%60}m`} color="#4f98a3" sub={workMins ? `${Math.round((workMins/totalMins)*100)}%` : "Not logged"} />
        <StatCard label="Peak Hour"   value={peakHour?.score ? formatTime12(peakHour.h, 0).replace(":00","") : "—"} color="var(--color-gold)" sub={peakHour?.score ? `Score ${peakHour.score}` : undefined} />
        <StatCard label="Biggest Gap" value={maxGap ? `${maxGap}m` : "—"} color={maxGap > 60 ? "var(--color-error)" : "var(--color-text-muted)"} sub={maxGap > 60 ? "⚠ Large gap" : maxGap > 0 ? "Minimal" : undefined} />
      </div>

      <TimelineBar logs={logs} dominantTag={dominantTag} />
      <Heatmap logs={logs} />
      <TagBreakdown logs={logs} />
      <DayScore logs={logs} />
      <DeepestSession logs={logs} />
    </div>
  );
}