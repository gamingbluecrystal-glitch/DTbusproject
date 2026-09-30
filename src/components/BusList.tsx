import React from 'react';
import { useSmartBus } from '../context/SmartBusContext';
import { BusEtaResult } from '../types';

export const BusList: React.FC = () => {
  const {
    busesForSelectedStop,
    filterNext20Min,
    setFilterNext20Min,
    selectedStopId,
    stopsMap,
    setActiveRouteModal,
    currentTimeString,
    stops,
  } = useSmartBus();

  const selectedStop = stopsMap.get(selectedStopId);

  if (stops.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded p-6 text-center text-gray-500 text-xs">
        <p className="font-bold text-sm text-gray-800 mb-1">No Schedule Data in Database</p>
        <p>No routes or timetables are currently configured. Please add or import data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header and Filter Buttons */}
      <div className="bg-white border border-gray-200 rounded p-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Arrivals at {selectedStop?.name || 'Selected Stop'}
          </h2>
          <span className="text-xs text-gray-500">As of {currentTimeString}</span>
        </div>

        <div className="flex space-x-1 text-xs">
          <button
            onClick={() => setFilterNext20Min(true)}
            className={`px-3 py-1.5 rounded font-bold border ${
              filterNext20Min
                ? 'bg-red-700 text-white border-red-700'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Next 20 Minutes
          </button>
          <button
            onClick={() => setFilterNext20Min(false)}
            className={`px-3 py-1.5 rounded font-bold border ${
              !filterNext20Min
                ? 'bg-red-700 text-white border-red-700'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Trips Today
          </button>
        </div>
      </div>

      {/* Bus Cards List */}
      {busesForSelectedStop.length > 0 ? (
        <div className="space-y-2.5">
          {busesForSelectedStop.map((item) => (
            <BusCard
              key={`${item.tripId}-${item.bus.id}`}
              item={item}
              onViewRoute={() => setActiveRouteModal(item)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded p-6 text-center text-gray-600 text-xs">
          <p className="font-bold text-sm text-gray-800 mb-1">
            No buses arriving in the next 20 minutes for {selectedStop?.name}.
          </p>
          <p className="mb-3 text-gray-500">
            Try adjusting the time or click "All Trips Today" to see the upcoming schedule.
          </p>
          <button
            onClick={() => setFilterNext20Min(false)}
            className="px-3 py-1.5 bg-red-700 text-white rounded font-bold text-xs hover:bg-red-800"
          >
            View All Trips Today
          </button>
        </div>
      )}
    </div>
  );
};

interface BusCardProps {
  item: BusEtaResult;
  onViewRoute: () => void;
}

const BusCard: React.FC<BusCardProps> = ({ item, onViewRoute }) => {
  const { bus, route, originStop, destinationStop, etaMinutes, expectedArrivalTime, stopsRemaining, status } = item;

  return (
    <div className="bg-white border border-gray-200 rounded p-4 hover:border-red-600 transition shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2 mb-2">
        {/* Bus Number */}
        <div className="flex items-center space-x-2">
          <span className="bg-red-700 text-white font-black text-sm px-2.5 py-0.5 rounded">
            {bus.busNumber}
          </span>
          <span className="text-xs text-gray-500 font-mono">({bus.plateNumber})</span>
        </div>

        {/* Status Tag */}
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded border ${
            status === 'Arriving Soon'
              ? 'bg-red-50 text-red-700 border-red-200'
              : status === 'Upcoming'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-gray-100 text-gray-700 border-gray-200'
          }`}
        >
          {status}
        </span>
      </div>

      {/* Route & Destination */}
      <div className="text-sm font-bold text-gray-900 mb-2">
        {originStop.name} &rarr; <span className="text-red-700">{destinationStop.name}</span>
      </div>

      {/* ETA and Expected Times */}
      <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded border border-gray-100 text-xs mb-3">
        <div>
          <span className="text-gray-500 block text-[11px]">Estimated Arrival</span>
          <span className="text-lg font-black text-red-700">
            {etaMinutes <= 0 ? 'Now' : `${etaMinutes} min`}
          </span>
        </div>
        <div className="text-right">
          <span className="text-gray-500 block text-[11px]">Expected Time</span>
          <span className="text-sm font-bold text-gray-900 font-mono">{expectedArrivalTime}</span>
        </div>
      </div>

      {/* Stops Away & Action */}
      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-gray-600 font-medium">
          {stopsRemaining === 0 ? 'At current stop' : `${stopsRemaining} stops away`}
        </span>

        <button
          onClick={onViewRoute}
          className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white font-bold rounded text-xs transition"
        >
          View Route
        </button>
      </div>
    </div>
  );
};
