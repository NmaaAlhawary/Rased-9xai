/**
 * ZoomControls — Fixed +/− buttons for zooming the Cesium camera in/out.
 * Positioned on the right edge, vertically centered.
 */

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div
      className="fixed z-40 flex flex-col gap-1 select-none"
      style={{ right: '1rem', top: '50%', transform: 'translateY(-50%)' }}
    >
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        aria-label="Zoom in"
        className="
          w-8 h-8 rounded panel-glass
          flex items-center justify-center
          text-wv-muted hover:text-wv-cyan
          border border-wv-border hover:border-wv-cyan/40
          transition-all duration-150
          active:scale-90
        "
        style={{ fontSize: '1.1rem', lineHeight: 1 }}
      >
        +
      </button>

      {/* Divider */}
      <div className="h-px bg-wv-border mx-1" />

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        aria-label="Zoom out"
        className="
          w-8 h-8 rounded panel-glass
          flex items-center justify-center
          text-wv-muted hover:text-wv-cyan
          border border-wv-border hover:border-wv-cyan/40
          transition-all duration-150
          active:scale-90
        "
        style={{ fontSize: '1.3rem', lineHeight: 1 }}
      >
        −
      </button>
    </div>
  );
}
