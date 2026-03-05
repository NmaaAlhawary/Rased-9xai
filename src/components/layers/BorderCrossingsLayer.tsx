/**
 * BorderCrossingsLayer — Renders Jordan's border crossings as colour-coded
 * billboard markers on the globe.
 *
 * Status colours:
 *   open    → green  (#00FF88)
 *   limited → amber  (#F59E0B)
 *   closed  → red    (#EF4444)
 *
 * Uses imperative BillboardCollection + LabelCollection for performance.
 * Clicking a crossing triggers onCrossingClick callback.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useCesium } from 'resium';
import {
  Cartesian3,
  Color,
  BillboardCollection,
  LabelCollection,
  LabelStyle,
  VerticalOrigin,
  HorizontalOrigin,
  NearFarScalar,
  DistanceDisplayCondition,
  BlendOption,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
} from 'cesium';
import type { BorderCrossing } from '../../hooks/useBorderCrossings';
import type { Lang } from '../../i18n/translations';

interface Props {
  crossings: BorderCrossing[];
  visible: boolean;
  lang: Lang;
  onCrossingClick?: (crossing: BorderCrossing) => void;
}

function statusColor(status: BorderCrossing['status']): Color {
  switch (status) {
    case 'open':    return new Color(0.0, 1.0, 0.53, 1.0);   // #00FF88
    case 'limited': return new Color(0.96, 0.62, 0.04, 1.0); // #F59E0B
    case 'closed':  return new Color(0.94, 0.27, 0.27, 1.0); // #EF4444
    default:        return Color.WHITE;
  }
}

/** Inline SVG → data URI for the crossing gate icon */
function makeGateIcon(hexColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${hexColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1" y="3" width="22" height="4" rx="1"/>
    <path d="M4 7v13M20 7v13M8 7v7h8V7"/>
    <circle cx="12" cy="17" r="1.5" fill="${hexColor}" stroke="none"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const ICON_COLORS: Record<BorderCrossing['status'], string> = {
  open: '#00FF88',
  limited: '#F59E0B',
  closed: '#EF4444',
};

export default function BorderCrossingsLayer({ crossings, visible, lang, onCrossingClick }: Props) {
  const { viewer } = useCesium();
  const billboardsRef = useRef<BillboardCollection | null>(null);
  const labelsRef = useRef<LabelCollection | null>(null);
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  const crossingsRef = useRef<BorderCrossing[]>(crossings);
  crossingsRef.current = crossings;

  const handleClick = useCallback((movement: any) => {
    if (!viewer || !billboardsRef.current || !onCrossingClick) return;
    const picked = viewer.scene.pick(movement.position);
    if (!defined(picked) || !picked.primitive) return;

    const bb = billboardsRef.current;
    for (let i = 0; i < bb.length; i++) {
      if (bb.get(i) === picked.primitive) {
        const crossing = crossingsRef.current[i];
        if (crossing) onCrossingClick(crossing);
        return;
      }
    }
  }, [viewer, onCrossingClick]);

  // Setup / teardown click handler
  useEffect(() => {
    if (!viewer) return;
    const handler = new ScreenSpaceEventHandler(viewer.canvas);
    handler.setInputAction(handleClick, ScreenSpaceEventType.LEFT_CLICK);
    handlerRef.current = handler;
    return () => { if (!handler.isDestroyed()) handler.destroy(); };
  }, [viewer, handleClick]);

  // Rebuild billboard + label collections when crossings or visibility change
  useEffect(() => {
    if (!viewer) return;
    const scene = viewer.scene;

    // Remove old collections
    if (billboardsRef.current && !billboardsRef.current.isDestroyed()) {
      scene.primitives.remove(billboardsRef.current);
    }
    if (labelsRef.current && !labelsRef.current.isDestroyed()) {
      scene.primitives.remove(labelsRef.current);
    }

    if (!visible || crossings.length === 0) {
      billboardsRef.current = null;
      labelsRef.current = null;
      return;
    }

    const bbs = new BillboardCollection({ blendOption: BlendOption.TRANSLUCENT });
    const lbls = new LabelCollection();

    for (const crossing of crossings) {
      const color = statusColor(crossing.status);
      const hexColor = ICON_COLORS[crossing.status];
      const iconUri = makeGateIcon(hexColor);

      bbs.add({
        position: Cartesian3.fromDegrees(crossing.lon, crossing.lat, 0),
        image: iconUri,
        width: 20,
        height: 20,
        color,
        verticalOrigin: VerticalOrigin.BOTTOM,
        horizontalOrigin: HorizontalOrigin.CENTER,
        scaleByDistance: new NearFarScalar(5e4, 2.0, 2e6, 0.6),
        distanceDisplayCondition: new DistanceDisplayCondition(0, 3_000_000),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        id: crossing.id,
      });

      const labelText = lang === 'ar' ? crossing.nameAr : crossing.nameEn;
      lbls.add({
        position: Cartesian3.fromDegrees(crossing.lon, crossing.lat, 0),
        text: labelText,
        font: '10px monospace',
        fillColor: color,
        outlineColor: Color.BLACK,
        outlineWidth: 2,
        style: LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: VerticalOrigin.TOP,
        horizontalOrigin: HorizontalOrigin.CENTER,
        pixelOffset: { x: 0, y: 4 } as any,
        scaleByDistance: new NearFarScalar(5e4, 1.2, 1e6, 0.6),
        distanceDisplayCondition: new DistanceDisplayCondition(0, 1_500_000),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        id: `lbl-${crossing.id}-name`,
      });

      // Arabic name label below, only when zoomed in
      lbls.add({
        position: Cartesian3.fromDegrees(crossing.lon, crossing.lat, 0),
        text: lang === 'ar' ? crossing.nameEn : crossing.nameAr,
        font: '9px sans-serif',
        fillColor: Color.fromCssColorString('#aaaaaa'),
        outlineColor: Color.BLACK,
        outlineWidth: 2,
        style: LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: VerticalOrigin.TOP,
        horizontalOrigin: HorizontalOrigin.CENTER,
        pixelOffset: { x: 0, y: 16 } as any,
        scaleByDistance: new NearFarScalar(5e4, 1.0, 8e5, 0.0),
        distanceDisplayCondition: new DistanceDisplayCondition(0, 800_000),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        id: `lbl-${crossing.id}-ar`,
      });
    }

    scene.primitives.add(bbs);
    scene.primitives.add(lbls);
    billboardsRef.current = bbs;
    labelsRef.current = lbls;

    return () => {
      try {
        if (!scene.isDestroyed()) {
          if (!bbs.isDestroyed()) scene.primitives.remove(bbs);
          if (!lbls.isDestroyed()) scene.primitives.remove(lbls);
        }
      } catch { /* ok */ }
    };
  }, [viewer, crossings, visible, lang]);

  return null;
}
