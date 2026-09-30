import { Stop, Route, Bus, Trip, TimetableHalt } from '../types';

export const INITIAL_STOPS: Stop[] = [
  {
    id: 'stop-nsr',
    code: 'NSR-01',
    name: 'Nashik Road',
    lat: 19.9575,
    lng: 73.8315,
  },
  {
    id: 'stop-byt',
    code: 'BYT-02',
    name: 'Bytco',
    lat: 19.9658,
    lng: 73.8272,
  },
  {
    id: 'stop-dwk',
    code: 'DWK-04',
    name: 'Dwarka',
    lat: 19.9868,
    lng: 73.7994,
  },
  {
    id: 'stop-mbn',
    code: 'MBN-05',
    name: 'Mumbai Naka',
    lat: 19.9892,
    lng: 73.7845,
  },
  {
    id: 'stop-cbs',
    code: 'CBS-06',
    name: 'CBS',
    lat: 19.9975,
    lng: 73.7898,
  },
  {
    id: 'stop-pcv',
    code: 'PCV-08',
    name: 'Panchavati',
    lat: 20.0083,
    lng: 73.7936,
  },
  {
    id: 'stop-crd',
    code: 'CRD-10',
    name: 'College Road',
    lat: 20.0038,
    lng: 73.7625,
  },
  {
    id: 'stop-cdc',
    code: 'CDC-13',
    name: 'CIDCO',
    lat: 19.9652,
    lng: 73.7523,
  },
  {
    id: 'stop-stp',
    code: 'STP-14',
    name: 'Satpur',
    lat: 19.9740,
    lng: 73.7310,
  },
];

export const INITIAL_BUSES: Bus[] = [
  {
    id: 'bus-101',
    busNumber: 'BUS 101',
    plateNumber: 'MH-15-EG-4521',
    model: 'Standard City Bus',
    capacity: 45,
    status: 'active',
  },
  {
    id: 'bus-102',
    busNumber: 'BUS 102',
    plateNumber: 'MH-15-EG-4819',
    model: 'Standard City Bus',
    capacity: 45,
    status: 'active',
  },
];

export const INITIAL_ROUTES: Route[] = [
  {
    id: 'route-101',
    routeNumber: '101',
    name: 'Nashik Road → CBS',
    originStopId: 'stop-nsr',
    destinationStopId: 'stop-cbs',
    via: 'Bytco, Dwarka, Mumbai Naka',
    color: '#b91c1c', // Gov red
    isActive: true,
    stops: [
      { stopId: 'stop-nsr', sequenceOrder: 1, approxMinutesFromPrev: 0 },
      { stopId: 'stop-byt', sequenceOrder: 2, approxMinutesFromPrev: 7 },
      { stopId: 'stop-dwk', sequenceOrder: 3, approxMinutesFromPrev: 8 },
      { stopId: 'stop-mbn', sequenceOrder: 4, approxMinutesFromPrev: 7 },
      { stopId: 'stop-cbs', sequenceOrder: 5, approxMinutesFromPrev: 8 },
    ],
  },
];

function buildHalts(startMinute: number): TimetableHalt[] {
  // Offsets from start: Nashik Road (+0), Bytco (+7), Dwarka (+15), Mumbai Naka (+22), CBS (+30)
  const offsets = [
    { stopId: 'stop-nsr', arr: 0, dep: 2 },
    { stopId: 'stop-byt', arr: 7, dep: 8 },
    { stopId: 'stop-dwk', arr: 15, dep: 16 },
    { stopId: 'stop-mbn', arr: 22, dep: 23 },
    { stopId: 'stop-cbs', arr: 30, dep: 30 },
  ];

  return offsets.map((o) => {
    const arrMin = (startMinute + o.arr) % 1440;
    const depMin = (startMinute + o.dep) % 1440;
    const arrH = Math.floor(arrMin / 60);
    const arrM = arrMin % 60;
    const depH = Math.floor(depMin / 60);
    const depM = depMin % 60;
    return {
      stopId: o.stopId,
      arrivalTime: `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`,
      departureTime: `${String(depH).padStart(2, '0')}:${String(depM).padStart(2, '0')}`,
    };
  });
}

export function generateInitialTrips(): Trip[] {
  const trips: Trip[] = [];
  let idCounter = 1;
  const busList = ['bus-101', 'bus-102'];

  // Trips from 06:00 to 22:00 every 20 minutes
  for (let min = 6 * 60; min <= 22 * 60; min += 20) {
    const busId = busList[idCounter % busList.length];
    trips.push({
      id: `trip-${idCounter}`,
      routeId: 'route-101',
      busId: busId,
      tripNumber: `TRIP-${String(idCounter).padStart(3, '0')}`,
      direction: 'UP',
      halts: buildHalts(min),
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      isActive: true,
    });
    idCounter++;
  }

  return trips;
}
