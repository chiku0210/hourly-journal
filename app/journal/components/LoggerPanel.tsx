"use client";

import { useState } from "react";
import { Log } from "@/lib/types";
import LoggerForm from "./LoggerForm";
import LogFeed from "./LogFeed";

interface LoggerPanelProps {
  logs: Log[];
  onAdd: (log: Omit<Log, "id" | "date">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  selectedDate: string;
}

export default function LoggerPanel({ logs, onAdd, onDelete, selectedDate }: LoggerPanelProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <LoggerForm logs={logs} onAdd={onAdd} selectedDate={selectedDate} />
      <LogFeed logs={logs} onDelete={handleDelete} deletingId={deletingId} />
    </div>
  );
}