export function PalmTree({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Trunk — slight curve */}
      <path
        d="M80 280 Q75 200 82 140 Q86 100 80 80"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      {/* Trunk rings */}
      <path d="M74 240 Q80 236 86 240" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M73 210 Q80 206 87 210" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M74 180 Q80 176 86 180" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M75 150 Q80 146 85 150" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* Fronds — left drooping */}
      <path
        d="M80 80 Q40 50 10 70 Q40 40 80 60"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Fronds — right drooping */}
      <path
        d="M80 80 Q120 50 150 70 Q120 40 80 60"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Fronds — top left */}
      <path
        d="M80 75 Q50 30 20 20 Q55 25 80 55"
        fill="currentColor"
        opacity="0.7"
      />
      {/* Fronds — top right */}
      <path
        d="M80 75 Q110 30 140 20 Q105 25 80 55"
        fill="currentColor"
        opacity="0.7"
      />
      {/* Fronds — center top */}
      <path
        d="M80 75 Q78 20 75 5 Q85 20 82 75"
        fill="currentColor"
        opacity="0.6"
      />
      {/* Coconuts */}
      <circle cx="75" cy="85" r="6" fill="currentColor" opacity="0.9" />
      <circle cx="85" cy="88" r="5" fill="currentColor" opacity="0.9" />
      <circle cx="78" cy="92" r="5" fill="currentColor" opacity="0.9" />
    </svg>
  );
}
