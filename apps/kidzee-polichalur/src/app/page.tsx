import Link from "next/link";
import Image from "next/image";
import { getActivities, getAvailableYears } from "@/lib/data";
import { ActivityCard } from "@/components/activity-card";
import { WaveDivider } from "@/components/wave-divider";
import { ArrowRight, Star, Users, Calendar, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const activities = await getActivities();
  const years = await getAvailableYears();
  const recentActivities = activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div>
      {/* Hero Section — purple gradient (brand DNA) */}
      <section className="relative bg-gradient-to-br from-[#4A2366] via-[#65318E] to-[#8B5CB8] text-white py-16 sm:py-24 px-4 overflow-hidden">
        {/* Decorative illustrations */}
        <Image
          src="/decorative/butterfly.png"
          alt=""
          width={80}
          height={80}
          className="absolute top-8 left-[5%] opacity-30 rotate-12 pointer-events-none hidden sm:block"
          aria-hidden="true"
        />
        <Image
          src="/decorative/balloon.png"
          alt=""
          width={60}
          height={100}
          className="absolute top-12 right-[8%] opacity-25 -rotate-6 pointer-events-none hidden sm:block"
          aria-hidden="true"
        />
        <Image
          src="/decorative/bird.png"
          alt=""
          width={50}
          height={50}
          className="absolute bottom-16 left-[10%] opacity-20 pointer-events-none hidden md:block"
          aria-hidden="true"
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Image
            src="/kidzee-logo.svg"
            alt="Kidzee"
            width={200}
            height={65}
            className="mx-auto mb-6 drop-shadow-lg"
          />
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 drop-shadow-lg font-[var(--font-display)] text-white">
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
              Explore Activities <ArrowRight className="w-5 h-5" />
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

      {/* Wave divider: hero → stats */}
      <WaveDivider from="#8B5CB8" to="var(--color-bg)" />

      {/* Stats Section */}
      <section className="py-12 px-4 -mt-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: "Years of Activities", value: years.length || "2+" },
            { icon: Star, label: "Total Activities", value: activities.length || "10+" },
            { icon: Users, label: "Happy Students", value: "500+" },
            { icon: Trophy, label: "Events Per Year", value: "20+" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--color-surface)] rounded-2xl p-5 text-center shadow-[var(--shadow-md)] border border-[var(--color-border-light)] hover:shadow-[var(--shadow-lg)] transition-shadow"
            >
              <stat.icon className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-2" />
              <div className="text-2xl font-bold font-[var(--font-display)] text-[var(--color-text)]">{stat.value}</div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activities — on lavender background (brand DNA) */}
      <section className="py-12 px-4 bg-[var(--color-bg-brand)]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-display)] text-[var(--color-text)]">
              Recent Activities
            </h2>
            <Link
              href="/activities"
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-semibold text-sm flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <div className="text-center py-16 bg-[var(--color-surface)] rounded-2xl border-2 border-dashed border-[var(--color-border-light)]">
              <div className="text-5xl mb-4">🌟</div>
              <p className="text-[var(--color-text-secondary)] text-lg">No activities yet!</p>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">Activities will appear here once uploaded by admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentActivities.map((activity, i) => (
                <ActivityCard key={activity.id} activity={activity} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Browse by Year — cream bg with decorative fish */}
      {years.length > 0 && (
        <section className="relative py-12 px-4 overflow-hidden">
          <Image
            src="/decorative/fish.png"
            alt=""
            width={60}
            height={40}
            className="absolute bottom-6 right-[5%] opacity-15 pointer-events-none hidden sm:block"
            aria-hidden="true"
          />
          <div className="max-w-5xl mx-auto text-center relative z-10">
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
