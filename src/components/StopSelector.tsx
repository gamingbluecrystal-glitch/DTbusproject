import React from 'react';
import { useSmartBus } from '../context/SmartBusContext';

export const StopSelector: React.FC = () => {
  const { stops, selectedStopId, setSelectedStopId } = useSmartBus();

  if (stops.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded p-4 mb-4 shadow-sm text-xs text-gray-500">
        <span className="font-bold text-gray-700">No Bus Stops in Database:</span> Add stops or import timetable data via the Admin portal.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded p-4 mb-4 shadow-sm">
      <label htmlFor="stop-dropdown" className="block text-xs font-bold text-red-800 uppercase tracking-wide mb-1">
        Select Bus Stop / Station
      </label>

      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <select
          id="stop-dropdown"
          value={selectedStopId}
          onChange={(e) => setSelectedStopId(e.target.value)}
          className="w-full sm:flex-1 p-2 border border-gray-300 rounded font-semibold text-sm text-gray-800 focus:outline-none focus:border-red-600 bg-white"
        >
          {stops.map((stop) => (
            <option key={stop.id} value={stop.id}>
              {stop.name} ({stop.code})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
