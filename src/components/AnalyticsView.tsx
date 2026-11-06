import React from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
  ShieldCheck,
  Info
} from 'lucide-react';
import { db } from '../db/sqliteEmulation';

export const AnalyticsView: React.FC = () => {
  const analytics = db.getAnalytics();
  const profiles = db.getProfiles();
  const proxies = db.getProxies();
  const tasks = db.getTasks();

  const successCount = tasks.filter(t => t.status === 'completed').length;
  const failureCount = tasks.filter(t => t.status === 'failed').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            System Analytics &amp; Execution Telemetry
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>Automated Operational Metrics</span>
            <span aria-hidden="true">·</span>
            <span>Hardware Utilization</span>
            <span aria-hidden="true">·</span>
            <span>Strict Traffic Transparency</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Last Snapshot: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Traffic Integrity & Compliance Banner */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex items-start gap-3.5 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            Audit Classification &amp; Anti-Fabrication Notice:
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            All metrics shown represent synthetic robotic navigation operations executed for authorized audits, content inspection, and quality assurance. SEARX AI ULTRA PRO explicitly distinguishes automated sessions from genuine human website traffic and never falsely attributes bot operations as organic visitors or conversions.
          </p>
        </div>
      </div>

      {/* 4 Primary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-500 font-medium">Task Success Ratio</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono tabular-nums">
            {analytics.workflowSuccessRate}%
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
            <span className="text-emerald-600 dark:text-emerald-400">{successCount} passed</span>
            <span>·</span>
            <span className="text-rose-600 dark:text-rose-400">{failureCount} failed</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-500 font-medium">Average Roundtrip Latency</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono tabular-nums">
            {analytics.averageResponseTimeMs} ms
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across active proxy fleet
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-500 font-medium">RAM Allocation (Engine)</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono tabular-nums">
            {analytics.memoryUsageMb} MB
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Max limit 8192 MB (psutil)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-500 font-medium">Proxy Fleet Health</div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono tabular-nums">
            {analytics.activeProxies} / {analytics.totalProxies}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Active and responding
          </div>
        </div>
      </div>

      {/* Latency Distribution & Profile Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency by Proxy Node */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
            Proxy Node Latencies (ms)
          </h2>

          <div className="space-y-3 mt-4">
            {proxies.map(p => (
              <div key={p.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                  <span className="font-mono text-slate-500 tabular-nums">{p.latencyMs} ms</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      p.latencyMs === 0
                        ? 'bg-slate-300 dark:bg-slate-700'
                        : p.latencyMs < 60
                        ? 'bg-emerald-500'
                        : p.latencyMs < 120
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (p.latencyMs / 300) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Activity & Storage Footprint */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
            Profile Storage &amp; Cache Allocation
          </h2>

          <div className="space-y-3 mt-4">
            {profiles.map(p => (
              <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {p.cookiesCount} cookies · {p.localStorageCount} storage items
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {(p.cacheSizeKb / 1024).toFixed(1)} MB
                  </span>
                  <div className="text-[10px] text-slate-400">cache size</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
