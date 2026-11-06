import React, { useState } from 'react';
import {
  Fingerprint,
  Monitor,
  Laptop,
  Smartphone,
  Tablet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  Plus,
  Save,
  ShieldAlert,
  Info
} from 'lucide-react';
import { db } from '../db/sqliteEmulation';
import { FingerprintConfig, DeviceFamily } from '../types';

export const FingerprintEditor: React.FC = () => {
  const [fingerprints, setFingerprints] = useState(db.getFingerprints());
  const [selectedId, setSelectedId] = useState(fingerprints[0]?.id || '');

  const activeConfig = fingerprints.find(f => f.id === selectedId) || fingerprints[0];

  // Edit form state
  const [form, setForm] = useState<FingerprintConfig>(activeConfig);

  const selectConfig = (cfg: FingerprintConfig) => {
    setSelectedId(cfg.id);
    setForm(cfg);
  };

  const handleFamilyPreset = (family: DeviceFamily) => {
    let presetUpdates: Partial<FingerprintConfig> = {};
    if (family === 'windows-desktop') {
      presetUpdates = {
        family: 'windows-desktop',
        name: 'Windows 11 Workstation Chrome 133',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        browserName: 'Chrome',
        browserVersion: '133.0.0.0',
        osName: 'Windows',
        osVersion: '11 x64',
        platform: 'Win32',
        screenResolution: '2560x1440',
        viewportWidth: 1920,
        viewportHeight: 1080,
        deviceScaleFactor: 1.25,
        touchEnabled: false,
        maxTouchPoints: 0
      };
    } else if (family === 'windows-laptop') {
      presetUpdates = {
        family: 'windows-laptop',
        name: 'Windows 10 Laptop Edge 132',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0',
        browserName: 'Edge',
        browserVersion: '132.0.2917.39',
        osName: 'Windows',
        osVersion: '10 x64',
        platform: 'Win32',
        screenResolution: '1920x1080',
        viewportWidth: 1536,
        viewportHeight: 864,
        deviceScaleFactor: 1.0,
        touchEnabled: true,
        maxTouchPoints: 10
      };
    } else if (family === 'android-mobile') {
      presetUpdates = {
        family: 'android-mobile',
        name: 'Galaxy S24 Ultra Android 14',
        userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
        browserName: 'Chrome Mobile',
        browserVersion: '133.0.0.0',
        osName: 'Android',
        osVersion: '14.0',
        platform: 'Linux armv8l',
        screenResolution: '1440x3120',
        viewportWidth: 412,
        viewportHeight: 915,
        deviceScaleFactor: 3.5,
        touchEnabled: true,
        maxTouchPoints: 5
      };
    } else if (family === 'android-tablet') {
      presetUpdates = {
        family: 'android-tablet',
        name: 'Pixel Tablet Android 14',
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        browserName: 'Chrome Tablet',
        browserVersion: '133.0.0.0',
        osName: 'Android',
        osVersion: '14.0',
        platform: 'Linux armv8l',
        screenResolution: '2560x1600',
        viewportWidth: 1280,
        viewportHeight: 800,
        deviceScaleFactor: 2.0,
        touchEnabled: true,
        maxTouchPoints: 10
      };
    }
    setForm(prev => ({ ...prev, ...presetUpdates }));
  };

  const handleSave = () => {
    db.updateFingerprint(form.id, form);
    setFingerprints([...db.getFingerprints()]);
    db.logActivity('security', 'success', `Saved fingerprint updates for '${form.name}'.`);
  };

  const handleCreateNew = () => {
    const created = db.addFingerprint({
      name: 'Custom Profile Preset',
      family: 'windows-desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      browserName: 'Chrome',
      browserVersion: '133.0.0.0',
      osName: 'Windows',
      osVersion: '11 x64',
      platform: 'Win32',
      screenResolution: '1920x1080',
      viewportWidth: 1920,
      viewportHeight: 1080,
      deviceScaleFactor: 1.0,
      language: 'en-US',
      locale: 'en-US',
      timezone: 'America/New_York',
      colorScheme: 'dark',
      touchEnabled: false,
      maxTouchPoints: 0,
      canvasNoise: true,
      webglNoise: true,
      audioNoise: true,
      webRtcPolicy: 'disable-non-proxied-udp',
      geolocationPermission: 'prompt'
    });
    setFingerprints([...db.getFingerprints()]);
    setSelectedId(created.id);
    setForm(created);
  };

  // Consistency validation algorithm
  const checkConsistency = () => {
    const issues: string[] = [];
    let score = 100;

    // Check UA vs OS
    const isUaAndroid = form.userAgent.includes('Android');
    const isUaWindows = form.userAgent.includes('Windows');

    if (isUaAndroid && form.osName !== 'Android') {
      issues.push('UA indicates Android, but OS is set to ' + form.osName);
      score -= 30;
    }
    if (isUaWindows && form.osName !== 'Windows') {
      issues.push('UA indicates Windows, but OS is set to ' + form.osName);
      score -= 30;
    }
    if (isUaAndroid && form.platform !== 'Linux armv8l' && form.platform !== 'Linux aarch64') {
      issues.push('Android UA requires Linux ARM platform, got ' + form.platform);
      score -= 20;
    }
    if (isUaWindows && form.platform !== 'Win32') {
      issues.push('Windows UA requires Win32 navigator.platform, got ' + form.platform);
      score -= 20;
    }
    if (form.family === 'android-mobile' && !form.touchEnabled) {
      issues.push('Mobile profile should have touch capability enabled');
      score -= 15;
    }
    if (form.viewportWidth > parseInt(form.screenResolution.split('x')[0] || '1920')) {
      issues.push('Viewport width exceeds screen resolution width');
      score -= 15;
    }

    return { score: Math.max(0, score), issues };
  };

  const consistency = checkConsistency();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Browser Fingerprint Configuration
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>Module 2 Architecture</span>
            <span aria-hidden="true">·</span>
            <span>Consistency Checker</span>
            <span aria-hidden="true">·</span>
            <span>Device Family Profiles</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Fingerprint</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Compliance Box */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">Fingerprint Architecture Policy: </span>
          <span>
            SEARX AI ULTRA PRO enforces consistent, authentic browser parameters across User-Agent, platform, and viewport dimensions. It strictly avoids illegal identity spoofing or randomized property collages that trigger automated bot detection.
          </span>
        </div>
      </div>

      {/* Device Family Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'windows-desktop', label: 'Windows Desktop', icon: Monitor, desc: 'High-res dual display' },
          { id: 'windows-laptop', label: 'Windows Laptop', icon: Laptop, desc: '1080p touch ultrabook' },
          { id: 'android-mobile', label: 'Android Mobile', icon: Smartphone, desc: 'High-DPI touch screen' },
          { id: 'android-tablet', label: 'Android Tablet', icon: Tablet, desc: 'Landscape 2560x1600' },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = form.family === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleFamilyPreset(item.id as DeviceFamily)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                isActive
                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.label}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Form Left, Consistency Radar Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Settings (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Fingerprint Parameters
            </h2>
            <select
              value={selectedId}
              onChange={(e) => {
                const found = fingerprints.find(f => f.id === e.target.value);
                if (found) selectConfig(found);
              }}
              className="text-xs px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
            >
              {fingerprints.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Configuration Profile Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                User-Agent String
              </label>
              <textarea
                rows={2}
                value={form.userAgent}
                onChange={(e) => setForm({ ...form, userAgent: e.target.value })}
                className="w-full font-mono text-[11px] px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Split row: OS & Platform */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Operating System
                </label>
                <input
                  type="text"
                  value={form.osName}
                  onChange={(e) => setForm({ ...form, osName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Navigator Platform
                </label>
                <input
                  type="text"
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
            </div>

            {/* Split row: Screen & Viewport */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Screen Resolution
                </label>
                <input
                  type="text"
                  value={form.screenResolution}
                  onChange={(e) => setForm({ ...form, screenResolution: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Viewport Dimensions
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={form.viewportWidth}
                    onChange={(e) => setForm({ ...form, viewportWidth: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                  <span>×</span>
                  <input
                    type="number"
                    value={form.viewportHeight}
                    onChange={(e) => setForm({ ...form, viewportHeight: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Device Scale Factor
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={form.deviceScaleFactor}
                  onChange={(e) => setForm({ ...form, deviceScaleFactor: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
            </div>

            {/* Split row: Locale & Timezone */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Locale
                </label>
                <input
                  type="text"
                  value={form.locale}
                  onChange={(e) => setForm({ ...form, locale: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Timezone ID
                </label>
                <input
                  type="text"
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Color Scheme
                </label>
                <select
                  value={form.colorScheme}
                  onChange={(e) => setForm({ ...form, colorScheme: e.target.value as any })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="no-preference">No Preference</option>
                </select>
              </div>
            </div>

            {/* Checkboxes row: Touch, Canvas, WebGL, Audio noise */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.touchEnabled}
                  onChange={(e) => setForm({ ...form, touchEnabled: e.target.checked, maxTouchPoints: e.target.checked ? 5 : 0 })}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <span>Touch Capability</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.canvasNoise}
                  onChange={(e) => setForm({ ...form, canvasNoise: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <span>Canvas Noise</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.webglNoise}
                  onChange={(e) => setForm({ ...form, webglNoise: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <span>WebGL Noise</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.audioNoise}
                  onChange={(e) => setForm({ ...form, audioNoise: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <span>Audio Noise</span>
              </label>
            </div>
          </div>
        </div>

        {/* Consistency Checker Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
              Fingerprint Consistency Engine
            </h2>

            <div className="mt-4 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {consistency.score}%
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                {consistency.score >= 90 ? 'High Coherence' : consistency.score >= 70 ? 'Moderate Coherence' : 'Incoherent Parameters'}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Consistency Audit
              </div>
              {consistency.issues.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>No architectural anomalies detected. All parameters align naturally.</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {consistency.issues.map((iss, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{iss}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-xs text-slate-500 space-y-2">
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              Why Fingerprint Consistency Matters:
            </div>
            <p>
              Modern web servers cross-reference HTTP User-Agent headers against <code className="font-mono">navigator.platform</code>, screen coordinates, and touch support. A desktop browser claiming mobile touch with Win32 platform triggers immediate bot flags.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
