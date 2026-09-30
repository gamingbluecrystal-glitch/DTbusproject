import React, { useState, useEffect } from 'react';
import { SmartBusProvider } from './context/SmartBusContext';
import { Navbar } from './components/Navbar';
import { SimulationBar } from './components/SimulationBar';
import { StopSelector } from './components/StopSelector';
import { BusList } from './components/BusList';
import { MapView } from './components/MapView';
import { RouteModal } from './components/RouteModal';
import { AdminDashboard } from './components/admin/AdminDashboard';

const PassengerView: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* 2-Column Grid: Left Stops & Bus List | Right Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Side: Stop selector and arrivals list */}
        <div className="lg:col-span-5 space-y-4">
          <StopSelector />
          <BusList />
        </div>

        {/* Right Side: Map view */}
        <div className="lg:col-span-7">
          <MapView />
        </div>
      </div>
    </div>
  );
};

export function App() {
  const [currentView, setCurrentView] = useState<'passenger' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin')) return 'admin';
    }
    return 'passenger';
  });

  const handleViewChange = (view: 'passenger' | 'admin') => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      window.location.hash = view;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin')) {
        setCurrentView('admin');
      } else {
        setCurrentView('passenger');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <SmartBusProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
        {/* Red Government Header */}
        <Navbar currentView={currentView} onViewChange={handleViewChange} />

        {/* Simple Time Control Bar */}
        <SimulationBar />

        {/* Route Modal */}
        <RouteModal />

        {/* Main Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:px-6">
          {currentView === 'passenger' ? (
            <PassengerView />
          ) : (
            <AdminDashboard onBackToPassenger={() => handleViewChange('passenger')} />
          )}
        </main>

        {/* Simple Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 text-xs text-gray-600">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <strong className="text-red-700">SmartBus</strong> – Schedule-Based Bus Tracking & ETA System
            </div>
            <div>
              Official Timetable Data • Non-GPS Schedule Tracking
            </div>
          </div>
        </footer>
      </div>
    </SmartBusProvider>
  );
}

export default App;
