import { Tag } from "./types";

// Tag configuration with labels, emojis, colors, and groups
export const TAG_CONFIG: Record<Tag, { label: string; emoji: string; color: string; bg: string; group: string }> = {
  work:     { label: "Work",     emoji: "💼", color: "#4f98a3", bg: "rgba(79,152,163,0.15)",  group: "job"  },
  dsa:      { label: "DSA",      emoji: "🧩", color: "#6daa45", bg: "rgba(109,170,69,0.15)",  group: "prep" },
  sysdes:   { label: "Sys Des",  emoji: "🏗️", color: "#a86fdf", bg: "rgba(168,111,223,0.15)", group: "prep" },
  project:  { label: "Project",  emoji: "🚀", color: "#5591c7", bg: "rgba(85,145,199,0.15)",  group: "prep" },
  prep:     { label: "Prep",     emoji: "📚", color: "#fdab43", bg: "rgba(253,171,67,0.15)",  group: "prep" },
  workout:  { label: "Workout",  emoji: "💪", color: "#dd6974", bg: "rgba(221,105,116,0.15)", group: "life" },
  break:    { label: "Break",    emoji: "☕", color: "#e8af34", bg: "rgba(232,175,52,0.15)",  group: "life" },
  personal: { label: "Personal", emoji: "🌱", color: "#797876", bg: "rgba(121,120,118,0.15)", group: "life" },
  sleep:    { label: "Sleep",    emoji: "🌙", color: "#393836", bg: "rgba(57,56,54,0.5)",     group: "life" },
};

// Tag groups for categorized display
export const TAG_GROUPS = [
  { id: "job",  label: "Job",      tags: ["work"] as Tag[] },
  { id: "prep", label: "Job Prep", tags: ["dsa", "sysdes", "project", "prep"] as Tag[] },
  { id: "life", label: "Life",     tags: ["workout", "break", "personal", "sleep"] as Tag[] },
];

// Intensity level labels
export const INTENSITY_LABEL: Record<number, string> = { 1: "Low", 2: "Light", 3: "Medium", 4: "High", 5: "Deep" };

// Prep tags for calculations
export const PREP_TAGS: Tag[] = ["dsa", "sysdes", "project", "prep"];