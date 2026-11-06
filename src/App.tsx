import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProfilesManager } from './components/ProfilesManager';
import { FingerprintEditor } from './components/FingerprintEditor';
import { UserAgentManager } from './components/UserAgentManager';
import { ProxyManager } from './components/ProxyManager';
import { NetworkManager } from './components/NetworkManager';
import { VisualRpaBuilder } from './components/VisualRpaBuilder';
import { SearchWorkflowView } from './components/SearchWorkflowView';
import { WebsiteManager } from './components/WebsiteManager';
import { UrlManager } from './components/UrlManager';
import { TaskEngineView } from './components/TaskEngineView';
import { AnalyticsView } from './components/AnalyticsView';
import { ActivityLogsView } from './components/ActivityLogsView';
import { DatabaseStudio } from './components/DatabaseStudio';
import { WindowsBuildModal } from './components/WindowsBuildModal';
import { SettingsView } from './components/SettingsView';
import { db } from './db/sqliteEmulation';
import { ThemeMode } from './types';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('searx_theme') as ThemeMode) || 'dark';
  });
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isWindowsBuildOpen, setIsWindowsBuildOpen] = useState(false);
  const [, setDbVersion] = useState(0);

  // Sync theme with <html> element and Tailwind CSS
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('searx_theme', theme);
  }, [theme]);

  // Subscribe to database changes for real-time reactivity
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setDbVersion(v => v + 1);
    });
    return unsubscribe;
  }, []);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const profiles = db.getProfiles();
  const proxies = db.getProxies();
  const workflows = db.getWorkflows();
  const tasks = db.getTasks();
  const websites = db.getWebsites();
  const activeSessionsCount = profiles.filter(p => p.status === 'running').length;

  const counts = {
    profiles: profiles.length,
    proxies: proxies.length,
    workflows: workflows.length,
    tasks: tasks.filter(t => t.status === 'queued' || t.status === 'running').length,
    websites: websites.length
  };

  const handleLaunchQuickTask = () => {
    const wf = workflows[0];
    const prof = profiles[0];
    if (wf && prof) {
      db.enqueueTask({
        workflowId: wf.id,
        workflowName: wf.name,
        profileId: prof.id,
        profileName: prof.name,
        targetUrl: 'https://searx.be/search?q=robotics+automation',
        priority: 'high',
        totalSteps: wf.steps.length
      });
      setCurrentTab('tasks');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased overflow-hidden select-none font-sans">
      {/* Top Bar adhering to 3-zone contract */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenWindowsBuild={() => setIsWindowsBuildOpen(true)}
        onOpenDatabaseStudio={() => setCurrentTab('database_studio')}
        activeSessionsCount={activeSessionsCount}
      />

      {/* Main Desktop Layout: Sidebar + Viewport */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'windows_build') {
              setIsWindowsBuildOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          counts={counts}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/80">
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigate={setCurrentTab}
              onLaunchQuickTask={handleLaunchQuickTask}
            />
          )}

          {currentTab === 'profiles' && <ProfilesManager />}
          {currentTab === 'fingerprints' && <FingerprintEditor />}
          {currentTab === 'user_agents' && <UserAgentManager />}
          {currentTab === 'proxies' && <ProxyManager />}
          {currentTab === 'network' && <NetworkManager />}
          {currentTab === 'rpa_builder' && <VisualRpaBuilder />}
          {currentTab === 'search_workflow' && <SearchWorkflowView />}
          {currentTab === 'websites' && <WebsiteManager />}
          {currentTab === 'urls' && <UrlManager />}
          {currentTab === 'tasks' && <TaskEngineView />}
          {currentTab === 'analytics' && <AnalyticsView />}
          {currentTab === 'logs' && <ActivityLogsView />}
          {currentTab === 'database_studio' && <DatabaseStudio />}
          {currentTab === 'settings' && (
            <SettingsView
              currentTheme={theme}
              onThemeChange={setTheme}
            />
          )}
        </main>
      </div>

      {/* Windows 10/11 Build & Python Package Exporter Modal */}
      <WindowsBuildModal
        isOpen={isWindowsBuildOpen}
        onClose={() => setIsWindowsBuildOpen(false)}
      />
    </div>
  );
}
