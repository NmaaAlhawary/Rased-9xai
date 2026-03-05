/**
 * JordanLandmarksLayer — Static billboards for key Jordan strategic,
 * cultural, and geographic locations.
 *
 * Uses imperative BillboardCollection + LabelCollection for zero React
 * reconciliation overhead. Points are fixed — no polling required.
 *
 * Landmarks:
 *  - Amman (capital)
 *  - Queen Alia International Airport (OJAI)
 *  - King Hussein International Airport, Aqaba (OJAQ)
 *  - Petra (UNESCO World Heritage)
 *  - Wadi Rum (UNESCO)
 *  - Dead Sea (lowest point on Earth, −430 m)
 *  - Jerash (largest Roman ruins outside Italy)
 *  - Port of Aqaba (Jordan's only seaport)
 *  - Ajloun Castle (medieval Ayyubid fortress)
 *  - Madaba (mosaic city, known for map of Holy Land)
 *  - Karak Castle (Crusader fortress)
 */

import { useEffect, useRef } from 'react';
import type { Lang } from '../../i18n/translations';
import { useCesium } from 'resium';
import {
  Cartesian3,
  Color,
  BillboardCollection,
  LabelCollection,
  LabelStyle,
  VerticalOrigin,
  HorizontalOrigin,
  Cartesian2 as CesiumCartesian2,
  NearFarScalar,
  DistanceDisplayCondition,
  BlendOption,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
  Math as CesiumMath,
  BoundingSphere,
  HeadingPitchRange,
} from 'cesium';

/* ─── Landmark definitions ─────────────────────────────────────── */

export interface LandmarkData {
  id: string;
  name: string;
  shortName: string;
  lat: number;
  lon: number;
  alt: number;         // elevation in metres
  emoji: string;
  category: 'capital' | 'airport' | 'heritage' | 'port' | 'nature' | 'historic';
  description: string;
  /** Camera range in metres for 3D tile zoom — keep < 2000 for 3D tiles to load */
  viewRange: number;
  /** Optional precise 3D-tile focal point (defaults to lat/lon if omitted) */
  view3dLat?: number;
  view3dLon?: number;
}

/** Duck-type guard — is this billboard id a LandmarkData object? */
function isLandmark(obj: unknown): obj is LandmarkData {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return typeof o.lat === 'number' && typeof o.lon === 'number' && typeof o.category === 'string' && typeof o.shortName === 'string';
}

const JORDAN_LANDMARKS: LandmarkData[] = [
  {
    id: 'amman',
    name: 'Amman — عمّان',
    shortName: 'AMMAN',
    lat: 31.9539,
    lon: 35.9106,
    alt: 770,
    emoji: '🏛',
    category: 'capital',
    description: 'Capital and largest city of Jordan. Population ~4.5 million.',
    viewRange: 900,
    view3dLat: 31.9522,   // 1st Circle / Rainbow Street downtown
    view3dLon: 35.9195,
  },
  {
    id: 'ojai',
    name: 'Queen Alia Int\'l Airport',
    shortName: 'OJAI',
    lat: 31.7226,
    lon: 35.9932,
    alt: 722,
    emoji: '✈',
    category: 'airport',
    description: 'ICAO: OJAI | IATA: AMM | Main international gateway to Jordan.',
    viewRange: 1200,
  },
  {
    id: 'ojaq',
    name: 'King Hussein Int\'l Airport',
    shortName: 'OJAQ',
    lat: 29.6116,
    lon: 35.0181,
    alt: 51,
    emoji: '✈',
    category: 'airport',
    description: 'ICAO: OJAQ | IATA: AQJ | Aqaba airport serving the Red Sea coast.',
    viewRange: 1000,
  },
  {
    id: 'petra',
    name: 'Petra — البتراء',
    shortName: 'PETRA',
    lat: 30.3258,
    lon: 35.4746,
    alt: 900,
    emoji: '🏺',
    category: 'heritage',
    description: 'UNESCO World Heritage Site. Ancient Nabataean city carved into rose-red rock.',
    viewRange: 600,
    view3dLat: 30.3222,   // Al-Khazneh (The Treasury) entrance
    view3dLon: 35.4588,
  },
  {
    id: 'wadi-rum',
    name: 'Wadi Rum — وادي رم',
    shortName: 'WADI RUM',
    lat: 29.5755,
    lon: 35.4183,
    alt: 900,
    emoji: '🏜',
    category: 'nature',
    description: 'UNESCO World Heritage Site. Protected desert known as "Valley of the Moon".',
    viewRange: 2000,
    view3dLat: 29.5774,   // Wadi Rum village / visitor centre
    view3dLon: 35.4200,
  },
  {
    id: 'dead-sea',
    name: 'Dead Sea — البحر الميت',
    shortName: 'DEAD SEA',
    lat: 31.5590,
    lon: 35.4732,
    alt: 0,
    emoji: '🌊',
    category: 'nature',
    description: 'Lowest point on Earth at −430 m. ~9.6× saltier than ocean. Located on the Jordan–Palestine border.',
    viewRange: 1500,
    view3dLat: 31.5090,   // Sweimeh resort area on the Jordan shore
    view3dLon: 35.5831,
  },
  {
    id: 'aqaba-port',
    name: 'Port of Aqaba — ميناء العقبة',
    shortName: 'PORT AQABA',
    lat: 29.4662,
    lon: 34.9780,
    alt: 0,
    emoji: '🚢',
    category: 'port',
    description: 'Jordan\'s only seaport on the Red Sea. Critical trade gateway — handles ~25M tonnes/year.',
    viewRange: 1000,
    view3dLat: 29.4662,   // Aqaba industrial port
    view3dLon: 34.9780,
  },
  {
    id: 'jerash',
    name: 'Jerash — جرش',
    shortName: 'JERASH',
    lat: 32.2784,
    lon: 35.8908,
    alt: 570,
    emoji: '🏛',
    category: 'historic',
    description: 'One of the best-preserved Roman provincial cities in the world. Decapolis city of Gerasa.',
    viewRange: 700,
    view3dLat: 32.2784,   // Oval Plaza / Cardo Maximus
    view3dLon: 35.8908,
  },
  {
    id: 'ajloun',
    name: 'Ajloun Castle — قلعة عجلون',
    shortName: 'AJLOUN',
    lat: 32.3252,
    lon: 35.7273,
    alt: 1050,
    emoji: '🏰',
    category: 'historic',
    description: 'Ayyubid castle built by Izz al-Din Usama in 1184 CE. Overlooks the Jordan Valley.',
    viewRange: 500,
  },
  {
    id: 'madaba',
    name: 'Madaba — مادبا',
    shortName: 'MADABA',
    lat: 31.7162,
    lon: 35.7924,
    alt: 790,
    emoji: '🗺',
    category: 'historic',
    description: 'City of mosaics. Home to the oldest surviving mosaic map of the Holy Land (560 CE).',
    viewRange: 800,
    view3dLat: 31.7161,   // St. George church (mosaic map)
    view3dLon: 35.7932,
  },
  {
    id: 'karak',
    name: 'Karak Castle — قلعة الكرك',
    shortName: 'KARAK',
    lat: 31.1805,
    lon: 35.7017,
    alt: 1000,
    emoji: '🏰',
    category: 'historic',
    description: 'Massive Crusader fortress built in 1142 CE. One of the largest crusader castles in the Levant.',
    viewRange: 500,
  },
  {
    id: 'zarqa',
    name: 'Zarqa — الزرقاء',
    shortName: 'ZARQA',
    lat: 32.0728,
    lon: 36.0880,
    alt: 615,
    emoji: '🏙',
    category: 'capital',
    description: 'Jordan\'s second-largest city and industrial hub. Population ~0.9 million.',
    viewRange: 900,
  },
];

/* ─── colour by category ───────────────────────────────────────── */

const CATEGORY_COLOR: Record<LandmarkData['category'], Color> = {
  capital:  Color.fromCssColorString('#00D4FF'),   // cyan
  airport:  Color.fromCssColorString('#FFD700'),   // gold
  heritage: Color.fromCssColorString('#FF8C00'),   // amber
  port:     Color.fromCssColorString('#00E5FF'),   // teal
  nature:   Color.fromCssColorString('#00FF88'),   // green
  historic: Color.fromCssColorString('#FF6B6B'),   // red-pink
};

/* ─── dot icon canvas ───────────────────────────────────────────── */

function createDotIcon(color: Color, radius = 8): HTMLCanvasElement {
  const S = radius * 2 + 4;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  const cx = S / 2;
  const cy = S / 2;
  // Glow
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius + 2);
  gradient.addColorStop(0, `rgba(${Math.round(color.red * 255)},${Math.round(color.green * 255)},${Math.round(color.blue * 255)}, 0.4)`);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, S, S);
  // Core dot
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${Math.round(color.red * 255)},${Math.round(color.green * 255)},${Math.round(color.blue * 255)}, 0.9)`;
  ctx.fill();
  // White border
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1;
  ctx.stroke();
  return canvas;
}

/* ─── Component ──────────────────────────────────────────────────── */

export interface JordanLandmarksLayerProps {
  visible: boolean;
  onLandmarkClick?: (landmark: LandmarkData) => void;
  lang?: Lang;
}

export default function JordanLandmarksLayer({ visible, onLandmarkClick, lang = 'en' }: JordanLandmarksLayerProps) {
  const onLandmarkClickRef = useRef(onLandmarkClick);
  onLandmarkClickRef.current = onLandmarkClick;
  const { viewer } = useCesium();
  const billboardsRef = useRef<BillboardCollection | null>(null);
  const labelsRef = useRef<LabelCollection | null>(null);

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    // Create collections once
    if (!billboardsRef.current) {
      billboardsRef.current = viewer.scene.primitives.add(
        new BillboardCollection({ blendOption: BlendOption.TRANSLUCENT })
      );
    }
    if (!labelsRef.current) {
      labelsRef.current = viewer.scene.primitives.add(new LabelCollection());
    }

    const billboards = billboardsRef.current;
    const labels = labelsRef.current;
    if (!billboards || !labels) return;
    billboards.removeAll();
    labels.removeAll();

    if (!visible) return;

    // Pre-build one dot canvas per category
      const dotCanvases: Partial<Record<LandmarkData['category'], HTMLCanvasElement>> = {};
    for (const lm of JORDAN_LANDMARKS) {
      const color = CATEGORY_COLOR[lm.category];

      if (!dotCanvases[lm.category]) {
        dotCanvases[lm.category] = createDotIcon(color, lm.category === 'capital' ? 10 : 7);
      }

      const pos = Cartesian3.fromDegrees(lm.lon, lm.lat, lm.alt > 0 ? lm.alt : 0);

      // Billboard dot — store landmark data as `id` for click detection
      billboards.add({
        position: pos,
        image: dotCanvases[lm.category]!,
        verticalOrigin: VerticalOrigin.CENTER,
        horizontalOrigin: HorizontalOrigin.CENTER,
        pixelOffset: CesiumCartesian2.ZERO,
        scale: 1.0,
        scaleByDistance: new NearFarScalar(1e4, 1.2, 1e7, 0.6),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        distanceDisplayCondition: new DistanceDisplayCondition(0, 3_000_000),
        id: lm,   // store landmark data for pick detection
      });

      // Label — bilingual: extract Arabic portion from name when lang='ar'
      const arPart = lm.name.includes(' — ') ? lm.name.split(' — ')[1] : null;
      const labelText = lang === 'ar' && arPart ? lm.emoji + ' ' + arPart : lm.emoji + ' ' + lm.shortName;
      const labelFont = lang === 'ar' && arPart
        ? '13px "Noto Sans Arabic", "Segoe UI", sans-serif'
        : '11px "JetBrains Mono", "Fira Code", monospace';
      labels.add({
        position: pos,
        text: labelText,
        fillColor: color,
        outlineColor: Color.BLACK,
        outlineWidth: 2,
        style: LabelStyle.FILL_AND_OUTLINE,
        font: labelFont,
        verticalOrigin: VerticalOrigin.BOTTOM,
        horizontalOrigin: HorizontalOrigin.LEFT,
        pixelOffset: new CesiumCartesian2(8, -8),
        scaleByDistance: new NearFarScalar(1e4, 1.0, 2e6, 0.7),
        translucencyByDistance: new NearFarScalar(1e5, 1.0, 1.5e6, 0.0),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        distanceDisplayCondition: new DistanceDisplayCondition(0, 1_500_000),
      });
    }

    return () => {
      if (billboardsRef.current && !viewer.isDestroyed()) {
        billboardsRef.current.removeAll();
      }
      if (labelsRef.current && !viewer.isDestroyed()) {
        labelsRef.current.removeAll();
      }
    };
  }, [viewer, visible, lang]);

  // ── Click handler ──────────────────────────────────────────────
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((evt: { position: CesiumCartesian2 }) => {
      if (!viewer || viewer.isDestroyed()) return;

      const picked = viewer.scene.pick(evt.position);
      if (!defined(picked)) return;

      const lm = picked?.id;
      if (!isLandmark(lm)) return;

      // Notify parent
      onLandmarkClickRef.current?.(lm);

      // Fly to landmark — use view3dLat/Lon if defined for precise 3D tile focal point
      const focusLat = lm.view3dLat ?? lm.lat;
      const focusLon = lm.view3dLon ?? lm.lon;
      const centre = Cartesian3.fromDegrees(focusLon, focusLat, Math.max(lm.alt, 0));
      const bs = new BoundingSphere(centre, 100);
      viewer.camera.flyToBoundingSphere(bs, {
        duration: 2.0,
        offset: new HeadingPitchRange(
          CesiumMath.toRadians(340),   // slight NNW heading for dramatic angle
          CesiumMath.toRadians(-35),   // 35° tilt — shows 3D buildings/terrain well
          lm.viewRange,
        ),
      });
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      if (!handler.isDestroyed()) handler.destroy();
    };
  }, [viewer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewer && !viewer.isDestroyed()) {
        if (billboardsRef.current) {
          viewer.scene.primitives.remove(billboardsRef.current);
          billboardsRef.current = null;
        }
        if (labelsRef.current) {
          viewer.scene.primitives.remove(labelsRef.current);
          labelsRef.current = null;
        }
      }
    };
  }, [viewer]);

  return null;
}
