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
