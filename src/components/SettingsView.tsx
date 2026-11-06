import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Clock,
  HardDrive,
  Moon,
  Sun,
  Database,
  Info
} from 'lucide-react';
import { db } from '../db/sqliteEmulation';
import { AppSettings, ThemeMode } from '../types';

interface SettingsViewProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentTheme, onThemeChange }) => {
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSettings(settings);
    onThemeChange(settings.theme);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
    db.logActivity('system', 'success', 'Updated global application settings.');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            System &amp; Engine Settings
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>Module 12 Global Controls</span>
            <span aria-hidden="true">·</span>
            <span>Hardware Resource Limits</span>
            <span aria-hidden="true">·</span>
            <span>Persistence &amp; Theme</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Configuration</span>
        </button>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-3 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
          Settings saved to SQLite configuration storage successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Hardware & Task Governor */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Task Engine &amp; Hardware Resource Limits</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Max Concurrent Browser Sessions
              </label>
              <input
                type="number"
                min={1}
                max={16}
                value={settings.maxConcurrentSessions}
                onChange={(e) => setSettings({ ...settings, maxConcurrentSessions: Number(e.target.value) })}
                className="w-full font-mono px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Maximum 16 simultaneous worker processes</span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                CPU Safety Throttle (%)
              </label>
              <input
                type="number"
                min={50}
                max={95}
                value={settings.cpuLimitPercent}
                onChange={(e) => setSettings({ ...settings, cpuLimitPercent: Number(e.target.value) })}
                className="w-full font-mono px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Pauses worker queues when CPU exceeds threshold</span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Memory Safety Ceiling (MB)
              </label>
              <input
                type="number"
                step={256}
                min={1024}
                max={16384}
                value={settings.memoryLimitMb}
                onChange={(e) => setSettings({ ...settings, memoryLimitMb: Number(e.target.value) })}
                className="w-full font-mono px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">RAM allocation limit via psutil</span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Navigation Request Timeout (Seconds)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={settings.requestTimeoutSeconds}
                onChange={(e) => setSettings({ ...settings, requestTimeoutSeconds: Number(e.target.value) })}
                className="w-full font-mono px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Privacy & Browser Defaults */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Privacy Policy &amp; Web Defaults</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Default Timezone
              </label>
              <input
                type="text"
                value={settings.defaultTimezone}
                onChange={(e) => setSettings({ ...settings, defaultTimezone: e.target.value })}
                className="w-full font-mono px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Default Locale
              </label>
              <input
                type="text"
                value={settings.defaultLocale}
                onChange={(e) => setSettings({ ...settings, defaultLocale: e.target.value })}
                className="w-full font-mono px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.webrtcProtection}
                onChange={(e) => setSettings({ ...settings, webrtcProtection: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Enforce WebRTC Leak Shield (disable-non-proxied-udp)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.saveScreenshots}
                onChange={(e) => setSettings({ ...settings, saveScreenshots: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span>Retain Verification Screenshot Evidence in SQLite</span>
            </label>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <span>Desktop Appearance Theme</span>
          </h2>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSettings({ ...settings, theme: 'dark' });
                onThemeChange('dark');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold ${
                currentTheme === 'dark'
                  ? 'border-indigo-600 bg-slate-950 text-white shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Dark Theme (Executive Standard)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSettings({ ...settings, theme: 'light' });
                onThemeChange('light');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold ${
                currentTheme === 'light'
                  ? 'border-indigo-600 bg-white text-slate-900 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Theme (High Daylight Contrast)</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
