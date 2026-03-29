import type { Activity } from "./types";

function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_BASE_URL || "https://kidzee-polichalur.vercel.app";
}

export function getShareUrls(activity: Activity) {
  const BASE_URL = getBaseUrl();
  const activityUrl = `${BASE_URL}/activities/${activity.year}/${activity.id}`;
  const text = `${activity.title} - Kidzee Polichalur`;
  const encodedUrl = encodeURIComponent(activityUrl);
  const encodedText = encodeURIComponent(text);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    instagram: null, // Instagram doesn't support direct URL sharing - requires app/API
    youtube: activity.videoUrl || null,
    google: `https://business.google.com/`, // Link to Google Business for posting
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    copyLink: activityUrl,
  };
}
