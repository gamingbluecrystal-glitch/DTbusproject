import React, { useState } from 'react';
import { useSmartBus } from '../../context/SmartBusContext';
import { Route, RouteStop } from '../../types';

export const RoutesTab: React.FC = () => {
  const { routes, stops, addRoute, updateRoute, deleteRoute } = useSmartBus();
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<Route>>({
    routeNumber: '',
    name: '',
    via: '',
    color: '#b91c1c',
    isActive: true,
    stops: [],
  });

  const handleStartCreate = () => {
    setFormData({
      routeNumber: `${routes.length + 101}`,
      name: '',
      via: '',
      color: '#b91c1c',
      isActive: true,
      stops: [
        { stopId: stops[0]?.id || '', sequenceOrder: 1, approxMinutesFromPrev: 0 },
        { stopId: stops[1]?.id || '', sequenceOrder: 2, approxMinutesFromPrev: 8 },
      ],
    });
    setEditingRoute(null);
    setIsCreating(true);
  };

  const handleStartEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({ ...route });
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.routeNumber) {
      alert('Please fill Route Number and Name.');
      return;
    }

    const routeStops = formData.stops || [];
    const originStopId = routeStops[0]?.stopId || '';
    const destinationStopId = routeStops[routeStops.length - 1]?.stopId || '';

    if (editingRoute) {
      updateRoute({
        ...editingRoute,
        ...(formData as Route),
        originStopId,
        destinationStopId,
      });
    } else {
      const newRoute: Route = {
        id: `route-${Date.now()}`,
        routeNumber: formData.routeNumber!,
        name: formData.name!,
        originStopId,
        destinationStopId,
        via: formData.via || '',
        color: '#b91c1c',
        isActive: formData.isActive ?? true,
        stops: routeStops,
      };
      addRoute(newRoute);
    }

    setIsCreating(false);
    setEditingRoute(null);
  };

  const handleAddStopToSequence = (stopId: string) => {
    const curStops = formData.stops || [];
    const newSeq: RouteStop = {
      stopId,
      sequenceOrder: curStops.length + 1,
      approxMinutesFromPrev: 7,
    };
    setFormData({ ...formData, stops: [...curStops, newSeq] });
  };

  const handleRemoveStopFromSequence = (index: number) => {
    const curStops = formData.stops || [];
    const updated = curStops.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      sequenceOrder: idx + 1,
      approxMinutesFromPrev: idx === 0 ? 0 : s.approxMinutesFromPrev,
    }));
    setFormData({ ...formData, stops: updated });
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Bus Routes</h3>
          <p className="text-gray-500">Manage bus routes and sequence of stops</p>
        </div>
        <button
          onClick={handleStartCreate}
          className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded"
        >
          + Add New Route
        </button>
      </div>

      {/* Create / Edit Form */}
      {(isCreating || editingRoute) && (
        <form onSubmit={handleSave} className="bg-red-50/50 border border-red-200 p-4 rounded space-y-3">
          <div className="flex items-center justify-between font-bold text-red-900 text-sm">
            <span>{editingRoute ? `Edit Route: ${editingRoute.routeNumber}` : 'Add Route'}</span>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingRoute(null);
              }}
              className="text-gray-500 hover:text-black"
            >
              &times;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold mb-1">Route Number</label>
              <input
                type="text"
                value={formData.routeNumber || ''}
                onChange={(e) => setFormData({ ...formData, routeNumber: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded bg-white"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Route Name (e.g. Nashik Road &rarr; CBS)</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Via Stops (e.g. Bytco, Dwarka, Mumbai Naka)</label>
            <input
              type="text"
              value={formData.via || ''}
              onChange={(e) => setFormData({ ...formData, via: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            />
          </div>

          {/* Stops Sequence */}
          <div className="bg-white border border-gray-200 p-3 rounded space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span>Stops Sequence ({formData.stops?.length || 0} stops):</span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddStopToSequence(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="p-1 border border-gray-300 rounded bg-white text-xs"
              >
                <option value="">+ Append Stop...</option>
                {stops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              {formData.stops?.map((st, idx) => {
                const stopObj = stops.find((s) => s.id === st.stopId);
                return (
                  <div key={`${st.stopId}-${idx}`} className="flex items-center justify-between p-2 bg-gray-50 border rounded">
                    <div>
                      <span className="font-bold mr-2 text-red-700">{idx + 1}.</span>
                      <span className="font-semibold text-gray-800">{stopObj ? stopObj.name : st.stopId}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {idx > 0 && (
                        <div className="flex items-center space-x-1">
                          <span>+</span>
                          <input
                            type="number"
                            min="1"
                            value={st.approxMinutesFromPrev || 7}
                            onChange={(e) => {
                              const mins = parseInt(e.target.value, 10) || 1;
                              const updated = [...(formData.stops || [])];
                              updated[idx] = { ...updated[idx], approxMinutesFromPrev: mins };
                              setFormData({ ...formData, stops: updated });
                            }}
                            className="w-12 p-0.5 border text-center font-mono"
                          />
                          <span>min</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveStopFromSequence(idx)}
                        className="text-red-700 hover:text-red-900 font-bold px-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingRoute(null);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button type="submit" className="px-3 py-1.5 bg-red-700 text-white font-bold rounded hover:bg-red-800">
              Save Route
            </button>
          </div>
        </form>
      )}

      {/* Routes List Table */}
      <table className="w-full text-left border border-gray-200">
        <thead className="bg-gray-100 text-gray-700 border-b border-gray-200 font-bold">
          <tr>
            <th className="p-2">Route #</th>
            <th className="p-2">Name</th>
            <th className="p-2">Via</th>
            <th className="p-2">Stops</th>
            <th className="p-2">Status</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {routes.map((route) => (
            <tr key={route.id} className="hover:bg-gray-50">
              <td className="p-2 font-bold text-red-700">{route.routeNumber}</td>
              <td className="p-2 font-semibold text-gray-900">{route.name}</td>
              <td className="p-2 text-gray-600">{route.via}</td>
              <td className="p-2">{route.stops.length} stops</td>
              <td className="p-2">
                <button
                  onClick={() => updateRoute({ ...route, isActive: !route.isActive })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                    route.isActive ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}
                >
                  {route.isActive ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="p-2 text-right space-x-2">
                <button
                  onClick={() => handleStartEdit(route)}
                  className="text-red-700 hover:underline font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete Route ${route.routeNumber}?`)) {
                      deleteRoute(route.id);
                    }
                  }}
                  className="text-gray-500 hover:text-red-700 font-semibold"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
