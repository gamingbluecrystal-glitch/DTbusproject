import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, Radio, Check, Save, Sparkles, ExternalLink, Code2 } from 'lucide-react';
import { StorageService, AppSettings } from '../../services/storageService';
import { isSupabaseConfigured } from '../../services/supabaseClient';

export const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h3 className="text-lg font-bold text-slate-900">System & Database Settings</h3>
        <p className="text-xs text-slate-500">
          Configure cloud persistence (Supabase / PostgreSQL), simulation behavior, and future GPS hardware adapters
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center space-x-2 shadow-md">
          <Check className="w-4 h-4" />
          <span>System settings updated successfully!</span>
        </div>
      )}

      {/* Supabase / PostgreSQL Connection */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-sky-600">
            <Database className="w-5 h-5" />
            <h4 className="text-sm font-bold text-slate-900">Supabase / PostgreSQL Cloud Sync</h4>
          </div>
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              isSupabaseConfigured()
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isSupabaseConfigured() ? 'Cloud Connected' : 'Local Persistence Active'}
          </span>
        </div>

        <p className="text-xs text-slate-500">
          SmartBus automatically falls back to local high-performance browser storage so it works out of the box with zero setup. You can plug in your Supabase project credentials anytime:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Supabase Project URL</label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={settings.supabaseUrl}
              onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Supabase Anon Public API Key</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={settings.supabaseAnonKey}
              onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500 font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Future GPS / VTS Integration Architecture Guide */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md space-y-4">
        <div className="flex items-center space-x-2 text-emerald-400">
          <Radio className="w-5 h-5" />
          <h4 className="text-sm font-bold">Future GPS / VTS Hardware Integration Ready</h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The SmartBus ETA Calculation Engine was designed with a modular <strong>Adapter Pattern</strong>. Currently, it consumes the <code>ScheduleInterpolationAdapter</code>. When GPS/VTS devices (such as AIS-140 standard OBD-II / CAN bus trackers or smartphone driver apps) are installed in buses, they can push coordinates to the system via the following endpoint without touching user-facing code:
        </p>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
          <div className="text-sky-400 font-bold">POST /api/v1/telemetry/gps</div>
          <div className="text-slate-400">
            {`{
  "busId": "bus-101",
  "plateNumber": "MH-15-EG-4521",
  "latitude": 19.9723,
  "longitude": 73.8210,
  "speedKmph": 28.4,
  "headingDegrees": 182.5,
  "timestamp": 1727675153
}`}
          </div>
        </div>

        <p className="text-xs text-slate-400">
          When live coordinates are present for a bus, the ETA engine switches its source flag from <code>SCHEDULE_INTERPOLATED</code> to <code>LIVE_GPS</code>, recalculating the ETA minutes using real traffic velocity!
        </p>
      </div>
    </div>
  );
};
