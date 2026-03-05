import { useState, useEffect, type ReactNode } from 'react';
import type { Lang, Translations } from '../../i18n/translations';

interface TopNavProps {
  /** Toggles the left drawer */
  onDrawerToggle: () => void;
  isDrawerOpen: boolean;
  /** Quick layer toggles (5 most-used layers) */
  layers: {
    flights: boolean;
    satellites: boolean;
    earthquakes: boolean;
    cctv: boolean;
    ships: boolean;
  };
  onLayerToggle: (layer: 'flights' | 'satellites' | 'earthquakes' | 'cctv' | 'ships') => void;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  t: Translations;
  muted: boolean;
  onAudioToggle: () => void;
  isMobile?: boolean;
}

function QuickLayerBtn({
  active,
  label,
  activeColor,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  activeColor: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        relative flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg
        transition-all duration-200 group
        ${active
          ? `${activeColor} bg-white/8 border border-white/12`
          : 'text-wv-muted/60 hover:text-wv-muted border border-transparent hover:bg-white/4'}
      `}
    >
      {children}
      <span className="text-[7px] font-medium tracking-wide leading-none hidden sm:block">
        {label}
      </span>
      {/* Active indicator dot */}
      {active && (
        <span
          className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
          style={{ background: activeColor.includes('cyan') ? '#f0c060' : activeColor.includes('green') ? '#a78bfa' : activeColor.includes('amber') ? '#fb923c' : activeColor.includes('red') ? '#f87171' : '#f0c060' }}
        />
      )}
    </button>
  );
}

export default function TopNav({
  onDrawerToggle,
  isDrawerOpen,
  layers,
  onLayerToggle,
  lang,
  onLangChange,
  t,
  muted,
  onAudioToggle,
  isMobile = false,
}: TopNavProps) {
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = new Date(clock.getTime() + 3 * 60 * 60 * 1000)
    .toISOString().slice(11, 19);

  /* ── Quick layer icons ── */
  const QUICK_LAYERS: Array<{
    key: 'flights' | 'satellites' | 'earthquakes' | 'cctv' | 'ships';
    label: string;
    activeColor: string;
    icon: React.ReactNode;
  }> = [
    {
      key: 'flights',
      label: t.layerFlights,
      activeColor: 'text-wv-cyan',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </svg>
      ),
    },
    {
      key: 'satellites',
      label: t.layerSatellites,
      activeColor: 'text-wv-green',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12.9 7.1 3.54-3.54a2 2 0 0 1 2.83 0l1.17 1.17a2 2 0 0 1 0 2.83L16.9 10.9" />
          <path d="M14.5 9.5 9 15" />
          <path d="m7.1 12.9-3.54 3.54a2 2 0 0 0 0 2.83l1.17 1.17a2 2 0 0 0 2.83 0L11.1 16.9" />
          <path d="m2 22 4-4M20 2l-4 4" />
        </svg>
      ),
    },
    {
      key: 'earthquakes',
      label: t.layerEarthquakes,
      activeColor: 'text-wv-amber',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2,12 5,6 8,14 11,8 14,16 17,10 20,14 22,12" />
        </svg>
      ),
    },
    {
      key: 'cctv',
      label: t.layerCctv,
      activeColor: 'text-wv-red',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 10 4.553-2.07A1 1 0 0 1 21 8.9v6.2a1 1 0 0 1-1.447.97L15 14" />
          <rect x="3" y="8" width="12" height="8" rx="2" />
        </svg>
      ),
    },
    {
      key: 'ships',
      label: t.layerShips,
      activeColor: 'text-wv-cyan',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1" />
          <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.5.7 4.9 1.98 7" />
          <path d="M12 2v7.5M9 9.5l3-2 3 2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 h-14 panel-glass z-50 select-none flex items-center px-3 gap-3">

      {/* ── Left: Hamburger + Wordmark ── */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onDrawerToggle}
          className={`
            w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
            ${isDrawerOpen
              ? 'bg-wv-cyan/15 text-wv-cyan border border-wv-cyan/25'
              : 'text-wv-muted hover:text-wv-text hover:bg-white/5 border border-transparent'}
          `}
          aria-label="Toggle control panel"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            {isDrawerOpen ? (
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            ) : (
              <>
                <line x1="2" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <line x1="2" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>

        {/* Wordmark */}
        {!isMobile && (
          <div className="flex items-baseline gap-2">
            <span
              className="font-sora font-semibold text-wv-text tracking-widest"
              style={{ fontSize: '1.05rem', letterSpacing: '0.18em' }}
            >
              RASED
            </span>
            <span className="text-wv-muted/40 text-[9px] font-medium tracking-widest hidden md:block">
              Jordan Situational Awareness
            </span>
          </div>
        )}
      </div>

      {/* ── Centre separator ── */}
      <div className="hidden sm:block w-px h-6 bg-wv-border mx-1 shrink-0" />

      {/* ── Centre: Quick layer toggles ── */}
      <div className="flex items-center gap-1 flex-1 justify-center sm:justify-start">
        {QUICK_LAYERS.map(({ key, label, activeColor, icon }) => (
          <QuickLayerBtn
            key={key}
            active={layers[key]}
            label={label}
            activeColor={activeColor}
            onClick={() => onLayerToggle(key)}
          >
            {icon}
          </QuickLayerBtn>
        ))}
      </div>

      {/* ── Right: Clock + Lang + Audio ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* UTC Clock */}
        {!isMobile && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/4 border border-white/6">
            <span className="text-[8px] font-medium text-wv-muted tracking-widest uppercase">AST</span>
            <span className="font-mono text-[11px] font-medium text-wv-text tracking-wide tabular-nums">
              {timeStr}
            </span>
          </div>
        )}

        {/* Language toggle */}
        <div className="flex rounded-lg overflow-hidden border border-wv-border">
          {(['en', 'ar'] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLangChange(l)}
              className={`
                px-2.5 py-1 text-[9px] font-semibold tracking-widest transition-all duration-150
                ${lang === l
                  ? 'bg-wv-cyan/20 text-wv-cyan'
                  : 'text-wv-muted hover:text-wv-text hover:bg-white/4'}
              `}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Audio toggle */}
        <button
          onClick={onAudioToggle}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 border
            ${muted
              ? 'text-wv-muted/50 border-transparent hover:bg-white/4 hover:text-wv-muted'
              : 'text-wv-green border-transparent hover:bg-wv-green/10'}
          `}
          aria-label={muted ? 'Unmute audio' : 'Mute audio'}
        >
          <span className="text-[12px]">{muted ? '🔇' : '🔊'}</span>
        </button>
      </div>
    </div>
  );
}
