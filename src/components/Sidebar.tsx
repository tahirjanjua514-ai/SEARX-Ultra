import React from 'react';
import {
  LayoutDashboard,
  Users,
  Fingerprint,
  FileCode2,
  ShieldCheck,
  Network,
  Workflow,
  Globe,
  Link2,
  ListOrdered,
  BarChart3,
  ScrollText,
  Settings,
  Database,
  PackageCheck,
  Sliders,
  Search
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'profiles'
  | 'fingerprints'
  | 'user_agents'
  | 'proxies'
  | 'network'
  | 'rpa_builder'
  | 'search_workflow'
  | 'websites'
  | 'urls'
  | 'tasks'
  | 'analytics'
  | 'logs'
  | 'settings'
  | 'database_studio'
  | 'windows_build';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  counts: {
    profiles: number;
    proxies: number;
    workflows: number;
    tasks: number;
    websites: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, counts }) => {
  const primaryNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profiles', label: 'Browser Profiles', icon: Users, badge: counts.profiles },
    { id: 'fingerprints', label: 'Fingerprint Settings', icon: Fingerprint },
    { id: 'user_agents', label: 'User-Agent Manager', icon: FileCode2 },
    { id: 'proxies', label: 'Proxy Manager', icon: ShieldCheck, badge: counts.proxies },
    { id: 'network', label: 'Network Manager', icon: Network },
    { id: 'rpa_builder', label: 'Visual RPA Builder', icon: Workflow, badge: counts.workflows },
    { id: 'search_workflow', label: 'Search & Referral', icon: Search },
    { id: 'websites', label: 'Website Manager', icon: Globe, badge: counts.websites },
    { id: 'urls', label: 'URL Manager', icon: Link2 },
    { id: 'tasks', label: 'Task Scheduler', icon: ListOrdered, badge: counts.tasks },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'logs', label: 'Activity Logs', icon: ScrollText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const toolsNav = [
    { id: 'database_studio', label: 'SQLite Studio (14 Tables)', icon: Database },
    { id: 'windows_build', label: 'Windows 10/11 Exporter', icon: PackageCheck },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col shrink-0 select-none overflow-hidden transition-colors">
      {/* Search / Filter Quick Jump */}
      <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-2 mb-1.5">
          System Modules
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavigationTab)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap text-left ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-indigo-700 text-indigo-100'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 pb-1.5 px-3">
          <div className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Developer & Storage
          </div>
        </div>

        {toolsNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavigationTab)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap text-left ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer System Spec Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
        <div className="flex justify-between items-center font-mono">
          <span>OS Target:</span>
          <span className="text-slate-800 dark:text-slate-200">Win 10/11 x64</span>
        </div>
        <div className="flex justify-between items-center font-mono">
          <span>Python Runtime:</span>
          <span className="text-slate-800 dark:text-slate-200">v3.11+</span>
        </div>
        <div className="flex justify-between items-center font-mono">
          <span>Storage Engine:</span>
          <span className="text-emerald-600 dark:text-emerald-400">SQLite (WAL)</span>
        </div>
      </div>
    </aside>
  );
};
