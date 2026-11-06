import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  Check,
  Layers,
  ArrowRight
} from 'lucide-react';
import { db } from '../db/sqliteEmulation';
import { WebsiteRecord, DeviceFamily } from '../types';

export const WebsiteManager: React.FC = () => {
  const [websites, setWebsites] = useState(db.getWebsites());
  const proxies = db.getProxies();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add form
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [category, setCategory] = useState('Search Engine');
  const [group, setGroup] = useState('Primary');
  const [proxyId, setProxyId] = useState('');
  const [fpFamily, setFpFamily] = useState<DeviceFamily>('windows-desktop');

  const refresh = () => setWebsites([...db.getWebsites()]);

  const filteredWebsites = websites.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || !name.trim()) return;

    db.addWebsite({
      domain: domain.trim().toLowerCase(),
      name: name.trim(),
      category: category.trim(),
      group: group.trim(),
      enabled: true,
      specificProxyId: proxyId || undefined,
      defaultFingerprintFamily: fpFamily
    });

    setName('');
    setDomain('');
    setIsAddOpen(false);
    refresh();
  };

  const handleToggleEnabled = (id: string, current: boolean) => {
    db.updateWebsite(id, { enabled: !current });
    refresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete website record and its associated URL queue?')) {
      db.deleteWebsite(id);
      refresh();
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Website Registry &amp; Scope Manager
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>Target Domains</span>
            <span aria-hidden="true">·</span>
            <span>Per-Site Proxy Overrides</span>
            <span aria-hidden="true">·</span>
            <span>Health &amp; Response Metrics</span>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register Website</span>
        </button>
      </div>

      {/* Filter / Search */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search domain, name, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Websites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWebsites.map((site) => {
          const assignedProxy = proxies.find(p => p.id === site.specificProxyId);
          return (
            <div
              key={site.id}
              className={`p-4 rounded-lg border bg-white dark:bg-slate-900 transition-colors ${
                site.enabled
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-slate-200/60 dark:border-slate-800/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {site.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">· {site.category}</span>
                  </div>
                  <div className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                    {site.domain}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleEnabled(site.id, site.enabled)}
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                    site.enabled
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {site.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-500">
                <div className="flex justify-between font-mono">
                  <span>Queued URLs:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{site.urlCount}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Avg Response:</span>
                  <span className="text-slate-800 dark:text-slate-200">{site.avgResponseTimeMs}ms</span>
                </div>
                <div className="flex justify-between font-mono truncate">
                  <span>Proxy Route:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {assignedProxy ? `${assignedProxy.protocol.toUpperCase()} (${assignedProxy.host})` : 'Inherit Profile'}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => handleDelete(site.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  title="Delete Website"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* REGISTER WEBSITE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Register Target Website
            </h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Website Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SearXNG Metasearch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Domain Name (Host)
                </label>
                <input
                  type="text"
                  required
                  placeholder="searx.be"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full font-mono text-[11px] px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Group</label>
                  <input
                    type="text"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Dedicated Proxy Override (Optional)
                </label>
                <select
                  value={proxyId}
                  onChange={(e) => setProxyId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  <option value="">Inherit Profile Proxy</option>
                  {proxies.map(p => (
                    <option key={p.id} value={p.id}>{p.name} [{p.protocol.toUpperCase()}]</option>
                  ))}
                </select>
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
                  Save Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
