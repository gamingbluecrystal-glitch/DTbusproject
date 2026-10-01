/**
 * SmartBus Time-Based ETA Calculation Engine
 * Non-GPS real-time schedule tracking using linear interpolation.
 * Pure mathematical algorithms without hardcoded coordinates or constants.
 */

const EtaEngine = {
  /**
   * Converts "HH:MM" (24-hour format) to total minutes from midnight (0 - 1439).
   */
  timeStringToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  },

  /**
   * Converts minutes from midnight (0 - 1439) to "HH:MM AM/PM" or 24h format.
   */
  minutesToTimeString(totalMinutes, format24h = false) {
    const normalized = ((Math.floor(totalMinutes) % 1440) + 1440) % 1440;
    const hours = Math.floor(normalized / 60);
    const minutes = normalized % 60;

    if (format24h) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
  },

  /**
   * Calculates linear interpolation between two stops based on elapsed timetable minutes.
   */
  calculateEstimatedLocation(trip, stopsMap, currentMinutes) {
    const halts = trip.halts;

    if (!halts || halts.length === 0) {
      return {
        lat: null,
        lng: null,
        previousStop: null,
        nextStop: null,
        currentSegmentDescription: 'No halts scheduled',
        progressPercent: 0,
        isRestingAtStop: false,
        restingStop: null,
        isTripActive: false,
        statusText: 'Inactive'
      };
    }

    const firstHalt = halts[0];
    const lastHalt = halts[halts.length - 1];
    const originStop = stopsMap.get(firstHalt.stopId) || null;
    const destinationStop = stopsMap.get(lastHalt.stopId) || null;

    const firstDepMin = this.timeStringToMinutes(firstHalt.departureTime || firstHalt.arrivalTime);
    const lastArrMin = this.timeStringToMinutes(lastHalt.arrivalTime);

    const originLat = originStop && typeof originStop.lat === 'number' ? originStop.lat : null;
    const originLng = originStop && typeof originStop.lng === 'number' ? originStop.lng : null;
    const destLat = destinationStop && typeof destinationStop.lat === 'number' ? destinationStop.lat : originLat;
    const destLng = destinationStop && typeof destinationStop.lng === 'number' ? destinationStop.lng : originLng;

    // Case 1: Trip has not started yet
    if (currentMinutes < firstDepMin) {
      const minsToStart = firstDepMin - currentMinutes;
      return {
        lat: originLat,
        lng: originLng,
        previousStop: null,
        nextStop: originStop,
        currentSegmentDescription: `At origin: ${originStop?.name || 'Origin Terminal'} (Departs in ${minsToStart} min)`,
        progressPercent: 0,
        isRestingAtStop: true,
        restingStop: originStop,
        isTripActive: false,
        statusText: 'Trip Not Started'
      };
    }

    // Case 2: Trip completed
    if (currentMinutes >= lastArrMin) {
      return {
        lat: destLat,
        lng: destLng,
        previousStop: destinationStop,
        nextStop: null,
        currentSegmentDescription: `Arrived at destination: ${destinationStop?.name || 'Destination Terminal'}`,
        progressPercent: 100,
        isRestingAtStop: true,
        restingStop: destinationStop,
        isTripActive: false,
        statusText: 'Trip Completed'
      };
    }

    // Case 3: Checked if bus is resting/halted at an intermediate stop
    for (let i = 0; i < halts.length; i++) {
      const halt = halts[i];
      const arrMin = this.timeStringToMinutes(halt.arrivalTime);
      const depMin = this.timeStringToMinutes(halt.departureTime || halt.arrivalTime);

      if (currentMinutes >= arrMin && currentMinutes <= depMin) {
        const stop = stopsMap.get(halt.stopId) || null;
        const nextHalt = halts[i + 1];
        const nextStop = nextHalt ? stopsMap.get(nextHalt.stopId) || null : null;

        return {
          lat: stop && typeof stop.lat === 'number' ? stop.lat : null,
          lng: stop && typeof stop.lng === 'number' ? stop.lng : null,
          previousStop: stop,
          nextStop: nextStop,
          currentSegmentDescription: `Halted at ${stop?.name || 'Stop'} (Boarding)`,
          progressPercent: (i / (halts.length - 1)) * 100,
          isRestingAtStop: true,
          restingStop: stop,
          isTripActive: true,
          statusText: `At ${stop?.name || 'Stop'}`
        };
      }
    }

    // Case 4: Bus is moving between Stop i and Stop i + 1
    for (let i = 0; i < halts.length - 1; i++) {
      const fromHalt = halts[i];
      const toHalt = halts[i + 1];

      const fromDepMin = this.timeStringToMinutes(fromHalt.departureTime || fromHalt.arrivalTime);
      const toArrMin = this.timeStringToMinutes(toHalt.arrivalTime);

      if (currentMinutes > fromDepMin && currentMinutes < toArrMin) {
        const fromStop = stopsMap.get(fromHalt.stopId);
        const toStop = stopsMap.get(toHalt.stopId);

        const segmentDuration = Math.max(1, toArrMin - fromDepMin);
        const elapsed = currentMinutes - fromDepMin;
        const t = Math.min(1, Math.max(0, elapsed / segmentDuration));

        const latFrom = fromStop && typeof fromStop.lat === 'number' ? fromStop.lat : null;
        const lngFrom = fromStop && typeof fromStop.lng === 'number' ? fromStop.lng : null;
        const latTo = toStop && typeof toStop.lat === 'number' ? toStop.lat : latFrom;
        const lngTo = toStop && typeof toStop.lng === 'number' ? toStop.lng : lngFrom;

        let interpolatedLat = latFrom;
        let interpolatedLng = lngFrom;

        if (latFrom !== null && latTo !== null && lngFrom !== null && lngTo !== null) {
          interpolatedLat = latFrom + t * (latTo - latFrom);
          interpolatedLng = lngFrom + t * (lngTo - lngFrom);
        }

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
          statusText: `En route to ${toStop?.name || 'Next Stop'}`
        };
      }
    }

    // Default fallback
    return {
      lat: originLat,
      lng: originLng,
      previousStop: originStop,
      nextStop: destinationStop,
      currentSegmentDescription: 'In transit',
      progressPercent: 50,
      isRestingAtStop: false,
      restingStop: null,
      isTripActive: true,
      statusText: 'In transit'
    };
  },

  /**
   * Calculates ETA and status for a specific bus trip toward a target stop.
   */
  calculateBusEtaForStop(trip, route, bus, targetStopId, currentMinutes, stopsMap) {
    const halts = trip.halts;
    if (!halts || halts.length === 0) return null;

    const targetHaltIndex = halts.findIndex((h) => h.stopId === targetStopId);
    if (targetHaltIndex === -1) return null;

    const targetHalt = halts[targetHaltIndex];
    const targetStop = stopsMap.get(targetStopId);
    if (!targetStop) return null;

    const targetArrMin = this.timeStringToMinutes(targetHalt.arrivalTime);
    const targetDepMin = this.timeStringToMinutes(targetHalt.departureTime || targetHalt.arrivalTime);
    const etaMinutes = Math.round((targetArrMin - currentMinutes) * 100) / 100;

    const originHalt = halts[0];
    const destHalt = halts[halts.length - 1];
    const originStop = stopsMap.get(originHalt.stopId) || targetStop;
    const destinationStop = stopsMap.get(destHalt.stopId) || targetStop;

    const estimatedLocation = this.calculateEstimatedLocation(trip, stopsMap, currentMinutes);

    let lastPassedIndex = -1;
    for (let i = 0; i < halts.length; i++) {
      const haltDep = this.timeStringToMinutes(halts[i].departureTime || halts[i].arrivalTime);
      if (currentMinutes >= haltDep) {
        lastPassedIndex = i;
      }
    }

    const stopsRemaining = Math.max(0, targetHaltIndex - Math.max(0, lastPassedIndex));

    let status = 'Later';
    if (currentMinutes > targetDepMin) {
      status = 'Passed';
    } else if (etaMinutes <= 5) {
      status = 'Arriving Soon';
    } else if (etaMinutes <= 20) {
      status = 'Upcoming';
    }

    const timeline = halts.map((h, idx) => {
      const stopObj = stopsMap.get(h.stopId) || {
        id: h.stopId,
        code: '',
        name: 'Stop ' + (idx + 1),
        lat: null,
        lng: null
      };
      const arr = this.timeStringToMinutes(h.arrivalTime);
      const isPassed = currentMinutes > arr;
      const isCurrent =
        estimatedLocation.restingStop?.id === h.stopId ||
        estimatedLocation.previousStop?.id === h.stopId;
      const isTarget = h.stopId === targetStopId;

      return {
        stop: stopObj,
        sequenceOrder: idx + 1,
        arrivalTime: this.minutesToTimeString(arr),
        departureTime: this.minutesToTimeString(this.timeStringToMinutes(h.departureTime || h.arrivalTime)),
        isPassed,
        isCurrent,
        isTarget
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
      expectedArrivalTime: this.minutesToTimeString(targetArrMin),
      expectedDepartureTime: this.minutesToTimeString(targetDepMin),
      status,
      stopsRemaining,
      location: estimatedLocation,
      timeline
    };
  },

  /**
   * Filter and sort buses arriving at the given stop.
   */
  getBusesForStop(targetStopId, currentMinutes, trips, routesMap, busesMap, stopsMap, filterNext20MinutesOnly = false) {
    const results = [];

    for (const trip of trips) {
      if (!trip.isActive) continue;

      const route = routesMap.get(trip.routeId);
      if (!route || !route.isActive) continue;

      const bus = busesMap.get(trip.busId);
      if (!bus || bus.status !== 'active') continue;

      const etaResult = this.calculateBusEtaForStop(trip, route, bus, targetStopId, currentMinutes, stopsMap);
      if (!etaResult) continue;

      if (etaResult.status === 'Passed') continue;

      if (filterNext20MinutesOnly) {
        if (etaResult.etaMinutes >= 0 && etaResult.etaMinutes <= 20) {
          results.push(etaResult);
        }
      } else {
        if (etaResult.etaMinutes >= 0) {
          results.push(etaResult);
        }
      }
    }

    results.sort((a, b) => a.etaMinutes - b.etaMinutes);
    return results;
  }
};
