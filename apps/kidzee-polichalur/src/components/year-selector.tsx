"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

export function YearSelector({ years, activeYear }: { years: number[]; activeYear?: number }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Link
        href="/activities"
        className={cn(
          "px-4 py-2 rounded-[var(--radius-blob)] text-sm font-semibold transition-all",
          !activeYear
            ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-md)]"
            : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)]/20 border border-[var(--color-border-light)]"
        )}
      >
        All Years
      </Link>
      {years.map((year) => (
        <Link
          key={year}
          href={`/activities/${year}`}
          className={cn(
            "px-4 py-2 rounded-[var(--radius-blob)] text-sm font-semibold transition-all",
            activeYear === year
              ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-md)]"
              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)]/20 border border-[var(--color-border-light)]"
          )}
        >
          {year}
        </Link>
      ))}
    </div>
  );
}
