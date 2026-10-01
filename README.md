# DTbusproject – SmartBus Schedule-Based Bus Tracking & ETA System

> **“Know Your Bus Before It Arrives.”**  
> An intelligent public transit platform providing schedule-interpolated live bus tracking and dynamic arrival predictions without requiring GPS hardware.

---

## 🚌 Overview

Most small and mid-sized transit agencies cannot afford expensive GPS/VTS hardware and cellular data SIM plans across hundreds of public buses. **SmartBus** solves this problem by using **public bus timetables and route stop sequences** to calculate the expected bus position and arrival times (ETA).

### Example Scenario
- **Route:** Nashik Road → Bytco → Dwarka → Mumbai Naka → CBS
- **Timetable:** `08:00 → 08:07 → 08:15 → 08:22 → 08:30`
- **If the current time is 08:12:** The engine computes that the bus is in transit between **Bytco (08:08 departure)** and **Dwarka (08:15 arrival)**. It calculates its exact geographic coordinates using linear interpolation between the two stops and projects an **ETA of 3 minutes** for passengers waiting at Dwarka Circle.
- **Labeling:** Clearly displayed as **Estimated Location / Estimated Arrival** with an alert banner so passengers know it is non-GPS schedule tracking.

---

## 📱 System Features

### 1. Passenger Application (`/`)
- **Stop Selector & Search:** Search any stop or pick popular transit hubs (Dwarka Circle, CBS, Nashik Road, College Road, CIDCO, etc.).
- **Next 20-Minute Departures:** Highlights buses arriving in $\le$ 20 minutes with large ETA numbers and expected arrival clock time.
- **Stop Filter:** Filter and view all buses serving a selected stop.
- **Route Details Modal:** Inspect the complete stop sequence, previous stop, next stop, stops remaining, segment progress bar, and halt timeline.
- **Interactive Map:** Built using **Leaflet + OpenStreetMap** featuring:
  - Custom stop markers with bilingual names (English & Marathi).
  - Colored route polylines.
  - Active bus markers with pulsing beacon animations positioned at their interpolated coordinates.
  - Informative click popups.
- **Demo & Simulation Clock Bar:**
  - Fast-forward (+5m, +10m, +15m) or rewind (-10m) time.
  - Preset scenarios (e.g. *08:12 AM Bytco-Dwarka*, *10:20 AM Peak*, *05:45 PM Evening Rush*).
  - Play / Pause and speed multiplier (1x, 5x, 15x, 30x).
  - One-click sync to device's real-time clock.

### 2. Admin Dispatcher Dashboard
- **Protected Portal:** Access with dispatcher credentials or 1-Click Presentation Access.
- **Dashboard Overview:** Real-time statistics including Total Buses, Active Routes, Bus Stops, Today's Scheduled Trips, and Buses Currently Moving On-Road.
- **Route Management:** Create, edit, activate/deactivate routes, change line colors, and adjust stop sequences.
- **Bus Fleet:** Manage bus registration numbers, license plates, models (EV, CNG, Diesel), seating capacity, and status (`active`, `maintenance`, `inactive`).
- **Stop Coordinates:** Add or edit bus stops, geo-tagged coordinates (lat/lng), Marathi local names, and municipal transit zones.
- **Timetable Halts Scheduler:** Configure halt-by-halt arrival and departure times (24-hour format) and assign bus vehicles.
- **Import / Export Data:**
  - Import timetables from CSV or JSON files.
  - Download sample CSV templates.
  - Export full database snapshots.
  - One-click restore to Nashik official demo data.
- **Instant Synchronization:** Updates made in Admin immediately reflect across the Passenger App without page reloads!

---

## 🧮 Time-Based ETA Calculation Engine

The core logic resides in [`js/engine.js`](file:///c:/Users/Admin/Desktop/DT%20project/js/engine.js).

### Mathematical Interpolation Algorithm

Given:
- Halts sequence: $[H_1, H_2, \dots, H_n]$
- Halt departure time: $T_{\text{dep}}(H_i)$
- Next halt arrival time: $T_{\text{arr}}(H_{i+1})$
- Selected clock time: $T_{\text{curr}}$

1. **Segment Duration & Elapsed Time:**
   $$\Delta T = T_{\text{arr}}(H_{i+1}) - T_{\text{dep}}(H_i)$$
   $$T_{\text{elapsed}} = T_{\text{curr}} - T_{\text{dep}}(H_i)$$

2. **Progress Ratio ($t \in [0, 1]$):**
   $$t = \frac{T_{\text{elapsed}}}{\Delta T}$$

3. **Interpolated Coordinates:**
   $$\text{Lat}_{\text{est}} = \text{Lat}_{H_i} + t \cdot (\text{Lat}_{H_{i+1}} - \text{Lat}_{H_i})$$
   $$\text{Lng}_{\text{est}} = \text{Lng}_{H_i} + t \cdot (\text{Lng}_{H_{i+1}} - \text{Lng}_{H_i})$$

4. **Status Classification:**
   - **Arriving Soon:** $\text{ETA} \le 5\text{ min}$
   - **Upcoming:** $6 \le \text{ETA} \le 20\text{ min}$
   - **Later:** $\text{ETA} > 20\text{ min}$
   - **Passed:** Bus already crossed the selected stop ($T_{\text{curr}} > T_{\text{dep}}(\text{Stop})$)

---

## 🗄️ Database Architecture (Firebase Firestore & Local Cache)

The application connects to **Google Firebase Cloud Firestore** (`busapp-cf8fb`) using the Web SDK in [`js/firebase.js`](file:///c:/Users/Admin/Desktop/DT%20project/js/firebase.js), paired with an instant offline-first local cache in [`js/storage.js`](file:///c:/Users/Admin/Desktop/DT%20project/js/storage.js).

### Features
- **Real-time Synchronization (`onSnapshot`)**: Updates in stops, buses, routes, or trips made by an admin immediately stream live across all connected passenger devices without page refresh.
- **Offline Resiliency**: Data persists locally in `localStorage`, allowing the app to load instantly even without an internet connection and sync seamlessly when online.
- **Batch Writes**: Atomically synchronizes changes to Firestore in batches.

### Cloud Collections

1. **`stops`**: Bus stop geo-coordinates, bilingual naming, municipal transit zones.
2. **`buses`**: Transit fleet registry, registration plates, models, and operational status.
3. **`routes`**: Bus routes, polyline colors, ordered stop sequence, and intermediate distances.
4. **`trips`**: Scheduled timetable trips, bus vehicle assignments, directions, and halt-by-halt arrival/departure times.

---

## 🛰️ Future GPS / VTS Integration Roadmap

The ETA engine uses the **Adapter Pattern**. Currently, it uses the `ScheduleInterpolationAdapter`.

When IoT / AIS-140 GPS hardware or driver smartphone trackers become available:
1. A microservice ingests live telemetry via MQTT or HTTP:
   ```json
   POST /api/v1/telemetry/gps
   {
     "busId": "bus-101",
     "plateNumber": "MH-15-EG-4521",
     "latitude": 19.9723,
     "longitude": 73.8210,
     "speedKmph": 28.4,
     "timestamp": 1727675153
   }
   ```
2. The engine switches from linear schedule interpolation to real-time speed/distance matrices without changing UI components or database relations.

---

## 🚀 Quick Start Guide
 
No build step or Node dependencies required. SmartBus is built purely with standard HTML5, CSS3, and JavaScript.
 
### Option 1: Direct File
Simply double-click or open [index.html](file:///c:/Users/Admin/Desktop/DT%20project/index.html) directly in any modern browser.
 
### Option 2: Local Static Server (Optional)
Run any local static server of your choice:
```bash
# Python
python -m http.server 8000
```
Open **`http://localhost:8000/`** in your browser.

---

## 🏙️ Demo Data (Nashik City)
Includes 16 geo-tagged stops across Nashik:
- Nashik Road Railway Station (`NSR-01`)
- Bytco Point (`BYT-02`)
- Datta Mandir (`DTM-03`)
- Dwarka Circle (`DWK-04`)
- Mumbai Naka (`MBN-05`)
- Central Bus Station - CBS (`CBS-06`)
- Ashok Stambh (`ASK-07`)
- Panchavati Ramkund (`PCV-08`)
- Nimani Bus Stand (`NMN-09`)
- College Road BYK (`CRD-10`)
- Gangapur Road (`GPR-11`)
- ABB Circle (`ABB-12`)
- CIDCO Trimurti Chowk (`CDC-13`)
- Satpur MIDC ITI (`STP-14`)
- Indira Nagar (`IDN-15`)
- Govind Nagar City Centre Mall (`GVN-16`)

---

## 📄 License
MIT License. Built for Smart City Intelligent Public Transit Initiatives.
>>>>>>> f794f52 (feat: SmartBus schedule-based bus tracking and ETA system)
