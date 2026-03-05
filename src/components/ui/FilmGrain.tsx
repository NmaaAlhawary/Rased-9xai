/**
 * AmbientOrbs — replaces the old canvas film grain.
 * Three slow-drifting radial-gradient orbs behind everything,
 * creating a deep cosmic atmosphere without any canvas overhead.
 * Pointer-events: none — never blocks interaction.
 *
 * The `opacity` prop is kept for API compatibility with App.tsx.
 */
export default function FilmGrain({ opacity: _opacity }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

