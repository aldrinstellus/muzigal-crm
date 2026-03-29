interface SkipNavProps {
  targetId?: string;
  label?: string;
}

export function SkipNav({ targetId = "main-content", label = "Skip to main content" }: SkipNavProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--color-primary)] focus:text-[var(--color-on-primary)] focus:text-sm focus:font-medium focus:shadow-lg"
    >
      {label}
    </a>
  );
}
