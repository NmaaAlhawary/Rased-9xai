/**
 * AirQualityLayer — Renders OpenAQ monitoring stations as colour-coded
 * point circles on the globe.
 *
 * AQI colour scale:
 *   0–50    Good        → green  (#00FF88)
 *   51–100  Moderate    → yellow (#FFD700)
 *   101–150 Unhealthy   → orange (#F97316)
 *   >150    Hazardous   → red    (#EF4444)
 *
 * Uses imperative PointPrimitiveCollection + LabelCollection.
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
} from 'cesium';
import type { AirQualityStation } from '../../hooks/useAirQuality';

interface Props {
  stations: AirQualityStation[];
  visible: boolean;
}

function aqiColor(aqi: number): Color {
  if (aqi <= 50)  return new Color(0.0, 1.0, 0.53, 0.85);   // Good — green
  if (aqi <= 100) return new Color(1.0, 0.84, 0.0, 0.85);   // Moderate — yellow
  if (aqi <= 150) return new Color(0.98, 0.45, 0.09, 0.85); // Unhealthy — orange
  return new Color(0.94, 0.27, 0.27, 0.85);                  // Hazardous — red
}

function aqiPointSize(aqi: number): number {
  // Scale point radius from 6px (good) to 14px (hazardous)
  return Math.min(6 + (aqi / 50) * 4, 14);
}

export default function AirQualityLayer({ stations, visible }: Props) {
  const { viewer } = useCesium();
  const pointsRef = useRef<PointPrimitiveCollection | null>(null);
  const labelsRef = useRef<LabelCollection | null>(null);

  useEffect(() => {
    if (!viewer) return;
    const scene = viewer.scene;

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

    const pts = new PointPrimitiveCollection();
    const lbls = new LabelCollection();

    for (const station of stations) {
      const color = aqiColor(station.aqi);
      const size = aqiPointSize(station.aqi);

      pts.add({
        position: Cartesian3.fromDegrees(station.lon, station.lat, 0),
        color,
        pixelSize: size,
        outlineColor: Color.BLACK.withAlpha(0.5),
        outlineWidth: 1,
        scaleByDistance: new NearFarScalar(5e4, 2.0, 1e6, 0.8),
        distanceDisplayCondition: new DistanceDisplayCondition(0, 2_000_000),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });

      // Station name + PM2.5 label (visible only when zoomed in)
      const pm25Text = station.pm25 != null ? ` PM2.5:${station.pm25.toFixed(0)}` : '';
      lbls.add({
        position: Cartesian3.fromDegrees(station.lon, station.lat, 0),
        text: `${station.name.split(',')[0]}${pm25Text}`,
        font: '9px monospace',
        fillColor: color,
        outlineColor: Color.BLACK,
        outlineWidth: 2,
        style: LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: VerticalOrigin.TOP,
        horizontalOrigin: HorizontalOrigin.CENTER,
        pixelOffset: { x: 0, y: 6 } as any,
        scaleByDistance: new NearFarScalar(5e4, 1.0, 5e5, 0.0),
        distanceDisplayCondition: new DistanceDisplayCondition(0, 500_000),
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

  return null;
}
