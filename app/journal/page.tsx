"use client";

import { useState, useEffect, useCallback } from "react";
import { Log } from "@/lib/types";
import { toDateStr } from "@/lib/utils";
import Header from "./components/Header";
import DayNav from "./components/DayNav";
import LoggerPanel from "./components/LoggerPanel";
import DashboardPanel from "./components/DashboardPanel";
import MobileTabBar from "./components/MobileTabBar";

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [logs,         setLogs]         = useState<Log[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [activeTab, setActiveTab] = useState<"log" | "stats">("log");

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
        body {
          font-family: 'Geist', sans-serif;
          background: var(--color-bg);
          color: var(--color-text);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        input:focus, textarea:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 3px rgba(79,152,163,0.12);
        }
        /* hide number spinners */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { display: none; }
        input[type=number] { -moz-appearance: textfield; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }
        button:active { opacity: 0.75 !important; }

        /* ── Desktop (≥768px): side-by-side ── */
        .layout-body {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }
        .layout-columns {
          display: none;
        }
        .mobile-tabs-bar {
          display: flex;
        }
        .mobile-content {
          display: flex;
          flex: 1;
          overflow-y: auto;
          padding: 14px 14px 80px;
          flex-direction: column;
        }

        @media (min-width: 768px) {
          .layout-columns {
            display: grid;
            grid-template-columns: minmax(320px, 400px) 1fr;
            flex: 1;
            overflow: hidden;
            min-height: 0;
          }
          .col-left {
            border-right: 1px solid var(--color-border);
            padding: 16px;
            overflow-y: auto;
          }
          .col-right {
            padding: 16px;
            overflow-y: auto;
          }
          .mobile-tabs-bar {
            display: none !important;
          }
          .mobile-content {
            display: none !important;
          }
        }

        /* hide daynav scrollbar on mobile */
        .day-nav-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        <Header selectedDate={selectedDate} />

        {/* Day Nav — scrollable */}
        <div className="day-nav-scroll" style={{
          display: "flex", gap: 4, overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        } as React.CSSProperties}>
          <DayNav selected={selectedDate} onSelect={setSelectedDate} />
        </div>

        {/* ── Desktop: side-by-side columns ── */}
        <div className="layout-columns">
          <div className="col-left">
            {loading
              ? <div style={{ color: "var(--color-text-faint)", fontSize: 13, padding: 24, textAlign: "center" }}>Loading…</div>
              : <LoggerPanel logs={logs} onAdd={handleAdd} onDelete={handleDelete} selectedDate={selectedDate} />
            }
          </div>
          <div className="col-right">
            <DashboardPanel logs={logs} />
          </div>
        </div>

        {/* ── Mobile: single scrolling pane + bottom tabs ── */}
        <div className="mobile-content">
          {loading
            ? <div style={{ color: "var(--color-text-faint)", fontSize: 13, padding: 24, textAlign: "center" }}>Loading…</div>
            : activeTab === "log"
              ? <LoggerPanel logs={logs} onAdd={handleAdd} onDelete={handleDelete} selectedDate={selectedDate} />
              : <DashboardPanel logs={logs} />
          }
        </div>

        <MobileTabBar activeTab={activeTab} onChange={setActiveTab} />
      </div>
    </>
  );
}