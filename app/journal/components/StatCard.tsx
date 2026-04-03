"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export default function StatCard({ label, value, sub, color }: StatCardProps) {
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "14px 14px 12px" }}>
      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 20, fontWeight: 700, color: color || "var(--color-text)", letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 10, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}