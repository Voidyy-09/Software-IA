# Master Build Specification: Enterprise Disaster Response & Dynamic Rerouting System

> **Target Audience**: AI Coding Assistant (Cursor, Claude 3.5 Sonnet, Windsurf, Copilot)  
> **Project Goal**: Build a full-stack, enterprise-grade, high-fidelity web application for disaster rescue optimization, dispatching, and infrastructure-failure dynamic rerouting based on the K. J. Somaiya College of Engineering SRS.

---

## 1. Executive System Overview & Mission Goals

The **Disaster Response Route Optimization System** is a mission-critical emergency command application designed to operate during severe infrastructure failures (floods, landslides, earthquakes, wall collapses) during the **Golden Hour**.

Unlike standard consumer GPS engines (e.g., Google Maps, Waze) that calculate routes purely on short-path algorithms:
1. **Constraint-Aware Fleet Matching**: Matches emergency incidents with rescue units based on physical and operational constraints (e.g., water clearance depth, winch equipment, vehicle weight capacity, terrain capability).
2. **AI Satellite Hazard Detection**: Simulates satellite imagery processing to auto-detect flooded segments, structural damage, and debris blockages with confidence scores.
3. **Dynamic Infrastructure Rerouting**: Reacts in real time when a road segment transitions to `CLOSED` or `FLOODED`, automatically triggering route recalculation and pushing WebSocket alerts to field units.

---

## 2. Full Tech Stack & Directory Architecture

### 2.1 Tech Stack
* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, Lucide Icons, Framer Motion (animations), Recharts (data analytics).
* **GIS Engine**: Leaflet / React-Leaflet with OpenStreetMap or CartoDB Dark Matter tiles (Custom SVG vehicle markers, hazard circles, animated route polylines).
* **Frontend State Management**: Zustand (Global active incident, selected vehicle, spatial filters, real-time socket connections).
* **Backend**: Node.js, Express, TypeScript, Prisma ORM, SQLite / PostgreSQL.
* **Real-time Communication**: `ws` or `socket.io` for live GPS telemetry, instant rerouting notifications, and hazard updates.

### 2.2 Project Directory Tree
```text
disaster-response-system/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── prisma/
│   └── schema.prisma
├── src/
│   ├── client/                          # FRONTEND ARCHITECTURE
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── ui/                      # Shadcn UI primitives (Button, Card, Dialog, Badge, Tabs, Table)
│   │   │   ├── layout/                  # CommandHeader, Sidebar, NavigationTabs, NotificationBanner
│   │   │   ├── map/                     # GIS Map Container, HazardOverlays, VehicleMarkers, RoutePolyline
│   │   │   ├── dispatch/                # DispatchModal, ConstraintChecker, VehicleSelector
│   │   │   ├── satellite/               # SatelliteWorkbench, ConfidenceSlider, DetectionOverlay
│   │   │   ├── fleet/                   # FleetTable, VehicleTelemetryCard, CapacityProgress
│   │   │   ├── incidents/               # IncidentQueue, IncidentPriorityBadge, IncidentFilter
│   │   │   └── analytics/               # ResponseTimeChart, RouteFailureBarChart, MissionHistory
│   │   ├── hooks/                       # useWebSocket, useMapBounds, useFleetTelemetry
│   │   ├── store/                       # useEmergencyStore.ts (Zustand state)
│   │   ├── types/                       # Shared TypeScript interfaces
│   │   └── utils/                       # Route math, spatial calculators, date formatters
│   └── server/                          # BACKEND ARCHITECTURE
│       ├── index.ts
│       ├── config.ts
│       ├── routes/                      # API Endpoints
│       │   ├── incidents.ts
│       │   ├── vehicles.ts
│       │   ├── roads.ts
│       │   ├── satellite.ts
│       │   └── routes.ts
│       ├── services/                    # Core Logic Engines
│       │   ├── routingEngine.ts         # Dijkstra/A* routing with road status penalties
│       │   ├── satelliteAiService.ts    # Mock AI satellite image scanner
│       │   └── websocketService.ts      # Real-time event broadcaster
│       └── db/                          # Prisma Client setup & seeds
│           └── seed.ts
```

---

## 3. Detailed UI/UX Component Specifications

The interface must strictly adhere to a **Tactical Command Dark Mode UI** (`#0f172a` Slate background, `#1e293b` cards, glowing status borders, high contrast accents for hazards).

```
+---------------------------------------------------------------------------------------------------+
| 🛰️ DISASTER COMMAND CONSOLE - KURLA / VIDYAVIHAR MONSOON FLOODING ZONE   | Golden Hour: 00:42:15  |
+---------------------------------------------------------------------------------------------------+
| [ 📍 Map Command ]  [ 📡 AI Satellite Scanner ]  [ 🚑 Fleet Telemetry ]  [ 📜 Analytics & Logs ]   |
+------------------------------------+--------------------------------------------------------------+
| INCIDENT QUEUE                     | GIS MAP COMMAND CENTER                                       |
| - [CRITICAL] Mithi River Overflow  | +----------------------------------------------------------+ |
|   Trapped: 14 | Flood: 850mm       | |  [Leaflet Interactive Map]                               | |
| - [HIGH] Wall Collapse Ghatkopar   | |  - Red Polylines: Flooded LBS Marg                       | |
| - [MED] Somaiya Campus Rescue      | |  - Green Polylines: EE Highway Clear                     | |
|                                    | |  - Pulsing Markers: Rescue Vehicles & Hazards            | |
| ACTIVE DISPATCH PANEL              | +----------------------------------------------------------+ |
| Unit: NDRF Amphibious 01           | ROAD SEGMENT CONTROL OVERRIDE                                |
| Constraint Check: 🟢 PASSED        | [ Toggle LBS Marg Flood Status ] -> [ Dynamic Recalculate ]  |
+------------------------------------+--------------------------------------------------------------+
```

### 3.1 Primary Navigation Views

#### Tab 1: 📍 Live Incident & Map Command Center
* **Interactive GIS Canvas**:
  * Centered on Mumbai Vidyavihar/Kurla region (`19.0732, 72.8997`).
  * **Map Overlays**:
    * **Road State Polylines**: Green (`OPEN`), Red (`CLOSED`/`FLOODED`), Amber (`RESTRICTED`).
    * **Hazard Polygonal Zones**: Translucent red circles/polygons showing flooded areas (e.g., Mithi River basin).
    * **Vehicle Markers**: Pulsing SVG icons representing vehicles (Amphibious Truck, Boat Squad, 4x4 Ambulance, Helicopter).
    * **Incident Markers**: Flashing priority badges (Red = Critical, Amber = High, Blue = Medium).
* **Interactive Actions**:
  * Clicking an incident opens the **Constraint-Aware Dispatch Drawer**.
  * Clicking a road segment opens a quick modal to toggle status (`OPEN` $\leftrightarrow$ `FLOODED`) to test real-time dynamic rerouting.

#### Tab 2: 📡 AI Satellite Hazard Detector Workbench
* Dual-pane visual inspection tool:
  * **Left Pane**: Interactive image canvas simulating raw satellite input (Optical / SAR imagery) with sliders for flood depth thresholding and AI detection confidence thresholding ($0\% - 100\%$).
  * **Right Pane**: Detections breakdown list showing identified hazard zones, estimated flood depths in mm, affected road segment IDs, and an **"Apply Detections to Live Map"** button.

#### Tab 3: 🚑 Fleet Telemetry & Capability Manager
* Table and card view of all agency assets.
* Live telemetric attributes for each unit:
  * Fuel / Battery Level % bar
  * Current status (`AVAILABLE`, `DISPATCHED`, `IN_TRANSIT`, `MAINTENANCE`)
  * Hard operational limits: Max Water Clearance Depth ($\text{mm}$), Weight Limit ($\text{kg}$), Height Limit ($\text{m}$), Winch equipped ($\text{boolean}$).

#### Tab 4: 📜 Mission Analytics & Historical Logs
* Response metrics breakdown using Recharts:
  * Average Response Time trend during Golden Hour.
  * Successful dispatches vs Infrastructure Route Failures (rerouted count).
  * Filterable logs table of all historic assignments and dynamic reroute triggers.

---

## 4. Full Database Schema (Prisma Format)

Create `prisma/schema.prisma` with the exact SRS data model:

```prisma
datasource db {
  provider = "sqlite" // or "postgresql"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  DISPATCHER
  MANAGER
  ADMIN
}

enum RoadStatus {
  OPEN
  CLOSED_FLOODING
  CLOSED_DAMAGE
  RESTRICTED
}

enum RoadClassification {
  HIGHWAY
  ARTERIAL
  LOCAL
}

enum PriorityLevel {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum IncidentStatus {
  NEW
  VERIFIED
  IN_PROGRESS
  RESOLVED
}

enum VehicleStatus {
  AVAILABLE
  DISPATCHED
  EN_ROUTE
  OFFLINE
}

model Agency {
  id                   Int       @id @default(autoincrement())
  name                 String
  contactInfo          String
  jurisdictionBoundary String    // GeoJSON Polygon
  users                User[]
  vehicles             Vehicle[]
}

model User {
  id           Int      @id @default(autoincrement())
  agencyId     Int
  agency       Agency   @relation(fields: [agencyId], references: [id])
  username     String   @unique
  passwordHash String
  role         Role     @default(DISPATCHER)
}

model RoadSegment {
  id             Int                @id @default(autoincrement())
  name           String
  classification RoadClassification
  geometry       String             // GeoJSON LineString
  defaultSpeedKmh Float
  maxWeightKg    Float
  maxHeightM     Float
  isOneWay       Boolean            @default(false)
  roadStates     RoadState[]
}

model RoadState {
  id              Int        @id @default(autoincrement())
  segmentId       Int
  segment         RoadSegment @relation(fields: [segmentId], references: [id])
  status          RoadStatus @default(OPEN)
  currentSpeedKmh Float
  restrictionNotes String?
  floodDepthMm    Float      @default(0.0)
  lastUpdated     DateTime   @updatedAt
  updatedBySource String     // "SATELLITE_AI", "DISPATCHER_MANUAL", "TELEMETRY"
}

model HazardArea {
  id            Int      @id @default(autoincrement())
  type          String   // FLOOD, LANDSLIDE, COLLAPSE
  severityIndex Float    // 1.0 to 10.0
  geometry      String   // GeoJSON Polygon or Circle
  timestamp     DateTime @default(now())
}

model IncidentReport {
  id               Int            @id @default(autoincrement())
  reportedLocation String         // GeoJSON Point
  type             String         // MEDICAL, TRAPPED, EVACUATION
  description      String
  priority         PriorityLevel  @default(HIGH)
  status           IncidentStatus @default(NEW)
  timestamp        DateTime       @default(now())
  missions         MissionAssignment[]
}

model Vehicle {
  id                Int                 @id @default(autoincrement())
  agencyId          Int
  agency            Agency              @relation(fields: [agencyId], references: [id])
  callSign          String
  type              String              // AMPHIBIOUS_TRUCK, BOAT, 4X4_AMBULANCE, HELICOPTER
  status            VehicleStatus       @default(AVAILABLE)
  defaultAssetLocation String           // GeoJSON Point
  maxWeightKg       Float
  maxWaterDepthMm   Float               @default(300)
  clearanceM        Float
  telemetry         VehicleTelemetry?
  equipment         VehicleEquipment[]
  missions          MissionAssignment[]
}

model VehicleTelemetry {
  id              Int      @id @default(autoincrement())
  vehicleId       Int      @unique
  vehicle         Vehicle  @relation(fields: [vehicleId], references: [id])
  location        String   // GeoJSON Point
  currentSpeedKmh Float
  heading         Float
  fuelLevelPercent Float
  lastSeen        DateTime @updatedAt
}

model EquipmentType {
  id          Int     @id @default(autoincrement())
  name        String  // WINCH, INFLATABLE_RAFT, MEDICAL_KIT
  description String?
  vehicles    VehicleEquipment[]
}

model VehicleEquipment {
  vehicleId   Int
  equipmentId Int
  quantity    Int           @default(1)
  vehicle     Vehicle       @relation(fields: [vehicleId], references: [id])
  equipment   EquipmentType @relation(fields: [equipmentId], references: [id])

  @@id([vehicleId, equipmentId])
}

model MissionAssignment {
  id             Int            @id @default(autoincrement())
  incidentId     Int
  incident       IncidentReport @relation(fields: [incidentId], references: [id])
  vehicleId      Int
  vehicle        Vehicle        @relation(fields: [vehicleId], references: [id])
  assignedTimestamp DateTime    @default(now())
  routes         GeneratedRoute[]
}

model GeneratedRoute {
  id            Int               @id @default(autoincrement())
  missionId     Int
  mission       MissionAssignment @relation(fields: [missionId], references: [id])
  pathGeometry  String            // GeoJSON LineString
  origin        String            // GeoJSON Point
  destination   String            // GeoJSON Point
  etaTimestamp  DateTime
  status        String            // ACTIVE, COMPLETED, REROUTED_FAILURE
  failureReason String?
  generatedAt   DateTime          @default(now())
}
```

---

## 5. API Endpoints & Core Logic Specifications

### 5.1 REST Endpoints
* `GET /api/incidents` - List all active emergency incidents with spatial coordinates.
* `POST /api/incidents` - Create new emergency report.
* `GET /api/vehicles/telemetry` - Get live locations & operational capabilities of all vehicles.
* `GET /api/roads/segments` - Return road network with current `RoadState` flood levels.
* `PATCH /api/roads/segments/:id/status` - Manually update road status (Triggers auto-reroute check for affected active missions).
* `POST /api/satellite/analyze` - Trigger mock AI analysis on uploaded/selected satellite feed and return detected flood hazards.
* `POST /api/dispatch/recommend` - Calculate optimal vehicle match + route given incident requirements and vehicle constraints.
* `POST /api/dispatch/assign` - Create `MissionAssignment` and push route to vehicle over WebSocket.

### 5.2 Dynamic Routing Engine (`routingEngine.ts`)
* Implement custom Dijkstra or A* shortest path algorithm over the road segment network.
* **Cost Function**:
  $$\text{Cost} = \frac{\text{Segment Length}}{\text{Current Speed}} \times \text{Penalty Factor}$$
* **Constraint Filtering**:
  * If `RoadState.status == CLOSED_FLOODING` and `RoadState.floodDepthMm > Vehicle.maxWaterDepthMm`, set $\text{Penalty Factor} = \infty$ (impassable segment).
  * If a active mission's route contains a road segment whose status changes to impassable, instantly generate a new route and broadcast a WebSocket alert: `ROUTE_INVALIDATED_REROUTING`.

---

## 6. Step-by-Step Implementation Roadmap for Coding Agent

Follow this step-by-step sequence to construct the complete project:

### Phase 1: Backend Foundation & Prisma Seed
1. Initialize Node.js TypeScript project in `/src/server`.
2. Configure `prisma/schema.prisma` with SQLite database setup.
3. Write a robust `prisma/seed.ts` script that populates realistic Mumbai Vidyavihar/Kurla spatial data:
   * 8 Road Segments (including LBS Marg, Eastern Express Highway, CST Road).
   * 4 Vehicles (1 Amphibious NDRF Truck, 1 Inflatable Boat Unit, 1 4x4 Ambulance, 1 Standard Unit).
   * 3 Incidents (Flood stranded citizens at Kurla, Wall collapse at Ghatkopar, Medical at Somaiya Campus).
4. Implement REST API routes for Incidents, Vehicles, and Road Segments.

### Phase 2: GIS Routing Engine & WebSocket Broadcast
1. Build `routingEngine.ts` with constraint-based pathfinding.
2. Setup WebSocket server (`websocketService.ts`) to stream simulated vehicle GPS movements every 3 seconds.
3. Wire road status updates so that updating a road segment recalculates active routes and pushes live alerts over WebSocket.

### Phase 3: Frontend Layout & Interactive Leaflet GIS Map
1. Set up Vite + React + Tailwind CSS in `/src/client`.
2. Install Leaflet and `react-leaflet`.
3. Build `CommandHeader.tsx` with Golden Hour countdown clock and live system status badges.
4. Implement `GisMapCanvas.tsx`:
   * Render base map layer with dark tiles.
   * Render road polylines colored dynamically by flood status.
   * Render custom markers for incidents and moving vehicle telemetry.
   * Implement interactive popups for quick dispatches.

### Phase 4: Constraint-Aware Dispatch & Satellite AI Workbench
1. Implement `ConstraintChecker.tsx`: Visual matrix comparing incident needs (e.g., Flood depth 700mm) against vehicle capabilities (e.g., Clearance 900mm $\rightarrow$ 🟢 **PASSED**; Clearance 300mm $\rightarrow$ 🔴 **FAILED**).
2. Build `SatelliteWorkbench.tsx`:
   * Side-by-side satellite image visualizer.
   * Threshold slider triggering mock AI response with visual red hazard overlays.
   * "Commit to Map" button that converts AI detections into real database `RoadState` updates.

### Phase 5: Dynamic Rerouting Demo & Analytics Integration
1. Build interactive toggle on map view to simulate sudden infrastructure failure (e.g., "Bridge Collapse on LBS Marg").
2. Trigger animated map re-render showing the old route line breaking into red dots and a new cyan route polyline rendering around the obstacle.
3. Build `AnalyticsHub.tsx` using Recharts to visualize Golden Hour statistics, average response times, and failure-avoidance ratios.