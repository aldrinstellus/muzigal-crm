export function KolamPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Center dot */}
      <circle cx="50" cy="50" r="3" fill="currentColor" />
      {/* Inner ring dots */}
      <circle cx="50" cy="35" r="2" fill="currentColor" />
      <circle cx="50" cy="65" r="2" fill="currentColor" />
      <circle cx="35" cy="50" r="2" fill="currentColor" />
      <circle cx="65" cy="50" r="2" fill="currentColor" />
      {/* Diagonal dots */}
      <circle cx="39" cy="39" r="1.5" fill="currentColor" />
      <circle cx="61" cy="39" r="1.5" fill="currentColor" />
      <circle cx="39" cy="61" r="1.5" fill="currentColor" />
      <circle cx="61" cy="61" r="1.5" fill="currentColor" />
      {/* Connecting curves — kolam loops */}
      <path
        d="M50 35 Q65 35 65 50 Q65 65 50 65 Q35 65 35 50 Q35 35 50 35"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
      {/* Outer petal loops */}
      <path
        d="M50 35 Q58 25 65 35"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M65 50 Q75 58 65 65"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M50 65 Q42 75 35 65"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M35 50 Q25 42 35 35"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Outer corner dots */}
      <circle cx="25" cy="25" r="1.5" fill="currentColor" />
      <circle cx="75" cy="25" r="1.5" fill="currentColor" />
      <circle cx="25" cy="75" r="1.5" fill="currentColor" />
      <circle cx="75" cy="75" r="1.5" fill="currentColor" />
    </svg>
  );
}
