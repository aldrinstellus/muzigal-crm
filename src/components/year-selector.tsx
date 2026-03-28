"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

export function YearSelector({ years, activeYear }: { years: number[]; activeYear?: number }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Link
        href="/activities"
        className={cn(
          "px-4 py-2 rounded-full text-sm font-semibold transition-all",
          !activeYear
            ? "bg-orange-500 text-white shadow-md"
            : "bg-white text-gray-600 hover:bg-orange-100 border border-gray-200"
        )}
      >
        All Years
      </Link>
      {years.map((year) => (
        <Link
          key={year}
          href={`/activities/${year}`}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition-all",
            activeYear === year
              ? "bg-orange-500 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-orange-100 border border-gray-200"
          )}
        >
          {year}
        </Link>
      ))}
    </div>
  );
}
