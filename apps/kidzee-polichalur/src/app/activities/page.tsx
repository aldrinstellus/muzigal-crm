import { getActivities, getAvailableYears } from "@/lib/data";
import { ActivityCard } from "@/components/activity-card";
import { YearSelector } from "@/components/year-selector";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const activities = await getActivities();
  const years = await getAvailableYears();
  const sorted = activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-3">
            All Activities
          </h1>
          <p className="text-gray-500">Browse all our preschool activities and events</p>
        </div>

        <div className="mb-8">
          <YearSelector years={years} />
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No activities found</p>
            <p className="text-gray-400 text-sm mt-1">Check back later for updates!</p>
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
  );
}
