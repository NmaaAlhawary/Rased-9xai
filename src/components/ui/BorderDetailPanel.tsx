/**
 * BorderDetailPanel — Overlay panel shown when a Jordan border crossing is clicked.
 */

import type { BorderCrossing } from '../../hooks/useBorderCrossings';
import type { Lang, Translations } from '../../i18n/translations';

interface Props {
  crossing: BorderCrossing | null;
  onClose: () => void;
  lang: Lang;
  t: Translations;
}

const STATUS_COLOR: Record<BorderCrossing['status'], string> = {
  open:    '#00FF88',
  limited: '#F59E0B',
  closed:  '#EF4444',
};

const THROUGHPUT_COLOR: Record<BorderCrossing['throughput'], string> = {
  high:   '#00FF88',
  medium: '#F59E0B',
  low:    '#EF4444',
};

export default function BorderDetailPanel({ crossing, onClose, lang, t }: Props) {
  if (!crossing) return null;

  const color = STATUS_COLOR[crossing.status];
  const statusLabel = t[`border${crossing.status.charAt(0).toUpperCase() + crossing.status.slice(1)}` as keyof typeof t] as string;
  const throughputLabel = t[`border${crossing.throughput.charAt(0).toUpperCase() + crossing.throughput.slice(1)}` as keyof typeof t] as string;
  const displayName = lang === 'ar' ? crossing.nameAr : crossing.nameEn;
  const partnerDisplay = lang === 'ar' ? crossing.partnerAr : crossing.partner;

  return (
    <div
      className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
      style={{ minWidth: 320, maxWidth: 480 }}
    >
      <div
        className="rounded-sm border text-xs font-mono backdrop-blur-md"
        style={{
          background: 'rgba(0,0,0,0.85)',
          borderColor: color,
          boxShadow: `0 0 18px ${color}55, 0 0 4px ${color}33`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{ borderColor: `${color}55` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🛃</span>
            <div>
              <div className="text-white font-bold tracking-wide" style={{ fontSize: 13 }}>
                {displayName}
              </div>
              <div className="uppercase tracking-widest" style={{ color, fontSize: 9 }}>
                {t.layerBorders} — {crossing.shortName}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors ml-4 text-base leading-none"
            style={{ fontFamily: 'monospace' }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-3">
          {/* Status grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded px-2 py-1.5">
              <div className="text-gray-500 text-[8px] uppercase tracking-widest mb-1">{t.borderStatus}</div>
              <div className="font-bold text-[11px]" style={{ color }}>{statusLabel}</div>
            </div>
            <div className="bg-white/5 rounded px-2 py-1.5">
              <div className="text-gray-500 text-[8px] uppercase tracking-widest mb-1">{t.borderWait}</div>
              <div className="font-bold text-[11px] text-white">
                {crossing.waitMinutes > 0 ? `~${crossing.waitMinutes} min` : '—'}
              </div>
            </div>
            <div className="bg-white/5 rounded px-2 py-1.5">
              <div className="text-gray-500 text-[8px] uppercase tracking-widest mb-1">{t.borderThroughput}</div>
              <div className="font-bold text-[11px]" style={{ color: THROUGHPUT_COLOR[crossing.throughput] }}>
                {throughputLabel}
              </div>
            </div>
            <div className="bg-white/5 rounded px-2 py-1.5">
              <div className="text-gray-500 text-[8px] uppercase tracking-widest mb-1">{t.borderPartner}</div>
              <div className="font-bold text-[11px] text-white">{partnerDisplay}</div>
            </div>
          </div>

          {/* Hours */}
          <div className="text-[10px] text-gray-400">
            <span className="text-gray-600 uppercase tracking-wider text-[8px]">Hours: </span>
            {crossing.hours}
          </div>

          {/* Notes */}
          <p className="text-gray-400 leading-relaxed text-[10px] border-t border-white/10 pt-2">
            {crossing.notes}
          </p>

          {/* Coordinates */}
          <div className="flex gap-4 pt-1 border-t" style={{ borderColor: `${color}33`, fontSize: 10 }}>
            <span className="text-gray-500">
              {t.sbLat} <span style={{ color }} className="ml-1">{crossing.lat.toFixed(4)}°</span>
            </span>
            <span className="text-gray-500">
              {t.sbLon} <span style={{ color }} className="ml-1">{crossing.lon.toFixed(4)}°</span>
            </span>
          </div>
        </div>

        <div
          className="px-4 py-1 text-center border-t"
          style={{ borderColor: `${color}22`, color: '#444', fontSize: 9 }}
        >
          {t.ldpDismiss}
        </div>
      </div>
    </div>
  );
}
