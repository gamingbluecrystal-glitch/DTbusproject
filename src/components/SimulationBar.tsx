import React from 'react';
import { useSmartBus } from '../context/SmartBusContext';
import { minutesToTimeString, timeStringToMinutes } from '../services/etaEngine';

export const SimulationBar: React.FC = () => {
  const {
    simulatedMinutes,
    setSimulatedMinutes,
    jumpTime,
    resetToCurrentRealTime,
  } = useSmartBus();

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mins = timeStringToMinutes(e.target.value);
    setSimulatedMinutes(mins);
  };

  const timeInputValue = minutesToTimeString(simulatedMinutes, true);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 text-xs text-gray-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2">
          <label htmlFor="sim-time" className="font-bold text-gray-700">
            Selected Time:
          </label>
          <input
            id="sim-time"
            type="time"
            value={timeInputValue}
            onChange={handleTimeChange}
            className="border border-gray-300 rounded px-2 py-1 font-mono font-bold text-red-700 focus:outline-none focus:border-red-600 bg-white"
          />

          <button
            onClick={() => jumpTime(5)}
            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded font-semibold transition"
          >
            +5 min
          </button>
          <button
            onClick={() => jumpTime(10)}
            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded font-semibold transition"
          >
            +10 min
          </button>
          <button
            onClick={resetToCurrentRealTime}
            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded font-semibold transition"
          >
            Current Time
          </button>
        </div>

        <div className="text-gray-500 font-medium">
          <span className="font-bold text-red-700">Notice:</span> Estimated Location / Arrival based on route timetable (Non-GPS).
        </div>
      </div>
    </div>
  );
};
