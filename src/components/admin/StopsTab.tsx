import React, { useState } from 'react';
import { useSmartBus } from '../../context/SmartBusContext';
import { Stop } from '../../types';

export const StopsTab: React.FC = () => {
  const { stops, addStop, updateStop, deleteStop } = useSmartBus();
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<Stop>>({
    code: '',
    name: '',
    lat: 19.9975,
    lng: 73.7898,
  });

  const handleStartCreate = () => {
    setFormData({
      code: `STP-${stops.length + 1}`,
      name: '',
      lat: 19.9975,
      lng: 73.7898,
    });
    setEditingStop(null);
    setIsCreating(true);
  };

  const handleStartEdit = (stop: Stop) => {
    setEditingStop(stop);
    setFormData({ ...stop });
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || formData.lat === undefined || formData.lng === undefined) {
      alert('Please fill Stop Name, Code, and Coordinates.');
      return;
    }

    if (editingStop) {
      updateStop({
        ...editingStop,
        ...(formData as Stop),
      });
    } else {
      const newStop: Stop = {
        id: `stop-${Date.now()}`,
        code: formData.code!,
        name: formData.name!,
        lat: Number(formData.lat),
        lng: Number(formData.lng),
      };
      addStop(newStop);
    }

    setIsCreating(false);
    setEditingStop(null);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Bus Stops & Coordinates</h3>
          <p className="text-gray-500">Manage bus stop stations and latitude/longitude</p>
        </div>
        <button
          onClick={handleStartCreate}
          className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded"
        >
          + Add New Stop
        </button>
      </div>

      {(isCreating || editingStop) && (
        <form onSubmit={handleSave} className="bg-red-50/50 border border-red-200 p-4 rounded space-y-3">
          <div className="flex items-center justify-between font-bold text-red-900 text-sm">
            <span>{editingStop ? `Edit Stop: ${editingStop.name}` : 'Add Bus Stop'}</span>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingStop(null);
              }}
              className="text-gray-500 hover:text-black"
            >
              &times;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">Stop Code (e.g. DWK-04)</label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded bg-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Stop Name (e.g. Dwarka)</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded bg-white font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={formData.lat ?? 19.9975}
                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded bg-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={formData.lng ?? 73.7898}
                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded bg-white font-mono"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingStop(null);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button type="submit" className="px-3 py-1.5 bg-red-700 text-white font-bold rounded hover:bg-red-800">
              Save Stop
            </button>
          </div>
        </form>
      )}

      {/* Stops Table */}
      <table className="w-full text-left border border-gray-200">
        <thead className="bg-gray-100 text-gray-700 border-b border-gray-200 font-bold">
          <tr>
            <th className="p-2">Code</th>
            <th className="p-2">Stop Name</th>
            <th className="p-2">Latitude</th>
            <th className="p-2">Longitude</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {stops.map((stop) => (
            <tr key={stop.id} className="hover:bg-gray-50">
              <td className="p-2 font-mono font-bold text-gray-800">{stop.code}</td>
              <td className="p-2 font-semibold text-gray-900">{stop.name}</td>
              <td className="p-2 font-mono text-gray-600">{stop.lat.toFixed(4)}</td>
              <td className="p-2 font-mono text-gray-600">{stop.lng.toFixed(4)}</td>
              <td className="p-2 text-right space-x-2">
                <button
                  onClick={() => handleStartEdit(stop)}
                  className="text-red-700 hover:underline font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete stop ${stop.name}?`)) {
                      deleteStop(stop.id);
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
