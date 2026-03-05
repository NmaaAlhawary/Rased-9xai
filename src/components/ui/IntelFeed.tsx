import { useState } from 'react';
import MobileModal from './MobileModal';

export interface IntelFeedItem {
  id: string;
  time: string;
  type: 'flight' | 'seismic' | 'satellite' | 'system' | 'cctv' | 'ship';
  message: string;
}

/** Dot color per event type (matches new palette) */
const TYPE_DOT: Record<string, string> = {
  flight:    'bg-wv-cyan',
  seismic:   'bg-wv-amber',
  satellite: 'bg-wv-green',
  system:    'bg-wv-border',
  cctv:      'bg-wv-red',
  ship:      'bg-wv-cyan',
};

/** Left border color per type */
const TYPE_BAR: Record<string, string> = {
  flight:    'border-l-wv-cyan',
  seismic:   'border-l-wv-amber',
  satellite: 'border-l-wv-green',
  system:    'border-l-wv-border',
  cctv:      'border-l-wv-red',
  ship:      'border-l-wv-teal',
};

const TYPE_TEXT: Record<string, string> = {
  flight:    'text-wv-cyan',
  seismic:   'text-wv-amber',
  satellite: 'text-wv-green',
  system:    'text-wv-muted',
  cctv:      'text-wv-red',
  ship:      'text-wv-teal',
};

/** Human-readable event type labels */
const TYPE_LABELS: Record<string, string> = {
  flight:    'Aviation',
  seismic:   'Geology',
  satellite: 'Orbit',
  system:    'System',
  cctv:      'Camera',
  ship:      'Maritime',
};

interface IntelFeedProps {
  items: IntelFeedItem[];
  isMobile?: boolean;
}

export default function IntelFeed({ items, isMobile = false }: IntelFeedProps) {
  const [visible, setVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [bootMessages] = useState<IntelFeedItem[]>([
    { id: 'boot-1', time: new Date().toISOString().slice(11, 19), type: 'system',   message: 'RASED v2.0 — platform online' },
    { id: 'boot-2', time: new Date().toISOString().slice(11, 19), type: 'system',   message: 'Cesium 3D engine initialised' },
    { id: 'boot-3', time: new Date().toISOString().slice(11, 19), type: 'system',   message: 'Google 3D photorealistic tiles connected' },
    { id: 'boot-4', time: new Date().toISOString().slice(11, 19), type: 'system',   message: 'Regional node active — Jordan' },
    { id: 'boot-5', time: new Date().toISOString().slice(11, 19), type: 'seismic',  message: 'Dead Sea Transform Fault — seismic monitoring active' },
    { id: 'boot-6', time: new Date().toISOString().slice(11, 19), type: 'ship',     message: 'Port of Aqaba — maritime data stream established' },
  ]);

  const allItems = [...bootMessages, ...items].slice(-30);
  const liveCount = items.filter((i) => i.type !== 'system').length;

  const feedList = (
    <div className={isMobile ? 'p-2 space-y-0.5' : 'max-h-[18rem] overflow-y-auto p-2 space-y-0.5'}>
      {allItems.length === 0 && (
        <div className="py-6 flex flex-col items-center gap-2 text-wv-muted/40">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          <span className="text-[9px] tracking-wide">No events yet</span>
        </div>
      )}
      {allItems.map((item) => (
        <div
          key={item.id}
          className={`flex items-start gap-2 py-1.5 px-2 rounded-md border-l-2 transition-colors
            ${TYPE_BAR[item.type] ?? 'border-l-wv-border'}
            ${isMobile ? 'py-2.5' : ''}`}
        >
          {/* Color dot */}
          <div className="flex items-center gap-1.5 shrink-0 mt-1">
            <div className={`w-1 h-1 rounded-full ${TYPE_DOT[item.type] ?? 'bg-wv-border'}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`text-[8px] font-semibold tracking-wide ${TYPE_TEXT[item.type] ?? 'text-wv-muted'}`}>
                {TYPE_LABELS[item.type] ?? item.type}
              </span>
              <span className="font-mono text-[8px] text-wv-muted/40 ml-auto tabular-nums">{item.time}</span>
            </div>
            <p className={`text-[9px] leading-snug text-wv-text/60 break-words ${isMobile ? 'text-[11px]' : ''}`}>
              {item.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  /* ── Mobile: badge button + full-screen modal ── */
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 right-3 z-40 w-11 h-11 rounded-xl panel-glass
                     flex items-center justify-center
                     text-wv-muted hover:text-wv-text hover:bg-white/5 transition-colors
                     select-none active:scale-95 border border-wv-border/50"
          aria-label="Open event feed"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5.5 19.5a8.5 8.5 0 1 1 13 0" />
            <path d="M8.5 16.5a5 5 0 1 1 7 0" />
            <circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none" />
          </svg>
          {liveCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-wv-cyan
                             text-[8px] text-wv-black font-bold font-mono flex items-center justify-center px-0.5">
              {liveCount > 99 ? '99+' : liveCount}
            </span>
          )}
        </button>
        <MobileModal
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          title="Event Feed"
          icon="◊"
          accent="bg-wv-cyan"
        >
          {feedList}
        </MobileModal>
      </>
    );
  }

  /* ── Desktop: floating card anchored bottom-right ── */
  return (
    <div
      className="fixed bottom-12 right-4 panel-glass rounded-2xl overflow-hidden z-40 select-none"
      style={{
        width: 296,
        boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(240,192,96,0.08)',
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2.5 border-b border-wv-border flex items-center justify-between cursor-pointer hover:bg-white/2 transition-colors"
        onClick={() => setVisible(!visible)}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-wv-cyan animate-pulse" />
          <span className="text-[11px] font-semibold text-wv-text font-sora">Event Feed</span>
          {liveCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-wv-cyan/12 border border-wv-cyan/20 font-mono text-[8px] text-wv-cyan font-semibold">
              {liveCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-wv-muted/40 tracking-wide">live</span>
          <span className="text-[9px] text-wv-muted/50">{visible ? '▾' : '▴'}</span>
        </div>
      </div>
      {visible && feedList}
    </div>
  );
}

