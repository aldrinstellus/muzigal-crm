"use client";

import type { ActivityCategory } from "@/lib/types";
import { CATEGORY_ICONS } from "@/lib/types";
import {
  MaskHappy,
  Trophy,
  PaintBrush,
  Bus,
  Confetti,
  GraduationCap,
  Wrench,
  Medal,
  MusicNotes,
  Star,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

const ICON_MAP: Record<string, Icon> = {
  MaskHappy,
  Trophy,
  PaintBrush,
  Bus,
  Confetti,
  GraduationCap,
  Wrench,
  Medal,
  MusicNotes,
  Star,
};

/** Background colors for each category — kid-friendly, distinct palette */
const CATEGORY_BG: Record<ActivityCategory, string> = {
  "annual-day": "bg-purple-500",
  "sports-day": "bg-amber-500",
  "art-craft": "bg-pink-500",
  "field-trip": "bg-sky-500",
  festival: "bg-rose-500",
  graduation: "bg-indigo-500",
  workshop: "bg-orange-500",
  competition: "bg-yellow-500",
  cultural: "bg-violet-500",
  other: "bg-teal-500",
};

interface CategoryIconProps {
  category: ActivityCategory;
  size?: number;
  className?: string;
}

export function CategoryIcon({ category, size = 20, className = "" }: CategoryIconProps) {
  const iconName = CATEGORY_ICONS[category];
  const IconComponent = ICON_MAP[iconName] ?? Star;
  const bgColor = CATEGORY_BG[category];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${bgColor} text-white ${className}`}
      style={{ width: size + 12, height: size + 12 }}
    >
      <IconComponent size={size} weight="fill" />
    </span>
  );
}
