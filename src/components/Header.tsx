import React from 'react';
import { 
  Sun, 
  Moon, 
  Download, 
  Terminal, 
  Database,
  Cpu,
  Layers
} from 'lucide-react';
import { ThemeMode } from '../types';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenWindowsBuild: () => void;
  onOpenDatabaseStudio: () => void;
  activeSessionsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenWindowsBuild,
  onOpenDatabaseStudio,
  activeSessionsCount
}) => {
  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-6 flex items-center justify-between gap-8 shrink-0 z-30 transition-colors">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          SX
        </div>
        <div className="flex flex-col">
          <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
            SEARX AI ULTRA PRO
          </span>
        </div>
      </div>

      {/* Zone 2: 4-5 clean single-line navigation indicators */}
      <div className="hidden lg:flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-mono text-slate-700 dark:text-slate-300">SQLite 3</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span>WAL Mode</span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-mono text-slate-700 dark:text-slate-300">Playwright 1.49</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span>Isolated Profiles</span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-mono text-slate-700 dark:text-slate-300">Windows 10 / 11</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span>Python 3.11+</span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-mono text-slate-700 dark:text-slate-300">Active Sessions:</span>
          <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
            {activeSessionsCount}
          </span>
        </div>
      </div>

      {/* Zone 3: Primary Action Zone */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenDatabaseStudio}
          title="Open SQLite Database Studio"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap"
        >
          <Database className="w-3.5 h-3.5" />
          <span>SQLite Studio</span>
        </button>

        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          className="p-1.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <button
          onClick={onOpenWindowsBuild}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-sm transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Windows Build Package</span>
        </button>
      </div>
    </header>
  );
};
