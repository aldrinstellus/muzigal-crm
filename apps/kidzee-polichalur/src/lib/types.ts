export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  year: number;
  category: ActivityCategory;
  images: string[]; // URLs or paths
  videoUrl?: string; // YouTube or other video URL
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ActivityCategory =
  | "annual-day"
  | "sports-day"
  | "art-craft"
  | "field-trip"
  | "festival"
  | "graduation"
  | "workshop"
  | "competition"
  | "cultural"
  | "other";

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  "annual-day": "Annual Day",
  "sports-day": "Sports Day",
  "art-craft": "Art & Craft",
  "field-trip": "Field Trip",
  festival: "Festival Celebration",
  graduation: "Graduation",
  workshop: "Workshop",
  competition: "Competition",
  cultural: "Cultural Event",
  other: "Other",
};

/** @deprecated Use CATEGORY_ICONS with the CategoryIcon component instead */
export const CATEGORY_EMOJIS: Record<ActivityCategory, string> = {
  "annual-day": "🎭",
  "sports-day": "🏃",
  "art-craft": "🎨",
  "field-trip": "🚌",
  festival: "🎉",
  graduation: "🎓",
  workshop: "🔧",
  competition: "🏆",
  cultural: "🎶",
  other: "📌",
};

/** Phosphor icon component names for each activity category */
export const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  "annual-day": "MaskHappy",
  "sports-day": "Trophy",
  "art-craft": "PaintBrush",
  "field-trip": "Bus",
  festival: "Confetti",
  graduation: "GraduationCap",
  workshop: "Wrench",
  competition: "Medal",
  cultural: "MusicNotes",
  other: "Star",
};
