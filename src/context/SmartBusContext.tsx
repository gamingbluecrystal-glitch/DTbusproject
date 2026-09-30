import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Stop, Route, Bus, Trip, BusEtaResult, SystemStats, TripEstimatedLocation } from '../types';
import { StorageService } from '../services/storageService';
import { getBusesForStop, calculateEstimatedLocation, minutesToTimeString, timeStringToMinutes } from '../services/etaEngine';

interface SmartBusContextType {
  // Data
  stops: Stop[];
  buses: Bus[];
  routes: Route[];
  trips: Trip[];
  stopsMap: Map<string, Stop>;
  busesMap: Map<string, Bus>;
  routesMap: Map<string, Route>;

  // User state
  selectedStopId: string;
  setSelectedStopId: (id: string) => void;
  selectedRouteId: string | null;
  setSelectedRouteId: (id: string | null) => void;
  filterNext20Min: boolean;
  setFilterNext20Min: (val: boolean) => void;
  activeRouteModal: BusEtaResult | null;
  setActiveRouteModal: (result: BusEtaResult | null) => void;

  // Simulation Time state
  simulatedMinutes: number;
  setSimulatedMinutes: (min: number) => void;
  currentTimeString: string;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  jumpTime: (deltaMinutes: number) => void;
  resetToCurrentRealTime: () => void;

  // Computed data
  busesForSelectedStop: BusEtaResult[];
  allActiveBusesLocations: { bus: Bus; route: Route; trip: Trip; location: TripEstimatedLocation }[];
  stats: SystemStats;

  // Admin Actions
  addStop: (stop: Stop) => void;
  updateStop: (stop: Stop) => void;
  deleteStop: (id: string) => void;

  addBus: (bus: Bus) => void;
  updateBus: (bus: Bus) => void;
  deleteBus: (id: string) => void;

  addRoute: (route: Route) => void;
  updateRoute: (route: Route) => void;
  deleteRoute: (id: string) => void;

  addTrip: (trip: Trip) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;

  resetToDefaults: () => void;
  clearAllData: () => void;
  importJsonData: (json: string) => boolean;
}

const SmartBusContext = createContext<SmartBusContextType | undefined>(undefined);

function getRealTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export const SmartBusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load data from persistent storage
  const [stops, setStops] = useState<Stop[]>(() => StorageService.getStops());
  const [buses, setBuses] = useState<Bus[]>(() => StorageService.getBuses());
  const [routes, setRoutes] = useState<Route[]>(() => StorageService.getRoutes());
  const [trips, setTrips] = useState<Trip[]>(() => StorageService.getTrips());

  // Default stop: first available stop or empty
  const [selectedStopId, setSelectedStopId] = useState<string>(() => {
    const s = StorageService.getStops();
    return s.length > 0 ? s[0].id : '';
  });
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [filterNext20Min, setFilterNext20Min] = useState<boolean>(true);
  const [activeRouteModal, setActiveRouteModal] = useState<BusEtaResult | null>(null);

  // Keep selectedStopId updated when stops change
  useEffect(() => {
    if (!selectedStopId && stops.length > 0) {
      setSelectedStopId(stops[0].id);
    }
  }, [stops, selectedStopId]);

  // Time & Simulation state (default to 08:12 AM demo time or real time)
  const [simulatedMinutes, setSimulatedMinutes] = useState<number>(() => {
    const realMin = getRealTimeMinutes();
    return (realMin >= 6 * 60 && realMin <= 22 * 60) ? realMin : 8 * 60 + 12;
  });
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);

  // Synchronize when storage changes in another tab or action
  const reloadFromStorage = useCallback(() => {
    setStops(StorageService.getStops());
    setBuses(StorageService.getBuses());
    setRoutes(StorageService.getRoutes());
    setTrips(StorageService.getTrips());
  }, []);

  useEffect(() => {
    window.addEventListener('smartbus_storage_updated', reloadFromStorage);
    return () => window.removeEventListener('smartbus_storage_updated', reloadFromStorage);
  }, [reloadFromStorage]);

  // Simulation clock ticker
  useEffect(() => {
    if (!isSimulating) return;

    // Normal speed 1x = 1 simulation second per real second
    // Or for presentation: 1 real second = simulationSpeed minutes
    const intervalMs = 1000;
    const timer = setInterval(() => {
      setSimulatedMinutes((prev) => {
        const next = (prev + (simulationSpeed / 60)) % 1440;
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isSimulating, simulationSpeed]);

  const jumpTime = (deltaMinutes: number) => {
    setSimulatedMinutes((prev) => ((prev + deltaMinutes) % 1440 + 1440) % 1440);
  };

  const resetToCurrentRealTime = () => {
    setSimulatedMinutes(getRealTimeMinutes());
  };

  // Precomputed Maps
  const stopsMap = useMemo(() => new Map(stops.map((s) => [s.id, s])), [stops]);
  const busesMap = useMemo(() => new Map(buses.map((b) => [b.id, b])), [buses]);
  const routesMap = useMemo(() => new Map(routes.map((r) => [r.id, r])), [routes]);

  // Buses for Selected Stop
  const busesForSelectedStop = useMemo(() => {
    if (!selectedStopId) return [];
    return getBusesForStop(
      selectedStopId,
      simulatedMinutes,
      trips,
      routesMap,
      busesMap,
      stopsMap,
      filterNext20Min
    );
  }, [selectedStopId, simulatedMinutes, trips, routesMap, busesMap, stopsMap, filterNext20Min]);

  // All active bus locations on the road right now (for the map)
  const allActiveBusesLocations = useMemo(() => {
    const list: { bus: Bus; route: Route; trip: Trip; location: TripEstimatedLocation }[] = [];
    for (const trip of trips) {
      if (!trip.isActive) continue;
      const route = routesMap.get(trip.routeId);
      const bus = busesMap.get(trip.busId);
      if (!route || !bus || bus.status !== 'active') continue;

      const loc = calculateEstimatedLocation(trip, stopsMap, simulatedMinutes);
      if (loc.isTripActive) {
        list.push({ bus, route, trip, location: loc });
      }
    }
    return list;
  }, [trips, routesMap, busesMap, stopsMap, simulatedMinutes]);

  // System Stats
  const stats: SystemStats = useMemo(() => {
    return {
      totalBuses: buses.length,
      totalRoutes: routes.length,
      totalStops: stops.length,
      totalTripsToday: trips.length,
      activeBusesOnRoad: allActiveBusesLocations.length,
    };
  }, [buses.length, routes.length, stops.length, trips.length, allActiveBusesLocations.length]);

  // Admin CRUD methods
  const addStop = (stop: Stop) => {
    const updated = [...stops, stop];
    setStops(updated);
    StorageService.saveStops(updated);
  };

  const updateStop = (stop: Stop) => {
    const updated = stops.map((s) => (s.id === stop.id ? stop : s));
    setStops(updated);
    StorageService.saveStops(updated);
  };

  const deleteStop = (id: string) => {
    const updated = stops.filter((s) => s.id !== id);
    setStops(updated);
    StorageService.saveStops(updated);
  };

  const addBus = (bus: Bus) => {
    const updated = [...buses, bus];
    setBuses(updated);
    StorageService.saveBuses(updated);
  };

  const updateBus = (bus: Bus) => {
    const updated = buses.map((b) => (b.id === bus.id ? bus : b));
    setBuses(updated);
    StorageService.saveBuses(updated);
  };

  const deleteBus = (id: string) => {
    const updated = buses.filter((b) => b.id !== id);
    setBuses(updated);
    StorageService.saveBuses(updated);
  };

  const addRoute = (route: Route) => {
    const updated = [...routes, route];
    setRoutes(updated);
    StorageService.saveRoutes(updated);
  };

  const updateRoute = (route: Route) => {
    const updated = routes.map((r) => (r.id === route.id ? route : r));
    setRoutes(updated);
    StorageService.saveRoutes(updated);
  };

  const deleteRoute = (id: string) => {
    const updated = routes.filter((r) => r.id !== id);
    setRoutes(updated);
    StorageService.saveRoutes(updated);
  };

  const addTrip = (trip: Trip) => {
    const updated = [...trips, trip];
    setTrips(updated);
    StorageService.saveTrips(updated);
  };

  const updateTrip = (trip: Trip) => {
    const updated = trips.map((t) => (t.id === trip.id ? trip : t));
    setTrips(updated);
    StorageService.saveTrips(updated);
  };

  const deleteTrip = (id: string) => {
    const updated = trips.filter((t) => t.id !== id);
    setTrips(updated);
    StorageService.saveTrips(updated);
  };

  const resetToDefaults = () => {
    StorageService.loadNashikSampleTemplate();
    reloadFromStorage();
  };

  const clearAllData = () => {
    StorageService.clearAllData();
    reloadFromStorage();
  };

  const importJsonData = (json: string): boolean => {
    const success = StorageService.importFullDataFromJson(json);
    if (success) {
      reloadFromStorage();
    }
    return success;
  };

  const currentTimeString = minutesToTimeString(simulatedMinutes);

  return (
    <SmartBusContext.Provider
      value={{
        stops,
        buses,
        routes,
        trips,
        stopsMap,
        busesMap,
        routesMap,
        selectedStopId,
        setSelectedStopId,
        selectedRouteId,
        setSelectedRouteId,
        filterNext20Min,
        setFilterNext20Min,
        activeRouteModal,
        setActiveRouteModal,
        simulatedMinutes,
        setSimulatedMinutes,
        currentTimeString,
        isSimulating,
        setIsSimulating,
        simulationSpeed,
        setSimulationSpeed,
        jumpTime,
        resetToCurrentRealTime,
        busesForSelectedStop,
        allActiveBusesLocations,
        stats,
        addStop,
        updateStop,
        deleteStop,
        addBus,
        updateBus,
        deleteBus,
        addRoute,
        updateRoute,
        deleteRoute,
        addTrip,
        updateTrip,
        deleteTrip,
        resetToDefaults,
        clearAllData,
        importJsonData,
      }}
    >
      {children}
    </SmartBusContext.Provider>
  );
};

export const useSmartBus = () => {
  const context = useContext(SmartBusContext);
  if (!context) {
    throw new Error('useSmartBus must be used within a SmartBusProvider');
  }
  return context;
};
