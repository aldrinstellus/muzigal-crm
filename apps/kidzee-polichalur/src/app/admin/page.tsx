"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Activity, ActivityCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import {
  Plus,
  Trash,
  SignOut,
  UploadSimple,
  CalendarBlank,
  Tag,
  VideoCamera,
  FileText,
  SpinnerGap,
  Tray,
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
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

const ICON_MAP: Record<ActivityCategory, Icon> = {
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
            <h1 className="text-3xl font-extrabold text-[var(--color-text)]">Admin Dashboard</h1>
            <p className="text-[var(--color-text-secondary)] text-sm mt-1">Manage Kidzee Polichalur activities</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-[var(--color-primary)]/25 text-sm"
            >
              <Plus size={16} weight="bold" />
              Add Activity
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] text-[var(--color-text-secondary)] font-semibold rounded-2xl hover:bg-[var(--color-border-light)] transition-all text-sm border border-[var(--color-border-light)]"
            >
              <SignOut size={16} weight="bold" />
              Logout
            </button>
          </div>
        </div>

        {/* Add Activity Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <span style={{ color: "var(--color-primary)" }}><UploadSimple size={20} weight="duotone" /></span>
              Upload New Activity
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)]/80 mb-1">
                    <span className="inline mr-1 align-[-2px]"><FileText size={14} weight="duotone" /></span>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Annual Day Celebrations 2024"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)]/80 mb-1">
                    <span className="inline mr-1 align-[-2px]"><CalendarBlank size={14} weight="duotone" /></span>
                    Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)]/80 mb-1">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the activity..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none text-sm resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)]/80 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none text-sm bg-white"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)]/80 mb-1">
                    <span className="inline mr-1 align-[-2px]"><VideoCamera size={14} weight="duotone" /></span>
                    Video URL (optional)
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)]/80 mb-1">
                  <span className="inline mr-1 align-[-2px]"><Tag size={14} weight="duotone" /></span>
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., sports, outdoor, fun, teamwork"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-[var(--color-success)] to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 text-sm shadow-md"
                >
                  {submitting ? "Saving..." : "Save Activity"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-2.5 bg-[var(--color-surface)] text-[var(--color-text-secondary)] font-semibold rounded-xl hover:bg-[var(--color-border-light)] transition-all text-sm border border-[var(--color-border-light)]"
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
            <div className="flex justify-center mb-3"><span className="animate-spin inline-block" style={{ color: "var(--color-primary)" }}><SpinnerGap size={40} weight="bold" /></span></div>
            <p className="text-[var(--color-text-secondary)]">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-[var(--color-border-light)]">
            <div className="flex justify-center mb-4" style={{ color: "var(--color-text-muted)" }}><Tray size={48} weight="duotone" /></div>
            <p className="text-[var(--color-text-secondary)] text-lg">No activities yet</p>
            <p className="text-[var(--color-text-muted)] text-sm mt-1">Click &quot;Add Activity&quot; to get started!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedYears.map((year) => (
              <div key={year}>
                <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                  <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1 rounded-full text-sm font-extrabold">
                    {year}
                  </span>
                  <span className="text-[var(--color-text-muted)] text-sm font-normal">
                    {activityByYear[year].length} activities
                  </span>
                </h2>
                <div className="space-y-3">
                  {activityByYear[year]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((activity) => {
                      const CategoryIcon = ICON_MAP[activity.category];
                      const accentColor = COLOR_MAP[activity.category];
                      return (
                        <div
                          key={activity.id}
                          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                          style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full"
                              style={{ backgroundColor: `${accentColor}18` }}
                            >
                              <CategoryIcon size={20} weight="fill" style={{ color: accentColor }} />
                            </span>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-[var(--color-text)] text-sm truncate">
                                {activity.title}
                              </h3>
                              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
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
                            <Trash size={16} weight="bold" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
