import { getActivitiesByYear, getAvailableYears } from "@/lib/data";
import { ActivityCard } from "@/components/activity-card";
import { YearSelector } from "@/components/year-selector";

export const dynamic = "force-dynamic";

export default async function YearActivitiesPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr);
  const activities = await getActivitiesByYear(year);
  const years = await getAvailableYears();

  return (
    <div>
      <div className="py-8 px-4 bg-[var(--color-bg-brand)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] mb-3 font-[var(--font-display)]">
              Activities - {year}
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              {activities.length} {activities.length === 1 ? "activity" : "activities"} in {year}
            </p>
          </div>

          <div className="mb-8">
            <YearSelector years={years} activeYear={year} />
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-16 bg-[var(--color-surface)] rounded-2xl border-2 border-dashed border-[var(--color-border-light)]">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-[var(--color-text-secondary)] text-lg">No activities found for {year}</p>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">Try selecting a different year.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.map((activity, i) => (
                <ActivityCard key={activity.id} activity={activity} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
