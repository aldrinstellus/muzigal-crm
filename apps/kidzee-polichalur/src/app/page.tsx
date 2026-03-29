import Link from "next/link";
import { getActivities, getAvailableYears } from "@/lib/data";
import { ActivityCard } from "@/components/activity-card";
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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-300 via-orange-300 to-pink-400 text-white py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-6xl sm:text-8xl mb-6">🎓</div>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 drop-shadow-lg">
            Kidzee Polichalur
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Where every day is an adventure! Explore our preschool activities, celebrations,
            and the wonderful moments of learning and growth.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/activities"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Explore Activities <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-full font-bold backdrop-blur-sm hover:bg-white/30 transition-all border border-white/30"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </section>

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
              className="bg-white rounded-2xl p-5 text-center shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <stat.icon className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activities */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
              Recent Activities
            </h2>
            <Link
              href="/activities"
              className="text-orange-500 hover:text-orange-600 font-semibold text-sm flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="text-5xl mb-4">🌟</div>
              <p className="text-gray-500 text-lg">No activities yet!</p>
              <p className="text-gray-400 text-sm mt-1">Activities will appear here once uploaded by admin.</p>
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

      {/* Browse by Year */}
      {years.length > 0 && (
        <section className="py-12 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6">
              Browse by Year
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {years.map((year) => (
                <Link
                  key={year}
                  href={`/activities/${year}`}
                  className="px-6 py-3 bg-white rounded-2xl font-bold text-gray-700 shadow-md hover:shadow-lg hover:scale-105 transition-all border border-gray-100"
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
