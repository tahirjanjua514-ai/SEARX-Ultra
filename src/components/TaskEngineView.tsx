import React, { useState, useEffect } from 'react';
import {
  ListOrdered,
  Play,
  Pause,
  Square,
  Plus,
  Trash2,
  Cpu,
  HardDrive,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { db } from '../db/sqliteEmulation';
import { TaskQueueItem } from '../types';

export const TaskEngineView: React.FC = () => {
  const [tasks, setTasks] = useState(db.getTasks());
  const workflows = db.getWorkflows();
  const profiles = db.getProfiles();
  const settings = db.getSettings();

  const [isPaused, setIsPaused] = useState(false);
  const [concurrency, setConcurrency] = useState(settings.maxConcurrentSessions);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // New task form
  const [selectedWfId, setSelectedWfId] = useState(workflows[0]?.id || '');
  const [selectedProfileId, setSelectedProfileId] = useState(profiles[0]?.id || '');
  const [targetUrl, setTargetUrl] = useState('https://searx.be/search?q=industrial+automation');
  const [priority, setPriority] = useState<'urgent' | 'high' | 'normal' | 'low'>('normal');

  const refresh = () => setTasks([...db.getTasks()]);

  // Worker ticker simulation: advances running task progress
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      let stateChanged = false;
      const currentTasks = db.getTasks();

      // Check running tasks and advance
      for (const t of currentTasks) {
        if (t.status === 'running') {
          const nextProgress = Math.min(100, t.progressPercent + 20);
          const nextStep = Math.min(t.totalSteps, t.currentStepIndex + 1);
          if (nextProgress >= 100) {
            db.updateTask(t.id, {
              status: 'completed',
              progressPercent: 100,
              currentStepIndex: t.totalSteps,
              completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
              currentStepDescription: 'Completed all steps.'
            });
            db.logActivity('task', 'success', `Task #${t.id} (${t.workflowName}) completed.`);
          } else {
            db.updateTask(t.id, {
              progressPercent: nextProgress,
              currentStepIndex: nextStep,
              currentStepDescription: `Executing Step ${nextStep}/${t.totalSteps}`
            });
          }
          stateChanged = true;
        }
      }

      // If running count < concurrency, pick up queued tasks by priority
      const runningCount = currentTasks.filter(t => t.status === 'running').length;
      if (runningCount < concurrency) {
        const queued = currentTasks.filter(t => t.status === 'queued');
        // sort urgent > high > normal > low
        const priorityRank = { urgent: 1, high: 2, normal: 3, low: 4 };
        queued.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);

        const toStart = queued.slice(0, concurrency - runningCount);
        for (const taskToStart of toStart) {
          db.updateTask(taskToStart.id, {
            status: 'running',
            startedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            progressPercent: 10,
            currentStepDescription: 'Allocated worker process. Initializing session...'
          });
          db.logActivity('task', 'info', `Task #${taskToStart.id} transitioned to RUNNING.`);
          stateChanged = true;
        }
      }

      if (stateChanged) {
        refresh();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isPaused, concurrency]);

  const handleGlobalPause = () => {
    setIsPaused(!isPaused);
    db.logActivity('task', isPaused ? 'info' : 'warning', `Task Engine ${isPaused ? 'RESUMED' : 'PAUSED'} globally.`);
  };

  const handleGlobalStop = () => {
    for (const t of tasks) {
      if (t.status === 'running' || t.status === 'queued') {
        db.updateTask(t.id, { status: 'failed', errorMessage: 'Execution stopped by global operator command.' });
      }
    }
    db.logActivity('task', 'warning', 'Global stop command issued to all workers.');
    refresh();
  };

  const handleEnqueue = (e: React.FormEvent) => {
    e.preventDefault();
    const wf = workflows.find(w => w.id === selectedWfId) || workflows[0];
    const prof = profiles.find(p => p.id === selectedProfileId) || profiles[0];

    db.enqueueTask({
      workflowId: wf.id,
      workflowName: wf.name,
      profileId: prof.id,
      profileName: prof.name,
      targetUrl,
      priority,
      totalSteps: wf.steps.length
    });

    setIsNewTaskOpen(false);
    refresh();
  };

  const handleClearFinished = () => {
    db.clearCompletedTasks();
    refresh();
  };

  const priorityBadge = (p: TaskQueueItem['priority']) => {
    const map = {
      urgent: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300',
      high: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
      normal: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300',
      low: 'bg-slate-100 dark:bg-slate-800 text-slate-600'
    };
    return (
      <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${map[p]}`}>
        {p}
      </span>
    );
  };

  const statusBadge = (s: TaskQueueItem['status']) => {
    const map = {
      queued: 'bg-slate-100 dark:bg-slate-800 text-slate-600',
      running: 'bg-indigo-600 text-white animate-pulse',
      completed: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
      failed: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300',
      paused: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
    };
    return (
      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${map[s]}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Multi-Thread Task Engine
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>Async Worker Pool</span>
            <span aria-hidden="true">·</span>
            <span>Priority Queue Dispatch</span>
            <span aria-hidden="true">·</span>
            <span>Memory &amp; CPU Throttle</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGlobalPause}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              isPaused
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume Engine' : 'Pause All'}</span>
          </button>

          <button
            onClick={handleGlobalStop}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-md transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop All</span>
          </button>

          <button
            onClick={handleClearFinished}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Finished</span>
          </button>

          <button
            onClick={() => setIsNewTaskOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enqueue Task</span>
          </button>
        </div>
      </div>

      {/* Concurrency & Throttle Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div>
          <div className="flex justify-between items-center text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <span>Concurrent Worker Sessions</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{concurrency} Active Slots</span>
          </div>
          <input
            type="range"
            min={1}
            max={16}
            value={concurrency}
            onChange={(e) => {
              const val = Number(e.target.value);
              setConcurrency(val);
              db.updateSettings({ maxConcurrentSessions: val });
            }}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>1 Worker (Low resource)</span>
            <span>16 Workers (Multi-core)</span>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <div className="flex justify-between font-mono">
            <span>Hardware Capacity Limit:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">100 Max Profiles</span>
          </div>
          <div className="flex justify-between font-mono">
            <span>Memory Governor Throttle:</span>
            <span className="text-emerald-600 dark:text-emerald-400">Normal (3000MB Safe)</span>
          </div>
          <div className="flex justify-between font-mono">
            <span>CPU Safety Backoff:</span>
            <span className="text-emerald-600 dark:text-emerald-400">Active at 85%</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 border-l border-slate-200 dark:border-slate-800 pl-4">
          <p>
            The task engine asynchronously schedules RPA jobs across independent browser contexts. Queued jobs automatically prioritize by label (Urgent &gt; High &gt; Normal &gt; Low).
          </p>
        </div>
      </div>

      {/* Task Queue Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Task Execution Queue ({tasks.length} Total Tasks)
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {tasks.filter(t => t.status === 'running').length} Running · {tasks.filter(t => t.status === 'queued').length} Queued
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Task ID &amp; Workflow</th>
                <th className="p-3 font-semibold">Assigned Profile</th>
                <th className="p-3 font-semibold">Target URL</th>
                <th className="p-3 font-semibold">Priority</th>
                <th className="p-3 font-semibold">Status &amp; Progress</th>
                <th className="p-3 font-semibold">Execution Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {task.workflowName}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                      #{task.id} · Queued {task.createdAt}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{task.profileName}</span>
                  </td>
                  <td className="p-3 max-w-xs truncate font-mono text-[11px] text-slate-500" title={task.targetUrl}>
                    {task.targetUrl}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {priorityBadge(task.priority)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="space-y-1 w-36">
                      <div className="flex items-center justify-between">
                        {statusBadge(task.status)}
                        <span className="font-mono text-[11px] text-slate-500 tabular-nums">{task.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            task.status === 'completed'
                              ? 'bg-emerald-600'
                              : task.status === 'failed'
                              ? 'bg-rose-600'
                              : 'bg-indigo-600'
                          }`}
                          style={{ width: `${task.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    {task.currentStepDescription || 'Queued in pool'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ENQUEUE TASK MODAL */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Enqueue Automation Task
            </h3>

            <form onSubmit={handleEnqueue} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  RPA Workflow
                </label>
                <select
                  value={selectedWfId}
                  onChange={(e) => setSelectedWfId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  {workflows.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Execution Browser Profile
                </label>
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

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Destination URL
                </label>
                <input
                  type="text"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full font-mono text-[11px] px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Queue Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 uppercase"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded"
                >
                  Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
