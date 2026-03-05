/**
 * WeatherDetailPanel — Overlay shown when a Jordan weather city marker is clicked.
 * Displays temperature, condition, wind, humidity, and coordinates.
 */

import type { WeatherStation } from '../../hooks/useWeather';
import type { Lang } from '../../i18n/translations';

interface Props {
  station: WeatherStation | null;
  onClose: () => void;
  lang?: Lang;
}

/** WMO weather code → human readable description */
function wmoDescription(code: number, lang: Lang): string {
  const map: Array<[number[], string, string]> = [
    [[0],           'Clear Sky',          'سماء صافية'],
    [[1],           'Mainly Clear',       'صافٍ في معظمه'],
    [[2],           'Partly Cloudy',      'غائم جزئياً'],
    [[3],           'Overcast',           'غائم'],
    [[45, 48],      'Foggy',              'ضبابي'],
    [[51, 53, 55],  'Drizzle',            'رذاذ خفيف'],
    [[56, 57],      'Freezing Drizzle',   'رذاذ متجمد'],
    [[61, 63, 65],  'Rain',               'أمطار'],
    [[66, 67],      'Freezing Rain',      'أمطار متجمدة'],
    [[71, 73, 75],  'Snow',               'ثلوج'],
    [[77],          'Snow Grains',        'حبيبات ثلجية'],
    [[80, 81, 82],  'Rain Showers',       'زخات مطرية'],
    [[85, 86],      'Snow Showers',       'زخات ثلجية'],
    [[95],          'Thunderstorm',       'عاصفة رعدية'],
    [[96, 99],      'Thunderstorm + Hail','عاصفة رعدية مع برد'],
  ];
  for (const [codes, en, ar] of map) {
    if (codes.includes(code)) return lang === 'ar' ? ar : en;
  }
  return lang === 'ar' ? 'غير معروف' : 'Unknown';
}

/** WMO code → emoji */
function wmoEmoji(code: number): string {
  if (code === 0)                      return '☀️';
  if (code <= 3)                       return '⛅';
  if (code === 45 || code === 48)      return '🌫️';
  if (code >= 51 && code <= 67)        return '🌧️';
  if (code >= 71 && code <= 77)        return '🌨️';
  if (code >= 80 && code <= 82)        return '🌦️';
  if (code >= 95)                      return '⛈️';
  return '🌡️';
}

/** Temperature → accent colour hex */
function tempColor(temp: number | null): string {
  if (temp === null) return '#7c75b8';
  if (temp < 5)      return '#60A5FA'; // cold blue
  if (temp < 15)     return '#22D3EE'; // cool cyan
  if (temp < 25)     return '#34D399'; // comfortable green
  if (temp < 35)     return '#F59E0B'; // warm amber
  return '#EF4444';                    // hot red
}

export default function WeatherDetailPanel({ station, onClose, lang = 'en' }: Props) {
  if (!station) return null;

  const color    = tempColor(station.temperature);
  const emoji    = wmoEmoji(station.weatherCode);
  const desc     = wmoDescription(station.weatherCode, lang);
  const tempText = station.temperature !== null ? `${Math.round(station.temperature)}°C` : '--°C';
  const windText = station.windSpeed   !== null ? `${Math.round(station.windSpeed)} km/h` : '--';
  const humText  = station.humidity    !== null ? `${Math.round(station.humidity)}%` : '--';

  const updatedDate = new Date(station.updatedAt);
  const updatedStr  = updatedDate.toLocaleTimeString(lang === 'ar' ? 'ar-JO' : 'en-GB', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div
      className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
      style={{ minWidth: 300, maxWidth: 420 }}
    >
      <div
        className="rounded-2xl border text-xs backdrop-blur-xl"
        style={{
          background: 'rgba(10, 8, 32, 0.90)',
          borderColor: color,
          boxShadow: `0 0 24px ${color}40, 0 4px 16px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{ borderColor: `${color}44` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">{emoji}</span>
            <div>
              <div className="font-semibold text-wv-text" style={{ fontSize: 13 }}>
                {station.name}
              </div>
              <div className="uppercase tracking-widest" style={{ color, fontSize: 9 }}>
                {lang === 'ar' ? 'الطقس الحالي' : 'CURRENT WEATHER'}
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

          {/* Big temperature + condition */}
          <div className="flex items-center gap-4">
            <span
              className="font-mono font-bold tabular-nums"
              style={{ fontSize: 40, color, lineHeight: 1 }}
            >
              {tempText}
            </span>
            <span className="text-wv-muted leading-tight" style={{ fontSize: 12 }}>
              {desc}
            </span>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 border-t"
            style={{ borderColor: `${color}22`, fontSize: 11 }}
          >
            <div className="flex justify-between">
              <span className="text-gray-500">{lang === 'ar' ? 'سرعة الرياح' : 'Wind'}</span>
              <span style={{ color }} className="font-mono">{windText}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{lang === 'ar' ? 'الرطوبة' : 'Humidity'}</span>
              <span style={{ color }} className="font-mono">{humText}</span>
            </div>
          </div>

          {/* Coordinates */}
          <div
            className="flex gap-4 pt-1 border-t"
            style={{ borderColor: `${color}22`, fontSize: 10 }}
          >
            <span className="text-gray-500">
              {lang === 'ar' ? 'خط العرض' : 'Lat'}{' '}
              <span style={{ color }} className="ml-1 font-mono">{station.lat.toFixed(4)}°N</span>
            </span>
            <span className="text-gray-500">
              {lang === 'ar' ? 'خط الطول' : 'Lon'}{' '}
              <span style={{ color }} className="ml-1 font-mono">{station.lon.toFixed(4)}°E</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-1 flex items-center justify-between border-t"
          style={{ borderColor: `${color}22`, fontSize: 9 }}
        >
          <span className="text-gray-600">
            {lang === 'ar' ? 'آخر تحديث' : 'Updated'}: {updatedStr}
          </span>
          <span className="text-gray-600 tracking-wide">
            {lang === 'ar' ? 'انقر على الخريطة أو ESC للإغلاق' : 'Click map or ESC to close'}
          </span>
        </div>
      </div>
    </div>
  );
}
