/** Elegant, abstract rangoli-inspired line pattern used as a faint hero texture. */
export function Rangoli({ className }: { className?: string }) {
  const petals = Array.from({ length: 16 });
  return (
    <svg viewBox="-200 -200 400 400" className={className} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1">
        {[190, 150, 110, 70, 34].map((r) => (
          <circle key={r} r={r} strokeDasharray={r % 70 === 0 ? "2 6" : undefined} />
        ))}
        {petals.map((_, i) => (
          <g key={i} transform={`rotate(${(360 / petals.length) * i})`}>
            <path d="M0 -70 C14 -92 14 -118 0 -146 C-14 -118 -14 -92 0 -70Z" />
            <path d="M0 -152 L8 -170 L0 -188 L-8 -170Z" />
            <circle cy="-52" r="3" />
          </g>
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={i} d="M0 -34 C10 -20 10 -8 0 0 C-10 -8 -10 -20 0 -34Z" transform={`rotate(${i * 45})`} />
        ))}
      </g>
    </svg>
  );
}
