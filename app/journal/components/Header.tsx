"use client";

interface HeaderProps {
  selectedDate: string;
}

export default function Header({ selectedDate }: HeaderProps) {
  return (
    <header style={{
      borderBottom: "1px solid var(--color-border)",
      padding: "10px 14px",
      display: "flex", flexDirection: "column", gap: 10,
      background: "var(--color-surface)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      {/* Top row: logo + date */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-label="Hourly Journal">
            <circle cx="13" cy="13" r="12" stroke="var(--color-primary)" strokeWidth="1.5"/>
            <line x1="13" y1="4" x2="13" y2="13" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="13" y1="13" x2="18" y2="16" stroke="var(--color-text-muted)" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="13" cy="13" r="1.5" fill="var(--color-primary)"/>
          </svg>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.03em" }}>Hourly Journal</div>
            <div style={{ fontSize: 10, color: "var(--color-text-faint)", letterSpacing: "0.04em" }}>100% ACCOUNTABILITY</div>
          </div>
        </div>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-faint)" }}>
          {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>
    </header>
  );
}