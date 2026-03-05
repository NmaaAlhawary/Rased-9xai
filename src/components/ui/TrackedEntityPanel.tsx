import { useState } from 'react';
import type { TrackedEntityInfo } from '../globe/EntityClickHandler';

interface TrackedEntityPanelProps {
  trackedEntity: TrackedEntityInfo | null;
  onUnlock?: () => void;
  isMobile?: boolean;
}

const TYPE_ICONS: Record<TrackedEntityInfo['entityType'], string> = {
  satellite: 'Satellite',
  aircraft: 'Aircraft',
  ship: 'Vessel',
  earthquake: 'Seismic',
  cctv: 'Camera',
  unknown: 'Target',
};

const TYPE_LABELS: Record<TrackedEntityInfo['entityType'], string> = {
  satellite: 'Satellite',
  aircraft: 'Aircraft',
  ship: 'Vessel',
  earthquake: 'Seismic Event',
  cctv: 'CCTV Camera',
  unknown: 'Target',
};

const TYPE_COLORS: Record<TrackedEntityInfo['entityType'], string> = {
  satellite: 'text-wv-green',
  aircraft: 'text-wv-cyan',
  ship: 'text-wv-cyan',
  earthquake: 'text-wv-amber',
  cctv: 'text-wv-red',
  unknown: 'text-wv-muted',
};

const TYPE_BADGE_COLORS: Record<TrackedEntityInfo['entityType'], string> = {
  satellite: 'bg-wv-green/15 text-wv-green border-wv-green/25',
  aircraft: 'bg-wv-cyan/15 text-wv-cyan border-wv-cyan/25',
  ship: 'bg-wv-teal/15 text-wv-teal border-wv-teal/25',
  earthquake: 'bg-wv-amber/15 text-wv-amber border-wv-amber/25',
  cctv: 'bg-wv-red/15 text-wv-red border-wv-red/25',
  unknown: 'bg-white/5 text-wv-muted border-wv-border',
};

/** Parse simple key-value pairs from the entity description HTML */
function parseDescription(html: string): Record<string, string> {
  const pairs: Record<string, string> = {};
  // Match patterns like <b>Key:</b> Value
  const regex = /<b>([^<]+):<\/b>\s*([^<]+)/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (key && value) pairs[key] = value;
  }
  return pairs;
}

/** Build a FlightAware URL from a registration string (strips hyphens) */
function flightAwareUrl(registration: string): string {
  return `https://www.flightaware.com/live/flight/${registration.replace(/-/g, '')}`;
}

export default function TrackedEntityPanel({ trackedEntity, onUnlock, isMobile = false }: TrackedEntityPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!trackedEntity) return null;

  const details = parseDescription(trackedEntity.description);
  const abbr = TYPE_ICONS[trackedEntity.entityType];
  const label = TYPE_LABELS[trackedEntity.entityType];
  const colorClass = TYPE_COLORS[trackedEntity.entityType];
  const badgeClass = TYPE_BADGE_COLORS[trackedEntity.entityType];

  /* ── Mobile: compact tracking bar, tap to expand ── */
  if (isMobile) {
    return (
      <div className="fixed bottom-8 left-2 right-2 z-50 pointer-events-auto">
        <div className="panel-glass rounded-lg border border-white/10 overflow-hidden">
          {/* Always-visible compact bar */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left"
          >
            <span className={`font-mono text-[8px] tracking-widest px-1.5 py-0.5 rounded border font-semibold shrink-0 ${badgeClass}`}>{abbr}</span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono font-medium text-white truncate block">
                {trackedEntity.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[8px] font-mono text-red-400 uppercase tracking-wider">Lock</span>
              <span className="text-[9px] text-wv-muted ml-1">{expanded ? '▾' : '▴'}</span>
            </div>
          </button>

          {/* Expanded detail section */}
          {expanded && Object.keys(details).length > 0 && (
            <div className="px-3 pb-2 pt-1 border-t border-white/6">
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {Object.entries(details).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-1">
                    <span className="text-[8px] font-mono text-wv-muted uppercase truncate">{key}</span>
                    <span className={`text-[9px] font-mono tabular-nums text-right truncate ${colorClass}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unlock button */}
          <button
            onClick={onUnlock}
            className="w-full text-[9px] font-mono uppercase tracking-wider text-wv-muted/60
                       hover:text-wv-muted border-t border-white/6
                       px-3 py-1.5 transition-colors min-h-[36px]"
          >
            Tap to unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div
        className="panel-glass rounded-2xl px-4 py-3 min-w-[320px] max-w-[480px]"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(240,192,96,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className={`font-mono text-[9px] tracking-wide px-2 py-0.5 rounded-lg border font-semibold ${badgeClass}`}>
              {abbr}
            </span>
            <div>
              <span className={`text-[9px] font-medium tracking-wide ${colorClass} opacity-70`}>
                {label}
              </span>
              <h3 className="text-sm font-semibold text-wv-text leading-tight">
                {trackedEntity.name}
              </h3>
            </div>
          </div>
          {/* Gold lock indicator */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <div className="w-2 h-2 rounded-full border-2 border-wv-cyan" />
              <div className="absolute inset-0 w-2 h-2 rounded-full border-2 border-wv-cyan animate-ping opacity-50" />
            </div>
            <span className="text-[8px] font-medium text-wv-cyan tracking-wide">Tracking</span>
          </div>
        </div>

        {/* Detail grid */}
        {Object.keys(details).length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 pt-2 border-t border-white/6">
            {Object.entries(details).map(([key, value]) => {
              const isRegLink = trackedEntity.entityType === 'aircraft'
                && key === 'Registration' && value && value !== 'N/A';

              return (
                <div key={key} className="flex justify-between gap-2">
                  <span className="text-[8px] font-mono text-wv-muted uppercase tracking-wide truncate">{key}</span>
                  {isRegLink ? (
                    <a
                      href={flightAwareUrl(value)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-[9px] font-mono tabular-nums text-right ${colorClass}
                                 underline decoration-current/30 hover:decoration-current
                                 hover:text-white transition-colors pointer-events-auto`}
                    >
                      {value}
                    </a>
                  ) : (
                    <span className={`text-[9px] font-mono tabular-nums text-right ${colorClass}`}>{value}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Unlock hint */}
        <button
          onClick={onUnlock}
          className="mt-3 w-full text-[9px] font-medium tracking-wide text-wv-muted/40
                     hover:text-wv-muted border border-white/5 hover:border-wv-border/50
                     rounded-xl px-2 py-1.5 transition-colors cursor-pointer"
        >
          Press ESC or click map to release
        </button>
      </div>
    </div>
  );
}
