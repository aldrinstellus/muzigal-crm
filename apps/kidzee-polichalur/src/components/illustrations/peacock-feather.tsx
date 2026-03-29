export function PeacockFeather({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Feather shaft */}
      <path
        d="M40 160 Q38 100 40 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Outer eye shape */}
      <path
        d="M40 20 Q15 40 20 70 Q25 90 40 95 Q55 90 60 70 Q65 40 40 20Z"
        fill="currentColor"
        opacity="0.3"
      />
      {/* Inner eye ring */}
      <path
        d="M40 35 Q25 48 28 65 Q32 78 40 80 Q48 78 52 65 Q55 48 40 35Z"
        fill="currentColor"
        opacity="0.5"
      />
      {/* Eye center */}
      <ellipse cx="40" cy="58" rx="8" ry="12" fill="currentColor" opacity="0.7" />
      {/* Eye pupil */}
      <ellipse cx="40" cy="56" rx="4" ry="6" fill="currentColor" opacity="0.9" />
      {/* Barbs — left */}
      <path d="M38 100 Q30 95 25 100" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M38 115 Q28 110 22 116" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M38 130 Q30 126 26 132" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.2" />
      {/* Barbs — right */}
      <path d="M42 100 Q50 95 55 100" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M42 115 Q52 110 58 116" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M42 130 Q50 126 54 132" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.2" />
    </svg>
  );
}
