import { notFound } from "next/navigation";
import Link from "next/link";
import { getActivitiesPaginated, getAvailableYears } from "@/lib/data";
import type { ActivityCategory } from "@/lib/types";
import {
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  ALL_CATEGORIES,
} from "@/lib/types";
import { ActivityCard } from "@/components/activity-card";
import { YearSelector } from "@/components/year-selector";
import { CategoryFilter } from "@/components/category-filter";
import { Pagination } from "@/components/pagination";
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
  House,
  CaretRight,
  FolderOpen,
} from "@phosphor-icons/react/dist/ssr";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = slug as ActivityCategory;
  if (!ALL_CATEGORIES.includes(category)) {
    return { title: "Category Not Found" };
  }
  return {
    title: `${CATEGORY_LABELS[category]} Activities`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ year?: string; page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = slug as ActivityCategory;

  if (!ALL_CATEGORIES.includes(category)) {
    notFound();
  }

  const label = CATEGORY_LABELS[category];
  const description = CATEGORY_DESCRIPTIONS[category];
  const CategoryIcon = ICON_MAP[category];
  const categoryColor = COLOR_MAP[category];
  const yearFilter = sp.year ? parseInt(sp.year) : undefined;
  const page = sp.page ? parseInt(sp.page) : 1;

  const years = await getAvailableYears();
  const { activities, total, totalPages } = await getActivitiesPaginated(page, 6, {
    category: slug,
    year: yearFilter,
  });

  // Build basePath for pagination with current filters
  let basePath = `/activities/category/${slug}`;
  if (yearFilter) basePath += `?year=${yearFilter}`;

  return (
    <div>
      <div className="py-8 px-4 bg-[var(--color-bg-brand)]">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] mb-6">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors"
            >
              <House size={14} weight="bold" />
              Home
            </Link>
            <CaretRight size={12} weight="bold" />
            <Link
              href="/activities"
              className="hover:text-[var(--color-primary)] transition-colors"
            >
              Activities
            </Link>
            <CaretRight size={12} weight="bold" />
            <span className="text-[var(--color-text)] font-semibold">{label}</span>
          </nav>

          {/* Page header */}
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
              style={{ backgroundColor: `${categoryColor}18` }}
            >
              <CategoryIcon
                size={28}
                weight="duotone"
                color={categoryColor}
              />
            </div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {label} Activities
            </h1>
            <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto">
              {description}
            </p>
          </div>

          {/* Category filter */}
          <div className="mb-6">
            <CategoryFilter activeCategory={category} />
          </div>

          {/* Year selector */}
          {years.length > 0 && (
            <div className="mb-8">
              <YearSelector
                years={years}
                activeYear={yearFilter}
                baseHref={`/activities/category/${slug}`}
              />
            </div>
          )}

          {/* Results count */}
          {total > 0 && (
            <p className="text-sm text-[var(--color-text-muted)] text-center mb-6">
              Showing {(page - 1) * 6 + 1}-{Math.min(page * 6, total)} of {total}{" "}
              {total === 1 ? "activity" : "activities"}
            </p>
          )}

          {/* Activity grid */}
          {activities.length === 0 ? (
            <div className="text-center py-16 bg-[var(--color-surface)] rounded-2xl border-2 border-dashed border-[var(--color-border-light)]">
              <div className="mb-4 flex justify-center">
                <FolderOpen
                  size={48}
                  weight="duotone"
                  color={categoryColor}
                />
              </div>
              <p className="text-[var(--color-text-secondary)] text-lg">
                No {label.toLowerCase()} activities found
                {yearFilter ? ` for ${yearFilter}` : ""}
              </p>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">
                Check back later or try a different filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.map((activity, i) => (
                <ActivityCard key={activity.id} activity={activity} index={i} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={basePath}
          />
        </div>
      </div>
    </div>
  );
}
