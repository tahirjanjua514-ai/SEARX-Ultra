import React, { useState } from 'react';
import {
  Link2,
  Plus,
  Trash2,
  Upload,
  Download,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { db } from '../db/sqliteEmulation';
import { UrlItem } from '../types';

export const UrlManager: React.FC = () => {
  const [urls, setUrls] = useState(db.getUrls());
  const websites = db.getWebsites();

  const [searchQuery, setSearchQuery] = useState('');
  const [websiteFilter, setWebsiteFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form
  const [selectedSiteId, setSelectedSiteId] = useState(websites[0]?.id || '');
  const [urlInput, setUrlInput] = useState('');
  const [priority, setPriority] = useState(1);

  const refresh = () => setUrls([...db.getUrls()]);

  const filteredUrls = urls.filter(u => {
    const matchesSearch = u.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.websiteDomain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSite = websiteFilter === 'All' || u.websiteDomain === websiteFilter;
    return matchesSearch && matchesSite;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !selectedSiteId) return;

    db.addUrl(selectedSiteId, urlInput.trim(), Number(priority));
    setUrlInput('');
    setIsAddOpen(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    db.deleteUrl(id);
    refresh();
  };

  const handleBatchImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !websites[0]) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      let count = 0;
      for (const line of lines) {
        if (line.startsWith('http')) {
          db.addUrl(websites[0].id, line, 2);
          count++;
        }
      }
      alert(`Imported ${count} URLs into queue.`);
      refresh();
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const lines = urls.map(u => u.url).join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'searx_urls_queue.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const domains = ['All', ...Array.from(new Set(websites.map(w => w.domain)))];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Target URL Queue Manager
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>Website Queues</span>
            <span aria-hidden="true">·</span>
            <span>Batch Import &amp; Export</span>
            <span aria-hidden="true">·</span>
            <span>Priority Scheduling</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import List</span>
            <input type="file" accept=".txt,.csv" onChange={handleBatchImport} className="hidden" />
          </label>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export List</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add URL</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search URL or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {domains.map(dom => (
            <button
              key={dom}
              onClick={() => setWebsiteFilter(dom)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                websiteFilter === dom
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Target URL</th>
                <th className="p-3 font-semibold">Registered Domain</th>
                <th className="p-3 font-semibold">Priority</th>
                <th className="p-3 font-semibold">Queue Status</th>
                <th className="p-3 font-semibold">Last Processed</th>
                <th className="p-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
              {filteredUrls.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 max-w-md truncate text-indigo-600 dark:text-indigo-400 font-semibold" title={item.url}>
                    {item.url}
                  </td>
                  <td className="p-3 whitespace-nowrap font-sans text-slate-700 dark:text-slate-300">
                    {item.websiteDomain}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    P{item.priority}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-semibold ${
                        item.status === 'processed'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : item.status === 'failed'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-500 font-sans text-[11px]">
                    {item.lastVisited || 'Never'}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD URL MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Add URL to Queue
            </h3>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Website Domain</label>
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
                >
                  {websites.map(w => (
                    <option key={w.id} value={w.id}>{w.domain} ({w.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://searx.be/search?q=robotics"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full font-mono text-[11px] px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Priority (1 = Highest)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full font-mono px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded"
                >
                  Add URL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
