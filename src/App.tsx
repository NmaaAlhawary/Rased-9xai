import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Viewer as CesiumViewer, Cartesian3, Math as CesiumMath, Entity as CesiumEntity } from 'cesium';
import type { CameraFeed } from './types/camera';
import GlobeViewer from './components/globe/GlobeViewer';
import EarthquakeLayer from './components/layers/EarthquakeLayer';
import SatelliteLayer from './components/layers/SatelliteLayer';
import FlightLayer from './components/layers/FlightLayer';
import TrafficLayer from './components/layers/TrafficLayer';
import CCTVLayer from './components/layers/CCTVLayer';
import ShipLayer from './components/layers/ShipLayer';
import JordanLandmarksLayer from './components/layers/JordanLandmarksLayer';
import type { LandmarkData } from './components/layers/JordanLandmarksLayer';
import LandmarkDetailPanel from './components/ui/LandmarkDetailPanel';
import BorderCrossingsLayer from './components/layers/BorderCrossingsLayer';
import AirQualityLayer from './components/layers/AirQualityLayer';
import WeatherLayer from './components/layers/WeatherLayer';
import WeatherDetailPanel from './components/ui/WeatherDetailPanel';
import BorderDetailPanel from './components/ui/BorderDetailPanel';
import type { AltitudeBand } from './components/layers/FlightLayer';
import type { SatelliteCategory } from './components/layers/SatelliteLayer';
import OperationsPanel from './components/ui/OperationsPanel';
import StatusBar from './components/ui/StatusBar';
import IntelFeed from './components/ui/IntelFeed';
import CCTVPanel from './components/ui/CCTVPanel';
import Crosshair from './components/ui/Crosshair';
import TrackedEntityPanel from './components/ui/TrackedEntityPanel';
import SplashScreen from './components/ui/SplashScreen';
import FilmGrain from './components/ui/FilmGrain';
import TopNav from './components/ui/TopNav';
import ZoomControls from './components/ui/ZoomControls';
import { useEarthquakes } from './hooks/useEarthquakes';
import { useSatellites } from './hooks/useSatellites';
import { useFlights } from './hooks/useFlights';
import { useFlightsLive } from './hooks/useFlightsLive';
import { useTraffic } from './hooks/useTraffic';
import { useCameras } from './hooks/useCameras';
import { useShips } from './hooks/useShips';
import { useBorderCrossings } from './hooks/useBorderCrossings';
import type { BorderCrossing } from './hooks/useBorderCrossings';
import { useAirQuality } from './hooks/useAirQuality';
import { useWeather } from './hooks/useWeather';
import { useGeolocation } from './hooks/useGeolocation';
import { useIsMobile } from './hooks/useIsMobile';
import { useAudio } from './hooks/useAudio';
import type { ShaderMode } from './shaders/postprocess';
import type { IntelFeedItem } from './components/ui/IntelFeed';
import type { TrackedEntityInfo } from './components/globe/EntityClickHandler';
import { translations } from './i18n/translations';
import type { Lang } from './i18n/translations';

const DEFAULT_ALTITUDE_FILTER: Record<AltitudeBand, boolean> = {
  cruise: true,
  high: true,
  mid: true,
  low: true,
  ground: true,
};

const DEFAULT_SATELLITE_FILTER: Record<SatelliteCategory, boolean> = {
  iss: true,
  other: true,
};

/**
 * Convert a viewDirection compass string (e.g. "East", "N-W") to heading
 * degrees clockwise from North.  Returns null if the string is absent or
 * unrecognised.
 */
function parseViewDirection(dir?: string): number | null {
  if (!dir) return null;
  const normalised = dir.trim().toUpperCase().replace(/\s+/g, '');
  const map: Record<string, number> = {
    N: 0, NORTH: 0,
    NE: 45, 'N-E': 45, NORTHEAST: 45, 'NORTH-EAST': 45,
    E: 90, EAST: 90,
    SE: 135, 'S-E': 135, SOUTHEAST: 135, 'SOUTH-EAST': 135,
    S: 180, SOUTH: 180,
    SW: 225, 'S-W': 225, SOUTHWEST: 225, 'SOUTH-WEST': 225,
    W: 270, WEST: 270,
    NW: 315, 'N-W': 315, NORTHWEST: 315, 'NORTH-WEST': 315,
  };
  return map[normalised] ?? null;
}

function App() {
  // Responsive breakpoint
  const isMobile = useIsMobile();

  // Audio engine
  const audio = useAudio();

  // Viewer ref for reset-view functionality
  const viewerRef = useRef<CesiumViewer | null>(null);

  // Boot sequence
  const [booted, setBooted] = useState(false);

  // Drawer state (OperationsPanel slide-in)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const handleDrawerToggle = useCallback(() => setIsDrawerOpen((p) => !p), []);
  const handleDrawerClose = useCallback(() => setIsDrawerOpen(false), []);

  // Language state (en/ar)
  const [lang, setLang] = useState<Lang>('en');
  const t = translations[lang];

  // RTL effect
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // State: shader mode
  const [shaderMode, setShaderMode] = useState<ShaderMode>('none');

  // State: map tiles (google 3D vs OSM for testing)
  const [mapTiles, setMapTiles] = useState<'google' | 'osm'>('osm');

  // State: data layer visibility
  const [layers, setLayers] = useState({
    flights: true,
    satellites: true,
    earthquakes: false,
    traffic: false,
    cctv: false,
    ships: false,
    landmarks: true,
    borderCrossings: true,
    airQuality: false,
    weather: false,
  });

  // State: CCTV country filter
  const [cctvCountryFilter, setCctvCountryFilter] = useState('ALL');
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  // State: flight sub-toggles
  const [showPaths, setShowPaths] = useState(false);
  const [altitudeFilter, setAltitudeFilter] = useState<Record<AltitudeBand, boolean>>(DEFAULT_ALTITUDE_FILTER);

  // State: satellite sub-toggles
  const [showSatPaths, setShowSatPaths] = useState(false);
  const [satCategoryFilter, setSatCategoryFilter] = useState<Record<SatelliteCategory, boolean>>(DEFAULT_SATELLITE_FILTER);

  // State: camera position
  const [camera, setCamera] = useState({
    latitude: 31.9539,
    longitude: 35.9106,
    altitude: 8000000,
    heading: 0,
    pitch: -45,
  });

  // State: tracked entity (lock view)
  const [trackedEntity, setTrackedEntity] = useState<TrackedEntityInfo | null>(null);
  const cctvTrackEntityRef = useRef<CesiumEntity | null>(null);

  // State: selected Jordan landmark
  const [selectedLandmark, setSelectedLandmark] = useState<LandmarkData | null>(null);

  // State: selected border crossing
  const [selectedCrossing, setSelectedCrossing] = useState<BorderCrossing | null>(null);

  // State: selected weather station
  const [selectedWeatherStation, setSelectedWeatherStation] = useState<import('./hooks/useWeather').WeatherStation | null>(null);

  const handleCrossingClick = useCallback((crossing: BorderCrossing) => {
    setSelectedCrossing(crossing);
  }, []);

  const handleLandmarkClick = useCallback((lm: LandmarkData) => {
    setSelectedLandmark(lm);
  }, []);

  /** Remove the temporary Cesium Entity used for CCTV lock-on */
  const cleanupCctvEntity = useCallback(() => {
    if (cctvTrackEntityRef.current) {
      const viewer = viewerRef.current;
      if (viewer && !viewer.isDestroyed()) {
        viewer.entities.remove(cctvTrackEntityRef.current);
      }
      cctvTrackEntityRef.current = null;
    }
  }, []);

  const handleTrackEntity = useCallback((info: TrackedEntityInfo | null) => {
    setTrackedEntity(info);
    // When clearing, also dismiss landmark panel and clean up CCTV entity
    if (!info) {
      setSelectedLandmark(null);
      cleanupCctvEntity();
    } else if (info.entityType !== 'cctv') {
      cleanupCctvEntity();
    }
  }, [cleanupCctvEntity]);

  const handleViewerReady = useCallback((viewer: CesiumViewer) => {
    viewerRef.current = viewer;
  }, []);

  const handleResetView = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    viewer.trackedEntity = undefined;
    setTrackedEntity(null);
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(35.9106, 31.9539, 1_500_000),
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-90),
        roll: 0,
      },
      duration: 2,
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    viewer.camera.zoomIn(viewer.camera.positionCartographic.height * 0.35);
  }, []);

  const handleZoomOut = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    viewer.camera.zoomOut(viewer.camera.positionCartographic.height * 0.5);
  }, []);

  const handleCloseLandmark = useCallback(() => {
    setSelectedLandmark(null);
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(35.9106, 31.9539, 1_500_000),
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-90),
        roll: 0,
      },
      duration: 2,
    });
  }, []);;

  // Data hooks
  const { earthquakes, feedItems: eqFeedItems } = useEarthquakes(layers.earthquakes);
  const { satellites, feedItems: satFeedItems } = useSatellites(layers.satellites);
  const { flights: flightsGlobal, feedItems: fltFeedItems } = useFlights(layers.flights);
  const { flightsLive } = useFlightsLive(
    layers.flights,
    camera.latitude,
    camera.longitude,
    camera.altitude,
    !!trackedEntity,
  );
  const { roads: trafficRoads, vehicles: trafficVehicles } = useTraffic(
    layers.traffic,
    camera.latitude,
    camera.longitude,
    camera.altitude,
  );
  const { ships, feedItems: shipFeedItems, isLoading: shipsLoading } = useShips(layers.ships);
  const { crossings, feedItems: borderFeedItems } = useBorderCrossings(layers.borderCrossings);
  const { stations: aqStations } = useAirQuality(layers.airQuality);
  const { stations: weatherStations, isLoading: weatherLoading } = useWeather(layers.weather);
  const {
    cameras: cctvCameras,
    feedItems: cctvFeedItems,
    isLoading: cctvLoading,
    error: cctvError,
    totalOnline: cctvOnline,
    totalCameras: cctvTotal,
    availableCountries: cctvCountries,
  } = useCameras(layers.cctv, cctvCountryFilter);

  // Geolocation hook — browser GPS (consent) + IP fallback
  const { location: geoLocation, status: geoStatus, locate: geoLocate } = useGeolocation();

  // Fly to user's location when geolocation succeeds
  useEffect(() => {
    if (!geoLocation || geoStatus !== 'success') return;
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    // Choose altitude based on precision: GPS → street level, IP → city level
    const flyAltitude = geoLocation.source === 'gps' ? 5_000 : 200_000;

    viewer.trackedEntity = undefined;
    setTrackedEntity(null);
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        geoLocation.longitude,
        geoLocation.latitude,
        flyAltitude,
      ),
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-90),
        roll: 0,
      },
      duration: 2.5,
    });
  }, [geoLocation, geoStatus]);

  // Smart layer swap: live (adsb.fi 5s) replaces global (FR24 30s) for matching aircraft.
  // Global aircraft outside the live region remain visible. Zero duplicates guaranteed.
  const flights = useMemo(() => {
    if (flightsLive.length === 0) return flightsGlobal;
    if (flightsGlobal.length === 0) return flightsLive;

    // Set of icao24s in the live feed — these are EXCLUDED from global to prevent duplicates
    const liveIcaos = new Set(flightsLive.map((f) => f.icao24));

    // Global flights NOT covered by live feed (outside the adsb.fi 250nm region)
    const globalOnly = flightsGlobal.filter((f) => !liveIcaos.has(f.icao24));

    // Enrich live flights with FR24 route info where the live data is missing it
    const routeMap = new Map<string, { originAirport: string; destAirport: string; airline: string }>();
    for (const f of flightsGlobal) {
      if (f.originAirport || f.destAirport) {
        routeMap.set(f.icao24, {
          originAirport: f.originAirport,
          destAirport: f.destAirport,
          airline: f.airline,
        });
      }
    }
    const enrichedLive = flightsLive.map((f) => {
      const route = routeMap.get(f.icao24);
      if (route) {
        return {
          ...f,
          originAirport: f.originAirport || route.originAirport,
          destAirport: f.destAirport || route.destAirport,
          airline: f.airline || route.airline,
        };
      }
      return f;
    });

    return [...globalOnly, ...enrichedLive];
  }, [flightsGlobal, flightsLive]);

  // Combine intel feed items
  const allFeedItems: IntelFeedItem[] = [...fltFeedItems, ...satFeedItems, ...eqFeedItems, ...cctvFeedItems, ...shipFeedItems, ...borderFeedItems];

  // Handlers
  const handleCameraChange = useCallback(
    (lat: number, lon: number, alt: number, heading: number, pitch: number) => {
      setCamera({ latitude: lat, longitude: lon, altitude: alt, heading, pitch });
    },
    []
  );

  const handleLayerToggle = useCallback((layer: 'flights' | 'satellites' | 'earthquakes' | 'traffic' | 'cctv' | 'ships' | 'landmarks' | 'borderCrossings' | 'airQuality' | 'weather') => {
    setLayers((prev) => {
      const next = !prev[layer];
      audio.play(next ? 'toggleOn' : 'toggleOff');
      return { ...prev, [layer]: next };
    });
  }, [audio]);

  /** Select a camera in the panel (shows feed preview, no fly) */
  const handleSelectCamera = useCallback((cam: CameraFeed | null) => {
    setSelectedCameraId(cam ? cam.id : null);
  }, []);

  /** Lock-on to a CCTV camera: select, create entity, set trackedEntity */
  const handleCctvLockOn = useCallback((cam: CameraFeed) => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    setSelectedCameraId(cam.id);

    // Clean up any previous CCTV tracking entity
    cleanupCctvEntity();

    // Create a temporary Cesium Entity at the camera position for lock-on
    const entity = viewer.entities.add({
      position: Cartesian3.fromDegrees(cam.longitude, cam.latitude, 0),
      name: cam.name,
      description: [
        `<b>Source:</b> ${cam.source.toUpperCase()}`,
        `<b>Country:</b> ${cam.countryName}`,
        `<b>Region:</b> ${cam.region || 'N/A'}`,
        `<b>Status:</b> ${cam.available ? 'ONLINE' : 'OFFLINE'}`,
        `<b>Coords:</b> ${cam.latitude.toFixed(4)}°, ${cam.longitude.toFixed(4)}°`,
      ].join('<br/>') as any,
    });

    // Street-level viewFrom: close-in with optional heading match
    // viewFrom is in the entity's local ENU frame (x=East, y=North, z=Up)
    const ALT = 300;  // metres above ground
    const DEFAULT_HDG = 160; // degrees — default viewing heading when camera has none
    const DIST = 200; // metres behind the look-point
    const headingDeg = parseViewDirection(cam.viewDirection) ?? DEFAULT_HDG;
    const hRad = CesiumMath.toRadians(headingDeg);
    entity.viewFrom = new Cartesian3(
      -DIST * Math.sin(hRad), // east component (negative = behind heading)
      -DIST * Math.cos(hRad), // north component
      ALT,
    ) as any;

    cctvTrackEntityRef.current = entity;

    // Lock on — Cesium flies to and centres the entity
    viewer.trackedEntity = entity;

    // Set React tracked-entity state for the tracking panel UI
    setTrackedEntity({
      name: cam.name,
      entityType: 'cctv',
      description: [
        `<b>Source:</b> ${cam.source.toUpperCase()}`,
        `<b>Country:</b> ${cam.countryName}`,
        `<b>Region:</b> ${cam.region || 'N/A'}`,
        `<b>Status:</b> ${cam.available ? 'ONLINE' : 'OFFLINE'}`,
      ].join('<br/>'),
    });
  }, [cleanupCctvEntity]);

  /** Handle FLY TO from CCTVPanel — locks on (same as globe click) */
  const handleFlyToCamera = useCallback((cam: CameraFeed) => {
    handleCctvLockOn(cam);
  }, [handleCctvLockOn]);

  /** Handle CCTV billboard click on the globe (from EntityClickHandler) */
  const handleCctvClickOnGlobe = useCallback((camData: any) => {
    handleCctvLockOn(camData as CameraFeed);
  }, [handleCctvLockOn]);

  const handleAltitudeToggle = useCallback((band: AltitudeBand) => {
    audio.play('click');
    setAltitudeFilter((prev) => ({ ...prev, [band]: !prev[band] }));
  }, [audio]);

  const handleSatCategoryToggle = useCallback((category: SatelliteCategory) => {
    audio.play('click');
    setSatCategoryFilter((prev) => ({ ...prev, [category]: !prev[category] }));
  }, [audio]);

  // Stable altitude filter ref to avoid unnecessary re-renders
  const stableAltitudeFilter = useMemo(() => altitudeFilter, [
    altitudeFilter.cruise, altitudeFilter.high, altitudeFilter.mid,
    altitudeFilter.low, altitudeFilter.ground,
  ]);

  // Boot complete callback — starts ambient drone
  const handleBootComplete = useCallback(() => {
    audio.play('bootComplete');
    audio.startAmbient();
    setBooted(true);
  }, [audio]);

  // Splash screen
  if (!booted) {
    return <SplashScreen onComplete={handleBootComplete} audio={audio} />;
  }

  return (
    <div className="w-screen h-screen bg-wv-black overflow-hidden">
      {/* Ambient atmosphere orbs (CSS, replaces film grain) */}
      <FilmGrain opacity={0.06} />

      {/* Top navigation bar */}
      <TopNav
        onDrawerToggle={handleDrawerToggle}
        isDrawerOpen={isDrawerOpen}
        layers={{
          flights: layers.flights,
          satellites: layers.satellites,
          earthquakes: layers.earthquakes,
          cctv: layers.cctv,
          ships: layers.ships,
        }}
        onLayerToggle={handleLayerToggle}
        lang={lang}
        onLangChange={setLang}
        t={t}
        muted={audio.muted}
        onAudioToggle={audio.toggleMute}
        isMobile={isMobile}
      />
      {/* 3D Globe (fills entire viewport) */}
      <GlobeViewer
        shaderMode={shaderMode}
        mapTiles={mapTiles}
        onCameraChange={handleCameraChange}
        onTrackEntity={handleTrackEntity}
        onViewerReady={handleViewerReady}
        onCctvClick={handleCctvClickOnGlobe}
      >
        <EarthquakeLayer earthquakes={earthquakes} visible={layers.earthquakes} isTracking={!!trackedEntity} />
        <SatelliteLayer satellites={satellites} visible={layers.satellites} showPaths={showSatPaths} categoryFilter={satCategoryFilter} isTracking={!!trackedEntity} />
        <FlightLayer
          flights={flights}
          visible={layers.flights}
          showPaths={showPaths}
          altitudeFilter={stableAltitudeFilter}
          isTracking={!!trackedEntity}
        />
        <TrafficLayer
          roads={trafficRoads}
          vehicles={trafficVehicles}
          visible={layers.traffic}
          showRoads={true}
          showVehicles={false}
          congestionMode={true}
        />
        <CCTVLayer
          cameras={cctvCameras}
          visible={layers.cctv}
          selectedCameraId={selectedCameraId}
        />
        <ShipLayer
          ships={ships}
          visible={layers.ships}
          isTracking={!!trackedEntity}
        />
        <JordanLandmarksLayer visible={layers.landmarks} onLandmarkClick={handleLandmarkClick} lang={lang} />
        <BorderCrossingsLayer crossings={crossings} visible={layers.borderCrossings} lang={lang} onCrossingClick={handleCrossingClick} />
        <AirQualityLayer stations={aqStations} visible={layers.airQuality} />
        <WeatherLayer
          stations={weatherStations}
          visible={layers.weather}
          onStationClick={setSelectedWeatherStation}
        />
      </GlobeViewer>

      {/* Tactical UI Overlay */}
      <Crosshair />
      <TrackedEntityPanel
        trackedEntity={trackedEntity}
        isMobile={isMobile}
        onUnlock={() => handleTrackEntity(null)}
      />
      <OperationsPanel
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        shaderMode={shaderMode}
        onShaderChange={(mode) => { audio.play('shaderSwitch'); setShaderMode(mode); }}
        layers={layers}
        layerLoading={{ ships: shipsLoading, weather: weatherLoading }}
        onLayerToggle={handleLayerToggle}
        mapTiles={mapTiles}
        onMapTilesChange={(t) => { audio.play('click'); setMapTiles(t); }}
        showPaths={showPaths}
        onShowPathsToggle={() => { audio.play('click'); setShowPaths((p) => !p); }}
        altitudeFilter={altitudeFilter}
        onAltitudeToggle={handleAltitudeToggle}
        showSatPaths={showSatPaths}
        onShowSatPathsToggle={() => { audio.play('click'); setShowSatPaths((p) => !p); }}
        satCategoryFilter={satCategoryFilter}
        onSatCategoryToggle={handleSatCategoryToggle}
        onResetView={() => { audio.play('click'); handleResetView(); }}
        onLocateMe={() => { audio.play('click'); geoLocate(); }}
        geoStatus={geoStatus}
        isMobile={isMobile}
        lang={lang}
        t={t}
        onLangChange={setLang}
      />
      <IntelFeed items={allFeedItems} isMobile={isMobile} />
      <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      <LandmarkDetailPanel landmark={selectedLandmark} onClose={handleCloseLandmark} lang={lang} t={t} />
      <BorderDetailPanel crossing={selectedCrossing} onClose={() => setSelectedCrossing(null)} lang={lang} t={t} />
      <WeatherDetailPanel station={selectedWeatherStation} onClose={() => setSelectedWeatherStation(null)} lang={lang} />
      {layers.cctv && (
        <CCTVPanel
          cameras={cctvCameras}
          isLoading={cctvLoading}
          error={cctvError}
          totalOnline={cctvOnline}
          totalCameras={cctvTotal}
          availableCountries={cctvCountries}
          countryFilter={cctvCountryFilter}
          selectedCameraId={selectedCameraId}
          onCountryFilterChange={setCctvCountryFilter}
          onSelectCamera={handleSelectCamera}
          onFlyToCamera={handleFlyToCamera}
          isMobile={isMobile}
        />
      )}
      <StatusBar
        camera={camera}
        shaderMode={shaderMode}
        isMobile={isMobile}
        lang={lang}
        t={t}
        dataStatus={{
          flights: flights.length,
          satellites: satellites.length,
          earthquakes: earthquakes.length,
          cctv: cctvTotal,
          ships: ships.length,
          borderCrossings: crossings.length,
          airQuality: aqStations.length,
          weather: weatherStations.length,
        }}
      />
    </div>
  );
}

export default App;
