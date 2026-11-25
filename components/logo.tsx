/** TrueUnit mark: a house whose doorway is a check mark. Indigo outline, coral first stroke of the check. */
export function LogoMark({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  const ink = inverted ? "#ffffff" : "#2F2A7A";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 40H10V20L24 8l14 12v20h-5" stroke={ink} strokeWidth="4.2" />
      <path d="M17 29.5l5 6" stroke="#E5484D" strokeWidth="4.2" />
      <path d="M22 35.5l9-12" stroke={ink} strokeWidth="4.2" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark className="size-7 md:size-8" />
      <span className="text-[17px] tracking-tight text-[#2F2A7A] md:text-[19px]">
        True<span className="font-semibold">Unit</span>
      </span>
    </span>
  );
}
