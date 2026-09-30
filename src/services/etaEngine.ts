import { Trip, Route, Bus, Stop, BusEtaResult, EtaStatus, TripEstimatedLocation } from '../types';

/**
 * Converts "HH:MM" (24-hour format) to total minutes from midnight (0 - 1439).
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight (0 - 1439) to "HH:MM AM/PM" or 24h format.
 */
export function minutesToTimeString(totalMinutes: number, format24h: boolean = false): string {
  // Normalize within 0 - 1439 (24 hours)
  const normalized = ((Math.floor(totalMinutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;

  if (format24h) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Calculate linear interpolation between two stops based on elapsed time.
 * Clearly returns estimated coordinates, current segment, and status.
 */
export function calculateEstimatedLocation(
  trip: Trip,
  stopsMap: Map<string, Stop>,
  currentMinutes: number
): TripEstimatedLocation {
  const halts = trip.halts;

  if (!halts || halts.length === 0) {
    return {
      lat: 19.9975,
      lng: 73.7898,
      previousStop: null,
      nextStop: null,
      currentSegmentDescription: 'No halts scheduled',
      progressPercent: 0,
      isRestingAtStop: false,
      restingStop: null,
      isTripActive: false,
      statusText: 'Inactive',
    };
  }

  const firstHalt = halts[0];
  const lastHalt = halts[halts.length - 1];
  const originStop = stopsMap.get(firstHalt.stopId) || null;
  const destinationStop = stopsMap.get(lastHalt.stopId) || null;

  const firstDepMin = timeStringToMinutes(firstHalt.departureTime || firstHalt.arrivalTime);
  const lastArrMin = timeStringToMinutes(lastHalt.arrivalTime);

  // Case 1: Trip has not started yet
  if (currentMinutes < firstDepMin) {
    const minsToStart = firstDepMin - currentMinutes;
    return {
      lat: originStop ? originStop.lat : 19.9575,
      lng: originStop ? originStop.lng : 73.8315,
      previousStop: null,
      nextStop: originStop,
      currentSegmentDescription: `At origin: ${originStop?.name || 'Origin Terminal'} (Departs in ${minsToStart} min)`,
      progressPercent: 0,
      isRestingAtStop: true,
      restingStop: originStop,
      isTripActive: false,
      statusText: 'Trip Not Started',
    };
  }

  // Case 2: Trip is already completed
  if (currentMinutes >= lastArrMin) {
    return {
      lat: destinationStop ? destinationStop.lat : 19.9975,
      lng: destinationStop ? destinationStop.lng : 73.7898,
      previousStop: destinationStop,
      nextStop: null,
      currentSegmentDescription: `Arrived at destination: ${destinationStop?.name || 'Destination Terminal'}`,
      progressPercent: 100,
      isRestingAtStop: true,
      restingStop: destinationStop,
      isTripActive: false,
      statusText: 'Trip Completed',
    };
  }

  // Case 3: Check if bus is currently halted at an intermediate stop
  for (let i = 0; i < halts.length; i++) {
    const halt = halts[i];
    const arrMin = timeStringToMinutes(halt.arrivalTime);
    const depMin = timeStringToMinutes(halt.departureTime || halt.arrivalTime);

    if (currentMinutes >= arrMin && currentMinutes <= depMin) {
      const stop = stopsMap.get(halt.stopId) || null;
      const nextHalt = halts[i + 1];
      const nextStop = nextHalt ? stopsMap.get(nextHalt.stopId) || null : null;

      return {
        lat: stop ? stop.lat : 19.9975,
        lng: stop ? stop.lng : 73.7898,
        previousStop: stop,
        nextStop: nextStop,
        currentSegmentDescription: `Halted at ${stop?.name || 'Stop'} (Boarding)`,
        progressPercent: ((i) / (halts.length - 1)) * 100,
        isRestingAtStop: true,
        restingStop: stop,
        isTripActive: true,
        statusText: `At ${stop?.name || 'Stop'}`,
      };
    }
  }

  // Case 4: Bus is traveling between Stop i and Stop i + 1
  for (let i = 0; i < halts.length - 1; i++) {
    const fromHalt = halts[i];
    const toHalt = halts[i + 1];

    const fromDepMin = timeStringToMinutes(fromHalt.departureTime || fromHalt.arrivalTime);
    const toArrMin = timeStringToMinutes(toHalt.arrivalTime);

    if (currentMinutes > fromDepMin && currentMinutes < toArrMin) {
      const fromStop = stopsMap.get(fromHalt.stopId);
      const toStop = stopsMap.get(toHalt.stopId);

      const segmentDuration = Math.max(1, toArrMin - fromDepMin);
      const elapsed = currentMinutes - fromDepMin;
      const t = Math.min(1, Math.max(0, elapsed / segmentDuration));

      const latFrom = fromStop?.lat ?? 19.9975;
      const lngFrom = fromStop?.lng ?? 73.7898;
      const latTo = toStop?.lat ?? 19.9975;
      const lngTo = toStop?.lng ?? 73.7898;

      // Linear interpolation between the two stop coordinates
      const interpolatedLat = latFrom + t * (latTo - latFrom);
      const interpolatedLng = lngFrom + t * (lngTo - lngFrom);

      const overallProgress = ((i + t) / (halts.length - 1)) * 100;

      return {
        lat: interpolatedLat,
        lng: interpolatedLng,
        previousStop: fromStop || null,
        nextStop: toStop || null,
        currentSegmentDescription: `Between ${fromStop?.name || 'Stop A'} and ${toStop?.name || 'Stop B'}`,
        progressPercent: overallProgress,
        isRestingAtStop: false,
        restingStop: null,
        isTripActive: true,
        statusText: `En route to ${toStop?.name || 'Next Stop'}`,
      };
    }
  }

  // Fallback
  return {
    lat: originStop ? originStop.lat : 19.9575,
    lng: originStop ? originStop.lng : 73.8315,
    previousStop: originStop,
    nextStop: destinationStop,
    currentSegmentDescription: 'Calculating estimated position...',
    progressPercent: 50,
    isRestingAtStop: false,
    restingStop: null,
    isTripActive: true,
    statusText: 'In transit',
  };
}

/**
 * Calculates ETA and status for a specific bus trip towards a target stop.
 */
export function calculateBusEtaForStop(
  trip: Trip,
  route: Route,
  bus: Bus,
  targetStopId: string,
  currentMinutes: number,
  stopsMap: Map<string, Stop>
): BusEtaResult | null {
  const halts = trip.halts;
  if (!halts || halts.length === 0) return null;

  // Find target stop index in the trip
  const targetHaltIndex = halts.findIndex((h) => h.stopId === targetStopId);
  if (targetHaltIndex === -1) {
    // This trip does not serve the selected stop
    return null;
  }

  const targetHalt = halts[targetHaltIndex];
  const targetStop = stopsMap.get(targetStopId);
  if (!targetStop) return null;

  const targetArrMin = timeStringToMinutes(targetHalt.arrivalTime);
  const targetDepMin = timeStringToMinutes(targetHalt.departureTime || targetHalt.arrivalTime);
  const etaMinutes = targetArrMin - currentMinutes;

  const originHalt = halts[0];
  const destHalt = halts[halts.length - 1];
  const originStop = stopsMap.get(originHalt.stopId) || targetStop;
  const destinationStop = stopsMap.get(destHalt.stopId) || targetStop;

  const estimatedLocation = calculateEstimatedLocation(trip, stopsMap, currentMinutes);

  // Determine which halts have passed
  let lastPassedIndex = -1;
  for (let i = 0; i < halts.length; i++) {
    const haltDep = timeStringToMinutes(halts[i].departureTime || halts[i].arrivalTime);
    if (currentMinutes >= haltDep) {
      lastPassedIndex = i;
    }
  }

  // Calculate stops remaining
  const stopsRemaining = Math.max(0, targetHaltIndex - Math.max(0, lastPassedIndex));

  // Determine status
  let status: EtaStatus;
  if (currentMinutes > targetDepMin) {
    status = 'Passed';
  } else if (etaMinutes <= 5) {
    status = 'Arriving Soon';
  } else if (etaMinutes <= 20) {
    status = 'Upcoming';
  } else {
    status = 'Later';
  }

  // Build timeline for user visualization
  const timeline = halts.map((h, idx) => {
    const stopObj = stopsMap.get(h.stopId) || {
      id: h.stopId,
      code: 'STOP',
      name: 'Stop ' + (idx + 1),
      lat: 19.99,
      lng: 73.78,
    };
    const arr = timeStringToMinutes(h.arrivalTime);
    const isPassed = currentMinutes > arr;
    const isCurrent =
      estimatedLocation.restingStop?.id === h.stopId ||
      estimatedLocation.previousStop?.id === h.stopId;
    const isTarget = h.stopId === targetStopId;

    return {
      stop: stopObj,
      sequenceOrder: idx + 1,
      arrivalTime: minutesToTimeString(arr),
      departureTime: minutesToTimeString(timeStringToMinutes(h.departureTime || h.arrivalTime)),
      isPassed,
      isCurrent,
      isTarget,
    };
  });

  return {
    tripId: trip.id,
    bus,
    route,
    originStop,
    destinationStop,
    targetStop,
    etaMinutes,
    expectedArrivalTime: minutesToTimeString(targetArrMin),
    expectedDepartureTime: minutesToTimeString(targetDepMin),
    status,
    stopsRemaining,
    location: estimatedLocation,
    timeline,
  };
}

/**
 * Filter and sort buses arriving at the given stop within the next 20 minutes (or upcoming).
 */
export function getBusesForStop(
  targetStopId: string,
  currentMinutes: number,
  trips: Trip[],
  routesMap: Map<string, Route>,
  busesMap: Map<string, Bus>,
  stopsMap: Map<string, Stop>,
  filterNext20MinutesOnly: boolean = false
): BusEtaResult[] {
  const results: BusEtaResult[] = [];

  for (const trip of trips) {
    if (!trip.isActive) continue;

    const route = routesMap.get(trip.routeId);
    if (!route || !route.isActive) continue;

    const bus = busesMap.get(trip.busId);
    if (!bus || bus.status !== 'active') continue;

    const etaResult = calculateBusEtaForStop(trip, route, bus, targetStopId, currentMinutes, stopsMap);
    if (!etaResult) continue;

    // Filter passed buses unless requested
    if (etaResult.status === 'Passed') continue;

    if (filterNext20MinutesOnly) {
      // Must be arriving in 0 to 20 minutes
      if (etaResult.etaMinutes >= 0 && etaResult.etaMinutes <= 20) {
        results.push(etaResult);
      }
    } else {
      // Show all remaining trips today
      if (etaResult.etaMinutes >= 0) {
        results.push(etaResult);
      }
    }
  }

  // Sort ascending by ETA minutes (soonest first)
  results.sort((a, b) => a.etaMinutes - b.etaMinutes);
  return results;
}
