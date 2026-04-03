"use client";

interface MobileTabBarProps {
  activeTab: "log" | "stats";
  onChange: (tab: "log" | "stats") => void;
}

export default function MobileTabBar({ activeTab, onChange }: MobileTabBarProps) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "var(--color-surface)",
      borderTop: "1px solid var(--color-border)",
      display: "flex",
      zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {[
        { id: "log" as const,   label: "Log",   icon: "✏️" },
        { id: "stats" as const, label: "Stats",  icon: "📊" },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: 1, padding: "12px 0", border: "none", background: "transparent",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            cursor: "pointer",
            color: activeTab === tab.id ? "var(--color-primary)" : "var(--color-text-faint)",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
            textTransform: "uppercase",
            transition: "color 140ms ease",
            minHeight: 56,
            WebkitTapHighlightColor: "transparent",
          } as React.CSSProperties}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}