/**
 * SmartBus Demo Transit Data (Nashik City)
 * Used as initial fallback or for one-click database seeding into Firebase Firestore.
 */

const INITIAL_STOPS = [
  { id: 'stop-nsr', code: 'NSR-01', name: 'Nashik Road Railway Station', lat: 19.9575, lng: 73.8315, zone: 'South Zone' },
  { id: 'stop-byt', code: 'BYT-02', name: 'Bytco Point', lat: 19.9658, lng: 73.8272, zone: 'South Zone' },
  { id: 'stop-dtm', code: 'DTM-03', name: 'Datta Mandir', lat: 19.9734, lng: 73.8201, zone: 'South Zone' },
  { id: 'stop-dwk', code: 'DWK-04', name: 'Dwarka Circle', lat: 19.9868, lng: 73.7994, zone: 'East Zone' },
  { id: 'stop-mbn', code: 'MBN-05', name: 'Mumbai Naka', lat: 19.9892, lng: 73.7845, zone: 'Central Zone' },
  { id: 'stop-cbs', code: 'CBS-06', name: 'Central Bus Station (CBS)', lat: 19.9975, lng: 73.7898, zone: 'Central Zone' },
  { id: 'stop-ask', code: 'ASK-07', name: 'Ashok Stambh', lat: 20.0012, lng: 73.7885, zone: 'Central Zone' },
  { id: 'stop-pcv', code: 'PCV-08', name: 'Panchavati Ramkund', lat: 20.0083, lng: 73.7936, zone: 'North Zone' },
  { id: 'stop-nmn', code: 'NMN-09', name: 'Nimani Bus Stand', lat: 20.0152, lng: 73.7990, zone: 'North Zone' },
  { id: 'stop-crd', code: 'CRD-10', name: 'College Road BYK', lat: 20.0038, lng: 73.7625, zone: 'West Zone' },
  { id: 'stop-gpr', code: 'GPR-11', name: 'Gangapur Road', lat: 20.0125, lng: 73.7540, zone: 'West Zone' },
  { id: 'stop-abb', code: 'ABB-12', name: 'ABB Circle', lat: 19.9790, lng: 73.7630, zone: 'West Zone' },
  { id: 'stop-cdc', code: 'CDC-13', name: 'CIDCO Trimurti Chowk', lat: 19.9652, lng: 73.7523, zone: 'South-West Zone' },
  { id: 'stop-stp', code: 'STP-14', name: 'Satpur MIDC ITI', lat: 19.9740, lng: 73.7310, zone: 'Industrial Zone' },
  { id: 'stop-idn', code: 'IDN-15', name: 'Indira Nagar', lat: 19.9680, lng: 73.7850, zone: 'South Zone' },
  { id: 'stop-gvn', code: 'GVN-16', name: 'Govind Nagar City Centre', lat: 19.9765, lng: 73.7745, zone: 'Central Zone' }
];

const INITIAL_BUSES = [
  { id: 'bus-101', busNumber: 'BUS 101', plateNumber: 'MH-15-EG-4521', model: 'Tata Starbus EV AC Low Floor', capacity: 45, status: 'active' },
  { id: 'bus-102', busNumber: 'BUS 102', plateNumber: 'MH-15-EG-4819', model: 'Ashok Leyland CNG Standard', capacity: 45, status: 'active' },
  { id: 'bus-103', busNumber: 'BUS 103', plateNumber: 'MH-15-EG-5120', model: 'Eicher Electric Cityliner', capacity: 40, status: 'active' },
  { id: 'bus-104', busNumber: 'BUS 104', plateNumber: 'MH-15-EG-5332', model: 'Tata Ultra City Express', capacity: 50, status: 'active' }
];

const INITIAL_ROUTES = [
  {
    id: 'route-101',
    routeNumber: '101',
    name: 'Nashik Road ↔ CBS Express',
    originStopId: 'stop-nsr',
    destinationStopId: 'stop-cbs',
    via: 'Bytco, Datta Mandir, Dwarka, Mumbai Naka',
    color: '#b91c1c',
    isActive: true,
    stops: [
      { stopId: 'stop-nsr', sequenceOrder: 1, approxMinutesFromPrev: 0, distanceKm: 0 },
      { stopId: 'stop-byt', sequenceOrder: 2, approxMinutesFromPrev: 7, distanceKm: 1.5 },
      { stopId: 'stop-dtm', sequenceOrder: 3, approxMinutesFromPrev: 5, distanceKm: 1.2 },
      { stopId: 'stop-dwk', sequenceOrder: 4, approxMinutesFromPrev: 8, distanceKm: 2.8 },
      { stopId: 'stop-mbn', sequenceOrder: 5, approxMinutesFromPrev: 7, distanceKm: 2.0 },
      { stopId: 'stop-cbs', sequenceOrder: 6, approxMinutesFromPrev: 8, distanceKm: 1.8 }
    ]
  },
  {
    id: 'route-204',
    routeNumber: '204',
    name: 'CBS ↔ College Road ↔ Gangapur Road',
    originStopId: 'stop-cbs',
    destinationStopId: 'stop-gpr',
    via: 'Ashok Stambh, College Road, Gangapur Road',
    color: '#2563eb',
    isActive: true,
    stops: [
      { stopId: 'stop-cbs', sequenceOrder: 1, approxMinutesFromPrev: 0, distanceKm: 0 },
      { stopId: 'stop-ask', sequenceOrder: 2, approxMinutesFromPrev: 4, distanceKm: 0.9 },
      { stopId: 'stop-crd', sequenceOrder: 3, approxMinutesFromPrev: 10, distanceKm: 3.2 },
      { stopId: 'stop-gpr', sequenceOrder: 4, approxMinutesFromPrev: 8, distanceKm: 2.1 }
    ]
  },
  {
    id: 'route-305',
    routeNumber: '305',
    name: 'CIDCO ↔ ABB Circle ↔ CBS',
    originStopId: 'stop-cdc',
    destinationStopId: 'stop-cbs',
    via: 'ABB Circle, Govind Nagar, Mumbai Naka',
    color: '#059669',
    isActive: true,
    stops: [
      { stopId: 'stop-cdc', sequenceOrder: 1, approxMinutesFromPrev: 0, distanceKm: 0 },
      { stopId: 'stop-abb', sequenceOrder: 2, approxMinutesFromPrev: 6, distanceKm: 1.9 },
      { stopId: 'stop-gvn', sequenceOrder: 3, approxMinutesFromPrev: 5, distanceKm: 1.4 },
      { stopId: 'stop-mbn', sequenceOrder: 4, approxMinutesFromPrev: 7, distanceKm: 1.8 },
      { stopId: 'stop-cbs', sequenceOrder: 5, approxMinutesFromPrev: 6, distanceKm: 1.5 }
    ]
  }
];

function buildHaltsForRoute101(startMinute) {
  const offsets = [
    { stopId: 'stop-nsr', arr: 0, dep: 2 },
    { stopId: 'stop-byt', arr: 7, dep: 8 },
    { stopId: 'stop-dtm', arr: 13, dep: 14 },
    { stopId: 'stop-dwk', arr: 22, dep: 23 },
    { stopId: 'stop-mbn', arr: 30, dep: 31 },
    { stopId: 'stop-cbs', arr: 38, dep: 38 }
  ];

  return offsets.map(o => {
    const arrMin = (startMinute + o.arr) % 1440;
    const depMin = (startMinute + o.dep) % 1440;
    const arrH = Math.floor(arrMin / 60);
    const arrM = arrMin % 60;
    const depH = Math.floor(depMin / 60);
    const depM = depMin % 60;
    return {
      stopId: o.stopId,
      arrivalTime: `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`,
      departureTime: `${String(depH).padStart(2, '0')}:${String(depM).padStart(2, '0')}`
    };
  });
}

function buildHaltsForRoute204(startMinute) {
  const offsets = [
    { stopId: 'stop-cbs', arr: 0, dep: 2 },
    { stopId: 'stop-ask', arr: 6, dep: 7 },
    { stopId: 'stop-crd', arr: 17, dep: 18 },
    { stopId: 'stop-gpr', arr: 26, dep: 26 }
  ];

  return offsets.map(o => {
    const arrMin = (startMinute + o.arr) % 1440;
    const depMin = (startMinute + o.dep) % 1440;
    return {
      stopId: o.stopId,
      arrivalTime: `${String(Math.floor(arrMin / 60)).padStart(2, '0')}:${String(arrMin % 60).padStart(2, '0')}`,
      departureTime: `${String(Math.floor(depMin / 60)).padStart(2, '0')}:${String(depMin % 60).padStart(2, '0')}`
    };
  });
}

function generateInitialTrips() {
  const trips = [];
  let idCounter = 1;
  const busList = ['bus-101', 'bus-102', 'bus-103', 'bus-104'];

  // Route 101 trips: Every 20 mins from 06:00 to 22:40
  for (let min = 6 * 60; min <= 22 * 60 + 40; min += 20) {
    const busId = busList[idCounter % busList.length];
    trips.push({
      id: `trip-101-${idCounter}`,
      routeId: 'route-101',
      busId: busId,
      tripNumber: `TRIP-101-${String(idCounter).padStart(3, '0')}`,
      direction: 'UP',
      halts: buildHaltsForRoute101(min),
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      isActive: true
    });
    idCounter++;
  }

  // Route 204 trips: Every 30 mins from 07:00 to 21:00
  let r2Counter = 1;
  for (let min = 7 * 60; min <= 21 * 60; min += 30) {
    const busId = busList[(r2Counter + 1) % busList.length];
    trips.push({
      id: `trip-204-${r2Counter}`,
      routeId: 'route-204',
      busId: busId,
      tripNumber: `TRIP-204-${String(r2Counter).padStart(3, '0')}`,
      direction: 'UP',
      halts: buildHaltsForRoute204(min),
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      isActive: true
    });
    r2Counter++;
  }

  return trips;
}
