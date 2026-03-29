"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDots,
  Star,
  UsersThree,
  Trophy,
} from "@phosphor-icons/react";

interface StatItem {
  iconName: "CalendarDots" | "Star" | "UsersThree" | "Trophy";
  label: string;
  value: string;
  color: string;
}

const iconMap = {
  CalendarDots,
  Star,
  UsersThree,
  Trophy,
};

const accentColors: Record<string, { bg: string; text: string }> = {
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-500" },
  pink: { bg: "bg-pink-100", text: "text-pink-500" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-500" },
};

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1200;
          const steps = 30;
          const stepDuration = duration / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += 1;
            const progress = current / steps;
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (current >= steps) {
              clearInterval(timer);
              setCount(target);
            }
          }, stepDuration);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-2xl font-bold font-[var(--font-display)] text-[var(--color-text)]">
      {count}
      {suffix}
    </div>
  );
}

function parseValue(value: string): { num: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/);
  if (match) {
    return { num: parseInt(match[1], 10), suffix: match[2] };
  }
  return { num: 0, suffix: value };
}

export function AnimatedStats({ stats }: { stats: StatItem[] }) {
  const colorKeys = Object.keys(accentColors);

  return (
    <section className="py-12 px-4 -mt-8">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = iconMap[stat.iconName];
          const accent = accentColors[colorKeys[i % colorKeys.length]];
          const { num, suffix } = parseValue(String(stat.value));

          return (
            <div
              key={stat.label}
              className="bg-[var(--color-surface)] rounded-2xl p-5 text-center shadow-[var(--shadow-md)] border border-[var(--color-border-light)] hover:shadow-[var(--shadow-lg)] transition-shadow group"
            >
              <div
                className={`w-12 h-12 ${accent.bg} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
              >
                <Icon className={`w-6 h-6 ${accent.text}`} weight="duotone" />
              </div>
              {num > 0 ? (
                <CountUp target={num} suffix={suffix} />
              ) : (
                <div className="text-2xl font-bold font-[var(--font-display)] text-[var(--color-text)]">
                  {stat.value}
                </div>
              )}
              <div className="text-xs text-[var(--color-text-secondary)] mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
