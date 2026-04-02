"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Tag =
  | "work"
  | "dsa"
  | "sysdes"
  | "project"
  | "prep"
  | "workout"
  | "break"
  | "personal"
  | "sleep";

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
const TAG_CONFIG: Record<Tag, { label: string; emoji: string; color: string; bg: string; group: string }> = {
  work:     { label: "Work",      emoji: "💼", color: "#4f98a3", bg: "rgba(79,152,163,0.15)",   group: "job" },
  dsa:      { label: "DSA",       emoji: "🧩", color: "#6daa45", bg: "rgba(109,170,69,0.15)",   group: "prep" },
  sysdes:   { label: "Sys Des",   emoji: "🏗️", color: "#a86fdf", bg: "rgba(168,111,223,0.15)",  group: "prep" },
  project:  { label: "Project",   emoji: "🚀", color: "#5591c7", bg: "rgba(85,145,199,0.15)",   group: "prep" },
  prep:     { label: "Prep",      emoji: "📚", color: "#fdab43", bg: "rgba(253,171,67,0.15)",   group: "prep" },
  workout:  { label: "Workout",   emoji: "💪", color: "#dd6974", bg: "rgba(221,105,116,0.15)",  group: "life" },
  break:    { label: "Break",     emoji: "☕", color: "#e8af34", bg: "rgba(232,175,52,0.15)",   group: "life" },
  personal: { label: "Personal",  emoji: "🌱", color: "#797876", bg: "rgba(121,120,118,0.15)",  group: "life" },
  sleep:    { label: "Sleep",     emoji: "🌙", color: "#393836", bg: "rgba(57,56,54,0.5)",      group: "life" },
};

const TAG_GROUPS = [
  { id: "job",  label: "Job",      tags: ["work"] as Tag[] },
  { id: "prep", label: "Job Prep", tags: ["dsa", "sysdes", "project", "prep"] as Tag[] },
  { id: "life", label: "Life",     tags: ["workout", "break", "personal", "sleep"] as Tag[] },
];

const INTENSITY_LABEL: Record<number, string> = { 1: "Low", 2: "Light", 3: "Medium", 4: "High", 5: "Deep" };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toDateStr(d: Date) { return d.toISOString().split("T")[0]; }
function pad(n: number)     { return String(n).padStart(2, "0"); }
function to24(h: number, ampm: "AM" | "PM") {
  if (ampm === "AM") return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}
function from24(h24: number): { h: number; ampm: "AM" | "PM" } {
  if (h24 === 0)  return { h: 12, ampm: "AM" };
  if (h24 < 12)   return { h: h24, ampm: "AM" };
  if (h24 === 12) return { h: 12, ampm: "PM" };
  return { h: h24 - 12, ampm: "PM" };
}
function formatTime12(h24: number, min: number) {
  const { h, ampm } = from24(h24);
  return `${pad(h)}:${pad(min)} ${ampm}`;
}
function minsOf(h: number, m: number) { return h * 60 + m; }
function durationLabel(startH: number, startM: number, endH: number, endM: number) {
  const mins = minsOf(endH, endM) - minsOf(startH, startM);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}m` : ""}`.trim();
}

// ─── TimeInput (12h picker) ──────────────────────────────────────────────────
function TimeInput({
  hour24, minute, onChange, label,
}: {
  hour24: number;
  minute: number;
  onChange: (h24: number, m: number) => void;
  label: string;
}) {
  const { h, ampm } = from24(hour24);
  const hourRef = useRef<HTMLInputElement>(null);
  const minRef  = useRef<HTMLInputElement>(null);

  const setHour = (val: string) => {
    let n = parseInt(val, 10);
    if (isNaN(n)) return;
    n = Math.max(1, Math.min(12, n));
    onChange(to24(n, ampm), minute);
  };
  const setMin = (val: string) => {
    let n = parseInt(val, 10);
    if (isNaN(n)) return;
    n = Math.max(0, Math.min(59, n));
    onChange(to24(h, ampm), n);
  };
  const toggleAmPm = () => {
    const next = ampm === "AM" ? "PM" : "AM";
    onChange(to24(h, next), minute);
  };

  const segStyle: React.CSSProperties = {
    width: 36, height: 40,
    background: "var(--color-surface-offset)",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    color: "var(--color-text)",
    fontFamily: "'Geist Mono', monospace",
    fontSize: 15, fontWeight: 600,
    textAlign: "center",
    outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
      <label style={{ fontSize: 10, color: "var(--color-text-faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <input
          ref={hourRef}
          type="number" min={1} max={12} value={h}
          onChange={(e) => setHour(e.target.value)}
          onFocus={(e) => e.target.select()}
          style={segStyle}
        />
        <span style={{ color: "var(--color-text-faint)", fontFamily: "monospace", fontWeight: 700, fontSize: 16, paddingBottom: 2 }}>:</span>
        <input
          ref={minRef}
          type="number" min={0} max={59} value={pad(minute)}
          onChange={(e) => setMin(e.target.value)}
          onFocus={(e) => e.target.select()}
          style={segStyle}
        />
        <button
          onClick={toggleAmPm}
          style={{
            height: 40, padding: "0 8px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: ampm === "PM" ? "rgba(79,152,163,0.15)" : "var(--color-surface-offset)",
            color: ampm === "PM" ? "var(--color-primary)" : "var(--color-text-muted)",
            fontFamily: "'Geist Mono', monospace",
            fontSize: 11, fontWeight: 700,
            cursor: "pointer",
            transition: "all 140ms ease",
            letterSpacing: "0.04em",
          }}
        >{ampm}</button>
      </div>
    </div>
  );
}

// ─── Logger Panel (Left) ──────────────────────────────────────────────────────
function LoggerPanel({
  logs, onAdd, onDelete, selectedDate,
}: {
  logs: Log[];
  onAdd: (log: Omit<Log, "id" | "date">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  selectedDate: string;
}) {
  const now     = new Date();
  const isToday = selectedDate === toDateStr(now);

  const lastLog = [...logs].sort((a, b) => minsOf(a.hour, a.minute_to) - minsOf(b.hour, b.minute_to)).at(-1);

  const defaultSH = lastLog ? (lastLog.minute_to >= 59 ? (lastLog.hour + 1) % 24 : lastLog.hour) : (isToday ? now.getHours() : 0);
  const defaultSM = lastLog ? (lastLog.minute_to >= 59 ? 0 : lastLog.minute_to + 1) : (isToday ? now.getMinutes() : 0);

  const [startH, setStartH] = useState(defaultSH);
  const [startM, setStartM] = useState(defaultSM);
  const [endH,   setEndH]   = useState(defaultSH);
  const [endM,   setEndM]   = useState(Math.min(defaultSM + 30, 59));
  const [title,  setTitle]  = useState("");
  const [tag,    setTag]    = useState<Tag>("work");
  const [intensity, setIntensity] = useState(3);
  const [note,   setNote]   = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const last = [...logs].sort((a, b) => minsOf(a.hour, a.minute_to) - minsOf(b.hour, b.minute_to)).at(-1);
    if (last) {
      const nH = last.minute_to >= 59 ? (last.hour + 1) % 24 : last.hour;
      const nM = last.minute_to >= 59 ? 0 : last.minute_to + 1;
      setStartH(nH); setStartM(nM);
      setEndH(nH);   setEndM(Math.min(nM + 30, 59));
    }
  }, [logs]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onAdd({ hour: startH, minute_from: startM, minute_to: endM, title: title.trim(), note, tag, intensity });
    setTitle(""); setNote(""); setIntensity(3);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  const dur = durationLabel(startH, startM, endH, endM);

  const sorted = [...logs].sort((a, b) => minsOf(a.hour, a.minute_from) - minsOf(b.hour, b.minute_from));

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "9px 12px",
    borderRadius: 8, border: "1px solid var(--color-border)",
    background: "var(--color-surface-offset)",
    color: "var(--color-text)", fontSize: 13,
    outline: "none", fontFamily: "inherit",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, height: "100%" }}>

      {/* ── Entry Form ── */}
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4f98a3", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>New Entry</span>
        </div>

        {/* Time row */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
          <TimeInput label="From" hour24={startH} minute={startM} onChange={(h, m) => { setStartH(h); setStartM(m); }} />
          <div style={{ color: "var(--color-text-faint)", fontSize: 18, paddingBottom: 8, flexShrink: 0 }}>→</div>
          <TimeInput label="To"   hour24={endH}   minute={endM}   onChange={(h, m) => { setEndH(h); setEndM(m); }} />
        </div>

        {/* Duration pill */}
        {dur && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: -6 }}>
            <div style={{ height: 1, flex: 1, background: "var(--color-border)" }} />
            <span style={{ fontSize: 11, color: "var(--color-primary)", fontFamily: "'Geist Mono', monospace", fontWeight: 600 }}>⏱ {dur}</span>
            <div style={{ height: 1, flex: 1, background: "var(--color-border)" }} />
          </div>
        )}

        {/* What did you do */}
        <input
          autoFocus value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSave()}
          placeholder="What did you do? (Enter to save)"
          style={inputBase}
        />

        {/* Tags grouped */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TAG_GROUPS.map((g) => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 9, color: "var(--color-text-faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 46 }}>{g.label}</span>
              {g.tags.map((t) => {
                const cfg = TAG_CONFIG[t];
                const active = tag === t;
                return (
                  <button key={t} onClick={() => setTag(t)} style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
                    border: `1px solid ${active ? cfg.color : "var(--color-border)"}`,
                    background: active ? cfg.bg : "transparent",
                    color: active ? cfg.color : "var(--color-text-faint)",
                    transition: "all 140ms ease",
                  }}>
                    {cfg.emoji} {cfg.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Intensity */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "var(--color-text-faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 54 }}>Focus</span>
          {[1,2,3,4,5].map((n) => {
            const active = intensity >= n;
            const cfg = TAG_CONFIG[tag];
            return (
              <button key={n} onClick={() => setIntensity(n)} title={INTENSITY_LABEL[n]} style={{
                flex: 1, height: 28, borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer",
                border: `1px solid ${active ? cfg.color : "var(--color-border)"}`,
                background: active ? cfg.bg : "transparent",
                color: active ? cfg.color : "var(--color-text-faint)",
                transition: "all 140ms ease",
              }}>{INTENSITY_LABEL[n]}</button>
            );
          })}
        </div>

        {/* Note */}
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
          placeholder="Notes (optional)…"
          style={{ ...inputBase, resize: "none" }} />

        {/* Save */}
        <button onClick={handleSave} disabled={saving || !title.trim()} style={{
          padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 700,
          cursor: saving || !title.trim() ? "not-allowed" : "pointer",
          border: "none", background: "var(--color-primary)", color: "#fff",
          opacity: saving || !title.trim() ? 0.4 : 1,
          transition: "opacity 150ms ease",
        }}>
          {saving ? "Saving…" : "Log Entry →"}
        </button>
      </div>

      {/* ── Log Feed ── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase", marginBottom: 4 }}>
          {sorted.length} {sorted.length === 1 ? "entry" : "entries"} logged
        </p>
        {sorted.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-text-faint)", fontSize: 13 }}>
            No entries yet. Start logging ↑
          </div>
        )}
        {sorted.map((log) => {
          const cfg = TAG_CONFIG[log.tag];
          const dur = durationLabel(log.hour, log.minute_from, log.hour, log.minute_to) || "–";
          return (
            <div key={log.id} style={{
              display: "grid", gridTemplateColumns: "56px 1fr auto", gap: 10,
              alignItems: "center", padding: "10px 12px",
              borderRadius: 10, background: "var(--color-surface)", border: "1px solid var(--color-border)",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: cfg.color, fontWeight: 700 }}>
                  {formatTime12(log.hour, log.minute_from).split(" ")[0]}
                </div>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: "var(--color-text-faint)" }}>
                  {from24(log.hour).ampm}
                </div>
                <div style={{ fontSize: 9, color: "var(--color-text-faint)", marginTop: 1 }}>{dur}</div>
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{log.title}</div>
                <div style={{ display: "flex", gap: 5, alignItems: "center", marginTop: 3 }}>
                  <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 10, background: cfg.bg, color: cfg.color, fontWeight: 600 }}>
                    {cfg.emoji} {cfg.label}
                  </span>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1,2,3,4,5].map((n) => (
                      <div key={n} style={{ width: 5, height: 5, borderRadius: "50%", background: n <= log.intensity ? cfg.color : "var(--color-border)" }} />
                    ))}
                  </div>
                  {log.note && <span style={{ fontSize: 10, color: "var(--color-text-faint)", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 100 }}>{log.note}</span>}
                </div>
              </div>
              <button onClick={() => handleDelete(log.id)} disabled={deletingId === log.id} style={{
                width: 26, height: 26, borderRadius: 6, border: "1px solid var(--color-border)",
                background: "transparent", color: "var(--color-text-faint)", cursor: "pointer",
                fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 150ms ease",
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--color-error)"; el.style.color = "var(--color-error)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--color-border)"; el.style.color = "var(--color-text-faint)"; }}
              >×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "14px 14px 12px" }}>
      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 20, fontWeight: 700, color: color || "var(--color-text)", letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 10, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Dashboard Panel (Right) ──────────────────────────────────────────────────
function DashboardPanel({ logs }: { logs: Log[] }) {
  const totalMins  = logs.reduce((acc, l) => acc + Math.max(0, minsOf(l.hour, l.minute_to) - minsOf(l.hour, l.minute_from)), 0);
  const totalHrs   = (totalMins / 60).toFixed(1);
  const tagMins    = logs.reduce((acc, l) => { acc[l.tag] = (acc[l.tag] || 0) + Math.max(0, minsOf(l.hour, l.minute_to) - minsOf(l.hour, l.minute_from)); return acc; }, {} as Partial<Record<Tag, number>>);
  const avgInt     = logs.length ? (logs.reduce((a, l) => a + l.intensity, 0) / logs.length) : 0;
  const dominantTag = Object.entries(tagMins).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] as Tag | undefined;
  const longestLog  = [...logs].sort((a, b) => (minsOf(b.hour, b.minute_to) - minsOf(b.hour, b.minute_from)) - (minsOf(a.hour, a.minute_to) - minsOf(a.hour, a.minute_from)))[0];

  const prepTags: Tag[] = ["dsa", "sysdes", "project", "prep"];
  const prepMins  = prepTags.reduce((a, t) => a + (tagMins[t] || 0), 0);
  const prepScore = totalMins ? Math.round((prepMins / totalMins) * 100) : 0;
  const workMins  = tagMins["work"] || 0;

  const hourMap: Record<number, Log[]> = {};
  for (let h = 0; h < 24; h++) hourMap[h] = [];
  logs.forEach((l) => { if (hourMap[l.hour]) hourMap[l.hour].push(l); });

  const peakHour = Object.entries(hourMap)
    .map(([h, ls]) => ({ h: Number(h), score: ls.reduce((a, l) => a + l.intensity, 0) }))
    .sort((a, b) => b.score - a.score)[0];

  const sorted = [...logs].sort((a, b) => minsOf(a.hour, a.minute_from) - minsOf(b.hour, b.minute_from));

  let maxGap = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = minsOf(sorted[i].hour, sorted[i].minute_from) - minsOf(sorted[i-1].hour, sorted[i-1].minute_to);
    if (gap > maxGap) maxGap = gap;
  }

  const intensityColor = avgInt >= 4 ? "#6daa45" : avgInt >= 3 ? "#4f98a3" : avgInt >= 2 ? "#e8af34" : "#dd6974";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── KPI Grid 2x3 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <StatCard label="Hrs Logged"   value={totalHrs}         color="var(--color-primary)" sub={`${logs.length} entries`} />
        <StatCard label="Avg Focus"    value={avgInt ? `${avgInt.toFixed(1)}/5` : "—"} color={intensityColor} sub={avgInt >= 4 ? "🔥 Deep work day" : avgInt >= 3 ? "✅ Good focus" : avgInt > 0 ? "⚡ Light day" : undefined} />
        <StatCard label="Job Prep"     value={`${Math.floor(prepMins / 60)}h ${prepMins % 60}m`} color="#a86fdf" sub={`${prepScore}% of day`} />
        <StatCard label="Job (Work)"   value={`${Math.floor(workMins / 60)}h ${workMins % 60}m`} color="#4f98a3" sub={workMins ? `${Math.round((workMins/totalMins)*100)}% of day` : "Not logged"} />
        <StatCard label="Peak Hour"    value={peakHour?.score ? formatTime12(peakHour.h, 0).replace(":00", "") : "—"} color="var(--color-gold)" sub={peakHour?.score ? `Score ${peakHour.score}` : undefined} />
        <StatCard label="Biggest Gap"  value={maxGap ? `${maxGap}m` : "—"} color={maxGap > 60 ? "var(--color-error)" : "var(--color-text-muted)"} sub={maxGap > 60 ? "⚠ Large gap" : maxGap > 0 ? "Minimal gaps" : undefined} />
      </div>

      {/* ── Timeline Bar ── */}
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase" }}>Day Timeline</p>
          {dominantTag && (
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: TAG_CONFIG[dominantTag].bg, color: TAG_CONFIG[dominantTag].color, fontWeight: 600 }}>
              {TAG_CONFIG[dominantTag].emoji} {TAG_CONFIG[dominantTag].label} day
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
            const n = new Date();
            const pct = (minsOf(n.getHours(), n.getMinutes()) / 1440) * 100;
            return <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pct}%`, width: 2, background: "#fff", opacity: 0.6, borderRadius: 1 }} />;
          })()}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          {["12am","3am","6am","9am","12pm","3pm","6pm","9pm",""].map((l, i) => (
            <span key={i} style={{ fontSize: 9, color: "var(--color-text-faint)", fontFamily: "'Geist Mono', monospace" }}>{l}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          {(Object.keys(TAG_CONFIG) as Tag[]).filter(t => tagMins[t]).map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: TAG_CONFIG[t].color }} />
              <span style={{ fontSize: 10, color: "var(--color-text-faint)" }}>{TAG_CONFIG[t].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 24h Heatmap ── */}
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 14 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase", marginBottom: 10 }}>24h Activity Heatmap</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 3 }}>
          {Array.from({ length: 24 }, (_, h) => {
            const hLogs  = hourMap[h];
            const topTag = hLogs.sort((a, b) => b.intensity - a.intensity)[0]?.tag;
            const fill   = hLogs.length > 0 ? (hLogs.reduce((a, l) => a + l.intensity, 0) / hLogs.length / 5) : 0;
            return (
              <div key={h} title={`${formatTime12(h, 0)} — ${hLogs.length} entries`} style={{
                height: 36, borderRadius: 4, overflow: "hidden",
                background: "var(--color-surface-offset)",
                border: `1px solid ${hLogs.length ? TAG_CONFIG[topTag!].color + "50" : "var(--color-divider)"}`,
                position: "relative", display: "flex", alignItems: "flex-end",
              }}>
                {fill > 0 && <div style={{ width: "100%", height: `${fill * 100}%`, background: TAG_CONFIG[topTag!].color, opacity: 0.75, borderRadius: 3 }} />}
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

      {/* ── Tag Breakdown ── */}
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
                      <span style={{ fontSize: 12 }}>{cfg.emoji}</span>
                      <span style={{ fontSize: 12, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "'Geist Mono', monospace" }}>
                        {Math.floor(mins / 60) > 0 ? `${Math.floor(mins / 60)}h ` : ""}{mins % 60}m
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

      {/* ── Productivity Score ── */}
      {logs.length > 0 && (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase", marginBottom: 12 }}>Day Score</p>
          {(() => {
            const coveredHours = new Set(logs.map(l => l.hour)).size;
            const coverage  = Math.min(coveredHours / 16, 1) * 100;
            const score     = Math.round(prepScore * 0.4 + (avgInt / 5 * 100) * 0.3 + coverage * 0.2 + (maxGap < 60 ? 100 : 50) * 0.1);
            const grade     = score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D";
            const gradeColor = score >= 80 ? "#6daa45" : score >= 65 ? "#4f98a3" : score >= 50 ? "#e8af34" : "#dd6974";
            const items = [
              { label: "Job Prep %",    val: prepScore,               color: "#a86fdf" },
              { label: "Focus Level",   val: Math.round(avgInt / 5 * 100), color: intensityColor },
              { label: "Hour Coverage", val: Math.round(coverage),    color: "#5591c7" },
            ];
            return (
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
            );
          })()}
        </div>
      )}

      {/* ── Best entry ── */}
      {longestLog && (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase", marginBottom: 8 }}>Deepest Session</p>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: TAG_CONFIG[longestLog.tag].bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {TAG_CONFIG[longestLog.tag].emoji}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{longestLog.title}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-faint)", marginTop: 2 }}>
                {formatTime12(longestLog.hour, longestLog.minute_from)} · {durationLabel(longestLog.hour, longestLog.minute_from, longestLog.hour, longestLog.minute_to)} · Intensity {longestLog.intensity}/5
              </div>
            </div>
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
    <div style={{ display: "flex", gap: 4 }}>
      {days.map((d) => (
        <button key={d.val} onClick={() => onSelect(d.val)} style={{
          padding: "5px 11px", borderRadius: 8, cursor: "pointer",
          border: `1px solid ${selected === d.val ? "var(--color-primary)" : "var(--color-border)"}`,
          background: selected === d.val ? "rgba(79,152,163,0.12)" : "transparent",
          color: selected === d.val ? "var(--color-primary)" : "var(--color-text-muted)",
          fontSize: 11, fontWeight: 600, transition: "all 140ms ease",
          lineHeight: 1.4,
        }}>
          {d.label}<br />
          <span style={{ fontWeight: 400, opacity: 0.6, fontSize: 10 }}>{d.sub}</span>
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
    } finally { setLoading(false); }
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
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --color-bg:              #0e0e0d;
          --color-surface:         #141413;
          --color-surface-offset:  #1c1b19;
          --color-divider:         #232220;
          --color-border:          #2e2d2b;
          --color-text:            #cdccca;
          --color-text-muted:      #797876;
          --color-text-faint:      #4a4948;
          --color-primary:         #4f98a3;
          --color-error:           #d163a7;
          --color-gold:            #e8af34;
        }
        html, body { height: 100%; }
        body { font-family: 'Geist', sans-serif; background: var(--color-bg); color: var(--color-text); -webkit-font-smoothing: antialiased; }
        input:focus, textarea:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 3px rgba(79,152,163,0.12);
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 0.2; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }
        button:hover { opacity: 0.85; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* ── Header ── */}
        <header style={{
          borderBottom: "1px solid var(--color-border)", padding: "10px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--color-surface)", position: "sticky", top: 0, zIndex: 50,
          gap: 16,
        }}>
          {/* Logo / App name */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-label="Hourly Journal">
              <circle cx="13" cy="13" r="12" stroke="var(--color-primary)" strokeWidth="1.5"/>
              <line x1="13" y1="4" x2="13" y2="13" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="13" y1="13" x2="18" y2="16" stroke="var(--color-text-muted)" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="13" cy="13" r="1.5" fill="var(--color-primary)"/>
            </svg>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
              <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text)" }}>Hourly Journal</span>
              <span style={{ fontSize: 10, color: "var(--color-text-faint)", letterSpacing: "0.04em", fontWeight: 500 }}>100% ACCOUNTABILITY</span>
            </div>
          </div>
          <DayNav selected={selectedDate} onSelect={setSelectedDate} />
        </header>

        {/* ── Body ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "minmax(320px, 420px) 1fr",
          flex: 1, height: "calc(100vh - 57px)", overflow: "hidden",
        }}>
          {/* LEFT — Logger */}
          <div style={{ borderRight: "1px solid var(--color-border)", padding: 16, overflowY: "auto" }}>
            {loading
              ? <div style={{ color: "var(--color-text-faint)", fontSize: 13, padding: 16, textAlign: "center" }}>Loading…</div>
              : <LoggerPanel logs={logs} onAdd={handleAdd} onDelete={handleDelete} selectedDate={selectedDate} />
            }
          </div>

          {/* RIGHT — Dashboard */}
          <div style={{ padding: 16, overflowY: "auto" }}>
            <DashboardPanel logs={logs} />
          </div>
        </div>
      </div>
    </>
  );
}
