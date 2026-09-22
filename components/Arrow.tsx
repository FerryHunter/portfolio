/** Panah diagonal — dipakai di semua pill (§5.5). */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 10" fill="none" aria-hidden="true" className={className}>
      <path d="M1 9 9 1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3.4 1H9v5.6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
