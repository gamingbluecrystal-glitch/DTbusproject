export interface Stop {
  id: string;
  code: string;
  name: string;
  localName?: string; // e.g. Marathi
  lat: number;
  lng: number;
  zone?: string;
}

export interface RouteStop {
  stopId: string;
  sequenceOrder: number;
  distanceFromPrevKm?: number;
  approxMinutesFromPrev?: number;
}

export interface Route {
  id: string;
  routeNumber: string;
  name: string;
  originStopId: string;
  destinationStopId: string;
  via: string;
  color: string;
  stops: RouteStop[];
  isActive: boolean;
}

export interface Bus {
  id: string;
  busNumber: string; // e.g. "BUS 102"
  plateNumber: string; // e.g. "MH-15-EG-4521"
  model: string; // e.g. "Electric AC Low Floor"
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface TimetableHalt {
  stopId: string;
  arrivalTime: string; // "HH:MM" 24h
  departureTime: string; // "HH:MM" 24h
}

export interface Trip {
  id: string;
  routeId: string;
  busId: string;
  tripNumber?: string;
  direction: 'UP' | 'DOWN';
  halts: TimetableHalt[];
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  isActive: boolean;
}

export type EtaStatus = 
  | 'Arriving Soon'  // <= 5 min
  | 'Upcoming'       // 6-20 min
  | 'Later'          // > 20 min
  | 'Passed'         // bus already crossed the stop
  | 'Not Started'    // trip hasn't begun
  | 'Completed';     // trip already ended

export interface TripEstimatedLocation {
  lat: number;
  lng: number;
  previousStop: Stop | null;
  nextStop: Stop | null;
  currentSegmentDescription: string;
  progressPercent: number; // 0 to 100
  isRestingAtStop: boolean;
  restingStop: Stop | null;
  isTripActive: boolean;
  statusText: string;
}

export interface BusEtaResult {
  tripId: string;
  bus: Bus;
  route: Route;
  originStop: Stop;
  destinationStop: Stop;
  targetStop: Stop;
  etaMinutes: number; // minutes until reaching target stop (negative if passed)
  expectedArrivalTime: string; // "HH:MM AM/PM"
  expectedDepartureTime: string; // "HH:MM AM/PM"
  status: EtaStatus;
  stopsRemaining: number;
  location: TripEstimatedLocation;
  timeline: {
    stop: Stop;
    sequenceOrder: number;
    arrivalTime: string;
    departureTime: string;
    isPassed: boolean;
    isCurrent: boolean;
    isTarget: boolean;
  }[];
}

export interface SystemStats {
  totalBuses: number;
  totalRoutes: number;
  totalStops: number;
  totalTripsToday: number;
  activeBusesOnRoad: number;
}
