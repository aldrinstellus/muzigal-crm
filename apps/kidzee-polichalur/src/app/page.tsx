import Link from "next/link";
import Image from "next/image";
import { getActivities, getAvailableYears } from "@/lib/data";
import { ActivityCard } from "@/components/activity-card";
import { WaveDivider } from "@/components/wave-divider";
import { AnimatedStats } from "@/components/animated-stats";
import { HeroShimmer } from "@/components/hero-shimmer";
import { AutoRickshaw } from "@/components/illustrations/auto-rickshaw";
import { PalmTree } from "@/components/illustrations/palm-tree";
import { KolamPattern } from "@/components/illustrations/kolam-pattern";
import { PeacockFeather } from "@/components/illustrations/peacock-feather";
import { CategoryFilter } from "@/components/category-filter";
import {
  ArrowRight,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { OrganizationSchema } from "@/components/structured-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const activities = await getActivities();
  const years = await getAvailableYears();
  const recentActivities = activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div>
      <OrganizationSchema />
      {/* Hero Section -- purple gradient (brand DNA) with Chennai/India motifs */}
      <section className="relative bg-gradient-to-br from-[#4A2366] via-[#65318E] to-[#8B5CB8] text-white py-16 sm:py-24 px-4 overflow-hidden">
        {/* Animated shimmer overlay */}
        <HeroShimmer />

        {/* Kolam pattern -- repeating subtle background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" aria-hidden="true">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='3' fill='white'/%3E%3Ccircle cx='50' cy='35' r='2' fill='white'/%3E%3Ccircle cx='50' cy='65' r='2' fill='white'/%3E%3Ccircle cx='35' cy='50' r='2' fill='white'/%3E%3Ccircle cx='65' cy='50' r='2' fill='white'/%3E%3Ccircle cx='39' cy='39' r='1.5' fill='white'/%3E%3Ccircle cx='61' cy='39' r='1.5' fill='white'/%3E%3Ccircle cx='39' cy='61' r='1.5' fill='white'/%3E%3Ccircle cx='61' cy='61' r='1.5' fill='white'/%3E%3Cpath d='M50 35 Q65 35 65 50 Q65 65 50 65 Q35 65 35 50 Q35 35 50 35' stroke='white' stroke-width='1.5' fill='none' opacity='0.6'/%3E%3Cpath d='M50 35 Q58 25 65 35' stroke='white' stroke-width='1.2' fill='none'/%3E%3Cpath d='M65 50 Q75 58 65 65' stroke='white' stroke-width='1.2' fill='none'/%3E%3Cpath d='M50 65 Q42 75 35 65' stroke='white' stroke-width='1.2' fill='none'/%3E%3Cpath d='M35 50 Q25 42 35 35' stroke='white' stroke-width='1.2' fill='none'/%3E%3C/svg%3E")`,
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        {/* Auto-rickshaw -- bottom left */}
        <div className="absolute bottom-4 left-[3%] text-white opacity-20 pointer-events-none hidden sm:block">
          <AutoRickshaw className="w-32 h-auto sm:w-40" />
        </div>

        {/* Palm tree -- right side */}
        <div className="absolute -bottom-4 right-[4%] text-white opacity-[0.12] pointer-events-none hidden sm:block">
          <PalmTree className="w-28 h-auto sm:w-36" />
        </div>

        {/* Kolam accent -- top right decorative */}
        <div className="absolute top-6 right-[8%] text-white opacity-[0.10] pointer-events-none hidden md:block">
          <KolamPattern className="w-20 h-20" />
        </div>

        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto text-center relative z-10">
          <Image
            src="/kidzee-logo.svg"
            alt="Kidzee"
            width={200}
            height={65}
            className="mx-auto mb-6 drop-shadow-lg"
          />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 drop-shadow-lg font-[var(--font-display)] text-white">
            Kidzee Polichalur
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Where every day is an adventure! Explore our preschool activities, celebrations,
            and the wonderful moments of learning and growth.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/activities"
              className="inline-flex items-center gap-2 bg-white text-[var(--color-primary)] px-6 py-3 rounded-[var(--radius-blob)] font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Explore Activities <ArrowRight size={20} weight="bold" />
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-[var(--radius-blob)] font-bold backdrop-blur-sm hover:bg-white/30 transition-all border border-white/30"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Wave divider: hero -> stats */}
      <WaveDivider from="#8B5CB8" to="var(--color-bg)" />

      {/* Stats Section -- animated count-up with Phosphor duotone icons */}
      <AnimatedStats
        stats={[
          { iconName: "CalendarDots", label: "Years of Activities", value: String(years.length || "2+"), color: "purple" },
          { iconName: "Star", label: "Total Activities", value: String(activities.length || "10+"), color: "orange" },
          { iconName: "UsersThree", label: "Happy Students", value: "500+", color: "pink" },
          { iconName: "Trophy", label: "Events Per Year", value: "20+", color: "emerald" },
        ]}
      />

      {/* Recent Activities -- on lavender background (brand DNA) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-brand)]">
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] text-[var(--color-text)]">
              Recent Activities
            </h2>
            <Link
              href="/activities"
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-semibold text-sm flex items-center gap-1"
            >
              View All <ArrowRight size={16} weight="bold" />
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <div className="text-center py-16 bg-[var(--color-surface)] rounded-2xl border-2 border-dashed border-[var(--color-border-light)]">
              <div className="flex justify-center mb-4">
                <Sparkle size={48} weight="duotone" color="var(--color-primary-light)" />
              </div>
              <p className="text-[var(--color-text-secondary)] text-lg font-semibold">
                No activities yet!
              </p>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">
                Activities will appear here once uploaded by admin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {recentActivities.map((activity, i) => (
                <ActivityCard key={activity.id} activity={activity} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] text-[var(--color-text)] mb-6">
            Browse by Category
          </h2>
          <CategoryFilter />
        </div>
      </section>

      {/* Browse by Year -- with peacock feather illustration */}
      {years.length > 0 && (
        <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-brand)] overflow-hidden">
          <div className="absolute bottom-4 right-[4%] text-[var(--color-primary)] opacity-[0.10] pointer-events-none hidden sm:block" aria-hidden="true">
            <PeacockFeather className="w-16 h-auto" />
          </div>
          <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto text-center relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] text-[var(--color-text)] mb-6">
              Browse by Year
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {years.map((year) => (
                <Link
                  key={year}
                  href={`/activities/${year}`}
                  className="px-6 py-3 bg-[var(--color-surface)] rounded-[var(--radius-blob)] font-bold text-[var(--color-text-secondary)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:scale-105 transition-all border border-[var(--color-border-light)]"
                >
                  {year}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
