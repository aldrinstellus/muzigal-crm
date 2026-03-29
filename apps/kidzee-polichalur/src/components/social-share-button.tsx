"use client";

import type { Activity } from "@/lib/types";
import { CATEGORY_EMOJIS } from "@/lib/types";
import { Globe, Send, X, ImageIcon, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

type Platform = "instagram" | "facebook" | "both";

function generatePreviewCaption(title: string, description: string, tags: string[]): string {
  const lines: string[] = [];
  lines.push(`\u2728 ${title}`);
  lines.push("");
  lines.push(description);
  lines.push("");
  lines.push("\uD83C\uDFEB Kidzee Polichalur \u2014 Where little minds bloom!");
  lines.push("");
  const hashtags = [
    "#Kidzee",
    "#KidzeePolichalur",
    "#PreschoolFun",
    "#EarlyLearning",
    "#LittleLearners",
    "#PreschoolLife",
    ...tags.map((t) => `#${t.replace(/\s+/g, "")}`),
  ];
  lines.push(hashtags.join(" "));
  return lines.join("\n");
}

export function SocialShareButton({ activity }: { activity: Activity }) {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>("both");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const caption = generatePreviewCaption(activity.title, activity.description, activity.tags);

  const handleSchedule = async () => {
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: activity.id,
          activityTitle: activity.title,
          description: activity.description,
          images: activity.images,
          platform,
          tags: activity.tags,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to schedule post");
      }

      setStatus("success");
      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-sm hover:shadow-md"
        aria-label="Schedule social media post"
      >
        <Globe className="w-3.5 h-3.5" />
        Auto-Post
      </button>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-1.5">
          {CATEGORY_EMOJIS[activity.category]} Schedule Social Post
        </h4>
        <button
          onClick={() => {
            setOpen(false);
            setStatus("idle");
          }}
          className="p-1 rounded-full hover:bg-gray-200/50 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Platform selector */}
      <div className="flex gap-2 mb-3">
        <PlatformButton
          label="Instagram"
          icon={<span className="text-xs">IG</span>}
          value="instagram"
          selected={platform}
          onSelect={setPlatform}
          color="from-purple-500 to-pink-500"
        />
        <PlatformButton
          label="Facebook"
          icon={<Globe className="w-3.5 h-3.5" />}
          value="facebook"
          selected={platform}
          onSelect={setPlatform}
          color="from-blue-500 to-blue-600"
        />
        <PlatformButton
          label="Both"
          icon={<Send className="w-3.5 h-3.5" />}
          value="both"
          selected={platform}
          onSelect={setPlatform}
          color="from-violet-500 to-indigo-500"
        />
      </div>

      {/* Caption preview */}
      <div className="bg-white/70 rounded-xl p-3 mb-3 border border-gray-200/50">
        <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
          Caption Preview
        </p>
        <p className="text-sm text-[var(--color-text)] whitespace-pre-line leading-relaxed">
          {caption}
        </p>
      </div>

      {/* Image count */}
      {activity.images.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] mb-3">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>
            {activity.images.length} image{activity.images.length !== 1 ? "s" : ""} will be attached
          </span>
        </div>
      )}

      {/* Error message */}
      {status === "error" && (
        <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{errorMsg}</div>
      )}

      {/* Success message */}
      {status === "success" && (
        <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2 mb-3">
          <CheckCircle className="w-3.5 h-3.5" />
          Post queued successfully!
        </div>
      )}

      {/* Schedule button */}
      <button
        onClick={handleSchedule}
        disabled={status === "loading" || status === "success"}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Scheduling...
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Queued!
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Schedule Post
          </>
        )}
      </button>

      <p className="text-xs text-gray-400 mt-2 text-center">
        Posts are queued for review before publishing
      </p>
    </div>
  );
}

function PlatformButton({
  label,
  icon,
  value,
  selected,
  onSelect,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  value: Platform;
  selected: Platform;
  onSelect: (p: Platform) => void;
  color: string;
}) {
  const isSelected = selected === value;
  return (
    <button
      onClick={() => onSelect(value)}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
        isSelected
          ? `bg-gradient-to-r ${color} text-white shadow-sm`
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
