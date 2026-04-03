"use client";

import { Tag } from "@/lib/types";
import { TAG_CONFIG, INTENSITY_LABEL } from "@/lib/constants";

interface IntensitySelectorProps {
  intensity: number;
  tag: Tag;
  onChange: (intensity: number) => void;
}

export default function IntensitySelector({ intensity, tag, onChange }: IntensitySelectorProps) {
  const cfg = TAG_CONFIG[tag];

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <span style={{ fontSize: 10, color: "var(--color-text-faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 44, flexShrink: 0 }}>Focus</span>
      {[1,2,3,4,5].map((n) => {
        const active = intensity >= n;
        return (
          <button key={n} onClick={() => onChange(n)} title={INTENSITY_LABEL[n]} style={{
            flex: 1, height: 34, borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer",
            border: `1px solid ${active ? cfg.color : "var(--color-border)"}`,
            background: active ? cfg.bg : "transparent",
            color: active ? cfg.color : "var(--color-text-faint)",
            transition: "all 140ms ease",
            WebkitTapHighlightColor: "transparent",
          } as React.CSSProperties}>{INTENSITY_LABEL[n]}</button>
        );
      })}
    </div>
  );
}