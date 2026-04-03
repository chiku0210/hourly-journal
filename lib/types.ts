// Types for the Hourly Journal application

export type Tag =
  | "work" | "dsa" | "sysdes" | "project" | "prep"
  | "workout" | "break" | "personal" | "sleep";

export type Log = {
  id: string;
  date: string;
  hour: number;
  minute_from: number;
  minute_to: number;
  title: string;
  note?: string;
  tag: Tag;
  intensity: number;
};