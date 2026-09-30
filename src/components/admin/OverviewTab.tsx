import React from 'react';
import { useSmartBus } from '../../context/SmartBusContext';

export const OverviewTab: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { stats, allActiveBusesLocations } = useSmartBus();

  return (
    <div className="space-y-5">
      {/* 4 Dashboard Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div
          onClick={() => onNavigateTab('buses')}
          className="bg-white border-2 border-red-700 p-4 rounded cursor-pointer hover:bg-red-50"
        >
          <div className="text-gray-500 font-bold uppercase">Total Buses</div>
          <div className="text-2xl font-black text-red-700 mt-1">{stats.totalBuses}</div>
        </div>

        <div
          onClick={() => onNavigateTab('routes')}
          className="bg-white border border-gray-300 p-4 rounded cursor-pointer hover:bg-gray-50"
        >
          <div className="text-gray-500 font-bold uppercase">Total Routes</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{stats.totalRoutes}</div>
        </div>

        <div
          onClick={() => onNavigateTab('stops')}
          className="bg-white border border-gray-300 p-4 rounded cursor-pointer hover:bg-gray-50"
        >
          <div className="text-gray-500 font-bold uppercase">Total Stops</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{stats.totalStops}</div>
        </div>

        <div
          onClick={() => onNavigateTab('timetables')}
          className="bg-white border border-gray-300 p-4 rounded cursor-pointer hover:bg-gray-50"
        >
          <div className="text-gray-500 font-bold uppercase">Today's Trips</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{stats.totalTripsToday}</div>
        </div>
      </div>

      {/* Currently Running Buses */}
      <div className="border border-gray-200 rounded p-4 bg-white text-xs">
        <h3 className="text-sm font-bold text-gray-900 mb-2">
          Currently Running Trips ({allActiveBusesLocations.length})
        </h3>
        <p className="text-gray-500 mb-3">
          Expected bus positions calculated from the official timetable.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 border-b border-gray-200 font-bold">
              <tr>
                <th className="p-2">Bus #</th>
                <th className="p-2">Route</th>
                <th className="p-2">Current Segment</th>
                <th className="p-2">Progress</th>
                <th className="p-2">Next Stop</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allActiveBusesLocations.length > 0 ? (
                allActiveBusesLocations.map(({ bus, route, trip, location }) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="p-2 font-bold text-red-700">{bus.busNumber}</td>
                    <td className="p-2">{route.name}</td>
                    <td className="p-2">{location.currentSegmentDescription}</td>
                    <td className="p-2 font-mono font-bold text-red-700">
                      {Math.round(location.progressPercent)}%
                    </td>
                    <td className="p-2">{location.nextStop?.name || 'Destination'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-400">
                    No active trips at this exact clock time. Adjust the time bar above to view running trips.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
