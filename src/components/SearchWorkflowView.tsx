import React, { useState } from 'react';
import {
  Search,
  Globe,
  Play,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ListPlus,
  RefreshCw,
  Info
} from 'lucide-react';
import { db } from '../db/sqliteEmulation';

export const SearchWorkflowView: React.FC = () => {
  const [searchEngine, setSearchEngine] = useState<'searxng' | 'google' | 'bing' | 'duckduckgo' | 'yahoo' | 'baidu'>('searxng');
  const [keywordInput, setKeywordInput] = useState('industrial automation robotic actuators');
  const [keywords, setKeywords] = useState<string[]>([
    'industrial automation robotic actuators',
    'python 3.11 playwright desktop',
    'sqlite wal concurrency benchmark',
    'ethical rpa web audit'
  ]);
  const [targetDomain, setTargetDomain] = useState('searx.be');
  const [isSimulatingSearch, setIsSimulatingSearch] = useState(false);
  const [searchOutput, setSearchOutput] = useState<Array<{ rank: number; title: string; url: string; domain: string; isTarget: boolean }>>([]);

  const addKeyword = () => {
    if (!keywordInput.trim()) return;
    if (!keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
    }
    setKeywordInput('');
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const handleExecuteEvaluation = async () => {
    if (keywords.length === 0) return;
    setIsSimulatingSearch(true);
    setSearchOutput([]);

    await new Promise(r => setTimeout(r, 900));

    // Simulated authentic SERP query response for authorized research
    const sampleResults = [
      { rank: 1, title: 'SearXNG - Free internet metasearch engine', url: 'https://searx.be/', domain: 'searx.be', isTarget: true },
      { rank: 2, title: 'Overview of Industrial Robotic Actuators & Systems', url: 'https://ieee.org/robotics/actuators-2026', domain: 'ieee.org', isTarget: false },
      { rank: 3, title: 'Python Automation with Playwright and SQLite WAL', url: 'https://github.com/microsoft/playwright-python', domain: 'github.com', isTarget: false },
      { rank: 4, title: 'Hardware Interface & Network Transparency Standards', url: 'https://en.wikipedia.org/wiki/Network_interface_controller', domain: 'en.wikipedia.org', isTarget: false },
      { rank: 5, title: 'Automated Web Quality Audits and Verification', url: 'https://w3c.github.io/webdriver/', domain: 'w3c.github.io', isTarget: false }
    ];

    setSearchOutput(sampleResults);
    setIsSimulatingSearch(false);
    db.logActivity('system', 'success', `Search evaluation completed for engine '${searchEngine.toUpperCase()}' against keyword '${keywords[0]}'.`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Search &amp; Referral Workflow Manager
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>Authorized Metasearch Evaluation</span>
            <span aria-hidden="true">·</span>
            <span>SERP Inspection</span>
            <span aria-hidden="true">·</span>
            <span>Referral Header Verification</span>
          </div>
        </div>

        <button
          disabled={isSimulatingSearch || keywords.length === 0}
          onClick={handleExecuteEvaluation}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isSimulatingSearch ? 'animate-pulse' : ''}`} />
          <span>{isSimulatingSearch ? 'Evaluating Queries...' : 'Run Search Audit'}</span>
        </button>
      </div>

      {/* Compliance Box */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">Ethical Search Evaluation Notice: </span>
          <span>
            This module evaluates organic search query placement, SERP metadata integrity, and referral header parameters for authorized content research. It strictly forbids automated click-fraud, rank manipulation, or CAPTCHA bypass.
          </span>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Engine & Keyword Queue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
            Query Evaluation Setup
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target Metasearch Engine
              </label>
              <select
                value={searchEngine}
                onChange={(e) => setSearchEngine(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="searxng">SearXNG (Decentralized Metasearch)</option>
                <option value="duckduckgo">DuckDuckGo</option>
                <option value="google">Google Search (Authorized)</option>
                <option value="bing">Microsoft Bing</option>
                <option value="yahoo">Yahoo Search</option>
                <option value="baidu">Baidu Engine</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target Domain To Verify
              </label>
              <input
                type="text"
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                placeholder="searx.be"
                className="w-full font-mono text-[11px] px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Keyword Evaluation Queue
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter search keyword"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addKeyword(); }}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-3 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded"
                >
                  Add
                </button>
              </div>

              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {keywords.map(kw => (
                  <div key={kw} className="p-1.5 bg-slate-50 dark:bg-slate-800/40 rounded flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-800 dark:text-slate-200">{kw}</span>
                    <button
                      onClick={() => removeKeyword(kw)}
                      className="text-slate-400 hover:text-rose-600 ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: SERP Inspection Output (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                SERP Destination Verification &amp; Inspection
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect organic search placement without clicking or generating fake traffic.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {searchOutput.length > 0 ? `${searchOutput.length} Verified Snippets` : 'Awaiting Audit'}
            </span>
          </div>

          <div className="mt-4 flex-1">
            {searchOutput.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-400 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                <Search className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                <p>Click &apos;Run Search Audit&apos; to execute legitimate search evaluation across configured keywords.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {searchOutput.map((item) => (
                  <div
                    key={item.rank}
                    className={`p-3 rounded-lg border text-xs transition-colors ${
                      item.isTarget
                        ? 'border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-500">#{item.rank}</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</span>
                      </div>
                      {item.isTarget && (
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded font-semibold">
                          Target Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mt-1">
                      <span className="text-indigo-600 dark:text-indigo-400">{item.domain}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate max-w-md">{item.url}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
