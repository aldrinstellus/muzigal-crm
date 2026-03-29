"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Activity, ActivityCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import type { SocialPost, SocialPostStatus, SocialPlatform } from "@/lib/social-posts";
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
  PencilSimple,
  ArrowSquareOut,
  ImageSquare,
  ChartBar,
  ShareNetwork,
  ListBullets,
  InstagramLogo,
  FacebookLogo,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  ArrowClockwise,
  Eye,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

type AdminTab = "activities" | "social" | "analytics";

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

const STATUS_CONFIG: Record<SocialPostStatus, { label: string; color: string; bg: string; icon: Icon }> = {
  queued: { label: "Queued", color: "#F59E0B", bg: "#FEF3C7", icon: Clock },
  published: { label: "Published", color: "#10B981", bg: "#D1FAE5", icon: CheckCircle },
  failed: { label: "Failed", color: "#EF4444", bg: "#FEE2E2", icon: XCircle },
};

const PLATFORM_CONFIG: Record<SocialPlatform, { label: string; icon: Icon; color: string }> = {
  instagram: { label: "Instagram", icon: InstagramLogo, color: "#E4405F" },
  facebook: { label: "Facebook", icon: FacebookLogo, color: "#1877F2" },
  both: { label: "Both", icon: Globe, color: "#6366F1" },
};

const TAB_CONFIG: { key: AdminTab; label: string; icon: Icon }[] = [
  { key: "activities", label: "Activities", icon: ListBullets },
  { key: "social", label: "Social Posts", icon: ShareNetwork },
  { key: "analytics", label: "Analytics", icon: ChartBar },
];

export default function AdminDashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [socialLoading, setSocialLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("activities");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState("");
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});
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
    fetchSocialPosts();
  }, [router]);

  const fetchActivities = async () => {
    setLoading(true);
    const res = await fetch("/api/activities");
    const data = await res.json();
    setActivities(data);
    setLoading(false);
  };

  const fetchSocialPosts = useCallback(async () => {
    setSocialLoading(true);
    const res = await fetch("/api/social");
    const data = await res.json();
    setSocialPosts(data);
    setSocialLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);

    const payload = {
      title,
      description,
      date,
      category,
      videoUrl: videoUrl || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    };

    if (editingId) {
      // PATCH — update existing
      const res = await fetch("/api/activities", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
      if (res.ok) {
        resetForm();
        setShowForm(false);
        setEditingId(null);
        fetchActivities();
      }
    } else {
      // POST — create new
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        resetForm();
        setShowForm(false);
        fetchActivities();
      }
    }
    setSubmitting(false);
  };

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id);
    setTitle(activity.title);
    setDescription(activity.description);
    setDate(activity.date);
    setCategory(activity.category);
    setVideoUrl(activity.videoUrl || "");
    setTags(activity.tags.join(", "));
    setShowForm(true);
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

  const handleDeleteSocialPost = async (id: string) => {
    if (!token) return;
    if (!confirm("Delete this social post?")) return;

    await fetch(`/api/social?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSocialPosts();
  };

  const handleUpdateCaption = async (id: string) => {
    if (!token) return;

    const res = await fetch("/api/social", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, caption: editingCaption }),
    });
    if (res.ok) {
      setEditingCaptionId(null);
      setEditingCaption("");
      fetchSocialPosts();
    }
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
    setEditingId(null);
  };

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => ({ ...prev, [year]: !prev[year] }));
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

  // Initialize expanded state for all years (default expanded)
  useEffect(() => {
    if (sortedYears.length > 0) {
      setExpandedYears((prev) => {
        const next = { ...prev };
        for (const y of sortedYears) {
          if (next[y] === undefined) next[y] = true;
        }
        return next;
      });
    }
  }, [activities.length]);

  // Group social posts by status
  const postsByStatus = socialPosts.reduce(
    (acc, p) => {
      if (!acc[p.status]) acc[p.status] = [];
      acc[p.status].push(p);
      return acc;
    },
    {} as Record<string, SocialPost[]>
  );

  // Analytics computations
  const totalActivities = activities.length;
  const activitiesByCategory = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    key: key as ActivityCategory,
    label,
    count: activities.filter((a) => a.category === key).length,
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  const activitiesByYear = sortedYears.map((year) => ({
    year,
    count: activityByYear[year].length,
  }));

  const maxYearCount = Math.max(...activitiesByYear.map((y) => y.count), 1);
  const maxCategoryCount = Math.max(...activitiesByCategory.map((c) => c.count), 1);

  const socialSummary = {
    total: socialPosts.length,
    queued: socialPosts.filter((p) => p.status === "queued").length,
    published: socialPosts.filter((p) => p.status === "published").length,
    failed: socialPosts.filter((p) => p.status === "failed").length,
  };

  const totalImages = activities.reduce((sum, a) => sum + a.images.length, 0);

  if (!token) return null;

  return (
    <div className="py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--color-text)]">Admin Dashboard</h1>
            <p className="text-[var(--color-text-secondary)] text-sm mt-1">Manage Kidzee Polichalur activities, social posts & analytics</p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "activities" && (
              <button
                onClick={() => {
                  if (editingId) resetForm();
                  setShowForm(!showForm);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-[var(--color-primary)]/25 text-sm"
              >
                <Plus size={16} weight="bold" />
                Add Activity
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] text-[var(--color-text-secondary)] font-semibold rounded-2xl hover:bg-[var(--color-border-light)] transition-all text-sm border border-[var(--color-border-light)]"
            >
              <SignOut size={16} weight="bold" />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--color-surface)] p-1 rounded-2xl border border-[var(--color-border-light)] mb-6">
          {TAB_CONFIG.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-white text-[var(--color-primary)] shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                <TabIcon size={16} weight={isActive ? "fill" : "regular"} />
                {tab.label}
                {tab.key === "social" && socialSummary.queued > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">
                    {socialSummary.queued}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "activities" && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Add/Edit Activity Form */}
              {showForm && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                  <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                    <span style={{ color: "var(--color-primary)" }}>
                      {editingId ? <PencilSimple size={20} weight="duotone" /> : <UploadSimple size={20} weight="duotone" />}
                    </span>
                    {editingId ? "Edit Activity" : "Upload New Activity"}
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
                        {submitting ? "Saving..." : editingId ? "Update Activity" : "Save Activity"}
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
                  <div className="flex justify-center mb-3">
                    <span className="animate-spin inline-block" style={{ color: "var(--color-primary)" }}>
                      <SpinnerGap size={40} weight="bold" />
                    </span>
                  </div>
                  <p className="text-[var(--color-text-secondary)]">Loading activities...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-[var(--color-border-light)]">
                  <div className="flex justify-center mb-4" style={{ color: "var(--color-text-muted)" }}>
                    <Tray size={48} weight="duotone" />
                  </div>
                  <p className="text-[var(--color-text-secondary)] text-lg">No activities yet</p>
                  <p className="text-[var(--color-text-muted)] text-sm mt-1">Click &quot;Add Activity&quot; to get started!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedYears.map((year) => {
                    const isExpanded = expandedYears[year] !== false;
                    return (
                      <div key={year}>
                        <button
                          onClick={() => toggleYear(year)}
                          className="w-full flex items-center justify-between mb-3 group cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1 rounded-full text-sm font-extrabold">
                              {year}
                            </span>
                            <span className="text-[var(--color-text-muted)] text-sm font-normal">
                              {activityByYear[year].length} activities
                            </span>
                          </div>
                          <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] transition-colors">
                            {isExpanded ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
                          </span>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-3">
                                {activityByYear[year]
                                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                  .map((activity) => {
                                    const CategoryIcon = ICON_MAP[activity.category];
                                    const accentColor = COLOR_MAP[activity.category];
                                    const firstImage = activity.images.length > 0 ? activity.images[0] : null;
                                    return (
                                      <div
                                        key={activity.id}
                                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                                        style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
                                      >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                          {/* Image thumbnail or category icon */}
                                          {firstImage ? (
                                            <img
                                              src={firstImage}
                                              alt=""
                                              className="flex-shrink-0 w-9 h-9 rounded-lg object-cover"
                                            />
                                          ) : (
                                            <span
                                              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg"
                                              style={{ backgroundColor: `${accentColor}18` }}
                                            >
                                              <ImageSquare size={20} weight="duotone" color={accentColor} />
                                            </span>
                                          )}
                                          <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-[var(--color-text)] text-sm truncate">
                                              {activity.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                              <p className="text-xs text-[var(--color-text-secondary)]">
                                                {new Date(activity.date).toLocaleDateString("en-IN", {
                                                  day: "numeric",
                                                  month: "short",
                                                  year: "numeric",
                                                })}
                                              </p>
                                              <span className="text-xs text-[var(--color-text-muted)]">&middot;</span>
                                              <span
                                                className="text-xs font-medium px-1.5 py-0.5 rounded-md"
                                                style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                                              >
                                                {CATEGORY_LABELS[activity.category]}
                                              </span>
                                              {activity.images.length > 0 && (
                                                <>
                                                  <span className="text-xs text-[var(--color-text-muted)]">&middot;</span>
                                                  <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-0.5">
                                                    <ImageSquare size={12} weight="fill" />
                                                    {activity.images.length}
                                                  </span>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <a
                                            href={`/activities/${activity.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Preview activity"
                                          >
                                            <ArrowSquareOut size={16} weight="bold" />
                                          </a>
                                          <button
                                            onClick={() => handleEdit(activity)}
                                            className="p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                            title="Edit activity"
                                          >
                                            <PencilSimple size={16} weight="bold" />
                                          </button>
                                          <button
                                            onClick={() => handleDelete(activity.id)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete activity"
                                          >
                                            <Trash size={16} weight="bold" />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "social" && (
            <motion.div
              key="social"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {socialLoading ? (
                <div className="text-center py-16">
                  <div className="flex justify-center mb-3">
                    <span className="animate-spin inline-block" style={{ color: "var(--color-primary)" }}>
                      <SpinnerGap size={40} weight="bold" />
                    </span>
                  </div>
                  <p className="text-[var(--color-text-secondary)]">Loading social posts...</p>
                </div>
              ) : socialPosts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-[var(--color-border-light)]">
                  <div className="flex justify-center mb-4" style={{ color: "var(--color-text-muted)" }}>
                    <ShareNetwork size={48} weight="duotone" />
                  </div>
                  <p className="text-[var(--color-text-secondary)] text-lg">No social posts yet</p>
                  <p className="text-[var(--color-text-muted)] text-sm mt-1">
                    Social posts are created when you queue activities for sharing.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {(["queued", "published", "failed"] as SocialPostStatus[]).map((status) => {
                    const posts = postsByStatus[status] || [];
                    if (posts.length === 0) return null;
                    const config = STATUS_CONFIG[status];
                    const StatusIcon = config.icon;
                    return (
                      <div key={status}>
                        <div className="flex items-center gap-2 mb-3">
                          <StatusIcon size={18} weight="fill" color={config.color} />
                          <h2 className="text-lg font-bold text-[var(--color-text)]">{config.label}</h2>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: config.bg, color: config.color }}
                          >
                            {posts.length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {posts.map((post) => {
                            const platConfig = PLATFORM_CONFIG[post.platform];
                            const PlatIcon = platConfig.icon;
                            const isEditingCaption = editingCaptionId === post.id;
                            return (
                              <div
                                key={post.id}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                      <h3 className="font-semibold text-[var(--color-text)] text-sm">
                                        {post.activityTitle}
                                      </h3>
                                      <span
                                        className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: `${platConfig.color}15`, color: platConfig.color }}
                                      >
                                        <PlatIcon size={12} weight="fill" />
                                        {platConfig.label}
                                      </span>
                                      <span
                                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: config.bg, color: config.color }}
                                      >
                                        {config.label}
                                      </span>
                                    </div>
                                    {isEditingCaption ? (
                                      <div className="mt-2">
                                        <textarea
                                          value={editingCaption}
                                          onChange={(e) => setEditingCaption(e.target.value)}
                                          rows={4}
                                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none text-xs font-mono"
                                        />
                                        <div className="flex gap-2 mt-2">
                                          <button
                                            onClick={() => handleUpdateCaption(post.id)}
                                            className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-lg hover:brightness-110 transition-all"
                                          >
                                            Save Caption
                                          </button>
                                          <button
                                            onClick={() => {
                                              setEditingCaptionId(null);
                                              setEditingCaption("");
                                            }}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-all"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2 whitespace-pre-line">
                                        {post.caption}
                                      </p>
                                    )}
                                    <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
                                      Created {new Date(post.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                      {post.publishedAt && (
                                        <> &middot; Published {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        })}</>
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {status === "queued" && (
                                      <>
                                        <button
                                          disabled
                                          title="Meta API not configured"
                                          className="p-2 text-green-300 rounded-lg cursor-not-allowed"
                                        >
                                          <ArrowSquareOut size={16} weight="bold" />
                                        </button>
                                        {!isEditingCaption && (
                                          <button
                                            onClick={() => {
                                              setEditingCaptionId(post.id);
                                              setEditingCaption(post.caption);
                                            }}
                                            className="p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                            title="Edit caption"
                                          >
                                            <PencilSimple size={16} weight="bold" />
                                          </button>
                                        )}
                                      </>
                                    )}
                                    {status === "failed" && (
                                      <button
                                        disabled
                                        title="Meta API not configured"
                                        className="p-2 text-orange-300 rounded-lg cursor-not-allowed"
                                      >
                                        <ArrowClockwise size={16} weight="bold" />
                                      </button>
                                    )}
                                    {status === "published" && post.publishedAt && (
                                      <span className="p-2 text-green-400" title="Published">
                                        <Eye size={16} weight="bold" />
                                      </span>
                                    )}
                                    <button
                                      onClick={() => handleDeleteSocialPost(post.id)}
                                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete post"
                                    >
                                      <Trash size={16} weight="bold" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                  <p className="text-3xl font-extrabold text-[var(--color-primary)]">{totalActivities}</p>
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] mt-1">Total Activities</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                  <p className="text-3xl font-extrabold text-[var(--color-accent)]">{totalImages}</p>
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] mt-1">Total Images</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                  <p className="text-3xl font-extrabold text-indigo-500">{sortedYears.length}</p>
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] mt-1">Years Active</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                  <p className="text-3xl font-extrabold text-emerald-500">{socialSummary.total}</p>
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] mt-1">Social Posts</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Activities by Year */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-base font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                    <CalendarBlank size={18} weight="duotone" color="var(--color-primary)" />
                    Activities by Year
                  </h3>
                  {activitiesByYear.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)]">No data</p>
                  ) : (
                    <div className="space-y-3">
                      {activitiesByYear.map((item) => (
                        <div key={item.year} className="flex items-center gap-3">
                          <span className="text-sm font-bold text-[var(--color-text)] w-12">{item.year}</span>
                          <div className="flex-1 h-7 bg-gray-50 rounded-lg overflow-hidden relative">
                            <div
                              className="h-full rounded-lg transition-all duration-500"
                              style={{
                                width: `${(item.count / maxYearCount) * 100}%`,
                                background: "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
                                minWidth: "24px",
                              }}
                            />
                            <span className="absolute inset-0 flex items-center px-2 text-xs font-bold text-[var(--color-text)]">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Activities by Category */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-base font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                    <Tag size={18} weight="duotone" color="var(--color-primary)" />
                    Activities by Category
                  </h3>
                  {activitiesByCategory.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)]">No data</p>
                  ) : (
                    <div className="space-y-3">
                      {activitiesByCategory.map((item) => {
                        const CatIcon = ICON_MAP[item.key];
                        const color = COLOR_MAP[item.key];
                        return (
                          <div key={item.key} className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 w-28 min-w-0">
                              <span className="flex-shrink-0"><CatIcon size={14} weight="fill" color={color} /></span>
                              <span className="text-xs font-semibold text-[var(--color-text)] truncate">{item.label}</span>
                            </span>
                            <div className="flex-1 h-7 bg-gray-50 rounded-lg overflow-hidden relative">
                              <div
                                className="h-full rounded-lg transition-all duration-500"
                                style={{
                                  width: `${(item.count / maxCategoryCount) * 100}%`,
                                  backgroundColor: color,
                                  opacity: 0.8,
                                  minWidth: "24px",
                                }}
                              />
                              <span className="absolute inset-0 flex items-center px-2 text-xs font-bold text-[var(--color-text)]">
                                {item.count}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Social Posts Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
                <h3 className="text-base font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                  <ShareNetwork size={18} weight="duotone" color="var(--color-primary)" />
                  Social Posts Summary
                </h3>
                {socialSummary.total === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">No social posts created yet.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {(["queued", "published", "failed"] as SocialPostStatus[]).map((status) => {
                      const cfg = STATUS_CONFIG[status];
                      const SIcon = cfg.icon;
                      return (
                        <div
                          key={status}
                          className="rounded-xl p-4 text-center"
                          style={{ backgroundColor: cfg.bg }}
                        >
                          <span className="mx-auto mb-1 flex justify-center"><SIcon size={24} weight="fill" color={cfg.color} /></span>
                          <p className="text-2xl font-extrabold" style={{ color: cfg.color }}>
                            {socialSummary[status]}
                          </p>
                          <p className="text-xs font-semibold" style={{ color: cfg.color }}>
                            {cfg.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
