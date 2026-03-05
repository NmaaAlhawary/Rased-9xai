import { useState } from 'react';
import type { ShaderMode } from '../../shaders/postprocess';
import type { AltitudeBand } from '../layers/FlightLayer';
import type { SatelliteCategory } from '../layers/SatelliteLayer';
import type { GeoStatus } from '../../hooks/useGeolocation';
import type { Lang, Translations } from '../../i18n/translations';
import MobileModal from './MobileModal';

interface OperationsPanelProps {
  /** Drawer open state (desktop) */
  isOpen?: boolean;
  onClose?: () => void;
  shaderMode: ShaderMode;
  onShaderChange: (mode: ShaderMode) => void;
  layers: {
    flights: boolean;
    satellites: boolean;
    earthquakes: boolean;
    traffic: boolean;
    cctv: boolean;
    ships: boolean;
    landmarks: boolean;
    borderCrossings: boolean;
    airQuality: boolean;
    weather: boolean;
  };
  onLayerToggle: (layer: 'flights' | 'satellites' | 'earthquakes' | 'traffic' | 'cctv' | 'ships' | 'landmarks' | 'borderCrossings' | 'airQuality' | 'weather') => void;
  /** Optional per-layer loading state (e.g. ships takes ~20s on first fetch) */
  layerLoading?: Partial<Record<'flights' | 'satellites' | 'earthquakes' | 'traffic' | 'cctv' | 'ships' | 'landmarks' | 'borderCrossings' | 'airQuality' | 'weather', boolean>>;
  mapTiles: 'google' | 'osm';
  onMapTilesChange: (tile: 'google' | 'osm') => void;
  showPaths: boolean;
  onShowPathsToggle: () => void;
  altitudeFilter: Record<AltitudeBand, boolean>;
  onAltitudeToggle: (band: AltitudeBand) => void;
  showSatPaths: boolean;
  onShowSatPathsToggle: () => void;
  satCategoryFilter: Record<SatelliteCategory, boolean>;
  onSatCategoryToggle: (category: SatelliteCategory) => void;
  onResetView: () => void;
  onLocateMe: () => void;
  geoStatus: GeoStatus;
  isMobile: boolean;
  lang: Lang;
  t: Translations;
  onLangChange: (lang: Lang) => void;
}

const SHADER_OPTIONS: { value: ShaderMode; colour: string }[] = [
  { value: 'none', colour: 'text-wv-text' },
  { value: 'crt',  colour: 'text-wv-cyan' },
  { value: 'flir', colour: 'text-wv-amber' },
];

function LayerIcon({ layerKey, className }: { layerKey: string; className?: string }) {
  const cls = `${className ?? ''}`;
  switch (layerKey) {
    case 'flights':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </svg>
      );
    case 'satellites':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="m12.9 7.1 3.54-3.54a2 2 0 0 1 2.83 0l1.17 1.17a2 2 0 0 1 0 2.83L16.9 10.9" />
          <path d="M14.5 9.5 9 15" />
          <path d="m7.1 12.9-3.54 3.54a2 2 0 0 0 0 2.83l1.17 1.17a2 2 0 0 0 2.83 0L11.1 16.9" />
          <path d="m2 22 4-4" />
          <path d="m20 2-4 4" />
        </svg>
      );
    case 'earthquakes':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <polyline points="2,12 5,6 8,14 11,8 14,16 17,10 20,14 22,12" />
        </svg>
      );
    case 'traffic':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
          <rect x="9" y="11" width="14" height="10" rx="2" />
          <circle cx="12" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
        </svg>
      );
    case 'cctv':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="m15 10 4.553-2.07A1 1 0 0 1 21 8.9v6.2a1 1 0 0 1-1.447.97L15 14" />
          <rect x="3" y="8" width="12" height="8" rx="2" />
          <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'ships':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1" />
          <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.5.7 4.9 1.98 7" />
          <path d="M12 2v7.5" />
          <path d="m9 9.5 3-2 3 2" />
        </svg>
      );
    case 'landmarks':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'borderCrossings':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="M3 3h18v4H3z" />
          <path d="M7 7v13M17 7v13M10 7v9h4V7" />
          <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'airQuality':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="M9 7c0-2 1.5-2 2-2s2 0 2 2v1" />
          <path d="M11 8c1 0 5 .4 5 5s-4 5-5 5-5-.4-5-5" />
          <path d="M7 17c-1 0-4-.4-4-4s3-4 4-4" />
          <path d="M13 17c1 0 4-.4 4-4" />
        </svg>
      );
    case 'weather':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      );
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={cls}>
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
  }
}

export default function OperationsPanel({
  isOpen = false,
  onClose,
  shaderMode,
  onShaderChange,
  layers,
  layerLoading = {},
  onLayerToggle,
  mapTiles,
  onMapTilesChange,
  showPaths,
  onShowPathsToggle,
  altitudeFilter,
  onAltitudeToggle,
  showSatPaths,
  onShowSatPathsToggle,
  satCategoryFilter,
  onSatCategoryToggle,
  onResetView,
  onLocateMe,
  geoStatus,
  isMobile,
  lang,
  t,
  onLangChange,
}: OperationsPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Count active layers for the FAB badge
  const activeLayerCount = Object.values(layers).filter(Boolean).length;

  /* ── Shared panel inner content (used by both desktop & mobile) ── */
  const panelContent = (
    <>
      {/* Language Toggle */}
      <div className="p-3 border-b border-wv-border">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-medium text-wv-muted tracking-widest uppercase">Language / اللغة</span>
          <div className="flex gap-1">
            <button
              onClick={() => onLangChange('en')}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold tracking-widest transition-all duration-150
                ${lang === 'en' ? 'text-wv-cyan bg-white/8 border border-wv-cyan/30' : 'text-wv-muted hover:text-wv-text border border-transparent'}`}
            >
              EN
            </button>
            <button
              onClick={() => onLangChange('ar')}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold tracking-widest transition-all duration-150
                ${lang === 'ar' ? 'text-wv-cyan bg-white/8 border border-wv-cyan/30' : 'text-wv-muted hover:text-wv-text border border-transparent'}`}
            >
              AR
            </button>
          </div>
        </div>
      </div>

      {/* Optics Section */}
      <div className="p-3 border-b border-wv-border">
        <div className="text-[9px] font-medium text-wv-muted tracking-widest uppercase mb-2">{t.opOptics}</div>
        <div className="grid grid-cols-2 gap-1">
          {SHADER_OPTIONS.map(({ value, colour }) => {
            const shaderLabel = {
              none: t.shaderStandard,
              crt: t.shaderCrt,
              flir: t.shaderFlir,
            }[value];
            return (
            <button
              key={value}
              onClick={() => onShaderChange(value)}
              className={`
                px-2 py-1.5 rounded text-[10px] font-mono font-semibold tracking-widest
                transition-all duration-150
                ${isMobile ? 'min-h-[44px]' : ''}
                ${shaderMode === value
                  ? `${colour} bg-white/8 border border-white/12`
                  : 'text-wv-muted hover:text-wv-text hover:bg-white/4 border border-transparent'
                }
              `}
            >
              {shaderLabel}
            </button>
            );
          })}
        </div>
      </div>

      {/* Map Tiles Section */}
      <div className="p-3 border-b border-wv-border">
        <div className="text-[9px] font-medium text-wv-muted tracking-widest uppercase mb-2">{t.opMapTiles}</div>
        <div className="grid grid-cols-2 gap-1">
          {([  
            { value: 'google' as const, label: t.tilesGoogle, colour: 'text-wv-cyan' },
            { value: 'osm' as const, label: t.tilesOsm, colour: 'text-wv-green' },
          ]).map(({ value, label, colour }) => (
            <button
              key={value}
              onClick={() => onMapTilesChange(value)}
              className={`
                px-2 py-1.5 rounded text-[10px] font-semibold tracking-wide
                transition-all duration-150
                ${isMobile ? 'min-h-[44px]' : ''}
                ${mapTiles === value
                  ? `${colour} bg-white/8 border border-white/12`
                  : 'text-wv-muted hover:text-wv-text hover:bg-white/4 border border-transparent'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Layers Section */}
      <div className="p-3 border-b border-wv-border">
        <div className="text-[9px] font-medium text-wv-muted tracking-widest uppercase mb-2">{t.opDataLayers}</div>
        <div className="flex flex-col gap-0.5">
          {([
            { key: 'flights',        label: t.layerFlights },
            { key: 'satellites',     label: t.layerSatellites },
            { key: 'earthquakes',    label: t.layerEarthquakes },
            { key: 'traffic',        label: t.layerTraffic },
            { key: 'cctv',           label: t.layerCctv },
            { key: 'ships',          label: t.layerShips },
            { key: 'landmarks',      label: t.layerLandmarks },
            { key: 'borderCrossings',label: t.layerBorders },
            { key: 'airQuality',     label: t.layerAirQuality },
            { key: 'weather',        label: t.layerWeather },
          ] as { key: 'flights' | 'satellites' | 'earthquakes' | 'traffic' | 'cctv' | 'ships' | 'landmarks' | 'borderCrossings' | 'airQuality' | 'weather'; label: string }[]).map(({ key, label }) => {
            const isOn = layers[key];
            const isLoading = !!layerLoading[key];
            const iconColour = isOn
              ? isLoading ? 'text-wv-amber' : 'text-wv-cyan'
              : 'text-wv-muted/40';
            return (
              <button
                key={key}
                onClick={() => onLayerToggle(key)}
                className={`
                  flex items-center gap-2.5 px-2 py-1.5 rounded text-[10px]
                  transition-all duration-150 text-left group
                  ${isMobile ? 'min-h-[44px] text-[12px]' : ''}
                  ${isOn
                    ? isLoading
                      ? 'bg-wv-amber/8 border-l-2 border-wv-amber'
                      : 'bg-white/4 border-l-2 border-wv-cyan'
                    : 'border-l-2 border-transparent hover:bg-white/3 hover:border-wv-border'
                  }
                `}
              >
                {/* Layer icon */}
                <span className={`shrink-0 transition-colors duration-150 ${iconColour}`}>
                  <LayerIcon layerKey={key} />
                </span>
                <span className={`tracking-wide font-medium ${
                  isOn ? (isLoading ? 'text-wv-amber' : 'text-wv-text') : 'text-wv-muted group-hover:text-wv-text'
                }`}>{label}</span>
                {isOn && isLoading ? (
                  <span className="ml-auto flex items-center gap-1.5">
                    <span className="text-[8px] text-wv-amber tracking-widest font-mono animate-pulse">…</span>
                  </span>
                ) : (
                  <span className={`ml-auto w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    isOn ? 'bg-wv-cyan' : 'bg-wv-border'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Flight Filters Section */}
      {layers.flights && (
        <div className="p-3">
          <div className="text-[9px] font-medium text-wv-muted tracking-widest uppercase mb-2">{t.opFlightFilters}</div>
          <button
            onClick={onShowPathsToggle}
            className={`
              flex items-center gap-2 px-2 py-1.5 rounded text-[10px] w-full
              transition-all duration-150 text-left mb-2
              ${isMobile ? 'min-h-[44px]' : ''}
              ${showPaths
                ? 'text-wv-cyan bg-white/4 border-l-2 border-wv-cyan'
                : 'text-wv-muted hover:text-wv-text hover:bg-white/3 border-l-2 border-transparent'
              }
            `}
          >
            <span className="font-mono text-[9px] tracking-widest">PATH</span>
            <span className="tracking-wide font-medium">{t.flightRoutePaths}</span>
            <span className={`ml-auto w-1.5 h-1.5 rounded-full ${showPaths ? 'bg-wv-cyan' : 'bg-wv-border'}`} />
          </button>
          <div className="text-[8px] font-medium text-wv-muted/70 tracking-widest uppercase mb-1 px-1">{t.opAltBands}</div>
          <div className="flex flex-col gap-0.5">
            {([
              { band: 'cruise' as const, label: t.flightCruise, colour: 'text-[#38BDF8]', dotColour: 'bg-[#38BDF8]' },
              { band: 'high'   as const, label: t.flightHigh,   colour: 'text-[#60A5FA]', dotColour: 'bg-[#60A5FA]' },
              { band: 'mid'    as const, label: t.flightMid,    colour: 'text-[#F59E0B]', dotColour: 'bg-[#F59E0B]' },
              { band: 'low'    as const, label: t.flightLow,    colour: 'text-[#F97316]', dotColour: 'bg-[#F97316]' },
              { band: 'ground' as const, label: t.flightGround, colour: 'text-[#EF4444]', dotColour: 'bg-[#EF4444]' },
            ]).map(({ band, label, colour, dotColour }) => (
              <button
                key={band}
                onClick={() => onAltitudeToggle(band)}
                className={`
                  flex items-center gap-2 px-2 py-1 rounded text-[9px]
                  transition-all duration-150 text-left
                  ${isMobile ? 'min-h-[40px]' : ''}
                  ${altitudeFilter[band]
                    ? `${colour} bg-white/3`
                    : 'text-wv-muted/40 hover:text-wv-muted hover:bg-white/3'
                  }
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${altitudeFilter[band] ? dotColour : 'bg-wv-border'}`} />
                <span className={`tracking-wide font-mono text-[8px] ${!altitudeFilter[band] ? 'line-through' : ''}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Satellite Filters Section */}
      {layers.satellites && (
        <div className="p-3 border-t border-wv-border">
          <div className="text-[9px] font-medium text-wv-muted tracking-widest uppercase mb-2">{t.opSatFilters}</div>
          <button
            onClick={onShowSatPathsToggle}
            className={`
              flex items-center gap-2 px-2 py-1.5 rounded text-[10px] w-full
              transition-all duration-150 text-left mb-2
              ${isMobile ? 'min-h-[44px]' : ''}
              ${showSatPaths
                ? 'text-wv-green bg-white/4 border-l-2 border-wv-green'
                : 'text-wv-muted hover:text-wv-text hover:bg-white/3 border-l-2 border-transparent'
              }
            `}
          >
            <span className="font-mono text-[9px] tracking-widest">PATH</span>
            <span className="tracking-wide font-medium">{t.satOrbitPaths}</span>
            <span className={`ml-auto w-1.5 h-1.5 rounded-full ${showSatPaths ? 'bg-wv-green' : 'bg-wv-border'}`} />
          </button>
          <div className="text-[8px] font-medium text-wv-muted/70 tracking-widest uppercase mb-1 px-1">{t.opSatCategories}</div>
          <div className="flex flex-col gap-0.5">
            {([
              { category: 'iss'   as const, label: t.satIss,   colour: 'text-[#38BDF8]', dotColour: 'bg-[#38BDF8]' },
              { category: 'other' as const, label: t.satOther, colour: 'text-[#10B981]', dotColour: 'bg-[#10B981]' },
            ]).map(({ category, label, colour, dotColour }) => (
              <button
                key={category}
                onClick={() => onSatCategoryToggle(category)}
                className={`
                  flex items-center gap-2 px-2 py-1 rounded text-[9px]
                  transition-all duration-150 text-left
                  ${isMobile ? 'min-h-[40px]' : ''}
                  ${satCategoryFilter[category]
                    ? `${colour} bg-white/3`
                    : 'text-wv-muted/40 hover:text-wv-muted hover:bg-white/3'
                  }
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${satCategoryFilter[category] ? dotColour : 'bg-wv-border'}`} />
                <span className={`tracking-wide font-mono text-[8px] ${!satCategoryFilter[category] ? 'line-through' : ''}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Locate Me + Reset View */}
      <div className="p-3 border-t border-wv-border flex flex-col gap-1.5">
        <button
          onClick={onLocateMe}
          disabled={geoStatus === 'requesting'}
          className={`
            w-full px-3 py-2 rounded text-[10px] font-semibold tracking-wide
            transition-all duration-150 flex items-center justify-center gap-2
            ${isMobile ? 'min-h-[48px] text-[12px]' : ''}
            ${geoStatus === 'requesting'
              ? 'text-wv-cyan/40 bg-white/3 cursor-wait border border-white/6'
              : geoStatus === 'success'
                ? 'text-wv-green bg-wv-green/10 hover:bg-wv-green/15 border border-wv-green/20'
                : 'text-wv-cyan bg-wv-cyan/8 hover:bg-wv-cyan/12 border border-wv-cyan/20'
            }
          `}
        >
          <span className="font-mono">{geoStatus === 'requesting' ? '○' : '◎'}</span>
          <span>
            {geoStatus === 'requesting'
              ? t.btnLocating
              : geoStatus === 'success'
                ? t.btnReRelocate
                : t.btnLocateMe
            }
          </span>
        </button>
        <button
          onClick={onResetView}
          className={`w-full px-3 py-2 rounded text-[10px] font-semibold tracking-wide
            text-wv-muted hover:text-wv-text bg-white/3 hover:bg-white/6
            border border-white/6 hover:border-white/12
            transition-all duration-150 flex items-center justify-center gap-2
            ${isMobile ? 'min-h-[48px] text-[12px]' : ''}`}
        >
          <span className="font-mono">↺</span>
          <span>{t.btnResetView}</span>
        </button>
      </div>
    </>
  );

  /* ── Mobile: FAB + full-screen modal ── */
  if (isMobile) {
    return (
      <>
        {/* Floating Action Button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-40 w-11 h-11 rounded-lg panel-glass
                     flex items-center justify-center
                     text-wv-muted hover:text-wv-text hover:bg-white/6 transition-colors
                     select-none active:scale-95"
          aria-label="Open operations panel"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M11.5 3.1l-1.4 1.4M4.5 11.5l-1.4 1.4"
              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {activeLayerCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-wv-cyan
                             text-[8px] text-wv-black font-bold flex items-center justify-center font-mono">
              {activeLayerCount}
            </span>
          )}
        </button>

        <MobileModal
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          title="Operations"
          icon="◈"
          accent="bg-wv-cyan"
        >
          {panelContent}
        </MobileModal>
      </>
    );
  }

  /* ── Desktop: slide-in drawer from left ── */
  return (
    <>
      {/* Scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[39] bg-wv-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 left-0 h-full panel-glass z-40 select-none overflow-y-auto flex flex-col"
        style={{
          width: 288,
          paddingTop: 56, /* clear the TopNav */
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Drawer header */}
        <div className="px-4 py-3 border-b border-wv-border flex items-center gap-2.5 shrink-0">
          <span className="font-sora font-semibold text-wv-text" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
            {t.opSystems}
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-wv-green animate-pulse ml-1" />
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-wv-muted hover:text-wv-text hover:bg-white/5 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {panelContent}
      </div>
    </>
  );
}
