"use client";

import { getDayOptions } from "@/lib/utils";

interface DayNavProps {
  selected: string;
  onSelect: (d: string) => void;
}

export default function DayNav({ selected, onSelect }: DayNavProps) {
  const days = getDayOptions(6);

  return (
    <div style={{
      display: "flex", gap: 4, overflowX: "auto",
      WebkitOverflowScrolling: "touch",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      paddingBottom: 2,
    } as React.CSSProperties}>
      {days.map((d) => (
        <button key={d.val} onClick={() => onSelect(d.val)} style={{
          padding: "6px 10px", borderRadius: 8, cursor: "pointer", flexShrink: 0,
          border: `1px solid ${selected === d.val ? "var(--color-primary)" : "var(--color-border)"}`,
          background: selected === d.val ? "rgba(79,152,163,0.12)" : "transparent",
          color: selected === d.val ? "var(--color-primary)" : "var(--color-text-muted)",
          fontSize: 11, fontWeight: 600, transition: "all 140ms ease",
          lineHeight: 1.4, minHeight: 40,
          WebkitTapHighlightColor: "transparent",
        } as React.CSSProperties}>
          {d.label}<br />
          <span style={{ fontWeight: 400, opacity: 0.6, fontSize: 10 }}>{d.sub}</span>
        </button>
      ))}
    </div>
  );
}