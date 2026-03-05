/**
 * LandmarkDetailPanel — Overlay panel shown when a Jordan landmark is clicked.
 * Displays name, category, description, coordinates, and enriched stats.
 */

import type { LandmarkData } from '../layers/JordanLandmarksLayer';
import type { Lang, Translations } from '../../i18n/translations';

interface Props {
  landmark: LandmarkData | null;
  onClose: () => void;
  lang?: Lang;
  t?: Translations;
}

const CATEGORY_LABELS: Record<LandmarkData['category'], string> = {
  capital:  'CAPITAL CITY',
  airport:  'AIRPORT',
  heritage: 'UNESCO HERITAGE',
  port:     'SEAPORT',
  nature:   'NATURAL SITE',
  historic: 'HISTORIC SITE',
};

const CATEGORY_LABELS_AR: Record<LandmarkData['category'], string> = {
  capital:  'عاصمة',
  airport:  'مطار',
  heritage: 'تراث يونسكو',
  port:     'ميناء بحري',
  nature:   'موقع طبيعي',
  historic: 'موقع تاريخي',
};

const CATEGORY_COLOR: Record<LandmarkData['category'], string> = {
  capital:  '#00D4FF',
  airport:  '#FFD700',
  heritage: '#FF8C00',
  port:     '#00E5FF',
  nature:   '#00FF88',
  historic: '#FF6B6B',
};

/** Enriched stats for select key landmarks */
const LANDMARK_STATS: Partial<Record<string, Array<{ label: string; labelAr: string; value: string }>>> = {
  'dead-sea': [
    { label: 'Elevation', labelAr: 'الارتفاع', value: '−430 m (lowest on Earth)' },
    { label: 'Salinity', labelAr: 'الملوحة', value: '~33.7%' },
    { label: 'Length', labelAr: 'الطول', value: '50 km' },
    { label: 'Width', labelAr: 'العرض', value: '15 km' },
  ],
  'petra': [
    { label: 'UNESCO Since', labelAr: 'يونسكو منذ', value: '1985' },
    { label: 'Est. Founded', labelAr: 'التأسيس', value: '4th c. BC' },
    { label: 'Area', labelAr: 'المساحة', value: '264 km²' },
    { label: 'Annual Visitors', labelAr: 'الزوار', value: '~1 million' },
  ],
  'aqaba-port': [
    { label: 'Annual Capacity', labelAr: 'الطاقة السنوية', value: '~25 M tonnes' },
    { label: 'Container TEU', labelAr: 'حاويات TEU', value: '~1 M/year' },
    { label: 'Berths', labelAr: 'مراسي', value: '27' },
    { label: 'Depth', labelAr: 'العمق', value: '16 m' },
  ],
};

export default function LandmarkDetailPanel({ landmark, onClose, lang = 'en', t }: Props) {
  if (!landmark) return null;

  const color = CATEGORY_COLOR[landmark.category];
  const catLabel = lang === 'ar' ? CATEGORY_LABELS_AR[landmark.category] : CATEGORY_LABELS[landmark.category];
  const stats = LANDMARK_STATS[landmark.id];

  const latLabel = t?.sbLat ?? 'LAT';
  const lonLabel = t?.sbLon ?? 'LON';
  const altLabel = t?.sbAlt ?? 'ALT';

  return (
    <div
      className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
      style={{ minWidth: 320, maxWidth: 500 }}
    >
      <div
        className="rounded-2xl border text-xs backdrop-blur-xl"
        style={{
          background: 'rgba(10, 8, 32, 0.88)',
          borderColor: color,
          boxShadow: `0 0 24px ${color}40, 0 4px 16px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{ borderColor: `${color}55` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{landmark.emoji}</span>
            <div>
              <div className="font-semibold text-wv-text" style={{ fontSize: 13 }}>
                {landmark.name}
              </div>
              <div
                className="uppercase tracking-widest"
                style={{ color, fontSize: 9 }}
              >
                {catLabel}
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
        <div className="px-4 py-3 space-y-2">
          <p className="text-gray-300 leading-relaxed" style={{ fontSize: 11 }}>
            {landmark.description}
          </p>

          {/* Enriched stats for select landmarks */}
          {stats && (
            <div
              className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 border-t"
              style={{ borderColor: `${color}22`, fontSize: 10 }}
            >
              {stats.map((s) => (
                <div key={s.label} className="flex justify-between">
                  <span className="text-gray-500">{lang === 'ar' ? s.labelAr : s.label}</span>
                  <span style={{ color }} className="ml-2 font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Coordinates */}
          <div
            className="flex gap-4 pt-1 border-t"
            style={{ borderColor: `${color}33`, fontSize: 10 }}
          >
            <span className="text-gray-500">
              {latLabel} <span style={{ color }} className="ml-1">{landmark.lat.toFixed(4)}°N</span>
            </span>
            <span className="text-gray-500">
              {lonLabel} <span style={{ color }} className="ml-1">{landmark.lon.toFixed(4)}°E</span>
            </span>
            <span className="text-gray-500">
              {altLabel} <span style={{ color }} className="ml-1">{landmark.alt > 0 ? `+${landmark.alt}` : landmark.alt} m</span>
            </span>
          </div>
        </div>

        {/* Footer hint */}
        <div
          className="px-4 py-1 text-center border-t"
          style={{ borderColor: `${color}22`, color: '#444', fontSize: 9 }}
        >
          {lang === 'ar' ? 'اضغط ESC أو انقر على الكرة لإغلاق' : 'Click map or press ESC to close'}
        </div>
      </div>
    </div>
  );
}
