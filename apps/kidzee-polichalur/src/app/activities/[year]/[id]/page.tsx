import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getActivityById, getActivitiesByYear } from "@/lib/data";
import { CATEGORY_LABELS } from "@/lib/types";
import type { ActivityCategory } from "@/lib/types";
import { Breadcrumb } from "@/components/breadcrumb";
import { ImageGallery } from "@/components/image-gallery";
import { ShareBar } from "./share-bar";
import {
  ArrowLeft,
  Calendar,
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
} from "@phosphor-icons/react/dist/ssr";
import { ActivityEventSchema, BreadcrumbSchema } from "@/components/structured-data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const ICON_MAP: Record<ActivityCategory, typeof MaskHappy> = {
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

function parseYouTubeId(url: string): string | null {
  // Handle youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];
  // Handle youtube.com/watch?v=ID
  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (longMatch) return longMatch[1];
  // Handle youtube.com/embed/ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) return embedMatch[1];
  return null;
}

type PageProps = {
  params: Promise<{ year: string; id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const activity = await getActivityById(id);
  if (!activity) return { title: "Activity Not Found" };

  const description = activity.description.slice(0, 160);
  const ogImage = activity.images.length > 0 ? activity.images[0] : "/kidzee-logo.png";

  return {
    title: activity.title,
    description,
    openGraph: {
      title: activity.title,
      description,
      images: [{ url: ogImage }],
    },
  };
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { year: yearStr, id } = await params;
  const year = parseInt(yearStr);
  const activity = await getActivityById(id);

  if (!activity || activity.year !== year) {
    notFound();
  }

  const CategoryIcon = ICON_MAP[activity.category];
  const categoryColor = COLOR_MAP[activity.category];
  const heroImage = activity.images.length > 0 ? activity.images[0] : null;
  const videoId = activity.videoUrl ? parseYouTubeId(activity.videoUrl) : null;

  // Related activities: 3 others from same year
  const yearActivities = await getActivitiesByYear(year);
  const related = yearActivities.filter((a) => a.id !== activity.id).slice(0, 3);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Activities", href: `/activities/${year}` },
    { label: String(year), href: `/activities/${year}` },
    { label: activity.title },
  ];

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://kidzee-polichalur.vercel.app";

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <ActivityEventSchema activity={activity} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: BASE_URL },
          { name: "Activities", url: `${BASE_URL}/activities` },
          { name: String(year), url: `${BASE_URL}/activities/${year}` },
          { name: activity.title },
        ]}
      />
      {/* Hero Image */}
      {heroImage && (
        <div className="relative w-full h-[280px] sm:h-[400px]">
          <Image
            src={heroImage}
            alt={activity.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {/* Back button on hero */}
          <Link
            href={`/activities/${year}`}
            className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/25 transition-colors"
          >
            <ArrowLeft size={16} weight="bold" />
            Back
          </Link>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Back link (when no hero) */}
        {!heroImage && (
          <Link
            href={`/activities/${year}`}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-primary)] font-medium hover:underline mb-6"
          >
            <ArrowLeft size={16} weight="bold" />
            Back to {year} Activities
          </Link>
        )}

        {/* Category badge */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ backgroundColor: categoryColor }}
          >
            <CategoryIcon size={20} weight="fill" color="#ffffff" />
          </div>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              backgroundColor: `${categoryColor}14`,
              color: categoryColor,
            }}
          >
            {CATEGORY_LABELS[activity.category]}
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--color-text)] leading-tight mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {activity.title}
        </h1>

        {/* Date */}
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm mb-6">
          <Calendar size={16} weight="bold" />
          {new Date(activity.date).toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>

        {/* Description */}
        <div className="prose max-w-none mb-8">
          <p className="text-[var(--color-text-secondary)] text-base leading-relaxed whitespace-pre-line">
            {activity.description}
          </p>
        </div>

        {/* Tags */}
        {activity.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {activity.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${categoryColor}0C`,
                  color: "var(--color-text-secondary)",
                  border: `1px solid ${categoryColor}18`,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Image Gallery (if multiple images) */}
        {activity.images.length > 1 && (
          <div className="mb-8">
            <h2
              className="text-lg font-bold text-[var(--color-text)] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Photo Gallery
            </h2>
            <ImageGallery images={activity.images} alt={activity.title} />
          </div>
        )}

        {/* YouTube Embed */}
        {videoId && (
          <div className="mb-8">
            <h2
              className="text-lg font-bold text-[var(--color-text)] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Watch Video
            </h2>
            <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`${activity.title} - Video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Share Section */}
        <div className="mb-12 p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)]">
          <h2
            className="text-lg font-bold text-[var(--color-text)] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Share This Activity
          </h2>
          <ShareBar activity={activity} />
        </div>

        {/* Related Activities */}
        {related.length > 0 && (
          <div>
            <h2
              className="text-lg font-bold text-[var(--color-text)] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              More from {year}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((rel) => {
                const RelIcon = ICON_MAP[rel.category];
                const relColor = COLOR_MAP[rel.category];
                const relImage = rel.images.length > 0 ? rel.images[0] : null;
                return (
                  <Link
                    key={rel.id}
                    href={`/activities/${year}/${rel.id}`}
                    className="group rounded-xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border-light)] hover:shadow-md transition-shadow"
                  >
                    {relImage ? (
                      <div className="relative h-32 overflow-hidden">
                        <Image
                          src={relImage}
                          alt={rel.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                    ) : (
                      <div
                        className="h-3 w-full"
                        style={{
                          background: `linear-gradient(90deg, ${relColor}, ${relColor}88)`,
                        }}
                      />
                    )}
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <RelIcon size={14} weight="fill" color={relColor} />
                        <span className="text-[10px] font-semibold" style={{ color: relColor }}>
                          {CATEGORY_LABELS[rel.category]}
                        </span>
                      </div>
                      <h3
                        className="text-sm font-bold text-[var(--color-text)] leading-snug line-clamp-2"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {rel.title}
                      </h3>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                        {new Date(rel.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
