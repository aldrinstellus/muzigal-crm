import { getActivities, getAvailableYears } from "@/lib/data";
import { ActivityCard } from "@/components/activity-card";
import { YearSelector } from "@/components/year-selector";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const activities = await getActivities();
  const years = await getAvailableYears();
  const sorted = activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <div className="py-8 px-4 bg-[var(--color-bg-brand)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] mb-3 font-[var(--font-display)]">
              All Activities
            </h1>
            <p className="text-[var(--color-text-secondary)]">Browse all our preschool activities and events</p>
          </div>

          <div className="mb-8">
            <YearSelector years={years} />
          </div>

          {sorted.length === 0 ? (
            <div className="text-center py-16 bg-[var(--color-surface)] rounded-2xl border-2 border-dashed border-[var(--color-border-light)]">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-[var(--color-text-secondary)] text-lg">No activities found</p>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">Check back later for updates!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sorted.map((activity, i) => (
                <ActivityCard key={activity.id} activity={activity} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
