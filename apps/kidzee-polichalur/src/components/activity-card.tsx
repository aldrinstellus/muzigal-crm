"use client";

import type { Activity, ActivityCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { getShareUrls } from "@/lib/social";
import { useState } from "react";
import Image from "next/image";
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
  Play,
  Calendar,
  Copy,
  Check,
  ChatCircleDots,
  XLogo,
  Images,
  Heart,
  ArrowSquareOut,
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
  const [imgError, setImgError] = useState(false);
  const shareUrls = getShareUrls(activity);
  const CategoryIcon = ICON_MAP[activity.category];
  const categoryColor = COLOR_MAP[activity.category];
  const hasImages = activity.images && activity.images.length > 0 && !imgError;
  const heroImage = hasImages ? activity.images[0] : null;
  const extraImageCount = hasImages ? activity.images.length - 1 : 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrls.copyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      id={`activity-${activity.id}`}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 24,
        delay: index * 0.06,
      }}
      className="group relative rounded-2xl bg-white overflow-hidden cursor-default"
      style={{
        boxShadow: "0 2px 12px rgba(101, 49, 142, 0.06)",
      }}
    >
      {/* Hero Image */}
      {heroImage ? (
        <div className="relative h-48 sm:h-52 overflow-hidden">
          <Image
            src={heroImage}
            alt={activity.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Category badge — floating on image */}
          <div className="absolute top-3 left-3">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-semibold backdrop-blur-sm"
              style={{ backgroundColor: `${categoryColor}CC` }}
            >
              <CategoryIcon size={14} weight="fill" />
              {CATEGORY_LABELS[activity.category]}
            </div>
          </div>

          {/* Image count badge */}
          {extraImageCount > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-semibold backdrop-blur-sm">
              <Images size={14} weight="bold" />
              +{extraImageCount}
            </div>
          )}

          {/* Video indicator */}
          {activity.videoUrl && (
            <a
              href={activity.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-red-600/90 text-white text-xs font-semibold backdrop-blur-sm hover:bg-red-600 transition-colors"
            >
              <Play size={14} weight="fill" />
              Watch
            </a>
          )}

          {/* Date stamp on image */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/90 text-xs font-medium">
            <Calendar size={13} weight="bold" />
            {new Date(activity.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      ) : (
        /* Fallback: colored header strip when no image */
        <div
          className="h-3 w-full"
          style={{
            background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}88)`,
          }}
        />
      )}

      {/* Content */}
      <div className="p-5">
        {/* Category badge (only when no hero image) */}
        {!heroImage && (
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{ backgroundColor: categoryColor }}
            >
              <CategoryIcon size={16} weight="fill" color="#ffffff" />
            </div>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${categoryColor}14`,
                color: categoryColor,
              }}
            >
              {CATEGORY_LABELS[activity.category]}
            </span>
            {!heroImage && (
              <span className="ml-auto text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <Calendar size={12} weight="bold" />
                {new Date(activity.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        )}

        {/* Title + Share */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-base font-bold text-[var(--color-text)] leading-snug"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {activity.title}
          </h3>
          <button
            onClick={() => setShowShare(!showShare)}
            className="shrink-0 p-1.5 rounded-full transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: showShare ? `${categoryColor}18` : "transparent",
              color: showShare ? categoryColor : "var(--color-text-muted)",
            }}
            aria-label="Share activity"
          >
            <ShareNetwork size={16} weight="bold" />
          </button>
        </div>

        {/* Description */}
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mt-2 line-clamp-2">
          {activity.description}
        </p>

        {/* Tags */}
        {activity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {activity.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors"
                style={{
                  backgroundColor: `${categoryColor}0C`,
                  color: "var(--color-text-secondary)",
                  border: `1px solid ${categoryColor}18`,
                }}
              >
                #{tag}
              </span>
            ))}
            {activity.tags.length > 4 && (
              <span className="text-[10px] text-[var(--color-text-muted)] px-1">
                +{activity.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Share panel */}
        <AnimatePresence>
          {showShare && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-3 border-t border-[var(--color-border-light)]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                  Share
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <a
                    href={shareUrls.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-white text-[11px] font-medium rounded-lg transition-all hover:opacity-85 active:scale-95"
                    style={{ backgroundColor: SOCIAL_COLORS.facebook }}
                  >
                    <ArrowSquareOut size={12} weight="bold" />
                    Facebook
                  </a>

                  {shareUrls.youtube && (
                    <a
                      href={shareUrls.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 text-white text-[11px] font-medium rounded-lg transition-all hover:opacity-85 active:scale-95"
                      style={{ backgroundColor: SOCIAL_COLORS.youtube }}
                    >
                      <Play size={12} weight="fill" />
                      YouTube
                    </a>
                  )}

                  <a
                    href={shareUrls.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-white text-[11px] font-medium rounded-lg transition-all hover:opacity-85 active:scale-95"
                    style={{ backgroundColor: SOCIAL_COLORS.whatsapp }}
                  >
                    <ChatCircleDots size={12} weight="bold" />
                    WhatsApp
                  </a>

                  <a
                    href={shareUrls.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-white text-[11px] font-medium rounded-lg transition-all hover:opacity-85 active:scale-95"
                    style={{ backgroundColor: SOCIAL_COLORS.twitter }}
                  >
                    <XLogo size={12} weight="bold" />
                    Post
                  </a>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-white text-[11px] font-medium rounded-lg transition-all hover:opacity-85 active:scale-95"
                    style={{ backgroundColor: SOCIAL_COLORS.copy }}
                  >
                    {copied ? (
                      <Check size={12} weight="bold" />
                    ) : (
                      <Copy size={12} weight="bold" />
                    )}
                    {copied ? "Copied" : "Link"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
