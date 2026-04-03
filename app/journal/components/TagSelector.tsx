"use client";

import { Tag } from "@/lib/types";
import { TAG_CONFIG, TAG_GROUPS } from "@/lib/constants";

interface TagSelectorProps {
  selectedTag: Tag;
  onChange: (tag: Tag) => void;
}

export default function TagSelector({ selectedTag, onChange }: TagSelectorProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {TAG_GROUPS.map((g) => (
        <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, color: "var(--color-text-faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 40 }}>{g.label}</span>
          {g.tags.map((t) => {
            const cfg    = TAG_CONFIG[t];
            const active = selectedTag === t;
            return (
              <button key={t} onClick={() => onChange(t)} style={{
                minHeight: 34, padding: "4px 12px", borderRadius: 20,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${active ? cfg.color : "var(--color-border)"}`,
                background: active ? cfg.bg : "transparent",
                color: active ? cfg.color : "var(--color-text-faint)",
                transition: "all 140ms ease",
                WebkitTapHighlightColor: "transparent",
              } as React.CSSProperties}>
                {cfg.emoji} {cfg.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}