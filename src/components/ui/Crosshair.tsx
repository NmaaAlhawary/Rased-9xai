interface CrosshairProps {
  visible?: boolean;
}

/**
 * Minimal arc reticle — four short arcs at cardinal positions around a
 * centre dot. Gold-tinted to match the HORIZON palette.
 */
export default function Crosshair({ visible = true }: CrosshairProps) {
  if (!visible) return null;

  const R = 14; // arc radius
  const GAP = 6; // gap between arc endpoints

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <svg width="56" height="56" viewBox="0 0 56 56" style={{ opacity: 0.18 }}>
        {/* Centre dot */}
        <circle cx="28" cy="28" r="1.2" fill="rgba(240,192,96,0.7)" />

        {/* Outer ring (dashed to feel lightweight) */}
        <circle cx="28" cy="28" r={R} fill="none" stroke="rgba(240,192,96,0.5)" strokeWidth="0.6" strokeDasharray="3 4" />

        {/* Cardinal tick marks */}
        <line x1="28" y1={28 - R - 2} x2="28" y2={28 - R - 7} stroke="rgba(240,192,96,0.6)" strokeWidth="0.7" strokeLinecap="round" />
        <line x1="28" y1={28 + R + 2} x2="28" y2={28 + R + 7} stroke="rgba(240,192,96,0.6)" strokeWidth="0.7" strokeLinecap="round" />
        <line x1={28 - R - 2} y1="28" x2={28 - R - 7} y2="28" stroke="rgba(240,192,96,0.6)" strokeWidth="0.7" strokeLinecap="round" />
        <line x1={28 + R + 2} y1="28" x2={28 + R + 7} y2="28" stroke="rgba(240,192,96,0.6)" strokeWidth="0.7" strokeLinecap="round" />

        {/* Inner gap cross lines (subtle) */}
        <line x1="28" y1={28 - GAP} x2="28" y2={28 - 2} stroke="rgba(240,192,96,0.25)" strokeWidth="0.5" />
        <line x1="28" y1={28 + 2}  x2="28" y2={28 + GAP} stroke="rgba(240,192,96,0.25)" strokeWidth="0.5" />
        <line x1={28 - GAP} y1="28" x2={28 - 2} y2="28"  stroke="rgba(240,192,96,0.25)" strokeWidth="0.5" />
        <line x1={28 + 2}  y1="28" x2={28 + GAP} y2="28" stroke="rgba(240,192,96,0.25)" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
