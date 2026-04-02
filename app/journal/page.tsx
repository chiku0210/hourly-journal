"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Tag = "work" | "focus" | "break" | "personal" | "general";

type Log = {
  id: string;
  date: string;
  hour: number;
  minute_from: number;
  minute_to: number;
  title: string;
  note?: string;
  tag: Tag;
  intensity: number;
};

// ─── Constants ───────────────────────────────────────────────────────────────
const TAG_CONFIG: Record<Tag, { label: string; color: string; bg: string }> = {
  work:     { label: "Work",     color: "#4f98a3", bg: "rgba(79,152,163,0.15)" },
  focus:    { label: "Focus",    color: "#6daa45", bg: "rgba(109,170,69,0.15)" },
  break:    { label: "Break",    color: "#e8af34", bg: "rgba(232,175,52,0.15)" },
  personal: { label: "Personal", color: "#a86fdf", bg: "rgba(168,111,223,0.15)" },
  general:  { label: "General",  color: "#797876", bg: "rgba(121,120,118,0.15)" },
};

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(hour: number, minute: number) {
  return `${pad(hour)}:${pad(minute)}`;
}

function minutesSinceMidnight(hour: number, minute: number) {
  return hour * 60 + minute;
}

function totalMinutes(log: Log) {
  return log.minute_to - log.minute_from + (log.minute_to < log.minute_from ? 60 : 0) + (log.hour * 0); // within-hour
  // simpler: just end - start within hour
}

function logDuration(log: Log): number {
  return Math.max(0, log.minute_to - log.minute_from);
}

// ─── Logger Panel (Left) ──────────────────────────────────────────────────────
function LoggerPanel({
  logs,
  onAdd,
  onDelete,
  selectedDate,
}: {
  logs: Log[];
  onAdd: (log: Omit<Log, "id" | "date">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  selectedDate: string;
}) {
  const now = new Date();
  const isToday = selectedDate === toDateStr(now);

  // Derive next start from last log end
  const lastLog = [...logs].sort(
    (a, b) => minutesSinceMidnight(a.hour, a.minute_to) - minutesSinceMidnight(b.hour, b.minute_to)
  ).at(-1);

  const defaultStartHour = lastLog ? (lastLog.minute_to === 59 ? (lastLog.hour + 1) % 24 : lastLog.hour) : (isToday ? now.getHours() : 0);
  const defaultStartMin  = lastLog ? (lastLog.minute_to === 59 ? 0 : lastLog.minute_to + 1) : (isToday ? now.getMinutes() : 0);

  const [startHour, setStartHour]   = useState(defaultStartHour);
  const [startMin, setStartMin]     = useState(defaultStartMin);
  const [endHour, setEndHour]       = useState(defaultStartHour);
  const [endMin, setEndMin]         = useState(Math.min(defaultStartMin + 30, 59));
  const [title, setTitle]           = useState("");
  const [tag, setTag]               = useState<Tag>("general");
  const [intensity, setIntensity]   = useState(3);
  const [note, setNote]             = useState("");
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync defaults when logs change (after a save)
  useEffect(() => {
    const last = [...logs].sort(
      (a, b) => minutesSinceMidnight(a.hour, a.minute_to) - minutesSinceMidnight(b.hour, b.minute_to)
    ).at(-1);
    if (last) {
      const nextH = last.minute_to >= 59 ? (last.hour + 1) % 24 : last.hour;
      const nextM = last.minute_to >= 59 ? 0 : last.minute_to + 1;
      setStartHour(nextH);
      setStartMin(nextM);
      setEndHour(nextH);
      setEndMin(Math.min(nextM + 30, 59));
    }
  }, [logs]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onAdd({
      hour: startHour,
      minute_from: startMin,
      minute_to: endMin,
      title: title.trim(),
      note,
      tag,
      intensity,
    });
    setTitle("");
    setNote("");
    setTag("general");
    setIntensity(3);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid var(--color-border)",
    background: "var(--color-surface-offset)",
    color: "var(--color-text)",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
  };

  const sortedLogs = [...logs].sort(
    (a, b) => minutesSinceMidnight(a.hour, a.minute_from) - minutesSinceMidnight(b.hour, b.minute_from)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>

      {/* ── Entry Form ── */}
      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 14,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-primary)", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>New Entry</span>
        </div>

        {/* Time Range */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center" }}>
          {/* Start */}
          <div>
            <label style={{ fontSize: 11, color: "var(--color-text-faint)", fontWeight: 600, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>From</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <input
                type="number" min={0} max={23} value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                style={{ ...inputStyle, fontFamily: "'Geist Mono', monospace", textAlign: "center" }}
              />
              <input
                type="number" min={0} max={59} value={startMin}
                onChange={(e) => setStartMin(Number(e.target.value))}
                style={{ ...inputStyle, fontFamily: "'Geist Mono', monospace", textAlign: "center" }}
              />
            </div>
          </div>

          <div style={{ color: "var(--color-text-faint)", fontWeight: 300, fontSize: 18, textAlign: "center", paddingTop: 18 }}>→</div>

          {/* End */}
          <div>
            <label style={{ fontSize: 11, color: "var(--color-text-faint)", fontWeight: 600, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>To</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <input
                type="number" min={0} max={23} value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
                style={{ ...inputStyle, fontFamily: "'Geist Mono', monospace", textAlign: "center" }}
              />
              <input
                type="number" min={0} max={59} value={endMin}
                onChange={(e) => setEndMin(Number(e.target.value))}
                style={{ ...inputStyle, fontFamily: "'Geist Mono', monospace", textAlign: "center" }}
              />
            </div>
          </div>
        </div>

        {/* Duration badge */}
        {(endHour > startHour || (endHour === startHour && endMin > startMin)) && (
          <div style={{ fontSize: 11, color: "var(--color-primary)", fontFamily: "'Geist Mono', monospace", marginTop: -6 }}>
            {(() => {
              const mins = (endHour * 60 + endMin) - (startHour * 60 + startMin);
              if (mins <= 0) return null;
              return `${mins >= 60 ? `${Math.floor(mins/60)}h ` : ""}${mins % 60 > 0 ? `${mins % 60}m` : ""}` ;
            })()}
          </div>
        )}

        {/* Title */}
        <div>
          <label style={{ fontSize: 11, color: "var(--color-text-faint)", fontWeight: 600, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>What did you do?</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSave()}
            placeholder="e.g. Deep work on auth module"
            style={inputStyle}
          />
        </div>

        {/* Tag row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(Object.keys(TAG_CONFIG) as Tag[]).map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                cursor: "pointer", transition: "all 150ms ease",
                border: `1px solid ${tag === t ? TAG_CONFIG[t].color : "var(--color-border)"}`,
                background: tag === t ? TAG_CONFIG[t].bg : "transparent",
                color: tag === t ? TAG_CONFIG[t].color : "var(--color-text-faint)",
              }}
            >
              {TAG_CONFIG[t].label}
            </button>
          ))}
          {/* Intensity */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
            {[1,2,3,4,5].map((n) => (
              <button
                key={n}
                onClick={() => setIntensity(n)}
                style={{
                  width: 22, height: 22, borderRadius: 4, fontSize: 10, fontWeight: 700,
                  cursor: "pointer", transition: "all 150ms ease",
                  border: `1px solid ${intensity >= n ? TAG_CONFIG[tag].color : "var(--color-border)"}`,
                  background: intensity >= n ? TAG_CONFIG[tag].bg : "transparent",
                  color: intensity >= n ? TAG_CONFIG[tag].color : "var(--color-text-faint)",
                }}
              >{n}</button>
            ))}
          </div>
        </div>

        {/* Note */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Notes (optional)…"
          style={{ ...inputStyle, resize: "none" }}
        />

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          style={{
            padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 700,
            cursor: saving || !title.trim() ? "not-allowed" : "pointer",
            border: "none", background: "var(--color-primary)", color: "#fff",
            opacity: saving || !title.trim() ? 0.45 : 1,
            transition: "opacity 150ms ease",
            letterSpacing: "0.02em",
          }}
        >
          {saving ? "Saving…" : "Log Entry →"}
        </button>
      </div>

      {/* ── Log Feed ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, overflowY: "auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase", marginBottom: 8 }}>
          {sortedLogs.length} {sortedLogs.length === 1 ? "entry" : "entries"} today
        </p>
        {sortedLogs.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-text-faint)", fontSize: 13 }}>
            No entries yet. Start logging ↑
          </div>
        )}
        {sortedLogs.map((log) => (
          <div
            key={log.id}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 10,
              alignItems: "center",
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              marginBottom: 6,
            }}
          >
            {/* Time */}
            <div style={{ textAlign: "center", minWidth: 64 }}>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: TAG_CONFIG[log.tag].color, fontWeight: 600 }}>
                {formatTime(log.hour, log.minute_from)}
              </div>
              <div style={{ fontSize: 10, color: "var(--color-text-faint)" }}>→ {formatTime(log.hour, log.minute_to)}</div>
            </div>
            {/* Title + tag */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", marginBottom: 2 }}>{log.title}</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{
                  fontSize: 10, padding: "1px 7px", borderRadius: 10,
                  background: TAG_CONFIG[log.tag].bg, color: TAG_CONFIG[log.tag].color, fontWeight: 600,
                }}>{TAG_CONFIG[log.tag].label}</span>
                <span style={{ color: "var(--color-text-faint)", fontSize: 10 }}>
                  {"●".repeat(log.intensity).split("").map((_,i) => (
                    <span key={i} style={{ color: TAG_CONFIG[log.tag].color, fontSize: 8 }}>●</span>
                  ))}
                </span>
                {log.note && <span style={{ fontSize: 10, color: "var(--color-text-faint)", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{log.note}</span>}
              </div>
            </div>
            {/* Delete */}
            <button
              onClick={() => handleDelete(log.id)}
              disabled={deletingId === log.id}
              style={{
                width: 26, height: 26, borderRadius: 6, border: "1px solid var(--color-border)",
                background: "transparent", color: "var(--color-text-faint)", cursor: "pointer",
                fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 150ms ease", flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-error)";
                (e.currentTarget as HTMLElement).style.color = "var(--color-error)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                (e.currentTarget as HTMLElement).style.color = "var(--color-text-faint)";
              }}
            >×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard Panel (Right) ──────────────────────────────────────────────────
function DashboardPanel({ logs }: { logs: Log[] }) {
  const totalMins = logs.reduce((acc, l) => {
    return acc + Math.max(0, (l.hour * 60 + l.minute_to) - (l.hour * 60 + l.minute_from));
  }, 0);
  const totalHrs   = (totalMins / 60).toFixed(1);
  const tagCounts  = logs.reduce((acc, l) => { acc[l.tag] = (acc[l.tag] || 0) + 1; return acc; }, {} as Record<string, number>);
  const tagMins    = logs.reduce((acc, l) => { acc[l.tag] = (acc[l.tag] || 0) + Math.max(0, l.minute_to - l.minute_from); return acc; }, {} as Record<string, number>);
  const avgIntensity = logs.length ? (logs.reduce((a, l) => a + l.intensity, 0) / logs.length).toFixed(1) : "—";
  const dominantTag  = Object.entries(tagMins).sort((a, b) => b[1] - a[1])[0]?.[0] as Tag | undefined;

  // Build 24h heatmap blocks
  const hourMap: Record<number, Log[]> = {};
  for (let h = 0; h < 24; h++) hourMap[h] = [];
  logs.forEach((l) => { if (hourMap[l.hour]) hourMap[l.hour].push(l); });

  // Sort logs by time for timeline bar
  const sorted = [...logs].sort((a, b) => (a.hour * 60 + a.minute_from) - (b.hour * 60 + b.minute_from));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── KPI Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[
          { label: "Hrs Logged", value: totalHrs, color: "var(--color-primary)" },
          { label: "Entries",    value: logs.length, color: "var(--color-text)" },
          { label: "Avg Focus",  value: avgIntensity, color: "var(--color-gold)" },
        ].map((k) => (
          <div key={k.label} style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            padding: "14px 12px",
            textAlign: "center",
          }}>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 10, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── 24h Heatmap ── */}
      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: 14,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase", marginBottom: 10 }}>24h Activity</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 3 }}>
          {Array.from({ length: 24 }, (_, h) => {
            const hasLogs = hourMap[h].length > 0;
            const topTag  = hourMap[h].sort((a, b) => b.intensity - a.intensity)[0]?.tag;
            return (
              <div key={h} title={`${pad(h)}:00 — ${hourMap[h].length} entries`} style={{
                height: 20,
                borderRadius: 4,
                background: hasLogs ? TAG_CONFIG[topTag!].bg : "var(--color-surface-offset)",
                border: `1px solid ${hasLogs ? TAG_CONFIG[topTag!].color + "60" : "var(--color-divider)"}`,
                position: "relative",
              }}>
                {hasLogs && (
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    height: `${(hourMap[h].reduce((a, l) => a + l.intensity, 0) / hourMap[h].length / 5) * 100}%`,
                    background: TAG_CONFIG[topTag!].color,
                    borderRadius: 3,
                    opacity: 0.7,
                  }} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {["12a","6a","12p","6p","11p"].map((l) => (
            <span key={l} style={{ fontSize: 9, color: "var(--color-text-faint)", fontFamily: "'Geist Mono', monospace" }}>{l}</span>
          ))}
        </div>
      </div>

      {/* ── Tag Breakdown ── */}
      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: 14,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase", marginBottom: 10 }}>Tag Breakdown</p>
        {logs.length === 0 ? (
          <div style={{ color: "var(--color-text-faint)", fontSize: 12, textAlign: "center", padding: "12px 0" }}>No data yet</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(Object.keys(TAG_CONFIG) as Tag[]).filter(t => tagMins[t]).sort((a,b) => (tagMins[b]||0)-(tagMins[a]||0)).map((t) => {
              const pct = totalMins ? ((tagMins[t] || 0) / totalMins) * 100 : 0;
              return (
                <div key={t}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: TAG_CONFIG[t].color, fontWeight: 600 }}>{TAG_CONFIG[t].label}</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "'Geist Mono', monospace" }}>{tagMins[t]}m</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: "var(--color-surface-offset)" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: TAG_CONFIG[t].color, transition: "width 400ms ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Timeline Bar ── */}
      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: 14,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase", marginBottom: 10 }}>Timeline</p>
        <div style={{ position: "relative", height: 28, background: "var(--color-surface-offset)", borderRadius: 6, overflow: "hidden" }}>
          {sorted.map((log) => {
            const startPct = ((log.hour * 60 + log.minute_from) / (24 * 60)) * 100;
            const widthPct = (Math.max(1, log.minute_to - log.minute_from) / (24 * 60)) * 100;
            return (
              <div
                key={log.id}
                title={`${formatTime(log.hour, log.minute_from)} – ${formatTime(log.hour, log.minute_to)}: ${log.title}`}
                style={{
                  position: "absolute",
                  left: `${startPct}%`,
                  width: `${Math.max(widthPct, 0.5)}%`,
                  top: 2, bottom: 2,
                  borderRadius: 3,
                  background: TAG_CONFIG[log.tag].color,
                  opacity: 0.85,
                }}
              />
            );
          })}
          {/* Current time needle */}
          {(() => {
            const n = new Date();
            const pct = ((n.getHours() * 60 + n.getMinutes()) / (24 * 60)) * 100;
            return (
              <div style={{
                position: "absolute", top: 0, bottom: 0,
                left: `${pct}%`, width: 2,
                background: "var(--color-primary)",
                borderRadius: 1,
              }} />
            );
          })()}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {["0","6","12","18","24"].map((l) => (
            <span key={l} style={{ fontSize: 9, color: "var(--color-text-faint)", fontFamily: "'Geist Mono', monospace" }}>{l}</span>
          ))}
        </div>
      </div>

      {/* ── Dominant tag badge ── */}
      {dominantTag && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: TAG_CONFIG[dominantTag].bg,
          border: `1px solid ${TAG_CONFIG[dominantTag].color}40`,
          borderRadius: 12, padding: "12px 16px",
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: TAG_CONFIG[dominantTag].color, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: TAG_CONFIG[dominantTag].color }}>{TAG_CONFIG[dominantTag].label} Day</div>
            <div style={{ fontSize: 10, color: "var(--color-text-faint)" }}>Most logged category · {tagMins[dominantTag]}m total</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Day Nav ──────────────────────────────────────────────────────────────────
function DayNav({ selected, onSelect }: { selected: string; onSelect: (d: string) => void }) {
  const days: { label: string; sub: string; val: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const val   = toDateStr(d);
    const label = i === 0 ? "Today" : i === 1 ? "Yesterday" : d.toLocaleDateString("en-IN", { weekday: "short" });
    const sub   = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    days.push({ label, sub, val });
  }
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
      {days.map((d) => (
        <button
          key={d.val}
          onClick={() => onSelect(d.val)}
          style={{
            padding: "6px 12px", borderRadius: 8, cursor: "pointer",
            border: `1px solid ${selected === d.val ? "var(--color-primary)" : "var(--color-border)"}`,
            background: selected === d.val ? "var(--color-primary-highlight)" : "transparent",
            color: selected === d.val ? "var(--color-primary)" : "var(--color-text-muted)",
            fontSize: 12, fontWeight: 600, transition: "all 150ms ease",
          }}
        >
          {d.label} <span style={{ fontWeight: 400, opacity: 0.6 }}>{d.sub}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [logs, setLogs]                 = useState<Log[]>([]);
  const [loading, setLoading]           = useState(false);

  const fetchLogs = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/logs?date=${date}`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(selectedDate); }, [selectedDate, fetchLogs]);

  const handleAdd = async (entry: Omit<Log, "id" | "date">) => {
    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...entry, date: selectedDate }),
    });
    fetchLogs(selectedDate);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/logs/${id}`, { method: "DELETE" });
    fetchLogs(selectedDate);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --color-bg:             #0e0e0d;
          --color-surface:        #141413;
          --color-surface-2:      #1a1918;
          --color-surface-offset: #201f1d;
          --color-divider:        #232220;
          --color-border:         #2e2d2b;
          --color-text:           #cdccca;
          --color-text-muted:     #797876;
          --color-text-faint:     #4a4948;
          --color-primary:        #4f98a3;
          --color-primary-highlight: rgba(79,152,163,0.12);
          --color-error:          #d163a7;
          --color-gold:           #e8af34;
        }
        html, body { height: 100%; }
        body { font-family: 'Geist', sans-serif; background: var(--color-bg); color: var(--color-text); }
        input:focus, textarea:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 3px rgba(79,152,163,0.12);
        }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* ── Header ── */}
        <header style={{
          borderBottom: "1px solid var(--color-border)",
          padding: "12px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--color-surface)",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-label="Hourly Journal">
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="var(--color-primary)" strokeWidth="1.5"/>
              <line x1="3" y1="9" x2="21" y2="9" stroke="var(--color-primary)" strokeWidth="1.5"/>
              <line x1="9" y1="9" x2="9" y2="21" stroke="var(--color-border)" strokeWidth="1"/>
              <circle cx="15" cy="15" r="2" fill="var(--color-primary)"/>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>hourly</span>
          </div>
          <DayNav selected={selectedDate} onSelect={setSelectedDate} />
        </header>

        {/* ── Body: Two columns ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(340px, 480px) 1fr",
          gap: 0,
          flex: 1,
          height: "calc(100vh - 57px)",
          overflow: "hidden",
        }}>

          {/* LEFT — Logger */}
          <div style={{
            borderRight: "1px solid var(--color-border)",
            padding: 20,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}>
            {loading ? (
              <div style={{ color: "var(--color-text-faint)", fontSize: 13, padding: 16 }}>Loading…</div>
            ) : (
              <LoggerPanel
                logs={logs}
                onAdd={handleAdd}
                onDelete={handleDelete}
                selectedDate={selectedDate}
              />
            )}
          </div>

          {/* RIGHT — Dashboard */}
          <div style={{
            padding: 20,
            overflowY: "auto",
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase", marginBottom: 16 }}>
              Productivity · {selectedDate}
            </p>
            <DashboardPanel logs={logs} />
          </div>
        </div>
      </div>
    </>
  );
}
