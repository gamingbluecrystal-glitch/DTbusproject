import { Stop, Route, Bus, Trip } from '../types';

const STOPS_KEY = 'smartbus_stops_v3';
const BUSES_KEY = 'smartbus_buses_v3';
const ROUTES_KEY = 'smartbus_routes_v3';
const TRIPS_KEY = 'smartbus_trips_v3';
const SETTINGS_KEY = 'smartbus_settings_v3';

export interface AppSettings {
  supabaseUrl: string;
  supabaseAnonKey: string;
  useCloudSync: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  useCloudSync: false,
};

export class StorageService {
  public static getStops(): Stop[] {
    try {
      const stored = localStorage.getItem(STOPS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading stops from storage:', e);
    }
    return [];
  }

  public static saveStops(stops: Stop[]): void {
    try {
      localStorage.setItem(STOPS_KEY, JSON.stringify(stops));
      window.dispatchEvent(new Event('smartbus_storage_updated'));
    } catch (e) {
      console.error('Error saving stops to storage:', e);
    }
  }

  public static getBuses(): Bus[] {
    try {
      const stored = localStorage.getItem(BUSES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading buses from storage:', e);
    }
    return [];
  }

  public static saveBuses(buses: Bus[]): void {
    try {
      localStorage.setItem(BUSES_KEY, JSON.stringify(buses));
      window.dispatchEvent(new Event('smartbus_storage_updated'));
    } catch (e) {
      console.error('Error saving buses to storage:', e);
    }
  }

  public static getRoutes(): Route[] {
    try {
      const stored = localStorage.getItem(ROUTES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading routes from storage:', e);
    }
    return [];
  }

  public static saveRoutes(routes: Route[]): void {
    try {
      localStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
      window.dispatchEvent(new Event('smartbus_storage_updated'));
    } catch (e) {
      console.error('Error saving routes to storage:', e);
    }
  }

  public static getTrips(): Trip[] {
    try {
      const stored = localStorage.getItem(TRIPS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading trips from storage:', e);
    }
    return [];
  }

  public static saveTrips(trips: Trip[]): void {
    try {
      localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
      window.dispatchEvent(new Event('smartbus_storage_updated'));
    } catch (e) {
      console.error('Error saving trips to storage:', e);
    }
  }

  public static getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading settings from storage:', e);
    }
    return DEFAULT_SETTINGS;
  }

  public static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to storage:', e);
    }
  }

  public static clearAllData(): void {
    localStorage.removeItem(STOPS_KEY);
    localStorage.removeItem(BUSES_KEY);
    localStorage.removeItem(ROUTES_KEY);
    localStorage.removeItem(TRIPS_KEY);
    window.dispatchEvent(new Event('smartbus_storage_updated'));
  }

  public static loadNashikSampleTemplate(): void {
    const stops: Stop[] = [
      { id: 'stop-nsr', code: 'NSR-01', name: 'Nashik Road', lat: 19.9575, lng: 73.8315 },
      { id: 'stop-byt', code: 'BYT-02', name: 'Bytco', lat: 19.9658, lng: 73.8272 },
      { id: 'stop-dwk', code: 'DWK-04', name: 'Dwarka', lat: 19.9868, lng: 73.7994 },
      { id: 'stop-mbn', code: 'MBN-05', name: 'Mumbai Naka', lat: 19.9892, lng: 73.7845 },
      { id: 'stop-cbs', code: 'CBS-06', name: 'CBS', lat: 19.9975, lng: 73.7898 },
    ];
    const buses: Bus[] = [
      { id: 'bus-101', busNumber: 'BUS 101', plateNumber: 'MH-15-EG-4521', model: 'City Bus', capacity: 45, status: 'active' },
      { id: 'bus-102', busNumber: 'BUS 102', plateNumber: 'MH-15-EG-4819', model: 'City Bus', capacity: 45, status: 'active' },
    ];
    const routes: Route[] = [
      {
        id: 'route-101',
        routeNumber: '101',
        name: 'Nashik Road → CBS',
        originStopId: 'stop-nsr',
        destinationStopId: 'stop-cbs',
        via: 'Bytco, Dwarka, Mumbai Naka',
        color: '#b91c1c',
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
    const trips: Trip[] = [
      {
        id: 'trip-1',
        routeId: 'route-101',
        busId: 'bus-101',
        tripNumber: 'TRIP-001',
        direction: 'UP',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
        halts: [
          { stopId: 'stop-nsr', arrivalTime: '08:00', departureTime: '08:02' },
          { stopId: 'stop-byt', arrivalTime: '08:07', departureTime: '08:08' },
          { stopId: 'stop-dwk', arrivalTime: '08:15', departureTime: '08:16' },
          { stopId: 'stop-mbn', arrivalTime: '08:22', departureTime: '08:23' },
          { stopId: 'stop-cbs', arrivalTime: '08:30', departureTime: '08:30' },
        ],
      },
      {
        id: 'trip-2',
        routeId: 'route-101',
        busId: 'bus-102',
        tripNumber: 'TRIP-002',
        direction: 'UP',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
        halts: [
          { stopId: 'stop-nsr', arrivalTime: '08:20', departureTime: '08:22' },
          { stopId: 'stop-byt', arrivalTime: '08:27', departureTime: '08:28' },
          { stopId: 'stop-dwk', arrivalTime: '08:35', departureTime: '08:36' },
          { stopId: 'stop-mbn', arrivalTime: '08:42', departureTime: '08:43' },
          { stopId: 'stop-cbs', arrivalTime: '08:50', departureTime: '08:50' },
        ],
      },
    ];

    this.saveStops(stops);
    this.saveBuses(buses);
    this.saveRoutes(routes);
    this.saveTrips(trips);
  }

  public static exportFullDataAsJson(): string {
    const data = {
      stops: this.getStops(),
      buses: this.getBuses(),
      routes: this.getRoutes(),
      trips: this.getTrips(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  public static importFullDataFromJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.stops)) this.saveStops(parsed.stops);
      if (Array.isArray(parsed.buses)) this.saveBuses(parsed.buses);
      if (Array.isArray(parsed.routes)) this.saveRoutes(parsed.routes);
      if (Array.isArray(parsed.trips)) this.saveTrips(parsed.trips);
      return true;
    } catch (e) {
      console.error('Error importing data from JSON:', e);
      return false;
    }
  }
}
