/**
 * WeatherLayer — Renders live weather for major Jordan cities on the globe.
 *
 * WMO weather code → emoji mapping:
 *   0        Clear sky        → ☀️
 *   1–3      Partly cloudy    → ⛅
 *   45, 48   Fog              → 🌫
 *   51–67    Drizzle/Rain     → 🌧
 *   71–77    Snow             → 🌨
 *   80–82    Rain showers     → 🌦
 *   95–99    Thunderstorm     → ⛈
 *
 * Temperature colour scale:
 *   < 5°C    → cold blue  #60A5FA
 *   5–15°C   → cool cyan  #22D3EE
 *   15–25°C  → comfortable green  #34D399
 *   25–35°C  → warm amber #F59E0B
 *   > 35°C   → hot red    #EF4444
 *
 * Uses imperative PointPrimitiveCollection + LabelCollection for performance.
 */

import { useEffect, useRef } from 'react';
import { useCesium } from 'resium';
import {
  Cartesian3,
  Color,
  PointPrimitiveCollection,
  LabelCollection,
  LabelStyle,
  VerticalOrigin,
  HorizontalOrigin,
  NearFarScalar,
  DistanceDisplayCondition,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
  Cartesian2 as CesiumCartesian2,
} from 'cesium';
import type { WeatherStation } from '../../hooks/useWeather';

interface Props {
  stations: WeatherStation[];
  visible: boolean;
  onStationClick?: (station: WeatherStation) => void;
}

/** WMO weather code → text emoji */
function weatherEmoji(code: number): string {
  if (code === 0)                      return '☀';
  if (code <= 3)                       return '⛅';
  if (code === 45 || code === 48)      return '🌫';
  if (code >= 51 && code <= 67)        return '🌧';
  if (code >= 71 && code <= 77)        return '🌨';
  if (code >= 80 && code <= 82)        return '🌦';
  if (code >= 95)                      return '⛈';
  return '〰';
}

/** Temperature → Cesium Color */
function tempColor(temp: number | null): Color {
  if (temp === null) return new Color(0.6, 0.6, 0.6, 0.9);
  if (temp < 5)   return new Color(0.38, 0.64, 0.98, 0.95); // cold blue
  if (temp < 15)  return new Color(0.13, 0.83, 0.93, 0.95); // cool cyan
  if (temp < 25)  return new Color(0.20, 0.83, 0.60, 0.95); // comfortable green
  if (temp < 35)  return new Color(0.96, 0.62, 0.04, 0.95); // warm amber
  return new Color(0.94, 0.27, 0.27, 0.95);                  // hot red
}

/** Type guard — is this picked object a WeatherStation? */
function isWeatherStation(obj: unknown): obj is WeatherStation {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return typeof o.lat === 'number' && typeof o.lon === 'number' && typeof o.weatherCode === 'number' && typeof o.name === 'string';
}

export default function WeatherLayer({ stations, visible, onStationClick }: Props) {
  const { viewer } = useCesium();
  const pointsRef = useRef<PointPrimitiveCollection | null>(null);
  const labelsRef = useRef<LabelCollection | null>(null);
  const onClickRef  = useRef(onStationClick);
  onClickRef.current = onStationClick;

  useEffect(() => {
    if (!viewer) return;
    const scene = viewer.scene;

    // Clear previous primitives
    if (pointsRef.current && !pointsRef.current.isDestroyed()) {
      scene.primitives.remove(pointsRef.current);
    }
    if (labelsRef.current && !labelsRef.current.isDestroyed()) {
      scene.primitives.remove(labelsRef.current);
    }

    if (!visible || stations.length === 0) {
      pointsRef.current = null;
      labelsRef.current = null;
      return;
    }

    const pts  = new PointPrimitiveCollection();
    const lbls = new LabelCollection();

    for (const station of stations) {
      const color = tempColor(station.temperature);
      const position = Cartesian3.fromDegrees(station.lon, station.lat, 8_000);

      // Glow dot — store station as id for pick detection
      pts.add({
        position,
        color,
        pixelSize: 14,
        outlineColor: Color.BLACK.withAlpha(0.5),
        outlineWidth: 2,
        scaleByDistance: new NearFarScalar(1e5, 2.0, 3e6, 0.6),
        distanceDisplayCondition: new DistanceDisplayCondition(0, 4_000_000),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        id: station,
      });

      // City name + temperature label
      const tempText = station.temperature !== null
        ? `${Math.round(station.temperature)}°C`
        : '--°C';
      const emoji = weatherEmoji(station.weatherCode);
      const windText = station.windSpeed !== null
        ? `  ${Math.round(station.windSpeed)}km/h`
        : '';

      // City name (larger, always visible from further out)
      lbls.add({
        position,
        text: station.name,
        font: 'bold 11px "DM Mono", monospace',
        fillColor: Color.WHITE.withAlpha(0.95),
        outlineColor: Color.BLACK.withAlpha(0.8),
        outlineWidth: 3,
        style: LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: VerticalOrigin.BOTTOM,
        horizontalOrigin: HorizontalOrigin.CENTER,
        pixelOffset: { x: 0, y: -14 } as any,
        scaleByDistance: new NearFarScalar(5e4, 1.1, 2e6, 0.7),
        distanceDisplayCondition: new DistanceDisplayCondition(0, 3_000_000),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      // Temp + emoji label (shown when closer)
      lbls.add({
        position,
        text: `${emoji} ${tempText}${windText}`,
        font: '10px "DM Mono", monospace',
        fillColor: color,
        outlineColor: Color.BLACK.withAlpha(0.8),
        outlineWidth: 2,
        style: LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: VerticalOrigin.TOP,
        horizontalOrigin: HorizontalOrigin.CENTER,
        pixelOffset: { x: 0, y: 6 } as any,
        scaleByDistance: new NearFarScalar(5e4, 1.0, 2e6, 0.7),
        distanceDisplayCondition: new DistanceDisplayCondition(0, 2_500_000),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
    }

    scene.primitives.add(pts);
    scene.primitives.add(lbls);
    pointsRef.current = pts;
    labelsRef.current = lbls;

    return () => {
      try {
        if (!scene.isDestroyed()) {
          if (!pts.isDestroyed()) scene.primitives.remove(pts);
          if (!lbls.isDestroyed()) scene.primitives.remove(lbls);
        }
      } catch { /* ok */ }
    };
  }, [viewer, stations, visible]);

  // ── Hover cursor + click handler ───────────────────────────────
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const canvas = viewer.scene.canvas;
    const handler = new ScreenSpaceEventHandler(canvas);

    // Change cursor to pointer when hovering over a weather point
    handler.setInputAction((evt: { endPosition: CesiumCartesian2 }) => {
      const picked = viewer.scene.pick(evt.endPosition);
      canvas.style.cursor = (defined(picked) && isWeatherStation(picked?.id))
        ? 'pointer'
        : '';
    }, ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction((evt: { position: CesiumCartesian2 }) => {
      if (!viewer || viewer.isDestroyed()) return;

      // Use drillPick so 3D tiles don't block the weather point
      const pickedList = viewer.scene.drillPick(evt.position, 10);
      for (const picked of pickedList) {
        if (!defined(picked)) continue;
        const station = picked?.id;
        if (isWeatherStation(station)) {
          onClickRef.current?.(station);
          return;
        }
      }

      // Fallback: single pick
      const single = viewer.scene.pick(evt.position);
      if (defined(single) && isWeatherStation(single?.id)) {
        onClickRef.current?.(single.id);
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      if (!handler.isDestroyed()) handler.destroy();
      canvas.style.cursor = '';
    };
  }, [viewer]);

  return null;
}
