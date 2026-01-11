'use client';

import { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  Globe, 
  Database,
  Zap,
  Save
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    lowBatteryThreshold: 20,
    offlineTimeoutMinutes: 60,
    refreshIntervalSeconds: 30,
    enableEmailAlerts: true,
    enableSmsAlerts: false,
    timezone: 'Asia/Dubai',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save settings to backend
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Configure parking system preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* Alert Settings */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Alert Settings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Low Battery Threshold (%)
              </label>
              <input
                type="number"
                min={5}
                max={50}
                value={settings.lowBatteryThreshold}
                onChange={(e) => setSettings({ ...settings, lowBatteryThreshold: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Alert when sensor battery drops below this level
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Offline Timeout (minutes)
              </label>
              <input
                type="number"
                min={15}
                max={180}
                value={settings.offlineTimeoutMinutes}
                onChange={(e) => setSettings({ ...settings, offlineTimeoutMinutes: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Mark sensor offline if no heartbeat received within this time
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Alerts</p>
                <p className="text-sm text-slate-500">Receive alerts via email</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, enableEmailAlerts: !settings.enableEmailAlerts })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.enableEmailAlerts ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.enableEmailAlerts ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">SMS Alerts</p>
                <p className="text-sm text-slate-500">Receive critical alerts via SMS</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, enableSmsAlerts: !settings.enableSmsAlerts })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.enableSmsAlerts ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.enableSmsAlerts ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">System Settings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Dashboard Refresh Interval (seconds)
              </label>
              <select
                value={settings.refreshIntervalSeconds}
                onChange={(e) => setSettings({ ...settings, refreshIntervalSeconds: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={120}>2 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Asia/Dubai">Dubai (GMT+4)</option>
                <option value="Asia/Abu_Dhabi">Abu Dhabi (GMT+4)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">API Configuration</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50">
              <div>
                <p className="text-white font-medium">API Endpoint</p>
                <p className="text-sm text-slate-500 font-mono">
                  https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod
                </p>
              </div>
              <span className="flex items-center gap-1 text-emerald-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </span>
            </div>

            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50">
              <div>
                <p className="text-white font-medium">IoT Endpoint</p>
                <p className="text-sm text-slate-500 font-mono">
                  a15wlpv31y3kre-ats.iot.me-central-1.amazonaws.com
                </p>
              </div>
              <span className="flex items-center gap-1 text-emerald-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </span>
            </div>

            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50">
              <div>
                <p className="text-white font-medium">Region</p>
                <p className="text-sm text-slate-500">me-central-1 (UAE)</p>
              </div>
              <span className="flex items-center gap-1 text-emerald-400 text-sm">
                <Globe className="w-4 h-4" />
                UAE
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
