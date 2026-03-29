export function WaveDivider({ from = "var(--color-primary)", to = "var(--color-bg)" }: { from?: string; to?: string }) {
  return (
    <div className="w-full overflow-hidden leading-[0] -mt-px">
      <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="w-full h-[40px] sm:h-[60px]">
        <path
          d="M0,0 C300,80 900,0 1200,60 L1200,80 L0,80 Z"
          fill={to}
        />
        <path
          d="M0,0 C300,80 900,0 1200,60 L1200,0 L0,0 Z"
          fill={from}
        />
      </svg>
    </div>
  );
}
