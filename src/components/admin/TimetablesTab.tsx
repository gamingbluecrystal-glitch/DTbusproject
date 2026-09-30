import React, { useState } from 'react';
import { useSmartBus } from '../../context/SmartBusContext';
import { Trip, TimetableHalt } from '../../types';

export const TimetablesTab: React.FC = () => {
  const { trips, routes, buses, stopsMap, addTrip, updateTrip, deleteTrip } = useSmartBus();
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>('all');
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<Trip>>({
    routeId: routes[0]?.id || '',
    busId: buses[0]?.id || '',
    tripNumber: '',
    direction: 'UP',
    halts: [],
    isActive: true,
  });

  const filteredTrips = selectedRouteFilter === 'all'
    ? trips
    : trips.filter((t) => t.routeId === selectedRouteFilter);

  const handleStartCreate = () => {
    const route = routes[0];
    const initialHalts: TimetableHalt[] = route ? route.stops.map((rs, idx) => ({
      stopId: rs.stopId,
      arrivalTime: `08:${String(idx * 7).padStart(2, '0')}`,
      departureTime: `08:${String(idx * 7 + (idx === route.stops.length - 1 ? 0 : 2)).padStart(2, '0')}`,
    })) : [];

    setFormData({
      routeId: route?.id || '',
      busId: buses[0]?.id || '',
      tripNumber: `TRIP-${trips.length + 1}`,
      direction: 'UP',
      halts: initialHalts,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      isActive: true,
    });
    setEditingTrip(null);
    setIsCreating(true);
  };

  const handleRouteChange = (newRouteId: string) => {
    const route = routes.find((r) => r.id === newRouteId);
    if (!route) return;

    const halts: TimetableHalt[] = route.stops.map((rs, idx) => ({
      stopId: rs.stopId,
      arrivalTime: `08:${String(idx * 7).padStart(2, '0')}`,
      departureTime: `08:${String(idx * 7 + (idx === route.stops.length - 1 ? 0 : 2)).padStart(2, '0')}`,
    }));

    setFormData({
      ...formData,
      routeId: newRouteId,
      tripNumber: `TRIP-${trips.length + 1}`,
      halts,
    });
  };

  const handleStartEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setFormData({ ...trip });
    setIsCreating(false);
  };

  const handleHaltTimeChange = (index: number, field: 'arrivalTime' | 'departureTime', val: string) => {
    const curHalts = [...(formData.halts || [])];
    curHalts[index] = { ...curHalts[index], [field]: val };
    setFormData({ ...formData, halts: curHalts });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.routeId || !formData.busId || !formData.halts?.length) {
      alert('Please select Route, Bus and halts.');
      return;
    }

    if (editingTrip) {
      updateTrip({
        ...editingTrip,
        ...(formData as Trip),
      });
    } else {
      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        routeId: formData.routeId!,
        busId: formData.busId!,
        tripNumber: formData.tripNumber || `TRIP-${Date.now()}`,
        direction: 'UP',
        halts: formData.halts!,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
      };
      addTrip(newTrip);
    }

    setIsCreating(false);
    setEditingTrip(null);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Trip Timetables</h3>
          <p className="text-gray-500">Configure arrival and departure times for each stop</p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedRouteFilter}
            onChange={(e) => setSelectedRouteFilter(e.target.value)}
            className="p-1.5 border border-gray-300 rounded bg-white font-semibold"
          >
            <option value="all">All Routes</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                Route {r.routeNumber} ({r.name})
              </option>
            ))}
          </select>

          <button
            onClick={handleStartCreate}
            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded"
          >
            + Schedule New Trip
          </button>
        </div>
      </div>

      {(isCreating || editingTrip) && (
        <form onSubmit={handleSave} className="bg-red-50/50 border border-red-200 p-4 rounded space-y-3">
          <div className="flex items-center justify-between font-bold text-red-900 text-sm">
            <span>{editingTrip ? `Edit Timetable: ${editingTrip.tripNumber}` : 'Add New Trip Timetable'}</span>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingTrip(null);
              }}
              className="text-gray-500 hover:text-black"
            >
              &times;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold mb-1">Select Route</label>
              <select
                value={formData.routeId}
                onChange={(e) => handleRouteChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded bg-white"
                disabled={!!editingTrip}
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    Route {r.routeNumber} ({r.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Assign Bus</label>
              <select
                value={formData.busId}
                onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded bg-white"
              >
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.busNumber} ({b.plateNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Trip Number</label>
              <input
                type="text"
                value={formData.tripNumber || ''}
                onChange={(e) => setFormData({ ...formData, tripNumber: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded bg-white font-mono"
                required
              />
            </div>
          </div>

          {/* Timetable Stop Halts */}
          <div className="bg-white border border-gray-200 rounded p-2">
            <div className="font-bold text-gray-800 mb-2">Halt Timetable:</div>
            <table className="w-full text-left border">
              <thead className="bg-gray-100 font-bold border-b">
                <tr>
                  <th className="p-2">Stop</th>
                  <th className="p-2">Arrival (HH:MM)</th>
                  <th className="p-2">Departure (HH:MM)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {formData.halts?.map((halt, idx) => {
                  const stop = stopsMap.get(halt.stopId);
                  return (
                    <tr key={`${halt.stopId}-${idx}`}>
                      <td className="p-2 font-semibold text-gray-900">
                        {stop ? stop.name : halt.stopId}
                      </td>
                      <td className="p-2">
                        <input
                          type="time"
                          value={halt.arrivalTime}
                          onChange={(e) => handleHaltTimeChange(idx, 'arrivalTime', e.target.value)}
                          className="border p-1 rounded font-mono font-bold"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="time"
                          value={halt.departureTime}
                          onChange={(e) => handleHaltTimeChange(idx, 'departureTime', e.target.value)}
                          className="border p-1 rounded font-mono font-bold"
                          required
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingTrip(null);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button type="submit" className="px-3 py-1.5 bg-red-700 text-white font-bold rounded hover:bg-red-800">
              Save Timetable
            </button>
          </div>
        </form>
      )}

      {/* Trips Table */}
      <table className="w-full text-left border border-gray-200">
        <thead className="bg-gray-100 text-gray-700 border-b border-gray-200 font-bold">
          <tr>
            <th className="p-2">Trip #</th>
            <th className="p-2">Route</th>
            <th className="p-2">Assigned Bus</th>
            <th className="p-2">Start Dep</th>
            <th className="p-2">End Arr</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredTrips.map((trip) => {
            const route = routes.find((r) => r.id === trip.routeId);
            const bus = buses.find((b) => b.id === trip.busId);
            const firstHalt = trip.halts[0];
            const lastHalt = trip.halts[trip.halts.length - 1];

            return (
              <tr key={trip.id} className="hover:bg-gray-50">
                <td className="p-2 font-mono font-bold text-gray-900">{trip.tripNumber}</td>
                <td className="p-2">{route?.name}</td>
                <td className="p-2 font-semibold text-red-700">{bus?.busNumber}</td>
                <td className="p-2 font-mono">{firstHalt?.departureTime || firstHalt?.arrivalTime}</td>
                <td className="p-2 font-mono">{lastHalt?.arrivalTime}</td>
                <td className="p-2 text-right space-x-2">
                  <button
                    onClick={() => handleStartEdit(trip)}
                    className="text-red-700 hover:underline font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete trip ${trip.tripNumber}?`)) {
                        deleteTrip(trip.id);
                      }
                    }}
                    className="text-gray-500 hover:text-red-700 font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
