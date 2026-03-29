export function AutoRickshaw({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Body */}
      <path
        d="M60 40 L140 40 Q160 40 160 60 L160 110 L40 110 L40 70 Q40 40 60 40Z"
        fill="currentColor"
      />
      {/* Roof canopy */}
      <path
        d="M50 40 Q100 5 150 40"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Front windshield */}
      <path
        d="M45 55 L45 90 L70 90 L70 50 Z"
        fill="currentColor"
        opacity="0.5"
      />
      {/* Rear opening */}
      <path
        d="M130 55 L155 55 L155 100 L130 100 Z"
        fill="currentColor"
        opacity="0.4"
      />
      {/* Front wheel */}
      <circle cx="55" cy="120" r="16" fill="currentColor" />
      <circle cx="55" cy="120" r="8" fill="currentColor" opacity="0.3" />
      {/* Rear wheel */}
      <circle cx="145" cy="120" r="16" fill="currentColor" />
      <circle cx="145" cy="120" r="8" fill="currentColor" opacity="0.3" />
      {/* Handlebar */}
      <path
        d="M35 50 L25 30"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Axle bar */}
      <path
        d="M40 115 L160 115"
        stroke="currentColor"
        strokeWidth="4"
      />
    </svg>
  );
}
