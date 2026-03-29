import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Present: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Enrolled: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    "Demo Scheduled": "bg-blue-50 text-blue-700 border-blue-200",
    Trial: "bg-violet-50 text-violet-700 border-violet-200",
    New: "bg-sky-50 text-sky-700 border-sky-200",
    Overdue: "bg-red-50 text-red-700 border-red-200",
    Cancelled: "bg-zinc-100 text-zinc-500 border-zinc-200",
    Absent: "bg-red-50 text-red-700 border-red-200",
    Late: "bg-amber-50 text-amber-700 border-amber-200",
    Lost: "bg-zinc-100 text-zinc-400 border-zinc-200",
    Inactive: "bg-zinc-100 text-zinc-400 border-zinc-200",
  };
  return map[status] || "bg-zinc-100 text-zinc-600 border-zinc-200";
}
