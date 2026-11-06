import React, { useState } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info
} from 'lucide-react';
import { db } from '../db/sqliteEmulation';
import { ActivityLog } from '../types';

export const ActivityLogsView: React.FC = () => {
  const [logs, setLogs] = useState(db.getLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const refresh = () => setLogs([...db.getLogs()]);

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (l.profileName && l.profileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (l.details && l.details.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel = levelFilter === 'all' || l.level === levelFilter;
    const matchesCategory = categoryFilter === 'all' || l.category === categoryFilter;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `activity_logs_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
  };

  const handleClear = () => {
    if (confirm('Clear all audit logs from SQLite table activity_logs?')) {
      db.clearLogs();
      refresh();
    }
  };

  const categories = ['all', 'profile', 'proxy', 'rpa', 'task', 'security', 'network', 'system'];
  const levels = ['all', 'info', 'success', 'warning', 'error'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            System Activity Audit Trail
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>SQLite Table: activity_logs</span>
            <span aria-hidden="true">·</span>
            <span>Auditable Session Forensics</span>
            <span aria-hidden="true">·</span>
            <span>Tamper-Resistant Local Store</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs message or profile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="text-xs px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-700 dark:text-slate-300 capitalize"
          >
            {levels.map(lvl => (
              <option key={lvl} value={lvl}>{lvl === 'all' ? 'All Levels' : lvl}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-700 dark:text-slate-300 capitalize"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Timestamp</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Level</th>
                <th className="p-3 font-semibold">Message &amp; Audit Details</th>
                <th className="p-3 font-semibold">Profile Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredLogs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 whitespace-nowrap font-mono text-[11px] text-slate-400 tabular-nums">
                    {l.timestamp}
                  </td>
                  <td className="p-3 whitespace-nowrap font-mono text-[10px] uppercase font-bold text-slate-500">
                    {l.category}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                        l.level === 'success'
                          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 font-semibold'
                          : l.level === 'warning'
                          ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 font-semibold'
                          : l.level === 'error'
                          ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      {l.level}
                    </span>
                  </td>
                  <td className="p-3 text-slate-900 dark:text-slate-100 max-w-xl">
                    <div className="font-medium">{l.message}</div>
                    {l.details && <div className="text-[11px] text-slate-400 font-mono mt-0.5">{l.details}</div>}
                  </td>
                  <td className="p-3 whitespace-nowrap font-sans text-indigo-600 dark:text-indigo-400 font-medium">
                    {l.profileName || '—'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No activity logs found matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
