"use client";

import type { Activity } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_EMOJIS } from "@/lib/types";
import { getShareUrls } from "@/lib/social";
import { SocialShareButton } from "@/components/social-share-button";
import { Calendar, Share2, Globe, Play, Copy, Check, MessageCircle } from "lucide-react";
import { useState } from "react";

const CARD_COLORS = [
  "from-pink-100 to-rose-50 border-pink-200",
  "from-blue-100 to-sky-50 border-blue-200",
  "from-green-100 to-emerald-50 border-green-200",
  "from-yellow-100 to-amber-50 border-yellow-200",
  "from-purple-100 to-violet-50 border-purple-200",
  "from-orange-100 to-red-50 border-orange-200",
  "from-cyan-100 to-teal-50 border-cyan-200",
];

export function ActivityCard({ activity, index = 0 }: { activity: Activity; index?: number }) {
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrls = getShareUrls(activity);
  const colorClass = CARD_COLORS[index % CARD_COLORS.length];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrls.copyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={`activity-${activity.id}`}
      className={`bg-gradient-to-br ${colorClass} border-2 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{CATEGORY_EMOJIS[activity.category]}</span>
            <span className="text-xs font-semibold px-2 py-1 bg-white/60 rounded-full text-gray-700">
              {CATEGORY_LABELS[activity.category]}
            </span>
          </div>

          <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">{activity.title}</h3>
          <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-3">{activity.description}</p>

          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(activity.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>

          {activity.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {activity.tags.map((tag) => (
                <span key={tag} className="text-xs bg-white/50 text-[var(--color-text-secondary)] px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowShare(!showShare)}
          className="p-2 rounded-full bg-white/60 hover:bg-white transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-orange)]"
          aria-label="Share activity"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Share panel */}
      {showShare && (
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Share this activity:</p>
          <div className="flex flex-wrap gap-2">
            <a
              href={shareUrls.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              Facebook
            </a>

            {shareUrls.youtube && (
              <a
                href={shareUrls.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs rounded-full hover:bg-red-700 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                YouTube
              </a>
            )}

            <a
              href={shareUrls.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs rounded-full hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>

            <a
              href={shareUrls.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 text-white text-xs rounded-full hover:bg-sky-600 transition-colors"
            >
              𝕏 Post
            </a>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white text-xs rounded-full hover:bg-gray-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Tip: For Instagram, copy the link and share via the Instagram app.
          </p>

          {/* Auto-post to social media */}
          <SocialShareButton activity={activity} />
        </div>
      )}

      {activity.videoUrl && (
        <a
          href={activity.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-xs text-[var(--color-error)] hover:text-[var(--color-error)]/80 font-semibold"
        >
          <Play className="w-4 h-4" />
          Watch Video
        </a>
      )}
    </div>
  );
}
