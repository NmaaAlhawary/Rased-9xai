# RASED — راصد
## Full Technical Documentation

> **Jordan Situational Awareness Platform**
> Real-time 3D geospatial intelligence dashboard built on CesiumJS

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [How to Run](#4-how-to-run)
5. [Environment Variables](#5-environment-variables)
6. [Architecture & Data Flow](#6-architecture--data-flow)
7. [Backend Proxy Server](#7-backend-proxy-server)
8. [Feature Documentation](#8-feature-documentation)
   - [3D Globe](#81-3d-globe)
   - [Post-Processing Shaders](#82-post-processing-shaders)
   - [Aviation Layer](#83-aviation-layer)
   - [Satellite Layer](#84-satellite-layer)
   - [Earthquake / Seismic Layer](#85-earthquake--seismic-layer)
   - [Road Traffic Layer](#86-road-traffic-layer)
   - [Maritime / AIS Layer](#87-maritime--ais-layer)
   - [CCTV / Surveillance Layer](#88-cctv--surveillance-layer)
   - [Border Crossings Layer](#89-border-crossings-layer)
   - [Air Quality Layer](#810-air-quality-layer)
   - [Jordan Landmarks Layer](#811-jordan-landmarks-layer)
   - [Entity Click & Lock-On](#812-entity-click--lock-on)
9. [UI Components](#9-ui-components)
   - [Top Navigation Bar](#91-top-navigation-bar)
   - [Control Panel (Drawer)](#92-control-panel-drawer)
   - [Intel Event Feed](#93-intel-event-feed)
   - [Status Bar](#94-status-bar)
   - [Tracking Panel](#95-tracking-panel)
   - [Landmark Detail Panel](#96-landmark-detail-panel)
   - [Border Detail Panel](#97-border-detail-panel)
   - [CCTV Panel](#98-cctv-panel)
   - [Splash Screen](#99-splash-screen)
   - [Ambient Orbs](#910-ambient-orbs)
10. [Hooks Reference](#10-hooks-reference)
11. [Internationalisation (i18n)](#11-internationalisation-i18n)
12. [Audio Engine](#12-audio-engine)
13. [State Management](#13-state-management)
14. [Performance Patterns](#14-performance-patterns)
15. [External API Reference](#15-external-api-reference)
16. [Caching Strategy](#16-caching-strategy)
17. [Known Limitations & Fallbacks](#17-known-limitations--fallbacks)

---

## 1. Project Overview

RASED (راصد — Arabic for "observer") is a browser-based situational awareness dashboard focused on the **Kingdom of Jordan**. It renders **live, real-time data** from multiple sources onto an interactive photorealistic 3D globe:

- ✈️ Live aircraft over Jordan and worldwide
- 🛰 Satellites in low Earth orbit with real orbital mechanics
- 🌋 Seismic activity along the Dead Sea Transform Fault
- 🚗 Road traffic on Amman's street network and Jordanian highways
- 📷 CCTV camera feeds from Jordan, London, and Austin
- ⚓ Maritime vessels in the Red Sea and Gulf of Aqaba
- 🛂 Jordan's official land border crossing statuses
- 💨 Air quality stations across Jordan's governorates
- 🏛 Curated Jordan landmarks and points of interest

The platform intentionally uses **civilian language** — no military jargon — and supports full **English / Arabic (RTL)** UI switching.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend framework** | React 19 + TypeScript |
| **Build tool** | Vite 7 |
| **3D globe** | CesiumJS 1.x (via Resium) |
| **Styling** | Tailwind CSS v4 (utility-first, `@theme` custom tokens) |
| **Fonts** | Sora (headings) · DM Sans (body) · DM Mono (data values) |
| **Backend** | Express 5 (Node.js, plain ESM, no TypeScript) |
| **Real-time** | WebSocket (ws library) |
| **Caching** | node-cache (in-memory, server-side) |
| **Orbital mechanics** | satellite.js (SGP4 propagation) |
| **Geospatial** | OpenStreetMap Overpass (roads), Haversine (distances) |

---

## 3. Repository Structure

```
rased/
├── index.html              # App entry — fonts, meta tags, theme colour
├── vite.config.ts          # Vite config — React plugin, Cesium, /api proxy
├── tsconfig.app.json       # Strict TypeScript for src/
├── tsconfig.node.json      # TypeScript for build scripts
├── package.json
├── .env                    # Client-side env vars (VITE_* prefix)
│
├── server/
│   ├── index.js            # Express backend — all API routes, WebSocket, caching
│   ├── .env                # Server secrets (OpenSky, NSW, etc.)
│   └── data/
│       ├── ammanRoads.js       # Static Amman city road geometries (15 arteries)
│       ├── jordanHighways.js   # Static Jordan national highway network
│       ├── jordanBorders.js    # Static Jordan border crossing data
│       └── jordanCameras.js    # Static Jordan CCTV camera locations
│
├── api/
│   └── index.js            # Vercel serverless function wrapper (production deploy)
│
└── src/
    ├── App.tsx             # Root component — all state, all hook calls, layout
    ├── main.tsx            # React entry point (ReactDOM.createRoot)
    ├── index.css           # Global CSS — colour tokens, animations, glassmorphism
    ├── vite-env.d.ts       # Vite type declarations
    │
    ├── components/
    │   ├── globe/
    │   │   ├── GlobeViewer.tsx        # CesiumJS Viewer — map tiles, shaders, camera
    │   │   └── EntityClickHandler.tsx # Click detection, entity lock-on, ESC to release
    │   ├── layers/
    │   │   ├── FlightLayer.tsx        # Aircraft BillboardCollection (imperative)
    │   │   ├── SatelliteLayer.tsx     # Satellite entities with SGP4 positions
    │   │   ├── EarthquakeLayer.tsx    # Pulsing seismic markers (Resium entities)
    │   │   ├── TrafficLayer.tsx       # Road polylines + animated vehicle particles
    │   │   ├── CCTVLayer.tsx          # Camera icon billboards (imperative)
    │   │   ├── ShipLayer.tsx          # AIS vessel billboards (imperative)
    │   │   ├── JordanLandmarksLayer.tsx # Landmark billboards with click handlers
    │   │   ├── BorderCrossingsLayer.tsx # Border crossing markers
    │   │   └── AirQualityLayer.tsx    # AQI station markers with colour coding
    │   └── ui/
    │       ├── TopNav.tsx             # Fixed top bar — hamburger, RASED brand, quick toggles
    │       ├── OperationsPanel.tsx    # Slide-in left drawer — all controls
    │       ├── StatusBar.tsx          # Bottom strip — coords, entity counts
    │       ├── IntelFeed.tsx          # Bottom-right floating event feed card
    │       ├── TrackedEntityPanel.tsx # Entity lock-on details
    │       ├── LandmarkDetailPanel.tsx # Landmark info overlay
    │       ├── BorderDetailPanel.tsx  # Border crossing details overlay
    │       ├── CCTVPanel.tsx          # Camera thumbnail grid
    │       ├── SplashScreen.tsx       # Boot animation with RASED wordmark
    │       ├── FilmGrain.tsx          # CSS ambient orbs (atmosphere effect)
    │       ├── Crosshair.tsx          # Gold arc centre reticle
    │       └── MobileModal.tsx        # Full-screen modal for mobile control panel
    │
    ├── hooks/
    │   ├── useFlights.ts       # Global flight data (20s poll)
    │   ├── useFlightsLive.ts   # Regional high-frequency flights (5s poll)
    │   ├── useSatellites.ts    # TLE fetch + SGP4 propagation
    │   ├── useEarthquakes.ts   # USGS earthquake polling
    │   ├── useTraffic.ts       # Road fetch + 60fps vehicle animation
    │   ├── useCameras.ts       # CCTV camera aggregation
    │   ├── useShips.ts         # AIS maritime data
    │   ├── useBorderCrossings.ts # Jordan border status
    │   ├── useAirQuality.ts    # OpenAQ air quality data
    │   ├── useGeolocation.ts   # Browser/IP geolocation
    │   ├── useIsMobile.ts      # Responsive breakpoint detection
    │   └── useAudio.ts         # Web Audio API ambient engine
    │
    ├── shaders/
    │   └── postprocess.ts      # GLSL shaders: CRT (Legacy), Infrared
    │
    ├── data/
    │   └── airports.ts         # IATA → lat/lon lookup for flight origins/destinations
    │
    ├── types/
    │   └── camera.ts           # CameraFeed, CameraSource, CameraMeta interfaces
    │
    └── i18n/
        └── translations.ts     # English + Arabic translation table
```

---

## 4. How to Run

### Development (both servers)

```bash
npm install         # Install all dependencies
npm run dev:all     # Starts backend (:3001) + Vite frontend (:5173) together
```

### Separately

```bash
npm run dev:server  # Only the Express backend (port 3001)
npm run dev         # Only the Vite dev server (port 5173)
```

### Production build

```bash
npm run build       # TypeScript check + Vite bundle → dist/
npm run preview     # Preview the production bundle locally
```

### Deploy to Vercel

The `api/index.js` file wraps the Express app as a Vercel serverless function. Push to the repo and Vercel auto-deploys. The `vercel.json` routes all `/api/*` requests to that function.

---

## 5. Environment Variables

### Client-side (`.env` in project root)

| Variable | Purpose | Required |
|---|---|---|
| `VITE_GOOGLE_API_KEY` | Google Maps 3D Photorealistic Tiles | Recommended |
| `VITE_CESIUM_ION_TOKEN` | Cesium Ion terrain / imagery services | Optional |

> If `VITE_GOOGLE_API_KEY` is missing or invalid, the globe automatically falls back to OpenStreetMap tiles.

### Server-side (`server/.env`)

| Variable | Purpose | Required |
|---|---|---|
| `OPENSKY_CLIENT_ID` | OpenSky Network OAuth2 client ID | Optional |
| `OPENSKY_CLIENT_SECRET` | OpenSky Network OAuth2 client secret | Optional |
| `NSW_TRANSPORT_API_KEY` | Transport for NSW CCTV API key | Optional |
| `ALLOWED_ORIGIN` | CORS origin whitelist for production | Optional |

All server variables are optional — the platform degrades gracefully when they are absent.

---

## 6. Architecture & Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                    Browser (React)                        │
│                                                           │
│  App.tsx ──► React Hooks (poll + transform)               │
│       │                                                   │
│       ├── GlobeViewer (CesiumJS render loop, 60 fps)     │
│       ├── Layer Components (imperative BillboardCollections)│
│       └── UI Panels (React DOM, event-driven)             │
│                                                           │
│  All external calls go to /api/* (proxied by Vite dev)   │
└─────────────────────────┬────────────────────────────────┘
                           │ HTTP /api/*
                           ▼
┌──────────────────────────────────────────────────────────┐
│              Express Backend (server/index.js)            │
│                                                           │
│  node-cache (in-memory)  ←──── cache all API responses   │
│                                                           │
│  Routes:                                                  │
│  GET /api/flights         → FlightRadar24 + adsb.fi       │
│  GET /api/flights/live    → adsb.fi regional bbox         │
│  GET /api/satellites      → tle.ivanstanojevic.me / CelesTrak│
│  GET /api/earthquakes     → USGS FDSN                     │
│  GET /api/traffic/roads   → Overpass API / static data    │
│  GET /api/cctv            → TfL + Austin + NSW + Jordan   │
│  GET /api/cctv/image      → image proxy (CORS bypass)     │
│  GET /api/ships           → AIS vessel data               │
│  GET /api/borders         → static Jordan border data     │
│  GET /api/airquality      → OpenAQ / static fallback      │
│  GET /api/geolocation     → ip-api.com                    │
│  WS  /ws                  → WebSocket (OpenSky real-time) │
└──────────────────────────────────────────────────────────┘
```

**Key principle:** The browser never touches external APIs directly. All credentials, rate-limiting, and caching are handled by the Express server. The React frontend only ever speaks to `/api/*`.

---

## 7. Backend Proxy Server

**File:** `server/index.js`

The backend has three responsibilities:

### 7.1 Credential hiding
API keys (OpenSky, NSW cameras) live in `server/.env` and never reach the browser.

### 7.2 Response caching
Every route uses `node-cache` with appropriate TTLs:

| Route | Cache TTL |
|---|---|
| Earthquakes | 5 minutes |
| Satellites (TLE) | 2 hours |
| Traffic roads | 24 hours |
| CCTV cameras | 5 minutes |
| Border crossings | 5 minutes |
| Air quality | 5 minutes |

### 7.3 Graceful failover
Every route has a fallback strategy. Example chain for traffic roads:
1. Check cache → serve if hit
2. Check if bbox overlaps Amman → serve static `ammanRoads.js` immediately
3. Check if bbox is anywhere in Jordan → serve `jordanHighways.js`
4. Try Overpass API (with 15s timeout, two server URLs)
5. Return empty array (no crash, no error to the user)

### 7.4 WebSocket (OpenSky)
A WebSocket server at `/ws` maintains a live connection to the OpenSky Network using OAuth2 client credentials. Aircraft updates within a configurable bounding box are pushed to subscribed clients in real time.

---

## 8. Feature Documentation

---

### 8.1 3D Globe

**Files:** `src/components/globe/GlobeViewer.tsx`

The globe is a CesiumJS `Viewer` instance wrapped by Resium's React bindings.

**Startup behaviour:**
- Default camera position: **Amman, Jordan** (31.95°N, 35.91°E) at 8,000 km altitude
- Default heading: 0° (North-up), pitch: −90° (looking straight down)

**Map tile modes:**

| Mode | Source | Notes |
|---|---|---|
| Google 3D Photorealistic | `googleapis.com` | Requires `VITE_GOOGLE_API_KEY`. Full 3D building mesh |
| OpenStreetMap | `tile.openstreetmap.org` | No key needed. Flat 2D map. Auto-fallback if Google fails |

**Camera tracking:**
`GlobeViewer` fires `onCameraChange(lat, lon, alt, heading, pitch)` on every camera move. `App.tsx` stores this in state and passes it to the StatusBar and to layer hooks that are viewport-aware (traffic, flights-live).

**Entity tracking:**
When an entity is selected, `viewer.trackedEntity` is set. CesiumJS's built-in follow-camera smoothly keeps the entity centred at 60 fps without any React re-renders.

**`ShaderManager` sub-component:**
Lives inside the Resium `<Viewer>` tree so it can access `useCesium()`. Safely removes the previously active `PostProcessStage` before adding a new one. Handles the case where the viewer was recreated (catches stale-stage exceptions).

---

### 8.2 Post-Processing Shaders

**File:** `src/shaders/postprocess.ts`

Full-screen GLSL fragment shaders applied as a CesiumJS `PostProcessStage`. They operate on the rendered scene texture (`colorTexture`) after all 3D geometry has been drawn.

#### Legacy (CRT)
Simulates a retro CRT monitor. Effects applied in order:
1. **Barrel distortion** — bends the corners of the image inward (screen curvature)
2. **Chromatic aberration (RGB shift)** — red/blue channels offset horizontally
3. **Scanlines** — horizontal dark lines at 800 lines/screen resolution
4. **Vignette** — bright centre, dark edges using `smoothstep`

#### Infrared (FLIR)
Simulates a thermal imaging camera:
1. **Luminance extraction** — converts RGB to greyscale brightness
2. **Contrast enhancement** — stretches the luminance range
3. **Sobel edge detection** — detects brightness gradients, highlights object outlines
4. **White-hot palette** — bright objects appear white, dark areas appear black

**Type definition:**
```typescript
export type ShaderMode = 'none' | 'crt' | 'flir';
```

---

### 8.3 Aviation Layer

**Hooks:** `src/hooks/useFlights.ts` (global) + `src/hooks/useFlightsLive.ts` (regional)
**Layer:** `src/components/layers/FlightLayer.tsx`

#### Dual data source strategy

| Hook | Endpoint | Poll interval | Coverage |
|---|---|---|---|
| `useFlights` | `/api/flights` | 20 seconds | Worldwide |
| `useFlightsLive` | `/api/flights/live` | 5 seconds | Regional bbox around camera |

Both datasets are merged in `App.tsx` and **deduplicated by ICAO24 hex code** — the live regional data wins for any aircraft that appears in both.

On-ground aircraft (altitude = 0, `onGround = true`) are filtered out before rendering.

#### Dead-reckoning (smooth movement)
`FlightLayer` uses a raw CesiumJS `BillboardCollection` rather than Resium React entities. Between 20-second data polls, each aircraft's position is **extrapolated every frame** using:
```
newLat = lastLat + (velocity × sin(headingRad) × Δt) / earthRadius
newLon = lastLon + (velocity × cos(headingRad) × Δt) / (earthRadius × cos(lat))
```
This gives fluid movement at 60 fps regardless of the data poll rate.

#### Altitude bands (filter)

| Band | Range | Colour |
|---|---|---|
| Cruise | ≥ 35,000 ft | Gold |
| High | 20,000–34,999 ft | Violet |
| Mid | 10,000–19,999 ft | Cyan |
| Low | 3,000–9,999 ft | Green |
| Ground | < 3,000 ft | Orange |

#### Error handling
Exponential backoff: 30s after first failure, doubling up to a 2-minute ceiling.

---

### 8.4 Satellite Layer

**Hook:** `src/hooks/useSatellites.ts`
**Layer:** `src/components/layers/SatelliteLayer.tsx`

#### How orbital mechanics work

1. **TLE fetch** — Two-Line Element sets are fetched from `/api/satellites` for two groups:
   - `stations` → ISS (ZARYA), Tiangong, CSS
   - `weather` → NOAA series, GOES, Meteosat

2. **Parsing** — The TLE text is split into triplets (name, line1, line2) and each converted to a `satrec` object using `satellite.js`'s `twoline2satrec()`.

3. **SGP4 propagation (every 2 seconds)** — For each satellite, `satellite.js`'s `propagate(satrec, date)` is called with the current UTC timestamp. This runs the SGP4 algorithm — a mathematical model of orbital mechanics accounting for Earth's oblateness, atmospheric drag, solar pressure, and lunar gravity.

4. **Coordinate conversion** — The resulting ECI (Earth-Centred Inertial) position vector is converted to geodetic lat/lon/altitude using `eciToGeodetic()` and `gstime()`.

5. **Orbit path preview (every 30 seconds)** — 90 future positions are computed at 1-minute intervals (= 90 minutes ahead = one full LEO orbit) to draw the projected ground track.

#### Cache behaviour
TLE data is refetched every **2 hours** (TLEs are valid for several days but accuracy degrades). The server caches TLE responses for 2 hours to avoid hammering the source APIs.

#### Fallback chain
- Primary: `tle.ivanstanojevic.me` API (JSON format, no auth)
- Fallback: CelesTrak `gp.php` endpoint (raw TLE text)

---

### 8.5 Earthquake / Seismic Layer

**Hook:** `src/hooks/useEarthquakes.ts`
**Layer:** `src/components/layers/EarthquakeLayer.tsx`

- Polls `/api/earthquakes` every **60 seconds**
- Backend queries USGS FDSN for all **M2.5+ events** within the bounding box covering the Dead Sea Transform Fault zone (27–39°N, 32–43°E), which is the primary seismic risk region for Jordan
- Results are fetched for the past **5 years** (500 event limit), ordered by most recent
- Cached server-side for 5 minutes

**Magnitude colour scale:**

| Magnitude | Colour |
|---|---|
| < 3.0 | Green |
| 3.0–4.9 | Yellow |
| 5.0–5.9 | Orange |
| ≥ 6.0 | Red |

Markers are rendered as pulsing Resium `Entity` billboards with an animated ring to draw attention to recent events. Clicking a marker shows magnitude, depth (km), location string, and UTC timestamp.

---

### 8.6 Road Traffic Layer

**Hook:** `src/hooks/useTraffic.ts`
**Layer:** `src/components/layers/TrafficLayer.tsx`

#### Data pipeline

1. `useTraffic` watches the camera position (latitude, longitude) rounded to ~1 km precision to avoid re-fetches on tiny pans.
2. When the bbox changes, a fetch is sent to `/api/traffic/roads?south=...&west=...&north=...&east=...` after an **800ms debounce** (prevents fetch spam during camera movement).
3. The server checks bbox overlap:
   - Overlaps Amman CBD → serves static `ammanRoads.js` (15 key city arteries)
   - Anywhere in Jordan → serves `jordanHighways.js` (national highway network)
   - Elsewhere → returns empty (no Overpass fallback currently active, kept for future)
4. Roads are drawn as a `PolylineCollection` with width and colour based on road class (motorway → primary → secondary → residential).

#### Vehicle animation
60 simulated vehicles are spawned per road segment. Each vehicle is a `PointPrimitive` in a `PointPrimitiveCollection`. The animation runs at **60 fps via `requestAnimationFrame`**:
- Each frame: advance each vehicle's `distanceAlongRoad` by `velocity × Δt`
- When a vehicle reaches the road end, it wraps back to the start
- React state is updated at **5 Hz** (every 200ms) to avoid re-render overhead

Road speed limits from the OSM `maxspeed` tag are used as vehicle velocities, with random variation per vehicle (±20%).

---

### 8.7 Maritime / AIS Layer

**Hook:** `src/hooks/useShips.ts`
**Layer:** `src/components/layers/ShipLayer.tsx`

- Polls `/api/ships` every **30 seconds**
- The server fetches AIS (Automatic Identification System) transponder data for the **Red Sea and Gulf of Aqaba** — Jordan's maritime domain centred on the Port of Aqaba

#### Ship type classification (AIS type code → category)

| AIS code | Category |
|---|---|
| 70–79 | Cargo |
| 80–89 | Tanker |
| 60–69 | Passenger |
| 30 | Fishing |
| 35 | Military |
| 31–32, 52 | Tug |
| 36–37 | Pleasure craft |
| 40–49 | High-speed vessel |
| Other | Unknown |

Each category has a distinct billboard icon and colour on the globe. Clicking a vessel shows: MMSI, vessel name, flag state, speed over ground (knots), course, heading, destination port, ship dimensions (length × width in metres), and navigational status (Under way / At anchor / Moored / etc.).

---

### 8.8 CCTV / Surveillance Layer

**Hook:** `src/hooks/useCameras.ts`
**Layer:** `src/components/layers/CCTVLayer.tsx`
**Panel:** `src/components/ui/CCTVPanel.tsx`

#### Camera sources

| Source | Country | Endpoint | Notes |
|---|---|---|---|
| Jordan static | JO | `server/data/jordanCameras.js` | Curated Jordanian surveillance points |
| TfL JamCam | GB | `api.tfl.gov.uk` | Transport for London CCTV network |
| Austin TrafficCam | US | `data.austintexas.gov` | Austin TX city traffic cameras |
| NSW Transport | AU | `api.transport.nsw.gov.au` | Requires `NSW_TRANSPORT_API_KEY` |

All sources are fetched in **parallel** using `Promise.allSettled()` — if one source fails, the rest still load. Results are aggregated and the country filter in the Control Panel hides/shows sources.

**Image proxy (`/api/cctv/image`):**
Camera JPEG URLs from external sources set restrictive CORS headers. The backend proxies the image bytes through to the browser, adding `Access-Control-Allow-Origin: *`, so thumbnails can be displayed in the CCTV Panel.

---

### 8.9 Border Crossings Layer

**Hook:** `src/hooks/useBorderCrossings.ts`
**Layer:** `src/components/layers/BorderCrossingsLayer.tsx`
**Panel:** `src/components/ui/BorderDetailPanel.tsx`

- Polls `/api/borders` every **5 minutes**
- Data comes from `server/data/jordanBorders.js` — a static dataset of all official Jordan border crossing points:
  - **Saudi Arabia** — Al-Omari, Al-Haditha
  - **Iraq** — Treibil / Karameh
  - **Syria** — Jaber / Nasib
  - **Israel / Palestine** — Sheikh Hussein, King Hussein / Allenby Bridge, Wadi Araba / Yitzhak Rabin

Each crossing has: bilingual names (English + Arabic), GPS coordinates, partner country, crossing type (land/sea/air), operating hours, current status (Open / Limited / Closed), estimated wait time, and throughput (High / Medium / Low).

The Intel Feed automatically surfaces alerts when crossings switch to Closed or Limited status.

---

### 8.10 Air Quality Layer

**Hook:** `src/hooks/useAirQuality.ts`
**Layer:** `src/components/layers/AirQualityLayer.tsx`

- Polls `/api/airquality` every **5 minutes**
- Backend queries **OpenAQ v3 API** for Jordan (`/locations?country=JO`)
- AQI is calculated from PM2.5 using simplified US EPA breakpoints:
  - 0–50 → Good (green)
  - 51–100 → Moderate (yellow)
  - 101–150 → Unhealthy for Sensitive Groups (orange)
  - 151+ → Unhealthy / Hazardous (red)
- If OpenAQ returns zero stations (common for Jordan's limited monitoring network), **8 static fallback stations** are served from the server:
  - Amman Downtown, Amman Sweifieh, Zarqa Industrial, Aqaba Port, Irbid City Centre, Mafraq, Russeifa Industrial, Dead Sea Highway

Per station, the following metrics are shown: PM2.5 (µg/m³), PM10 (µg/m³), NO₂ (µg/m³), and composite AQI.

---

### 8.11 Jordan Landmarks Layer

**Layer:** `src/components/layers/JordanLandmarksLayer.tsx`
**Panel:** `src/components/ui/LandmarkDetailPanel.tsx`

A hardcoded static dataset of curated Points of Interest in Jordan, including:
- **UNESCO World Heritage Sites** — Petra, Wadi Rum
- **Historic Sites** — Jerash (Gerasa), Amman Citadel, Karak Castle, Ajloun Castle
- **Natural Sites** — Dead Sea, Wadi Mujib, Dana Biosphere Reserve
- **Ports & Infrastructure** — Port of Aqaba, Queen Alia International Airport

Clicking a landmark:
1. Fires the camera to fly to that landmark's coordinates at 15,000 m altitude
2. Opens the Landmark Detail Panel with name, full description, category badge, and GPS coordinates

Closing the panel flies the camera back to the default Amman overview.

---

### 8.12 Entity Click & Lock-On

**File:** `src/components/globe/EntityClickHandler.tsx`

A CesiumJS `ScreenSpaceEventHandler` listens for `LEFT_CLICK` on the globe canvas. When an event fires:

1. `viewer.scene.pick(position)` finds what was clicked (if anything)
2. The entity's `id` and custom properties are read
3. `onTrackEntity(info: TrackedEntityInfo)` fires with:
   - `entityType`: `'flight' | 'satellite' | 'ship' | 'earthquake' | 'cctv' | 'landmark'`
   - `name`: display name
   - `position`: Cartesian3
   - Type-specific data (altitude, speed, magnitude, etc.)
4. `viewer.trackedEntity` is set → camera follows the entity

**Release lock-on:**
- Press **ESC** anywhere
- Click empty globe space (no entity under cursor)

Either action calls `onTrackEntity(null)`, which clears `viewer.trackedEntity` and dismisses the Tracking Panel.

---

## 9. UI Components

---

### 9.1 Top Navigation Bar

**File:** `src/components/ui/TopNav.tsx`
Height: 56px, fixed to top, `z-index: 50`, glassmorphism background.

**Left zone:**
- Hamburger (☰) / Close (✕) button — toggles the Control Panel drawer
- **RASED** wordmark in Sora font
- "Jordan Situational Awareness" subtitle (hidden on narrow screens)

**Centre zone — 5 quick-layer toggles:**

| Button | Layer | Active colour |
|---|---|---|
| ✈ | Aviation | Gold |
| 🛰 | Satellites | Violet |
| 🌋 | Seismic | Amber |
| 📷 | Surveillance | Rose |
| ⚓ | Maritime | Cyan |

Each toggle button shows a coloured dot indicator in the top-right corner when active.

**Right zone:**
- Live **AST clock** (Arabia Standard Time, UTC+3) — updates every second
- **EN / AR** language toggle — switches entire UI language and RTL/LTR layout
- **🔊 / 🔇** audio mute toggle

---

### 9.2 Control Panel (Drawer)

**File:** `src/components/ui/OperationsPanel.tsx`
Width: 288px, slides in from the left edge with a 280ms cubic-bezier transition.

**Desktop:** A slide-in drawer with a dark scrim backdrop over the globe.
**Mobile:** Opens as a full-screen `MobileModal` instead.

**Sections inside the panel:**

1. **View Mode** — Radio selector: Standard / Legacy (CRT) / Infrared
2. **Base Map** — Toggle: Google 3D / OpenStreetMap
3. **Data Layers** — On/off switches for all 9 layers with loading spinners
4. **Aviation Filters** (when flights on):
   - Show Routes toggle
   - Altitude band checkboxes (Cruise / High / Mid / Low / Near Ground)
5. **Satellite Filters** (when satellites on):
   - Show Orbit Paths toggle
   - Category checkboxes (Space Station ISS / Other Satellites)
6. **Surveillance Filters** (when CCTV on):
   - Country filter dropdown (All / Jordan / UK / USA / Australia)
7. **Action buttons:**
   - Locate Me (uses browser geolocation → fallback to IP geolocation)
   - Reset View (flies camera back to Amman, 2-second animation)

---

### 9.3 Intel Event Feed

**File:** `src/components/ui/IntelFeed.tsx`
Position: fixed bottom-right, 296px wide, floating card with `rounded-2xl` glassmorphism.

Displays a reverse-chronological list of notable events. Events are generated by data hooks whenever something meaningful changes (new aircraft count, earthquake detected, camera count updated, etc.).

**Event types and their colours:**

| Type | Dot colour | Examples |
|---|---|---|
| Aviation | Gold | "2,341 aircraft tracked worldwide" |
| Geology | Amber | "M4.2 — Dead Sea Transform Fault" |
| Orbit | Violet | "34 satellites tracked" |
| Camera | Rose | "142 cameras online" |
| Maritime | Teal | "18 vessels — Port of Aqaba" |
| System | Muted | "RASED v2.0 — platform online" |

The feed is capped at 30 items. On mobile it collapses to fit within a `MobileModal`.

---

### 9.4 Status Bar

**File:** `src/components/ui/StatusBar.tsx`
Height: 32px, fixed to the bottom edge, full width.

**Left side — camera position:**
```
↔  31.95°N  ·  35.91°E  |  alt  1,500 km  |  hdg  0°
```

**Right side — entity count pills:**
Each pill shows a label and count. If count > 0, it has a subtle highlight background and coloured number. On mobile, a simplified version shows only coordinates and altitude.

---

### 9.5 Tracking Panel

**File:** `src/components/ui/TrackedEntityPanel.tsx`
Position: fixed, centred horizontally near the top, `z-index: 45`.

Appears when an entity is locked. Shows:
- **Entity type badge** (Satellite / Aircraft / Vessel / Seismic / Camera / Target)
- **Entity name** in large text
- **Type-specific fields**: altitude, speed, heading, magnitude, depth, etc.
- **Gold "Tracking" ring** — pulsing `animate-ping` indicator
- **Release instruction**: "Press ESC or click map to release"

---

### 9.6 Landmark Detail Panel

**File:** `src/components/ui/LandmarkDetailPanel.tsx`

A centred floating card with indigo glassmorphism background (`rgba(10,8,32,0.88)`). Shows:
- Large emoji icon
- Landmark name
- Category badge (UNESCO / Historic Site / Natural Site / etc.)
- Full description text
- GPS coordinates

Dismissed by pressing ESC, clicking the globe, or the close button. Closing triggers a camera fly-back to Amman.

---

### 9.7 Border Detail Panel

**File:** `src/components/ui/BorderDetailPanel.tsx`

Opens when a border crossing marker is clicked. Shows:
- Crossing name (English + Arabic)
- Partner country
- Crossing type (land / sea / air)
- Status badge (Open → green / Limited → amber / Closed → red)
- Estimated wait time
- Operating hours
- Throughput level (High / Medium / Low)

---

### 9.8 CCTV Panel

**File:** `src/components/ui/CCTVPanel.tsx`

A thumbnail grid that opens when a camera marker is clicked (or from the Tracking Panel). Displays camera snapshots fetched via `/api/cctv/image` (the backend proxy handles CORS). Each tile shows the camera name, region/country, and a live JPEG thumbnail. Clicking a tile expands it to a larger preview.

---

### 9.9 Splash Screen

**File:** `src/components/ui/SplashScreen.tsx`

The boot animation shown on first load:

1. **Background** — Three CSS ambient orbs (same as the main app)
2. **RASED wordmark** — Sora font, 3.5rem, letter-spacing 0.2em, gold beam sweep animation
3. **Tagline** — "Jordan Situational Awareness" fades in beneath
4. **Loading indicator** — Three pulsing gold dots while data initialises
5. **Entry prompt** — "Press any key to enter" fades in when ready

The splash dismisses on any keypress or pointer click.

---

### 9.10 Ambient Orbs

**File:** `src/components/ui/FilmGrain.tsx` (renamed internally as AmbientOrbs)

Three `position: fixed; z-index: 0` divs placed behind the globe, each styled with a large `radial-gradient` in the platform's colour palette (indigo / violet / gold). Three CSS `@keyframes` animations (`orb-drift-1/2/3`) slowly move each orb independently, creating a living, breathing cosmic atmosphere behind the globe.

No canvas, no JavaScript, no `requestAnimationFrame` — pure CSS.

---

## 10. Hooks Reference

| Hook | What it does | Poll interval |
|---|---|---|
| `useFlights` | Global aircraft positions from backend | 20 s |
| `useFlightsLive` | Regional aircraft (camera bbox) | 5 s |
| `useSatellites` | TLE fetch + SGP4 propagation pipeline | TLE: 2 hr / Position: 2 s |
| `useEarthquakes` | USGS regional seismic events | 60 s |
| `useTraffic` | Road geometries + client-side vehicle animation | On camera move (800ms debounce) |
| `useCameras` | Aggregated CCTV feeds from 4 sources | 5 min |
| `useShips` | AIS maritime vessels | 30 s |
| `useBorderCrossings` | Jordan border crossing statuses | 5 min |
| `useAirQuality` | OpenAQ stations / static fallback | 5 min |
| `useGeolocation` | Browser geolocation → IP fallback | On demand |
| `useIsMobile` | Window resize → `< 768px` breakpoint | On resize |
| `useAudio` | Web Audio API ambient tone | Continuous |

All data hooks:
- Accept an `enabled: boolean` and return empty state immediately when false
- Clear their state when disabled (no stale data shown)
- Use exponential backoff on consecutive errors

---

## 11. Internationalisation (i18n)

**File:** `src/i18n/translations.ts`

A single `translations` object keyed by `'en' | 'ar'` contains every UI string in both languages. The active language is a `useState<Lang>` in `App.tsx`. Switching language:

1. Updates `document.documentElement.lang` attribute
2. Sets `document.documentElement.dir = 'rtl'` for Arabic (full RTL layout)
3. Passes the `t` (translations object) down to every component that needs it

All Arabic strings are written right-to-left compatible. Altitude values in the Arabic UI use feet with Arabic digit notation.

---

## 12. Audio Engine

**Hook:** `src/hooks/useAudio.ts`
**Library:** `src/lib/audio.ts`

Uses the browser **Web Audio API** to generate a continuous low-frequency ambient tone. Gives the platform an active, "live monitoring" feel.
- Toggleable via the speaker button in the TopNav
- Muted state persists for the session
- Gracefully handles browsers that block autoplay (waits for first user interaction)

---

## 13. State Management

All state lives in `App.tsx` — no Redux, no Zustand. The state is:

```typescript
// UI state
booted: boolean                          // Splash screen dismissed
isDrawerOpen: boolean                    // Control Panel slide-in
lang: 'en' | 'ar'                        // Active language

// Globe state
shaderMode: 'none' | 'crt' | 'flir'     // Post-processing shader
mapTiles: 'google' | 'osm'              // Base map type
camera: { latitude, longitude, altitude, heading, pitch }

// Layer visibility (9 booleans)
layers: { flights, satellites, earthquakes, traffic, cctv, ships, landmarks, borderCrossings, airQuality }

// Sub-filters
altitudeFilter: Record<AltitudeBand, boolean>
satCategoryFilter: Record<SatelliteCategory, boolean>
showPaths: boolean
showSatPaths: boolean
cctvCountryFilter: string

// Selected entities
trackedEntity: TrackedEntityInfo | null
selectedLandmark: LandmarkData | null
selectedCrossing: BorderCrossing | null
selectedCameraId: string | null
```

State is passed as explicit props ("prop drilling"). This is intentional — the component tree is shallow enough that prop drilling is clearer than a global store.

---

## 14. Performance Patterns

### Imperative Cesium rendering
`FlightLayer`, `CCTVLayer`, `ShipLayer`, and `TrafficLayer` bypass Resium's React bindings. They hold a `useRef` to raw Cesium `BillboardCollection / PolylineCollection / PointPrimitiveCollection` and mutate them imperatively in `useEffect`. This avoids React's reconciler overhead and allows rendering 27,000+ entities at 60 fps.

### Dead-reckoning
Aircraft positions are extrapolated every frame using heading + velocity. Users see smooth movement even with a 20-second data refresh cycle.

### `useCallback` / `useMemo` everywhere
All callbacks in `App.tsx` are wrapped in `useCallback`. All expensive computations (flight merge, satellite propagation) are memoised. This prevents unnecessary re-renders in the Cesium render loop.

### Viewport-aware fetching
`useFlightsLive` and `useTraffic` only fetch data for the region visible on screen. At high altitude the traffic layer is skipped entirely.

### Debouncing
Road fetches use an 800ms debounce on camera position changes. This means a rapid pan or zoom triggers only one HTTP request, not dozens.

---

## 15. External API Reference

| API | URL | Auth | RASED usage |
|---|---|---|---|
| FlightRadar24 | `data-cloud.flightradar24.com` | None (scrape) | Global aircraft positions |
| adsb.fi | `opendata.adsb.fi` | None | Regional high-freq aircraft |
| OpenSky Network | `opensky-network.org` | OAuth2 client credentials | WebSocket real-time aircraft |
| USGS FDSN | `earthquake.usgs.gov` | None | Seismic events |
| tle.ivanstanojevic.me | `tle.ivanstanojevic.me/api/tle` | None | Satellite TLE data (primary) |
| CelesTrak | `celestrak.org` | None | Satellite TLE data (fallback) |
| OSM Overpass | `overpass-api.de` | None | Road network geometries |
| OpenAQ | `api.openaq.io/v3` | None | Air quality stations |
| ip-api.com | `ip-api.com/json` | None | IP geolocation fallback |
| TfL JamCam | `api.tfl.gov.uk` | None | London CCTV cameras |
| Austin Open Data | `data.austintexas.gov` | None | Austin TX traffic cameras |
| NSW Transport | `api.transport.nsw.gov.au` | API key | NSW Australia cameras |
| Google Maps | `googleapis.com` | API key | 3D Photorealistic Tiles |

---

## 16. Caching Strategy

All caching is **server-side in-memory** using `node-cache`. There is no browser-side caching layer. Cache keys are deterministic strings (e.g. `"traffic-roads:31.95,35.91,32.05,36.00"`).

On cache hit, the response is served immediately with no external API call. On cache miss, the external API is called, the result is stored, and the TTL timer starts.

The cache is **lost on server restart** — this is acceptable since all data is live and would need refreshing anyway.

---

## 17. Known Limitations & Fallbacks

| Situation | Behaviour |
|---|---|
| `VITE_GOOGLE_API_KEY` missing/invalid | Globe automatically switches to OpenStreetMap |
| FlightRadar24 rate-limited or blocked | Degrades to adsb.fi regional data only |
| OpenSky credentials missing | WebSocket mode disabled; polling only |
| CelesTrak blocked | Falls back to `tle.ivanstanojevic.me` (or vice-versa) |
| Overpass API timeout (15s) | Serves static Jordan road data |
| OpenAQ returns empty data | Serves 8 representative static Jordan stations |
| NSW API key missing | NSW camera source silently skipped |
| Server not running | All `/api/*` calls fail; globe and landmark layer still work |
| Browser blocks autoplay audio | Audio engine waits for first user interaction |
| Mobile screen (< 768px) | Control Panel drawer replaced by full-screen modal |

---

*Documentation generated: March 2026 — RASED v2.0*
