import React, { useState } from 'react';
import {
  Database,
  Table,
  Terminal,
  Download,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Layers,
  Search
} from 'lucide-react';
import { db } from '../db/sqliteEmulation';

const SQLITE_TABLES = [
  'browser_profiles',
  'fingerprint_configs',
  'user_agents',
  'proxies',
  'network_interfaces',
  'websites',
  'urls',
  'workflows',
  'workflow_steps',
  'browser_sessions',
  'task_queue',
  'activity_logs',
  'analytics',
  'settings'
];

export const DatabaseStudio: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>('browser_profiles');
  const [queryInput, setQueryInput] = useState<string>('SELECT * FROM browser_profiles;');
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const state = db.getState();

  const getTableRows = (tableName: string): any[] => {
    switch (tableName) {
      case 'browser_profiles': return state.profiles;
      case 'fingerprint_configs': return state.fingerprints;
      case 'user_agents': return state.userAgents;
      case 'proxies': return state.proxies;
      case 'network_interfaces': return state.networkInterfaces;
      case 'websites': return state.websites;
      case 'urls': return state.urls;
      case 'workflows': return state.workflows;
      case 'workflow_steps': return state.workflows.flatMap(w => w.steps);
      case 'browser_sessions': return state.profiles.map(p => ({
        id: 'sess-' + p.id,
        profile_id: p.id,
        proxy_id: p.proxyId || 'None',
        status: p.status,
        cookies_retained: p.cookiesCount,
        storage_retained: p.localStorageCount
      }));
      case 'task_queue': return state.tasks;
      case 'activity_logs': return state.activityLogs;
      case 'analytics': return [db.getAnalytics()];
      case 'settings': return Object.entries(state.settings).map(([k, v]) => ({ key: k, value: String(v) }));
      default: return [];
    }
  };

  const handleSelectTable = (tbl: string) => {
    setSelectedTable(tbl);
    setQueryInput(`SELECT * FROM ${tbl};`);
    setQueryResult(null);
    setQueryError(null);
  };

  const handleExecuteQuery = () => {
    setQueryError(null);
    try {
      const q = queryInput.trim();
      const match = q.match(/from\s+([a-zA-Z0-9_]+)/i);
      const tableName = match ? match[1].toLowerCase() : selectedTable;

      if (!SQLITE_TABLES.includes(tableName)) {
        throw new Error(`Table '${tableName}' does not exist in SQLite schema.`);
      }

      const rows = getTableRows(tableName);
      setQueryResult(rows);
    } catch (err: any) {
      setQueryError(err.message || 'SQL syntax evaluation error.');
      setQueryResult(null);
    }
  };

  const handleDownloadDump = () => {
    const sqlContent = db.generateSqlDump();
    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `searx_ultra_pro_dump_${new Date().toISOString().slice(0, 10)}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset SQLite database to original initial seed?')) {
      db.resetToDefaults();
      alert('Database reset to defaults.');
      window.location.reload();
    }
  };

  const activeRows = queryResult !== null ? queryResult : getTableRows(selectedTable);
  const columns = activeRows.length > 0 ? Object.keys(activeRows[0]) : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            SQLite Database Studio &amp; Schema Inspector
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>Module 13 Architecture</span>
            <span aria-hidden="true">·</span>
            <span>14 Normalized Tables</span>
            <span aria-hidden="true">·</span>
            <span>WAL Mode &amp; Foreign Keys Enabled</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadDump}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SQLite SQL Dump (.sql)</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database</span>
          </button>
        </div>
      </div>

      {/* SQL Query Console */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Interactive SQL Console
            </h2>
          </div>
          <button
            onClick={handleExecuteQuery}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded shadow-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run SQL Query</span>
          </button>
        </div>

        <textarea
          rows={2}
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          className="w-full font-mono text-xs p-2.5 bg-slate-950 text-indigo-300 rounded border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        {queryError && (
          <div className="text-xs font-mono text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{queryError}</span>
          </div>
        )}
      </div>

      {/* Tables Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table List (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
            SQLite Tables (14)
          </div>
          {SQLITE_TABLES.map(tbl => {
            const isSelected = selectedTable === tbl;
            const count = getTableRows(tbl).length;
            return (
              <button
                key={tbl}
                onClick={() => handleSelectTable(tbl)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-mono rounded transition-colors text-left ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Table className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tbl}</span>
                </div>
                <span className="text-[10px] text-slate-400 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Data Grid (9 cols) */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
              TABLE: {selectedTable}
            </div>
            <span className="text-xs font-mono text-slate-400">{activeRows.length} Rows</span>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[500px]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 sticky top-0">
                <tr>
                  {columns.map(col => (
                    <th key={col} className="p-2.5 whitespace-nowrap font-semibold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {activeRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    {columns.map(col => {
                      const val = row[col];
                      const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
                      return (
                        <td key={col} className="p-2.5 whitespace-nowrap max-w-xs truncate text-slate-700 dark:text-slate-300" title={displayVal}>
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {activeRows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length || 1} className="p-8 text-center text-slate-400 font-sans">
                      No records in this SQLite table.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
