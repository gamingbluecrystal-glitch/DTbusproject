import React from 'react';
import { useSmartBus } from '../context/SmartBusContext';

export const RouteModal: React.FC = () => {
  const { activeRouteModal, setActiveRouteModal } = useSmartBus();

  if (!activeRouteModal) return null;

  const {
    bus,
    originStop,
    destinationStop,
    expectedArrivalTime,
    stopsRemaining,
    location,
    timeline,
  } = activeRouteModal;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded border border-gray-300 max-w-lg w-full max-h-[90vh] flex flex-col shadow-lg">
        {/* Header */}
        <div className="bg-red-700 text-white p-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Route Details: {bus.busNumber}</h3>
            <p className="text-xs text-red-100">
              {originStop.name} &rarr; {destinationStop.name}
            </p>
          </div>
          <button
            onClick={() => setActiveRouteModal(null)}
            className="text-white hover:text-gray-200 text-xl font-bold px-2"
          >
            &times;
          </button>
        </div>

        {/* Segment Info */}
        <div className="p-3 bg-red-50 border-b border-red-100 text-xs text-gray-800 space-y-1">
          <div className="font-bold text-red-800">
            Current Segment: {location.currentSegmentDescription}
          </div>
          <div className="grid grid-cols-2 gap-2 text-gray-700 pt-1">
            <div>Previous Stop: <strong>{location.previousStop?.name || originStop.name}</strong></div>
            <div>Next Stop: <strong>{location.nextStop?.name || destinationStop.name}</strong></div>
            <div>Stops Remaining: <strong>{stopsRemaining}</strong></div>
            <div>Estimated Arrival: <strong>{expectedArrivalTime}</strong></div>
          </div>
        </div>

        {/* Complete Stop Sequence Table */}
        <div className="p-3 overflow-y-auto flex-1 text-xs">
          <div className="font-bold text-gray-800 mb-2">Complete Stop Sequence:</div>
          <table className="w-full text-left border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Stop Name</th>
                <th className="p-2">Arrival</th>
                <th className="p-2">Departure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {timeline.map((item, idx) => (
                <tr
                  key={item.stop.id}
                  className={
                    item.isTarget
                      ? 'bg-red-100 font-bold text-red-900'
                      : item.isCurrent
                      ? 'bg-amber-50 font-semibold'
                      : ''
                  }
                >
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">
                    {item.stop.name}
                    {item.isTarget && <span className="ml-2 text-[10px] text-red-700 uppercase">(Your Stop)</span>}
                  </td>
                  <td className="p-2 font-mono">{item.arrivalTime}</td>
                  <td className="p-2 font-mono">{item.departureTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={() => setActiveRouteModal(null)}
            className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
