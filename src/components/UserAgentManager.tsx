import React, { useState } from 'react';
import {
  FileCode2,
  Plus,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Check,
  Smartphone,
  Monitor,
  Tablet,
  ArrowRight
} from 'lucide-react';
import { db } from '../db/sqliteEmulation';
import { UserAgentRecord } from '../types';

export const UserAgentManager: React.FC = () => {
  const [userAgents, setUserAgents] = useState(db.getUserAgents());
  const profiles = db.getProfiles();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'desktop' | 'mobile' | 'tablet'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUa, setSelectedUa] = useState<UserAgentRecord | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState(profiles[0]?.id || '');

  // Add form
  const [newUaString, setNewUaString] = useState('');
  const [newBrowser, setNewBrowser] = useState('Chrome');
  const [newOs, setNewOs] = useState('Windows');
  const [newDeviceType, setNewDeviceType] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');

  const refresh = () => setUserAgents([...db.getUserAgents()]);

  const filteredUas = userAgents.filter(ua => {
    const matchesSearch = ua.userAgent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ua.browser.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ua.os.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || ua.deviceType === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateUa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUaString.trim()) return;

    db.addUserAgent({
      userAgent: newUaString.trim(),
      browser: newBrowser,
      browserVersion: 'Custom Entry',
      os: newOs,
      osVersion: 'Standard',
      deviceType: newDeviceType,
      engine: newBrowser === 'Firefox' ? 'Gecko' : 'Blink',
      releaseDate: new Date().toISOString().slice(0, 10),
      isValid: true
    });

    setNewUaString('');
    setIsAddModalOpen(false);
    refresh();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const added = db.importUserAgents(lines);
      alert(`Imported ${added} User-Agent strings into the database.`);
      refresh();
    };
    reader.readAsText(file);
  };

  const handleExportTxt = () => {
    const textContent = userAgents.map(u => u.userAgent).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'searx_user_agents.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAssignToProfile = () => {
    if (!selectedUa || !selectedProfileId) return;
    const targetProfile = profiles.find(p => p.id === selectedProfileId);
    if (!targetProfile) return;

    // Update fingerprint or profile directly
    const fp = db.getFingerprints().find(f => f.id === targetProfile.fingerprintId);
    if (fp) {
      db.updateFingerprint(fp.id, {
        userAgent: selectedUa.userAgent,
        browserName: selectedUa.browser,
        osName: selectedUa.os
      });
      db.logActivity('profile', 'success', `Assigned User-Agent '${selectedUa.browser}' to profile '${targetProfile.name}'.`, undefined, targetProfile.id);
    }
    setIsAssignModalOpen(false);
    alert(`Successfully assigned User-Agent to profile '${targetProfile.name}'.`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            User-Agent Manager
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>Verified Browser Signatures</span>
            <span aria-hidden="true">·</span>
            <span>OS &amp; Platform Categorization</span>
            <span aria-hidden="true">·</span>
            <span>Profile Assignment</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import TXT / CSV</span>
            <input type="file" accept=".txt,.csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleExportTxt}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export TXT</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add User-Agent</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search browser, OS, or version..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Device Category Segmented Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(['all', 'desktop', 'mobile', 'tablet'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                categoryFilter === cat
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* UA Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Browser &amp; OS</th>
                <th className="p-3 font-semibold">Device Type</th>
                <th className="p-3 font-semibold">User-Agent Signature</th>
                <th className="p-3 font-semibold">Rendering Engine</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredUas.map((ua) => {
                const Icon = ua.deviceType === 'mobile' ? Smartphone : ua.deviceType === 'tablet' ? Tablet : Monitor;
                return (
                  <tr key={ua.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{ua.browser}</div>
                      <div className="text-[11px] text-slate-400">{ua.os} {ua.osVersion}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 capitalize">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ua.deviceType}</span>
                      </div>
                    </td>
                    <td className="p-3 max-w-md truncate font-mono text-[11px] text-slate-600 dark:text-slate-400" title={ua.userAgent}>
                      {ua.userAgent}
                    </td>
                    <td className="p-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {ua.engine}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedUa(ua);
                          setIsAssignModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded transition-colors"
                      >
                        Assign to Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASSIGN TO PROFILE MODAL */}
      {isAssignModalOpen && selectedUa && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Assign User-Agent to Browser Profile
            </h3>
            <p className="text-slate-500">
              Selected UA: <strong className="text-slate-900 dark:text-slate-100">{selectedUa.browser} ({selectedUa.os})</strong>
            </p>

            <div className="space-y-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">Target Profile:</label>
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.group})</option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignToProfile}
                className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER AGENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full p-5 space-y-4 shadow-xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Add New User-Agent Record
            </h3>

            <form onSubmit={handleCreateUa} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  User-Agent Header
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64) ..."
                  value={newUaString}
                  onChange={(e) => setNewUaString(e.target.value)}
                  className="w-full font-mono text-[11px] px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Browser</label>
                  <input
                    type="text"
                    value={newBrowser}
                    onChange={(e) => setNewBrowser(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">OS</label>
                  <input
                    type="text"
                    value={newOs}
                    onChange={(e) => setNewOs(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Device</label>
                  <select
                    value={newDeviceType}
                    onChange={(e) => setNewDeviceType(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  >
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
