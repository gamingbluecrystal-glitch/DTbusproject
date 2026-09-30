import React, { useState } from 'react';
import { useSmartBus } from '../../context/SmartBusContext';
import { StorageService, AppSettings } from '../../services/storageService';

export const ImportTab: React.FC = () => {
  const { resetToDefaults, clearAllData, importJsonData } = useSmartBus();
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [dbSaved, setDbSaved] = useState(false);

  const sampleCsvContent = `RouteNumber,BusNumber,StopCode,ArrivalTime,DepartureTime
101,BUS 101,NSR-01,08:00,08:02
101,BUS 101,BYT-02,08:07,08:08
101,BUS 101,DWK-04,08:15,08:16
101,BUS 101,MBN-05,08:22,08:23
101,BUS 101,CBS-06,08:30,08:30`;

  const handleDownloadCsv = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'timetable_sample.csv';
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (file.name.endsWith('.json')) {
        const ok = importJsonData(content);
        setStatusMsg(ok ? 'JSON data imported successfully.' : 'Error: Invalid JSON format.');
      } else {
        setStatusMsg(`CSV file "${file.name}" uploaded successfully.`);
      }
    };
    reader.readAsText(file);
  };

  const handleSeedTemplate = () => {
    resetToDefaults();
    setStatusMsg('Loaded template route (Nashik Road → CBS with 5 stops and timetable).');
  };

  const handleClearAll = () => {
    if (confirm('Clear all data from the database? (Tables will be completely empty)')) {
      clearAllData();
      setStatusMsg('All database tables cleared. Application is now empty.');
    }
  };

  const handleSaveDbSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(settings);
    setDbSaved(true);
    setTimeout(() => setDbSaved(false), 3000);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="pb-3 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-900">Database & Timetable Import</h3>
        <p className="text-gray-500">Configure PostgreSQL/Supabase database and import timetable files</p>
      </div>

      {statusMsg && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 font-semibold rounded">
          {statusMsg}
        </div>
      )}

      {/* Database Connection Form */}
      <form onSubmit={handleSaveDbSettings} className="border border-gray-200 p-4 rounded bg-white space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-800">Supabase / PostgreSQL Cloud Database</h4>
          {dbSaved && <span className="text-green-700 font-bold">Saved!</span>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Database / Supabase URL</label>
            <input
              type="text"
              placeholder="https://your-project.supabase.co"
              value={settings.supabaseUrl}
              onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded font-mono"
            />
          </div>
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Database Anon / Public Key</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              value={settings.supabaseAnonKey}
              onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded font-mono"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded"
          >
            Save Database Settings
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload box */}
        <div className="border border-gray-200 p-4 rounded bg-white space-y-3">
          <h4 className="font-bold text-gray-800">Upload Timetable File (.csv / .json)</h4>
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleFileUpload}
            className="border p-2 rounded w-full bg-gray-50 text-xs"
          />
          <button
            onClick={handleDownloadCsv}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 border rounded font-semibold"
          >
            Download Sample CSV Template
          </button>
        </div>

        {/* Database Controls */}
        <div className="border border-gray-200 p-4 rounded bg-white space-y-3">
          <h4 className="font-bold text-gray-800">Database Tools</h4>
          <p className="text-gray-500">
            Wipe all tables to start completely blank, or load the single Nashik Road &rarr; CBS template.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded"
            >
              Clear All Data (Empty Tables)
            </button>
            <button
              onClick={handleSeedTemplate}
              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded"
            >
              Load Sample Template
            </button>
          </div>
        </div>
      </div>

      {/* CSV format preview */}
      <div className="border border-gray-200 rounded p-3 bg-gray-50 font-mono text-[11px]">
        <div className="font-bold font-sans text-gray-700 mb-1">Expected CSV Columns:</div>
        <pre>{sampleCsvContent}</pre>
      </div>
    </div>
  );
};
