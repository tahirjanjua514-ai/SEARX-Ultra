import React, { useState } from 'react';
import {
  PackageCheck,
  Download,
  Copy,
  Check,
  FileCode2,
  Terminal,
  FolderArchive,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';
import { PYTHON_DESKTOP_FILES, PythonFileEntry } from '../data/pythonSourceTree';
import { SimpleZip } from '../utils/zipGenerator';
import { db } from '../db/sqliteEmulation';

interface WindowsBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsBuildModal: React.FC<WindowsBuildModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<PythonFileEntry>(PYTHON_DESKTOP_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = (file: PythonFileEntry) => {
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadFullZip = async () => {
    setIsExportingZip(true);
    try {
      const zip = new SimpleZip();

      // Add all Python desktop files, scripts, specs
      for (const f of PYTHON_DESKTOP_FILES) {
        zip.addFile(f.path, f.code);
      }

      // Add database SQL initialization dump
      const sqlDump = db.generateSqlDump();
      zip.addFile('init_schema.sql', sqlDump);

      const blob = zip.generateBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SEARX_AI_ULTRA_PRO_Windows_Desktop.zip';
      a.click();
      URL.revokeObjectURL(url);

      db.logActivity('system', 'success', 'Exported complete Windows 10/11 Python desktop distribution package (.zip).');
    } catch (e) {
      console.error('ZIP generation failed:', e);
      alert('Failed to generate ZIP package.');
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Module 14: Windows 10 &amp; 11 Build &amp; Deployment System
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span>Python 3.11+</span>
                <span aria-hidden="true">·</span>
                <span>Playwright &amp; SQLite WAL</span>
                <span aria-hidden="true">·</span>
                <span>PyInstaller Standalone .EXE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              disabled={isExportingZip}
              onClick={handleDownloadFullZip}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>{isExportingZip ? 'Packaging ZIP...' : 'Download Complete Windows Package (.zip)'}</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Size Architecture Explanation Banner */}
        <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 px-4 py-2.5 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center gap-2">
            <span className="font-bold">📦 Source Package: ~368 KB</span>
            <span aria-hidden="true" className="text-indigo-300 dark:text-indigo-700">·</span>
            <span className="text-[11px] text-indigo-700 dark:text-indigo-300">
              Contains pure Python logic, SQLite schema &amp; build scripts. The heavy browser engine (Chromium ~150MB) &amp; Python runtime (~120MB) are automatically downloaded onto Windows via <code>install.bat</code>.
            </span>
          </div>
          <span className="font-mono text-[10px] bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded font-semibold text-indigo-800 dark:text-indigo-300 shrink-0">
            Standard Python Architecture
          </span>
        </div>

        {/* Modal Body: File Explorer on Left, Code Viewer on Right */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
          {/* File Explorer (4 cols) */}
          <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 p-3 bg-slate-50/60 dark:bg-slate-950/40 overflow-y-auto space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
              Windows Package Files ({PYTHON_DESKTOP_FILES.length})
            </div>

            {PYTHON_DESKTOP_FILES.map((file) => {
              const isSelected = selectedFile.filename === file.filename;
              return (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-white dark:bg-slate-900 shadow-xs'
                      : 'border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                      {file.filename}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {file.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {file.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Code Viewer (8 cols) */}
          <div className="md:col-span-8 flex flex-col min-h-0 bg-slate-950 text-slate-200">
            {/* Viewer Toolbar */}
            <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-900/60 font-mono">
              <span className="text-indigo-400 font-bold">{selectedFile.path}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => handleDownloadSingleFile(selectedFile)}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <pre className="flex-1 p-4 font-mono text-[11px] overflow-auto leading-relaxed selection:bg-indigo-700">
              {selectedFile.code}
            </pre>
          </div>
        </div>

        {/* Modal Footer: Windows 10/11 Deployment Instructions */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-xs text-slate-600 dark:text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Windows Deployment:</span>
            <span>1. Extract ZIP</span>
            <span aria-hidden="true">·</span>
            <span>2. Run <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">install.bat</code></span>
            <span aria-hidden="true">·</span>
            <span>3. Run <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">run.bat</code></span>
            <span aria-hidden="true">·</span>
            <span>4. Compile .exe with <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">build_exe.bat</code></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
