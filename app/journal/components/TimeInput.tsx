"use client";

import { from24, to24, pad } from "@/lib/utils";

interface TimeInputProps {
  hour24: number;
  minute: number;
  onChange: (h24: number, m: number) => void;
  label: string;
}

export default function TimeInput({ hour24, minute, onChange, label }: TimeInputProps) {
  const { h, ampm } = from24(hour24);

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
    width: 44, height: 44,
    background: "var(--color-surface-offset)",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    color: "var(--color-text)",
    fontFamily: "'Geist Mono', monospace",
    fontSize: 16, fontWeight: 600,
    textAlign: "center",
    outline: "none",
    WebkitAppearance: "none",
    MozAppearance: "textfield",
  } as React.CSSProperties;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
      <label style={{ fontSize: 10, color: "var(--color-text-faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input
          type="number" min={1} max={12} value={h}
          onChange={(e) => setHour(e.target.value)}
          onFocus={(e) => e.target.select()}
          style={segStyle}
          inputMode="numeric"
        />
        <span style={{ color: "var(--color-text-faint)", fontFamily: "monospace", fontWeight: 700, fontSize: 18 }}>:</span>
        <input
          type="number" min={0} max={59} value={pad(minute)}
          onChange={(e) => setMin(e.target.value)}
          onFocus={(e) => e.target.select()}
          style={segStyle}
          inputMode="numeric"
        />
        <button
          onClick={toggleAmPm}
          style={{
            height: 44, padding: "0 10px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: ampm === "PM" ? "rgba(79,152,163,0.15)" : "var(--color-surface-offset)",
            color: ampm === "PM" ? "var(--color-primary)" : "var(--color-text-muted)",
            fontFamily: "'Geist Mono', monospace",
            fontSize: 12, fontWeight: 700,
            cursor: "pointer",
            transition: "all 140ms ease",
            letterSpacing: "0.04em",
            flexShrink: 0,
          }}
        >{ampm}</button>
      </div>
    </div>
  );
}