import React from 'react';
import {
  Users,
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Cpu,
  Layers,
  Play,
  Pause,
  Square,
  ArrowRight,
  Workflow
} from 'lucide-react';
import { db } from '../db/sqliteEmulation';
import { NavigationTab } from './Sidebar';

interface DashboardProps {
  onNavigate: (tab: NavigationTab) => void;
  onLaunchQuickTask: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onLaunchQuickTask }) => {
  const analytics = db.getAnalytics();
  const profiles = db.getProfiles();
  const tasks = db.getTasks().slice(0, 5);
  const logs = db.getLogs().slice(0, 6);
  const proxies = db.getProxies();

  const handleToggleProfile = (id: string, currentStatus: string) => {
    if (currentStatus === 'running') {
      db.setProfileStatus(id, 'stopped');
    } else {
      db.setProfileStatus(id, 'running');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            System Operations Overview
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>SEARX AI ULTRA PRO</span>
            <span aria-hidden="true">·</span>
            <span>Windows Desktop Environment</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Database Synchronized</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('tasks')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            Manage Task Queue
          </button>
          <button
            onClick={onLaunchQuickTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Execute RPA Audit</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Browser Profiles</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono tabular-nums">
            {analytics.totalProfiles}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {analytics.activeSessions} currently active
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Sessions</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 font-mono tabular-nums">
            {analytics.activeSessions}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Multi-context Playwright
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Proxy Fleet</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono tabular-nums">
            {analytics.activeProxies} / {analytics.totalProxies}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            HTTP / HTTPS / SOCKS5
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Latency</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono tabular-nums">
            {analytics.averageResponseTimeMs} ms
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Verified endpoint roundtrip
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Completed Tasks</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono tabular-nums">
            {analytics.completedTasks}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {analytics.workflowSuccessRate}% success rate
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Target Domains</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono tabular-nums">
            {analytics.totalWebsites}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {analytics.totalUrls} saved URLs
          </div>
        </div>
      </div>

      {/* Main Split: Profile Fast-Controller + Task Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Profile Control Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Browser Profiles & Hardware Routing
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Isolated user data directories with separate cookies, local storage, and independent proxies.
              </p>
            </div>
            <button
              onClick={() => onNavigate('profiles')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All ({profiles.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
            {profiles.map((p) => {
              const isRunning = p.status === 'running';
              const assignedProxy = proxies.find(x => x.id === p.proxyId);
              return (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {p.name}
                      </span>
                      <span className="text-[11px] text-slate-400">· {p.group}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>Cookies: <strong className="font-mono">{p.cookiesCount}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Storage: <strong className="font-mono">{p.localStorageCount} items</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Proxy: <span className="font-mono">{assignedProxy ? `${assignedProxy.protocol.toUpperCase()}://${assignedProxy.host}` : 'Direct Network'}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleProfile(p.id, p.status)}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                        isRunning
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Launch</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Hardware & Resource Meter */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Resource Governor
              </h2>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">psutil engine</span>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>Simulated CPU Allocation</span>
                  <span className="font-mono tabular-nums">{analytics.cpuUsagePercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      analytics.cpuUsagePercent > 75 ? 'bg-amber-500' : 'bg-indigo-600 dark:bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(analytics.cpuUsagePercent, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Safety throttle activates at 85% CPU load</p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>RAM Usage</span>
                  <span className="font-mono tabular-nums">{analytics.memoryUsageMb} MB / 8192 MB</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min((analytics.memoryUsageMb / 8192) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Multi-profile cache allocation</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <div className="flex justify-between font-mono">
                  <span>WebRTC UDP Leak Shield:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Enforced</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Actual Hardware MAC:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Protected</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>SQLite Transactions:</span>
                  <span className="text-slate-700 dark:text-slate-300">WAL Mode ON</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate('network')}
              className="w-full py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors text-center"
            >
              Inspect Hardware Network Adapters
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Logs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Live System Activity Audit Trail
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All profile launches, proxy validations, and RPA executions logged to SQLite activity_logs table.
            </p>
          </div>
          <button
            onClick={() => onNavigate('logs')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Full Audit Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/80">
          {logs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums">{log.timestamp}</span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="uppercase text-[10px] font-semibold tracking-wider text-slate-500">{log.category}</span>
                  {log.profileName && (
                    <>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">{log.profileName}</span>
                    </>
                  )}
                </div>
                <p className="text-slate-800 dark:text-slate-200">{log.message}</p>
              </div>

              <span
                className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                  log.level === 'success'
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                    : log.level === 'warning'
                    ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60'
                    : log.level === 'error'
                    ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60'
                    : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {log.level}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
