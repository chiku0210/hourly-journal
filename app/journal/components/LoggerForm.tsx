"use client";

import { useState, useEffect } from "react";
import { Log, Tag } from "@/lib/types";
import { toDateStr, sortLogsByEndTime, minsOf, durationLabel } from "@/lib/utils";
import TimeInput from "./TimeInput";
import TagSelector from "./TagSelector";
import IntensitySelector from "./IntensitySelector";

interface LoggerFormProps {
  logs: Log[];
  onAdd: (log: Omit<Log, "id" | "date">) => Promise<void>;
  selectedDate: string;
}

export default function LoggerForm({ logs, onAdd, selectedDate }: LoggerFormProps) {
  const now     = new Date();
  const isToday = selectedDate === toDateStr(now);

  const lastLog = sortLogsByEndTime(logs).at(-1);

  const defaultSH = lastLog ? (lastLog.minute_to >= 59 ? (lastLog.hour + 1) % 24 : lastLog.hour) : (isToday ? now.getHours() : 0);
  const defaultSM = lastLog ? (lastLog.minute_to >= 59 ? 0 : lastLog.minute_to + 1) : (isToday ? now.getMinutes() : 0);

  const [startH,    setStartH]    = useState(defaultSH);
  const [startM,    setStartM]    = useState(defaultSM);
  const [endH,      setEndH]      = useState(defaultSH);
  const [endM,      setEndM]      = useState(Math.min(defaultSM + 30, 59));
  const [title,     setTitle]     = useState("");
  const [tag,       setTag]       = useState<Tag>("work");
  const [intensity, setIntensity] = useState(3);
  const [note,      setNote]      = useState("");
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    const last = sortLogsByEndTime(logs).at(-1);
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

  const dur = durationLabel(startH, startM, endH, endM);

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "11px 14px",
    borderRadius: 10, border: "1px solid var(--color-border)",
    background: "var(--color-surface-offset)",
    color: "var(--color-text)", fontSize: 15,
    outline: "none", fontFamily: "inherit",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
    WebkitAppearance: "none",
  } as React.CSSProperties;

  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 16, padding: 16,
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4f98a3", animation: "pulse 2s infinite", flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>New Entry</span>
      </div>

      {/* Time row */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
        <TimeInput label="From" hour24={startH} minute={startM} onChange={(h, m) => { setStartH(h); setStartM(m); }} />
        <div style={{ color: "var(--color-text-faint)", fontSize: 18, paddingBottom: 10, flexShrink: 0 }}>→</div>
        <TimeInput label="To"   hour24={endH}   minute={endM}   onChange={(h, m) => { setEndH(h);   setEndM(m); }} />
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
        placeholder="What did you do?"
        style={inputBase}
      />

      {/* Tags grouped */}
      <TagSelector selectedTag={tag} onChange={setTag} />

      {/* Intensity */}
      <IntensitySelector intensity={intensity} tag={tag} onChange={setIntensity} />

      {/* Note */}
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
        placeholder="Notes (optional)…"
        style={{ ...inputBase, resize: "none" }} />

      {/* Save */}
      <button onClick={handleSave} disabled={saving || !title.trim()} style={{
        padding: "13px 0", borderRadius: 12, fontSize: 15, fontWeight: 700,
        cursor: saving || !title.trim() ? "not-allowed" : "pointer",
        border: "none", background: "var(--color-primary)", color: "#fff",
        opacity: saving || !title.trim() ? 0.4 : 1,
        transition: "opacity 150ms ease",
        minHeight: 48,
        WebkitTapHighlightColor: "transparent",
      } as React.CSSProperties}>
        {saving ? "Saving…" : "Log Entry →"}
      </button>
    </div>
  );
}