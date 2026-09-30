import React, { useState } from 'react';
import { OverviewTab } from './OverviewTab';
import { RoutesTab } from './RoutesTab';
import { BusesTab } from './BusesTab';
import { StopsTab } from './StopsTab';
import { TimetablesTab } from './TimetablesTab';
import { ImportTab } from './ImportTab';

interface AdminDashboardProps {
  onBackToPassenger: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToPassenger }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('smartbus_admin_session') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123' || passwordInput === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('smartbus_admin_session', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('smartbus_admin_session');
    onBackToPassenger();
  };

  // Login Gate for Admin
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white border border-gray-300 rounded p-6 shadow-sm text-xs">
        <div className="bg-red-700 text-white p-3 -m-6 mb-4 rounded-t font-bold text-sm">
          Dispatcher Admin Login
        </div>
        <p className="text-gray-600 mb-4">
          This portal is restricted to authorized transit personnel.
        </p>

        {loginError && (
          <div className="p-2 mb-3 bg-red-100 text-red-800 border border-red-200 rounded font-semibold">
            Incorrect admin password. (Default demo: <code>admin123</code>)
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Admin Password</label>
            <input
              type="password"
              placeholder="Enter admin password (admin123)"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-red-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded transition"
          >
            Log In
          </button>
        </form>

        <div className="mt-4 pt-3 border-t text-center">
          <button
            onClick={onBackToPassenger}
            className="text-gray-500 hover:text-gray-800 underline"
          >
            &larr; Return to Passenger View
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'routes', label: 'Routes' },
    { id: 'buses', label: 'Buses' },
    { id: 'stops', label: 'Bus Stops' },
    { id: 'timetables', label: 'Timetables' },
    { id: 'import', label: 'Import Data' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm">
      {/* Admin Subheader Bar */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Admin Control Panel</h2>
          <p className="text-xs text-gray-500">Manage routes, bus stops, fleet, and scheduled departure timetables</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded transition"
          >
            Logout
          </button>
          <button
            onClick={onBackToPassenger}
            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded transition"
          >
            &larr; Passenger App
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex flex-wrap border-b border-gray-200 bg-gray-50 text-xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 font-bold transition border-b-2 ${
              activeTab === tab.id
                ? 'border-red-700 text-red-700 bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab Body */}
      <div className="p-4 sm:p-6">
        {activeTab === 'dashboard' && <OverviewTab onNavigateTab={setActiveTab} />}
        {activeTab === 'routes' && <RoutesTab />}
        {activeTab === 'buses' && <BusesTab />}
        {activeTab === 'stops' && <StopsTab />}
        {activeTab === 'timetables' && <TimetablesTab />}
        {activeTab === 'import' && <ImportTab />}
      </div>
    </div>
  );
};
