import type { Lang, Translations } from '../../i18n/translations';

interface CameraState {
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  pitch: number;
}

interface StatusBarProps {
  camera: CameraState;
  shaderMode: string;
  dataStatus: {
    flights: number;
    satellites: number;
    earthquakes: number;
    cctv: number;
    ships: number;
    borderCrossings: number;
    airQuality: number;
    weather: number;
  };
  isMobile?: boolean;
  lang?: Lang;
  t?: Translations;
}

function formatCoordShort(value: number, posLabel: string, negLabel: string): string {
  return `${Math.abs(value).toFixed(3)}° ${value >= 0 ? posLabel : negLabel}`;
}

function formatAltitude(metres: number): string {
  if (metres > 100000) return `${(metres / 1000).toFixed(0)} km`;
  if (metres > 1000) return `${(metres / 1000).toFixed(1)} km`;
  return `${metres.toFixed(0)} m`;
}

interface CountPillProps {
  label: string;
  value: number;
  activeColor: string;
}

function CountPill({ label, value, activeColor }: CountPillProps) {
  const isActive = value > 0;
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${isActive ? 'bg-white/5' : ''}`}>
      <span className="text-[8px] text-wv-muted/60 font-medium">{label}</span>
      <span className={`font-mono text-[9px] font-medium tabular-nums ${isActive ? activeColor : 'text-wv-muted/30'}`}>
        {value}
      </span>
    </div>
  );
}

export default function StatusBar({ camera, shaderMode, dataStatus, isMobile = false }: StatusBarProps) {
  const alt = formatAltitude(camera.altitude);
  const hdg = `${camera.heading.toFixed(0)}°`;

  const lat = formatCoordShort(camera.latitude, 'N', 'S');
  const lon = formatCoordShort(camera.longitude, 'E', 'W');
  const shaderLabel: Record<string, string> = {
    none: 'Standard',
    crt: 'Legacy',
    nvg: 'Night',
    flir: 'Infrared',
  };

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-7 panel-glass flex items-center justify-between px-3 z-50 select-none mobile-safe-bottom">
        <span className="font-mono text-[8px] text-wv-cyan tabular-nums">{lat} · {lon}</span>
        <span className="font-mono text-[8px] text-wv-muted tabular-nums">{alt}</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 panel-glass flex items-center justify-between px-4 z-50 select-none">

      {/* Left: coordinates */}
      <div className="flex items-center gap-1 text-[8px]">
        <span className="text-wv-muted/50 font-medium mr-1">↔</span>
        <span className="font-mono text-wv-cyan tabular-nums">{lat}</span>
        <span className="text-wv-muted/30 mx-1">·</span>
        <span className="font-mono text-wv-cyan tabular-nums">{lon}</span>
        <span className="text-wv-muted/30 mx-2">|</span>
        <span className="text-wv-muted/50 text-[7px]">alt</span>
        <span className="font-mono text-wv-text tabular-nums ml-1">{alt}</span>
        <span className="text-wv-muted/30 mx-2">|</span>
        <span className="text-wv-muted/50 text-[7px]">hdg</span>
        <span className="font-mono text-wv-text tabular-nums ml-1">{hdg}</span>
      </div>

      {/* Right: entity counts */}
      <div className="flex items-center gap-0.5">
        <CountPill label="Flights"      value={dataStatus.flights}        activeColor="text-wv-cyan" />
        <CountPill label="Satellites"   value={dataStatus.satellites}     activeColor="text-wv-green" />
        <CountPill label="Seismic"      value={dataStatus.earthquakes}    activeColor="text-wv-amber" />
        <CountPill label="Cameras"      value={dataStatus.cctv}           activeColor="text-wv-red" />
        <CountPill label="Vessels"      value={dataStatus.ships}          activeColor="text-wv-cyan" />
        <CountPill label="Crossings"    value={dataStatus.borderCrossings} activeColor="text-wv-teal" />
        <CountPill label="AQ"           value={dataStatus.airQuality}     activeColor="text-yellow-400" />
        <CountPill label="Weather"       value={dataStatus.weather}        activeColor="text-wv-cyan" />
        <div className="w-px h-4 bg-wv-border/50 mx-1.5" />
        <span className="text-[8px] text-wv-muted/50">
          View: <span className="text-wv-muted">{shaderLabel[shaderMode] ?? shaderMode}</span>
        </span>
      </div>
    </div>
  );
}

