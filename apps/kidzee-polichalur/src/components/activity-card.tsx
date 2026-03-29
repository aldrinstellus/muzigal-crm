"use client";

import type { Activity, ActivityCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { getShareUrls } from "@/lib/social";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ShareNetwork,
  Link,
  Play,
  Calendar,
  Copy,
  Check,
  ChatCircleDots,
  XLogo,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

const ICON_MAP: Record<ActivityCategory, Icon> = {
  "annual-day": MaskHappy,
  "sports-day": Trophy,
  "art-craft": PaintBrush,
  "field-trip": Bus,
  festival: Confetti,
  graduation: GraduationCap,
  workshop: Wrench,
  competition: Medal,
  cultural: MusicNotes,
  other: Star,
};

const COLOR_MAP: Record<ActivityCategory, string> = {
  "annual-day": "#9B59B6",
  "sports-day": "#E67E22",
  "art-craft": "#E91E63",
  "field-trip": "#27AE60",
  festival: "#F39C12",
  graduation: "#2980B9",
  workshop: "#8D6E63",
  competition: "#D4AC0D",
  cultural: "#C0392B",
  other: "#7F8C8D",
};

const SOCIAL_COLORS = {
  facebook: "#1877F2",
  whatsapp: "#25D366",
  youtube: "#FF0000",
  twitter: "#1DA1F2",
  copy: "#6B7280",
};

export function ActivityCard({
  activity,
  index = 0,
}: {
  activity: Activity;
  index?: number;
}) {
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrls = getShareUrls(activity);
  const CategoryIcon = ICON_MAP[activity.category];
  const categoryColor = COLOR_MAP[activity.category];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrls.copyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      id={`activity-${activity.id}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: index * 0.08,
      }}
      whileHover={{
        y: -4,
        boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
      }}
      className="relative rounded-2xl bg-white overflow-hidden"
      style={{
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: categoryColor }}
      />

      <div className="p-6 pl-7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {/* Category badge */}
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-full"
                style={{ backgroundColor: categoryColor }}
              >
                <CategoryIcon size={18} weight="fill" color="#ffffff" />
              </div>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: `${categoryColor}14`,
                  color: categoryColor,
                }}
              >
                {CATEGORY_LABELS[activity.category]}
              </span>
            </div>

            {/* Title */}
            <h3
              className="text-lg font-bold text-[var(--color-text)] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {activity.title}
            </h3>

            {/* Description */}
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-3 line-clamp-3">
              {activity.description}
            </p>

            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <Calendar size={14} weight="bold" />
              <span>
                {new Date(activity.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Tags */}
            {activity.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {activity.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${categoryColor}0F`,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Share button */}
          <button
            onClick={() => setShowShare(!showShare)}
            className="p-2 rounded-full transition-colors"
            style={{
              backgroundColor: showShare ? `${categoryColor}18` : "transparent",
              color: showShare
                ? categoryColor
                : "var(--color-text-secondary)",
            }}
            aria-label="Share activity"
          >
            <ShareNetwork size={18} weight="bold" />
          </button>
        </div>

        {/* Share panel */}
        <AnimatePresence>
          {showShare && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-[var(--color-border-light)]">
                <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
                  Share this activity:
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={shareUrls.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs rounded-full transition-opacity hover:opacity-85"
                    style={{ backgroundColor: SOCIAL_COLORS.facebook }}
                  >
                    <Link size={14} weight="bold" />
                    Facebook
                  </a>

                  {shareUrls.youtube && (
                    <a
                      href={shareUrls.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs rounded-full transition-opacity hover:opacity-85"
                      style={{ backgroundColor: SOCIAL_COLORS.youtube }}
                    >
                      <Play size={14} weight="fill" />
                      YouTube
                    </a>
                  )}

                  <a
                    href={shareUrls.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs rounded-full transition-opacity hover:opacity-85"
                    style={{ backgroundColor: SOCIAL_COLORS.whatsapp }}
                  >
                    <ChatCircleDots size={14} weight="fill" />
                    WhatsApp
                  </a>

                  <a
                    href={shareUrls.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs rounded-full transition-opacity hover:opacity-85"
                    style={{ backgroundColor: SOCIAL_COLORS.twitter }}
                  >
                    <XLogo size={14} weight="bold" />
                    Post
                  </a>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs rounded-full transition-opacity hover:opacity-85"
                    style={{ backgroundColor: SOCIAL_COLORS.copy }}
                  >
                    {copied ? (
                      <Check size={14} weight="bold" />
                    ) : (
                      <Copy size={14} weight="bold" />
                    )}
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                  Tip: For Instagram, copy the link and share via the Instagram
                  app.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video link */}
        {activity.videoUrl && (
          <a
            href={activity.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold transition-opacity hover:opacity-75"
            style={{ color: SOCIAL_COLORS.youtube }}
          >
            <Play size={16} weight="fill" />
            Watch Video
          </a>
        )}
      </div>
    </motion.div>
  );
}
