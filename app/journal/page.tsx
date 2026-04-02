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

type ModalState = {
  open: boolean;
  hour: number | null;
  log: Log | null; // null = create, Log = edit
};

// ─── Constants ───────────────────────────────────────────────────────────────
const TAG_CONFIG: Record<Tag, { label: string; color: string; bg: string }> = {
  work:     { label: "Work",     color: "#4f98a3", bg: "rgba(79,152,163,0.15)" },
  focus:    { label: "Focus",    color: "#6daa45", bg: "rgba(109,170,69,0.15)" },
  break:    { label: "Break",    color: "#e8af34", bg: "rgba(232,175,52,0.15)" },
  personal: { label: "Personal", color: "#a86fdf", bg: "rgba(168,111,223,0.15)" },
  general:  { label: "General",  color: "#797876", bg: "rgba(121,120,118,0.15)" },
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatHour(h: number) {
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${String(display).padStart(2, "0")}:00 ${suffix}`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// ─── Day Navigator ────────────────────────────────────────────────────────────
function DayNav({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (d: string) => void;
}) {
  const days: { label: string; sub: string; val: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const val = toDateStr(d);
    const label = i === 0 ? "Today" : i === 1 ? "Yesterday" : d.toLocaleDateString("en-IN", { weekday: "short" });
    const sub = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    days.push({ label, sub, val });
  }

  return (
    <aside style={{
      width: 140,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      gap: 4,
      paddingRight: 16,
      borderRight: "1px solid var(--color-border)",
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "var(--color-text-faint)", textTransform: "uppercase", marginBottom: 8 }}>Days</p>
      {days.map((d) => (
        <button
          key={d.val}
          onClick={() => onSelect(d.val)}
          style={{
            textAlign: "left",
            padding: "8px 10px",
            borderRadius: 8,
            background: selected === d.val ? "var(--color-primary-highlight)" : "transparent",
            border: selected === d.val ? "1px solid var(--color-primary)" : "1px solid transparent",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: selected === d.val ? "var(--color-primary)" : "var(--color-text)" }}>{d.label}</div>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{d.sub}</div>
        </button>
      ))}
    </aside>
  );
}

// ─── Time Block ───────────────────────────────────────────────────────────────
function TimeBlock({
  hour,
  logs,
  isNow,
  onAdd,
  onEdit,
}: {
  hour: number;
  logs: Log[];
  isNow: boolean;
  onAdd: (hour: number) => void;
  onEdit: (log: Log) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "72px 1fr",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid var(--color-divider)",
        background: isNow ? "rgba(79,152,163,0.04)" : "transparent",
        position: "relative",
      }}
    >
      {/* Hour label */}
      <div style={{ display: "flex", alignItems: "flex-start", paddingTop: 2 }}>
        <span style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 12,
          color: isNow ? "var(--color-primary)" : "var(--color-text-faint)",
          fontWeight: isNow ? 700 : 400,
          letterSpacing: "0.02em",
        }}>
          {String(hour).padStart(2, "0")}:00
          {isNow && (
            <span style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--color-primary)",
              marginLeft: 4,
              verticalAlign: "middle",
              animation: "pulse 2s infinite",
            }} />
          )}
        </span>
      </div>

      {/* Task chips + add button */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "flex-start", minHeight: 36 }}>
        {logs.map((log) => (
          <button
            key={log.id}
            onClick={() => onEdit(log)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 20,
              background: TAG_CONFIG[log.tag].bg,
              border: `1px solid ${TAG_CONFIG[log.tag].color}40`,
              cursor: "pointer",
              fontSize: 12,
              color: "var(--color-text)",
              fontWeight: 500,
              transition: "all 150ms ease",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: TAG_CONFIG[log.tag].color, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>
              {pad(log.minute_from)}–{pad(log.minute_to)}
            </span>
            <span>{log.title}</span>
            {"●".repeat(log.intensity).split("").map((_, i) => (
              <span key={i} style={{ fontSize: 6, color: TAG_CONFIG[log.tag].color, lineHeight: 1 }}>●</span>
            ))}
          </button>
        ))}
        <button
          onClick={() => onAdd(hour)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 8px",
            borderRadius: 20,
            border: "1px dashed var(--color-border)",
            background: "transparent",
            cursor: "pointer",
            fontSize: 12,
            color: "var(--color-text-faint)",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-primary)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-faint)";
          }}
        >
          + log
        </button>
      </div>
    </div>
  );
}

// ─── Task Modal ───────────────────────────────────────────────────────────────
function TaskModal({
  modal,
  onClose,
  onSave,
  onDelete,
}: {
  modal: ModalState;
  onClose: () => void;
  onSave: (data: Omit<Log, "id" | "date" | "created_at" | "updated_at">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const editing = modal.log;
  const [title, setTitle] = useState(editing?.title ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  const [tag, setTag] = useState<Tag>(editing?.tag ?? "general");
  const [intensity, setIntensity] = useState(editing?.intensity ?? 3);
  const [minuteFrom, setMinuteFrom] = useState(editing?.minute_from ?? 0);
  const [minuteTo, setMinuteTo] = useState(editing?.minute_to ?? 59);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(editing?.title ?? "");
    setNote(editing?.note ?? "");
    setTag(editing?.tag ?? "general");
    setIntensity(editing?.intensity ?? 3);
    setMinuteFrom(editing?.minute_from ?? 0);
    setMinuteTo(editing?.minute_to ?? 59);
  }, [modal]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ hour: modal.hour!, minute_from: minuteFrom, minute_to: minuteTo, title: title.trim(), note, tag, intensity });
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!editing) return;
    setSaving(true);
    await onDelete(editing.id);
    setSaving(false);
    onClose();
  };

  if (!modal.open) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid var(--color-border)",
    background: "var(--color-surface-offset)",
    color: "var(--color-text)",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text)" }}>
            {editing ? "Edit Task" : `Log ${formatHour(modal.hour!)}`}
          </h2>
          <button onClick={onClose} style={{ color: "var(--color-text-muted)", fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {/* Title */}
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>TASK</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="What did you do?"
            style={inputStyle}
          />
        </div>

        {/* Minute range */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>FROM (min)</label>
            <input type="number" min={0} max={59} value={minuteFrom} onChange={(e) => setMinuteFrom(Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>TO (min)</label>
            <input type="number" min={0} max={59} value={minuteTo} onChange={(e) => setMinuteTo(Number(e.target.value))} style={inputStyle} />
          </div>
        </div>

        {/* Tag */}
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>TAG</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(Object.keys(TAG_CONFIG) as Tag[]).map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: `1px solid ${tag === t ? TAG_CONFIG[t].color : "var(--color-border)"}`,
                  background: tag === t ? TAG_CONFIG[t].bg : "transparent",
                  color: tag === t ? TAG_CONFIG[t].color : "var(--color-text-muted)",
                  transition: "all 150ms ease",
                }}
              >
                {TAG_CONFIG[t].label}
              </button>
            ))}
          </div>
        </div>

        {/* Intensity */}
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>
            INTENSITY — <span style={{ color: TAG_CONFIG[tag].color }}>{intensity}/5</span>
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setIntensity(n)}
                style={{
                  width: 36, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${intensity >= n ? TAG_CONFIG[tag].color : "var(--color-border)"}`,
                  background: intensity >= n ? TAG_CONFIG[tag].bg : "transparent",
                  color: intensity >= n ? TAG_CONFIG[tag].color : "var(--color-text-faint)",
                  transition: "all 150ms ease",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>NOTES (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Any context..."
            style={{ ...inputStyle, resize: "none" }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
          {editing && (
            <button
              onClick={handleDelete}
              disabled={saving}
              style={{
                padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                border: "1px solid var(--color-error)", background: "transparent", color: "var(--color-error)",
                transition: "all 150ms ease",
              }}
            >
              Delete
            </button>
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text-muted)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              style={{
                padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                border: "none", background: "var(--color-primary)", color: "#fff",
                opacity: saving || !title.trim() ? 0.5 : 1,
                transition: "all 150ms ease",
              }}
            >
              {saving ? "Saving…" : editing ? "Update" : "Log It"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({ open: false, hour: null, log: null });
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  // Keep current hour live
  useEffect(() => {
    const t = setInterval(() => setCurrentHour(new Date().getHours()), 60_000);
    return () => clearInterval(t);
  }, []);

  const fetchLogs = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/logs?date=${date}`);
      const data = await res.json();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(selectedDate);
  }, [selectedDate, fetchLogs]);

  const handleSave = async (data: Omit<Log, "id" | "date" | "created_at" | "updated_at">) => {
    if (modal.log) {
      // Edit
      await fetch(`/api/logs/${modal.log.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      // Create
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, date: selectedDate }),
      });
    }
    fetchLogs(selectedDate);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/logs/${id}`, { method: "DELETE" });
    fetchLogs(selectedDate);
  };

  // Stats
  const totalLogged = logs.length;
  const hoursWithLogs = new Set(logs.map((l) => l.hour)).size;
  const dominantTag = Object.entries(
    logs.reduce((acc, l) => ({ ...acc, [l.tag]: (acc[l.tag as Tag] || 0) + 1 }), {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])[0]?.[0] as Tag | undefined;

  return (
    <>
      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --color-bg: #0e0e0d;
          --color-surface: #141413;
          --color-surface-2: #1a1918;
          --color-surface-offset: #201f1d;
          --color-divider: #232220;
          --color-border: #2e2d2b;
          --color-text: #cdccca;
          --color-text-muted: #797876;
          --color-text-faint: #4a4948;
          --color-primary: #4f98a3;
          --color-primary-highlight: rgba(79,152,163,0.12);
          --color-error: #d163a7;
        }
        body { font-family: 'Geist', sans-serif; background: var(--color-bg); color: var(--color-text); }
        input:focus, textarea:focus { border-color: var(--color-primary) !important; box-shadow: 0 0 0 3px rgba(79,152,163,0.15); }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <header style={{
          borderBottom: "1px solid var(--color-border)",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--color-surface)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Logo */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-label="Hourly Journal">
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="var(--color-primary)" strokeWidth="1.5"/>
              <line x1="3" y1="9" x2="21" y2="9" stroke="var(--color-primary)" strokeWidth="1.5"/>
              <line x1="9" y1="9" x2="9" y2="21" stroke="var(--color-border)" strokeWidth="1"/>
              <circle cx="15" cy="15" r="2" fill="var(--color-primary)"/>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>hourly</span>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontFamily: "'Geist Mono', monospace" }}>
              {selectedDate}
            </span>
          </div>

          {/* Stats bar */}
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 16, fontWeight: 700, color: "var(--color-primary)" }}>{hoursWithLogs}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>hrs logged</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 16, fontWeight: 700, color: "var(--color-text)" }}>{totalLogged}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>tasks</div>
            </div>
            {dominantTag && (
              <div style={{
                padding: "4px 12px", borderRadius: 20,
                background: TAG_CONFIG[dominantTag].bg,
                border: `1px solid ${TAG_CONFIG[dominantTag].color}40`,
                fontSize: 12, color: TAG_CONFIG[dominantTag].color, fontWeight: 600,
              }}>
                {TAG_CONFIG[dominantTag].label} day
              </div>
            )}
          </div>
        </header>

        {/* Body */}
        <div style={{ display: "flex", flex: 1, padding: "24px", gap: 24, maxWidth: 1100, margin: "0 auto", width: "100%" }}>

          {/* Day Nav */}
          <DayNav selected={selectedDate} onSelect={setSelectedDate} />

          {/* Timeline */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {HOURS.map((h) => (
                  <div key={h} style={{ height: 44, background: "var(--color-surface-offset)", borderRadius: 6, marginBottom: 2, opacity: 0.5 }} />
                ))}
              </div>
            ) : (
              <div>
                {HOURS.map((hour) => (
                  <TimeBlock
                    key={hour}
                    hour={hour}
                    logs={logs.filter((l) => l.hour === hour)}
                    isNow={toDateStr(new Date()) === selectedDate && currentHour === hour}
                    onAdd={(h) => setModal({ open: true, hour: h, log: null })}
                    onEdit={(log) => setModal({ open: true, hour: log.hour, log })}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal */}
      <TaskModal
        modal={modal}
        onClose={() => setModal({ open: false, hour: null, log: null })}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}