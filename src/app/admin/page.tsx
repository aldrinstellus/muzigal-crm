"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Activity, ActivityCategory } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_EMOJIS } from "@/lib/types";
import { Plus, Trash2, LogOut, Upload, Calendar, Tag, Video, FileText } from "lucide-react";

export default function AdminDashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("other");
  const [videoUrl, setVideoUrl] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    const t = sessionStorage.getItem("admin_token");
    if (!t) {
      router.push("/admin/login");
      return;
    }
    setToken(t);
    fetchActivities();
  }, [router]);

  const fetchActivities = async () => {
    setLoading(true);
    const res = await fetch("/api/activities");
    const data = await res.json();
    setActivities(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);

    const res = await fetch("/api/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        date,
        category,
        videoUrl: videoUrl || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
      }),
    });

    if (res.ok) {
      resetForm();
      setShowForm(false);
      fetchActivities();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this activity?")) return;

    await fetch(`/api/activities?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchActivities();
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setCategory("other");
    setVideoUrl("");
    setTags("");
  };

  // Group activities by year
  const activityByYear = activities.reduce(
    (acc, a) => {
      if (!acc[a.year]) acc[a.year] = [];
      acc[a.year].push(a);
      return acc;
    },
    {} as Record<number, Activity[]>
  );
  const sortedYears = Object.keys(activityByYear)
    .map(Number)
    .sort((a, b) => b - a);

  if (!token) return null;

  return (
    <div className="py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Manage Kidzee Polichalur activities</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all shadow-md text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Add Activity Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-orange-500" />
              Upload New Activity
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <FileText className="w-3.5 h-3.5 inline mr-1" />
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Annual Day Celebrations 2024"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the activity..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-white"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {CATEGORY_EMOJIS[key as ActivityCategory]} {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <Video className="w-3.5 h-3.5 inline mr-1" />
                    Video URL (optional)
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <Tag className="w-3.5 h-3.5 inline mr-1" />
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., sports, outdoor, fun, teamwork"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 text-sm shadow-md"
                >
                  {submitting ? "Saving..." : "Save Activity"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Activities List by Year */}
        {loading ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3 animate-bounce">🔄</div>
            <p className="text-gray-500">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No activities yet</p>
            <p className="text-gray-400 text-sm mt-1">Click &quot;Add Activity&quot; to get started!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedYears.map((year) => (
              <div key={year}>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-extrabold">
                    {year}
                  </span>
                  <span className="text-gray-400 text-sm font-normal">
                    {activityByYear[year].length} activities
                  </span>
                </h2>
                <div className="space-y-3">
                  {activityByYear[year]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((activity) => (
                      <div
                        key={activity.id}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl flex-shrink-0">
                            {CATEGORY_EMOJIS[activity.category]}
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-800 text-sm truncate">
                              {activity.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(activity.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}{" "}
                              &middot; {CATEGORY_LABELS[activity.category]}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(activity.id)}
                          className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete activity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
