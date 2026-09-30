import React from 'react';
import { useSmartBus } from '../context/SmartBusContext';

interface NavbarProps {
  currentView: 'passenger' | 'admin';
  onViewChange: (view: 'passenger' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  const { currentTimeString } = useSmartBus();

  return (
    <header className="bg-red-700 text-white border-b-4 border-red-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onViewChange('passenger')}>
          <div className="bg-white text-red-700 font-bold px-2 py-1 text-sm rounded border border-red-200">
            BUS
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">SmartBus</h1>
            <p className="text-xs text-red-100">Schedule-Based Bus Tracking & ETA System</p>
          </div>
        </div>

        {/* Right Info: Clock ONLY for passengers (No Admin button!) */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-red-800 px-3 py-1.5 rounded border border-red-600 font-mono font-bold">
            Time: {currentTimeString}
          </div>

          {/* Only show Exit Admin if currently in Admin view */}
          {currentView === 'admin' && (
            <button
              onClick={() => onViewChange('passenger')}
              className="bg-white text-red-800 px-3 py-1.5 rounded font-bold hover:bg-gray-100 transition"
            >
              &larr; Exit Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
