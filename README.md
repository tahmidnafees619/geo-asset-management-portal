# Municipal Asset & Infrastructure Management Portal

An enterprise-grade Web GIS console for managing municipal infrastructure — buildings, utility networks, roadways, and field incidents — built as a single-page Next.js application with a live Leaflet map engine, dual coordinate reprojection, spatial analysis tools, and a BGT/BAG-style asset data model.

> Portfolio / demonstration project. All spatial data is mock data seeded in [`app/lib/data/`](app/lib/data); there is no backend — every feature runs client-side in the browser.

---

## 1. Architecture Overview

The app is a single Next.js App Router route (`app/page.tsx`) that owns all application state and composes a set of focused, single-responsibility components around a client-only Leaflet map. There is no server state, no database, and no API layer — `page.tsx` is the single source of truth, and every panel below it is a controlled view over that state.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              app/page.tsx                                 │
│         (single source of truth — all React state lives here)            │
│                                                                            │
│  state: buildings · utilities · incidents · selection · basemap ·        │
│         layerOpacity · reportMode · measureMode · bufferCenter · …       │
└───────────────┬─────────────────────────────────┬────────────────────────┘
                │                                   │
     ┌──────────▼──────────┐             ┌──────────▼───────────┐
     │   app/components/    │             │  app/lib/ (pure fns)  │
     │  ─────────────────   │             │  ────────────────    │
     │  Header               │◄───props──►│  geo.ts (haversine,  │
     │  Sidebar               │            │   nearby-asset scan) │
     │  MapCanvas (dynamic,   │            │  measurement.ts      │
     │   ssr:false)           │            │   (distance/area)    │
     │  FeatureDrawer         │            │  projections.ts      │
     │  IncidentModal         │            │   (proj4 reprojection)│
     │  CommandPalette        │            │  search.ts           │
     │  ExportModal           │            │  notifications.ts    │
     │  SettingsPanel         │            │  export.ts           │
     │  HealthHud             │            │  basemaps.ts         │
     │  MeasurementPanel      │            │  mapStyles.tsx       │
     └───────────┬────────────┘            │  data/               │
                 │                          │   infrastructure.ts  │
        renders  ▼                          │   incidents.ts       │
     ┌────────────────────────┐            └───────────────────────┘
     │   Leaflet map engine    │
     │  (react-leaflet, client) │
     │  ───────────────────    │
     │  TileLayer (basemap)     │
     │  GeoJSON: buildings,     │
     │   utilities, roads       │
     │  Marker: incidents       │
     │  Circle: 300m buffer     │
     │  Polyline/Polygon:       │
     │   measure-tool sketch    │
     └──────────────────────────┘
```

**Data flow in one sentence:** a user action (click a building, drag an opacity slider, submit an incident) calls a handler in `page.tsx`, which updates state; that state re-renders as props into `MapCanvas` and the surrounding panels, which redraw the affected Leaflet layer.

---

## 2. Feature Highlights

### Municipal-grade spatial data model (BGT/BAG-inspired)
Every feature — buildings, utility points, and road segments — carries a `bgt_classification` field mirroring the Dutch **BGT** (*Basisregistratie Grootschalige Topografie*) / **BAG** topography standard used by municipal GIS platforms like HawarIT:

| Layer      | `bgt_classification` | Meaning                          |
| ---------- | --------------------- | --------------------------------- |
| Buildings  | `Pand`                 | Building/parcel footprint         |
| Roads      | `Wegvak`               | Road segment                      |
| Utilities  | `KabelEnLeiding`       | Cable & pipeline network asset    |

Each feature also carries a `cad_ref_id`, `inspected_date`, and `maintenance_priority`, so the dataset reads like a real municipal CAD/GIS export rather than a demo.

### Live dual coordinate reprojection (EPSG:4326 ↔ EPSG:3857)
The status bar tracks the cursor in real time and reprojects it through [`proj4`](https://github.com/proj4js/proj4js) simultaneously in:
- **WGS84** (`EPSG:4326`) — `[Lng, Lat]`, 5-decimal precision
- **Web Mercator** (`EPSG:3857`) — meters

See [`app/lib/projections.ts`](app/lib/projections.ts).

### 300m Haversine spatial buffer engine
The Feature Inspector Drawer and the Incident Reporter both expose a **"Run Proximity Buffer (300m)"** action. It draws a translucent 300m ring around the selected feature and lists every other building, utility, or incident that falls inside it — ranked by distance — computed with the haversine great-circle formula (no external geometry library). See [`app/lib/geo.ts`](app/lib/geo.ts).

### Shoelace polygon area + polyline distance measurement
The **Measure** tool lets you click points on the live map to get a running distance (m/km) via chained haversine segments, and — once you've placed 3+ points — an enclosed area (m²/km²) via an equirectangular projection + the shoelace formula. See [`app/lib/measurement.ts`](app/lib/measurement.ts).

### Global Command-K spatial search
Press **⌘K / Ctrl+K** (or click the header search field) to fuzzy-search every building, utility, and road by name, ID, or category, and `flyTo` directly to it on the map. See [`app/lib/search.ts`](app/lib/search.ts) and [`app/components/CommandPalette.tsx`](app/components/CommandPalette.tsx).

### Esri Dark Canvas basemap + live switcher
Defaults to Esri's key-free **World Dark Base** canvas for a low-glare operations-console look, with a Settings panel to switch to Esri Satellite Imagery or standard OpenStreetMap at runtime — no API keys required. See [`app/lib/basemaps.ts`](app/lib/basemaps.ts).

### Client-side GeoJSON / CSV data exporter
The Export panel lets you pick any combination of layers (buildings, utilities, roads, incidents) and download them as valid `.geojson` or flattened `.csv` files — generated entirely in the browser via `Blob` + `URL.createObjectURL`, no server round-trip. See [`app/lib/export.ts`](app/lib/export.ts).

### Also included
- Editable **Feature Inspector Drawer** — update a building's condition or a utility's status and watch the map re-style live.
- **Incident Reporter** — crosshair-cursor click-to-report workflow with category/priority triage.
- **Alert Center** — live-derived notifications (critical buildings, maintenance utilities, high-priority incidents) with jump-to-location.
- **Asset Health HUD** — a floating executive widget summarizing condition mix and open incidents.
- Per-layer **opacity controls**, dark-glass UI with glow accents, and animated modals/drawers throughout.

---

## 3. Tech Stack

| Layer            | Technology                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| Framework          | [Next.js 16](https://nextjs.org) (App Router, Turbopack, React 19)         |
| Mapping engine      | [Leaflet](https://leafletjs.com) + [react-leaflet](https://react-leaflet.js.org) |
| Geodesy / projection | [proj4](https://github.com/proj4js/proj4js) (EPSG:4326 ↔ EPSG:3857)         |
| Styling             | [Tailwind CSS v4](https://tailwindcss.com)                                   |
| Icons               | [lucide-react](https://lucide.dev)                                          |
| Language            | TypeScript (strict mode)                                                    |
| Linting             | ESLint (`eslint-config-next`)                                               |

No backend, no database, no external API keys — the entire app runs client-side against mock data and public, key-free basemap tile services.

---

## 4. Local Setup & Execution

**Prerequisites:** Node.js 20+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Run the development server (Turbopack)
npm run dev
# → open http://localhost:3000

# 3. Type-check the project
npx tsc --noEmit

# 4. Lint the project
npm run lint

# 5. Build for production
npm run build

# 6. Run the production build locally
npm run start
```

---

## 5. Project Structure

```
app/
├── page.tsx                 # Single source of truth — all app state + composition root
├── layout.tsx                # Root layout, fonts, Leaflet CSS import
├── globals.css                # Tailwind theme, dark-slate/emerald palette, Leaflet overrides
├── components/
│   ├── MapCanvas.tsx           # Leaflet map engine (dynamically imported, ssr:false)
│   ├── Header.tsx               # Toolbar: search, report incident, measure, export, alerts, settings
│   ├── Sidebar.tsx               # Layer visibility toggles
│   ├── FeatureDrawer.tsx          # Feature Inspector — metadata, live edits, proximity buffer
│   ├── IncidentModal.tsx           # Incident report form + buffer preview
│   ├── CommandPalette.tsx           # ⌘K spatial search
│   ├── ExportModal.tsx               # GeoJSON/CSV exporter
│   ├── SettingsPanel.tsx              # Basemap switcher + layer opacity
│   ├── HealthHud.tsx                   # Asset health summary widget
│   ├── MeasurementPanel.tsx             # Live distance/area readout
│   └── StatusBar.tsx                     # Live WGS84 / Web Mercator coordinate readout
└── lib/
    ├── data/
    │   ├── infrastructure.ts       # Mock buildings/utilities/roads (BGT-classified)
    │   └── incidents.ts             # Incident types
    ├── geo.ts                        # Haversine distance + proximity buffer search
    ├── measurement.ts                 # Shoelace area + path distance
    ├── projections.ts                  # proj4 EPSG:4326 ↔ EPSG:3857
    ├── search.ts                        # Command palette search index
    ├── notifications.ts                  # Derived alert-center feed
    ├── export.ts                          # GeoJSON/CSV download helpers
    ├── basemaps.ts                         # Basemap tile provider configs
    ├── mapStyles.tsx                        # Condition/status/priority → color + icon mapping
    └── selection.ts                          # Selected-feature discriminated union
```

This follows Next.js App Router conventions: `app/` holds routes and layouts, colocated `components/` and `lib/` directories keep UI and pure logic separate, and the only client/server boundary in the app is the `{ ssr: false }` dynamic import around `MapCanvas` (Leaflet requires `window` at import time, which doesn't exist during server-side rendering).

---

## License

[MIT](LICENSE) © 2026 Tahmid Nafees

See [SECURITY.md](SECURITY.md) for the vulnerability disclosure policy.
