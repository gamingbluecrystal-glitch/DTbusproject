import React, { useState } from 'react';
import { useSmartBus } from '../../context/SmartBusContext';
import { Bus } from '../../types';

export const BusesTab: React.FC = () => {
  const { buses, addBus, updateBus, deleteBus } = useSmartBus();
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<Bus>>({
    busNumber: '',
    plateNumber: '',
    model: 'Standard City Bus',
    capacity: 45,
    status: 'active',
  });

  const handleStartCreate = () => {
    setFormData({
      busNumber: `BUS ${buses.length + 101}`,
      plateNumber: `MH-15-EG-${Math.floor(1000 + Math.random() * 9000)}`,
      model: 'Standard City Bus',
      capacity: 45,
      status: 'active',
    });
    setEditingBus(null);
    setIsCreating(true);
  };

  const handleStartEdit = (bus: Bus) => {
    setEditingBus(bus);
    setFormData({ ...bus });
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.busNumber || !formData.plateNumber) {
      alert('Please fill Bus Number and License Plate.');
      return;
    }

    if (editingBus) {
      updateBus({
        ...editingBus,
        ...(formData as Bus),
      });
    } else {
      const newBus: Bus = {
        id: `bus-${Date.now()}`,
        busNumber: formData.busNumber!,
        plateNumber: formData.plateNumber!,
        model: formData.model || 'Standard City Bus',
        capacity: formData.capacity || 45,
        status: (formData.status as any) || 'active',
      };
      addBus(newBus);
    }

    setIsCreating(false);
    setEditingBus(null);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Bus Fleet</h3>
          <p className="text-gray-500">Manage bus inventory and operational status</p>
        </div>
        <button
          onClick={handleStartCreate}
          className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded"
        >
          + Add New Bus
        </button>
      </div>

      {(isCreating || editingBus) && (
        <form onSubmit={handleSave} className="bg-red-50/50 border border-red-200 p-4 rounded space-y-3">
          <div className="flex items-center justify-between font-bold text-red-900 text-sm">
            <span>{editingBus ? `Edit Bus: ${editingBus.busNumber}` : 'Add Bus to Fleet'}</span>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingBus(null);
              }}
              className="text-gray-500 hover:text-black"
            >
              &times;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">Bus Number (e.g. BUS 102)</label>
              <input
                type="text"
                value={formData.busNumber || ''}
                onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded bg-white font-bold"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Plate Number (e.g. MH-15-EG-4521)</label>
              <input
                type="text"
                value={formData.plateNumber || ''}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded bg-white font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold mb-1">Model</label>
              <input
                type="text"
                value={formData.model || ''}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Capacity (Seats)</label>
              <input
                type="number"
                value={formData.capacity || 45}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 45 })}
                className="w-full p-2 border border-gray-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Status</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded bg-white"
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingBus(null);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button type="submit" className="px-3 py-1.5 bg-red-700 text-white font-bold rounded hover:bg-red-800">
              Save Bus
            </button>
          </div>
        </form>
      )}

      {/* Buses Table */}
      <table className="w-full text-left border border-gray-200">
        <thead className="bg-gray-100 text-gray-700 border-b border-gray-200 font-bold">
          <tr>
            <th className="p-2">Bus #</th>
            <th className="p-2">Plate Number</th>
            <th className="p-2">Model</th>
            <th className="p-2">Capacity</th>
            <th className="p-2">Status</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {buses.map((bus) => (
            <tr key={bus.id} className="hover:bg-gray-50">
              <td className="p-2 font-bold text-red-700">{bus.busNumber}</td>
              <td className="p-2 font-mono text-gray-800">{bus.plateNumber}</td>
              <td className="p-2 text-gray-600">{bus.model}</td>
              <td className="p-2 text-gray-600">{bus.capacity} seats</td>
              <td className="p-2">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                    bus.status === 'active'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}
                >
                  {bus.status.toUpperCase()}
                </span>
              </td>
              <td className="p-2 text-right space-x-2">
                <button
                  onClick={() => handleStartEdit(bus)}
                  className="text-red-700 hover:underline font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${bus.busNumber}?`)) {
                      deleteBus(bus.id);
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
