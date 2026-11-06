import React, { useState } from 'react';
import {
  Users,
  Plus,
  Play,
  Square,
  Pause,
  Copy,
  Trash2,
  Download,
  Upload,
  Cookie,
  HardDrive,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  Info
} from 'lucide-react';
import { db } from '../db/sqliteEmulation';
import { BrowserProfile } from '../types';

export const ProfilesManager: React.FC = () => {
  const [profiles, setProfiles] = useState(db.getProfiles());
  const fingerprints = db.getFingerprints();
  const proxies = db.getProxies();

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(profiles[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);

  // New profile form
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('General');
  const [newFpId, setNewFpId] = useState(fingerprints[0]?.id || '');
  const [newProxyId, setNewProxyId] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Storage / Cookie editor state
  const [cookieKey, setCookieKey] = useState('');
  const [cookieVal, setCookieVal] = useState('');
  const [storageKey, setStorageKey] = useState('');
  const [storageVal, setStorageVal] = useState('');

  const refresh = () => {
    setProfiles([...db.getProfiles()]);
  };

  const groups = ['All', ...Array.from(new Set(profiles.map(p => p.group)))];

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.group.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = groupFilter === 'All' || p.group === groupFilter;
    return matchesSearch && matchesGroup;
  });

  const activeProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = db.addProfile({
      name: newName.trim(),
      group: newGroup.trim() || 'General',
      fingerprintId: newFpId || fingerprints[0]?.id,
      proxyId: newProxyId || undefined,
      notes: newNotes.trim()
    });

    setNewName('');
    setNewNotes('');
    setIsCreateOpen(false);
    refresh();
    setSelectedProfileId(created.id);
  };

  const handleDuplicate = (id: string) => {
    const clone = db.duplicateProfile(id);
    if (clone) {
      refresh();
      setSelectedProfileId(clone.id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this browser profile and all isolated data?')) {
      db.deleteProfile(id);
      refresh();
      if (selectedProfileId === id) {
        setSelectedProfileId(null);
      }
    }
  };

  const handleStatusChange = (id: string, status: BrowserProfile['status']) => {
    db.setProfileStatus(id, status);
    refresh();
  };

  const handleExportBackup = (profile: BrowserProfile) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `profile_${profile.name.replace(/\s+/g, '_')}_backup.json`);
    dlAnchor.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.name && parsed.fingerprintId) {
            const imported = db.addProfile({
              name: `${parsed.name} (Restored)`,
              group: parsed.group || 'Restored',
              fingerprintId: parsed.fingerprintId,
              proxyId: parsed.proxyId,
              notes: parsed.notes
            });
            // restore cookies & storage
            db.updateProfile(imported.id, {
              cookiesData: parsed.cookiesData || {},
              localStorageData: parsed.localStorageData || {},
              cookiesCount: Object.keys(parsed.cookiesData || {}).length,
              localStorageCount: Object.keys(parsed.localStorageData || {}).length
            });
            refresh();
            setSelectedProfileId(imported.id);
          }
        } catch (err) {
          alert('Invalid profile JSON file format.');
        }
      };
    }
  };

  // Add Cookie to Active Profile
  const handleAddCookie = () => {
    if (!activeProfile || !cookieKey.trim()) return;
    const current = { ...(activeProfile.cookiesData || {}) };
    current[cookieKey.trim()] = cookieVal.trim();
    db.updateProfile(activeProfile.id, {
      cookiesData: current,
      cookiesCount: Object.keys(current).length
    });
    setCookieKey('');
    setCookieVal('');
    refresh();
  };

  const handleRemoveCookie = (key: string) => {
    if (!activeProfile) return;
    const current = { ...(activeProfile.cookiesData || {}) };
    delete current[key];
    db.updateProfile(activeProfile.id, {
      cookiesData: current,
      cookiesCount: Object.keys(current).length
    });
    refresh();
  };

  // Add LocalStorage Item
  const handleAddStorage = () => {
    if (!activeProfile || !storageKey.trim()) return;
    const current = { ...(activeProfile.localStorageData || {}) };
    current[storageKey.trim()] = storageVal.trim();
    db.updateProfile(activeProfile.id, {
      localStorageData: current,
      localStorageCount: Object.keys(current).length
    });
    setStorageKey('');
    setStorageVal('');
    refresh();
  };

  const handleRemoveStorage = (key: string) => {
    if (!activeProfile) return;
    const current = { ...(activeProfile.localStorageData || {}) };
    delete current[key];
    db.updateProfile(activeProfile.id, {
      localStorageData: current,
      localStorageCount: Object.keys(current).length
    });
    refresh();
  };

  const handleClearCache = (id: string) => {
    db.updateProfile(id, { cacheSizeKb: 0 });
    db.logActivity('profile', 'info', 'Cache wiped for profile.', undefined, id);
    refresh();
  };

  const activeFingerprint = fingerprints.find(f => f.id === activeProfile?.fingerprintId);
  const activeProxy = proxies.find(p => p.id === activeProfile?.proxyId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Multi-Profile Browser Engine
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>Playwright Persistent Contexts</span>
            <span aria-hidden="true">·</span>
            <span>Isolated Cookies &amp; Storage</span>
            <span aria-hidden="true">·</span>
            <span>Dedicated Proxy Routing</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Restore JSON</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Profile</span>
          </button>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3.5 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold">Hardware Compliance &amp; Network Routing Policy</span>
          <p className="text-[11px] text-amber-700 dark:text-amber-400">
            In compliance with Windows OS and browser architecture, physical network adapter MAC addresses remain uniform across local profiles unless dedicated virtual network adapters or profile-specific proxies are assigned. Each profile maintains strictly independent browser storage, cookies, IndexedDB, and proxy routing.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search profiles or groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Group Filter Tabs (Interactive filter control - button styled) */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
          {groups.map((grp) => (
            <button
              key={grp}
              onClick={() => setGroupFilter(grp)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                groupFilter === grp
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Pane Workspace: Profile List on Left, Active Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          {filteredProfiles.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center text-xs text-slate-500">
              No profiles found matching your search.
            </div>
          ) : (
            filteredProfiles.map((p) => {
              const isSelected = p.id === activeProfile?.id;
              const isRunning = p.status === 'running';
              const isPaused = p.status === 'paused';

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProfileId(p.id)}
                  className={`cursor-pointer rounded-lg border p-4 transition-all ${
                    isSelected
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500/50 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          · {p.group}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <span>Cookies: <strong className="font-mono">{p.cookiesCount}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Storage: <strong className="font-mono">{p.localStorageCount}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize font-mono text-[10px]">{p.status}</span>
                      </div>
                    </div>

                    {/* Status Pill-Free Indicator */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                          isRunning
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : isPaused
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      {isRunning ? (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(p.id, 'paused'); }}
                            title="Pause Profile"
                            className="p-1 text-slate-600 hover:text-amber-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(p.id, 'stopped'); }}
                            title="Stop Profile"
                            className="p-1 text-slate-600 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Square className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(p.id, 'running'); }}
                          className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded hover:bg-emerald-100"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Launch</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDuplicate(p.id); }}
                        title="Duplicate Profile"
                        className="p-1 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleExportBackup(p); }}
                        title="Export Backup JSON"
                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                        title="Delete Profile"
                        className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Profile Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {activeProfile ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-5">
              {/* Profile Top Summary */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {activeProfile.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>ID: <code className="font-mono text-[11px]">{activeProfile.id}</code></span>
                    <span aria-hidden="true">·</span>
                    <span>Created {activeProfile.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(activeProfile.id, activeProfile.status === 'running' ? 'stopped' : 'running')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md shadow-xs transition-colors ${
                      activeProfile.status === 'running'
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {activeProfile.status === 'running' ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Engine Context</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Launch Browser Session</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Hardware & Browser Binding Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Assigned Fingerprint
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {activeFingerprint?.name || 'Default Windows 11 Workstation'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    {activeFingerprint?.screenResolution} · {activeFingerprint?.locale}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Network &amp; Proxy Tunnel
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {activeProxy ? `${activeProxy.name}` : 'Direct Network Adapter'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    {activeProxy ? `${activeProxy.protocol.toUpperCase()}://${activeProxy.host}:${activeProxy.port} (${activeProxy.latencyMs}ms)` : 'Default Gateway Interface'}
                  </div>
                </div>
              </div>

              {/* Isolated Storage Controls */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Independent Context Storage
                </h3>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  {/* Cookies Box */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-white dark:bg-slate-900 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-medium">Cookies</span>
                        <Cookie className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                        {activeProfile.cookiesCount}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Isolated SQLite session</div>
                    </div>
                    <button
                      onClick={() => setIsCookieModalOpen(true)}
                      className="mt-3 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline text-left"
                    >
                      Inspect &amp; Edit Cookies
                    </button>
                  </div>

                  {/* LocalStorage Box */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-white dark:bg-slate-900 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-medium">Local Storage</span>
                        <HardDrive className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                        {activeProfile.localStorageCount}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Key-value entries</div>
                    </div>
                    <button
                      onClick={() => setIsStorageModalOpen(true)}
                      className="mt-3 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline text-left"
                    >
                      Inspect Storage
                    </button>
                  </div>

                  {/* Cache & History Box */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-white dark:bg-slate-900 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-medium">Cache &amp; History</span>
                        <Clock className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                        {(activeProfile.cacheSizeKb / 1024).toFixed(1)} MB
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{activeProfile.historyCount} navigation events</div>
                    </div>
                    <button
                      onClick={() => handleClearCache(activeProfile.id)}
                      className="mt-3 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline text-left"
                    >
                      Wipe Cache
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Notes */}
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Profile Operations Notes &amp; Scope
                </label>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-md">
                  {activeProfile.notes || 'No operational notes attached to this profile.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center text-xs text-slate-500">
              Select a browser profile to view isolated storage, proxies, and fingerprint configurations.
            </div>
          )}
        </div>
      </div>

      {/* CREATE PROFILE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Create Isolated Browser Profile
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Profile Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., E-Commerce Audit Runner"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Profile Group
                </label>
                <input
                  type="text"
                  placeholder="e.g., Market Research"
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Fingerprint Preset
                </label>
                <select
                  value={newFpId}
                  onChange={(e) => setNewFpId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {fingerprints.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.family})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Proxy Routing (Optional)
                </label>
                <select
                  value={newProxyId}
                  onChange={(e) => setNewProxyId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Direct Network (No Proxy)</option>
                  {proxies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.protocol.toUpperCase()}] ({p.latencyMs}ms)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Operational Purpose Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe target websites and audit scope..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COOKIES INSPECTOR MODAL */}
      {isCookieModalOpen && activeProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-xl w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Isolated Cookies Manager
                </h3>
                <p className="text-xs text-slate-500">Profile: {activeProfile.name}</p>
              </div>
              <button onClick={() => setIsCookieModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Cookies Table */}
            <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-2 font-medium">Cookie Name</th>
                    <th className="p-2 font-medium">Value</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
                  {Object.entries(activeProfile.cookiesData || {}).map(([k, v]) => (
                    <tr key={k}>
                      <td className="p-2 text-indigo-600 dark:text-indigo-400 font-semibold">{k}</td>
                      <td className="p-2 text-slate-700 dark:text-slate-300 truncate max-w-xs">{v}</td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => handleRemoveCookie(k)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {Object.keys(activeProfile.cookiesData || {}).length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-400 font-sans">
                        No cookies stored in this profile.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add New Cookie */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name (e.g. session_id)"
                value={cookieKey}
                onChange={(e) => setCookieKey(e.target.value)}
                className="w-1/3 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
              <input
                type="text"
                placeholder="Value"
                value={cookieVal}
                onChange={(e) => setCookieVal(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleAddCookie}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded"
              >
                Add
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsCookieModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STORAGE INSPECTOR MODAL */}
      {isStorageModalOpen && activeProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-xl w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Isolated Local Storage Key-Value Store
                </h3>
                <p className="text-xs text-slate-500">Profile: {activeProfile.name}</p>
              </div>
              <button onClick={() => setIsStorageModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Storage Table */}
            <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-2 font-medium">Storage Key</th>
                    <th className="p-2 font-medium">Value</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
                  {Object.entries(activeProfile.localStorageData || {}).map(([k, v]) => (
                    <tr key={k}>
                      <td className="p-2 text-indigo-600 dark:text-indigo-400 font-semibold">{k}</td>
                      <td className="p-2 text-slate-700 dark:text-slate-300 truncate max-w-xs">{v}</td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => handleRemoveStorage(k)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {Object.keys(activeProfile.localStorageData || {}).length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-400 font-sans">
                        No localStorage keys stored in this profile.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add New Storage Entry */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Key"
                value={storageKey}
                onChange={(e) => setStorageKey(e.target.value)}
                className="w-1/3 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
              <input
                type="text"
                placeholder="Value"
                value={storageVal}
                onChange={(e) => setStorageVal(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleAddStorage}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded"
              >
                Add
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsStorageModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
