import React, { useState } from 'react';
import {
  Workflow,
  Plus,
  Play,
  Download,
  Upload,
  Trash2,
  MoveUp,
  MoveDown,
  Edit2,
  CheckCircle2,
  XCircle,
  Camera,
  Search,
  MousePointer,
  Clock,
  ArrowRight,
  Code,
  FileText,
  Sliders,
  Settings,
  Layers,
  ChevronRight,
  Eye,
  X
} from 'lucide-react';
import { db } from '../db/sqliteEmulation';
import { RpaWorkflow, RpaStep, RpaActionType } from '../types';

const ACTION_DEFINITIONS: Array<{
  type: RpaActionType;
  label: string;
  category: 'navigation' | 'interaction' | 'extraction' | 'logic';
  description: string;
  defaultSelector?: string;
  defaultValue?: string;
}> = [
  { type: 'open_url', label: '1. Open URL', category: 'navigation', description: 'Navigates browser to target web address.', defaultValue: 'https://searx.be/' },
  { type: 'click_element', label: '2. Click Element', category: 'interaction', description: 'Performs mouse click on CSS selector.', defaultSelector: 'button#submit' },
  { type: 'scroll_page', label: '3. Scroll Page', category: 'interaction', description: 'Scrolls viewport by vertical delta pixels.', defaultValue: '600' },
  { type: 'wait_element', label: '4. Wait for Element', category: 'interaction', description: 'Waits until selector appears in DOM.', defaultSelector: 'article.result' },
  { type: 'wait_duration', label: '5. Wait Duration', category: 'interaction', description: 'Pauses execution for specified milliseconds.', defaultValue: '2000' },
  { type: 'fill_input', label: '6. Fill Input Field', category: 'interaction', description: 'Simulates human keyboard typing into text input.', defaultSelector: 'input[name="q"]', defaultValue: 'search keyword' },
  { type: 'select_dropdown', label: '7. Select Dropdown', category: 'interaction', description: 'Selects option in HTML select element.', defaultSelector: 'select#category', defaultValue: 'general' },
  { type: 'submit_form', label: '8. Submit Authorized Form', category: 'interaction', description: 'Submits HTML form element safely.', defaultSelector: 'form#searchform' },
  { type: 'navigate_back', label: '9. Navigate Back', category: 'navigation', description: 'Browser history go back one step.' },
  { type: 'navigate_forward', label: '10. Navigate Forward', category: 'navigation', description: 'Browser history go forward one step.' },
  { type: 'take_screenshot', label: '11. Take Screenshot', category: 'extraction', description: 'Captures full page or viewport png evidence.' },
  { type: 'extract_title', label: '12. Extract Page Title', category: 'extraction', description: 'Reads document.title to target variable.' },
  { type: 'extract_text', label: '13. Extract Page Text', category: 'extraction', description: 'Extracts innerText from DOM element.', defaultSelector: 'h1.title' },
  { type: 'save_result', label: '14. Save Result', category: 'extraction', description: 'Persists extracted variables to SQLite database.' },
  { type: 'conditional', label: '15. Conditional Action', category: 'logic', description: 'Evaluates if variable matches criteria before proceeding.' },
  { type: 'repeat_action', label: '16. Repeat Action', category: 'logic', description: 'Loops enclosed steps for N iterations.', defaultValue: '3' },
  { type: 'stop_workflow', label: '17. Stop Workflow', category: 'logic', description: 'Terminates execution gracefully.' }
];

export const VisualRpaBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState(db.getWorkflows());
  const [selectedWfId, setSelectedWfId] = useState(workflows[0]?.id || '');
  const profiles = db.getProfiles();

  const activeWorkflow = workflows.find(w => w.id === selectedWfId) || workflows[0];

  // Editor modal & step config states
  const [editingStep, setEditingStep] = useState<RpaStep | null>(null);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [isNewWfOpen, setIsNewWfOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [capturedScreenshot, setCapturedScreenshot] = useState<string | null>(null);

  // New Workflow Form
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [newWfCategory, setNewWfCategory] = useState('Search & SEO Audit');

  const refresh = () => setWorkflows([...db.getWorkflows()]);

  // Step reordering
  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (!activeWorkflow) return;
    const newSteps = [...activeWorkflow.steps];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSteps.length) return;

    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIdx];
    newSteps[targetIdx] = temp;

    // re-index order
    newSteps.forEach((s, i) => { s.order = i + 1; });

    db.updateWorkflow(activeWorkflow.id, { steps: newSteps });
    refresh();
  };

  const removeStep = (stepId: string) => {
    if (!activeWorkflow) return;
    const newSteps = activeWorkflow.steps.filter(s => s.id !== stepId);
    newSteps.forEach((s, i) => { s.order = i + 1; });
    db.updateWorkflow(activeWorkflow.id, { steps: newSteps });
    refresh();
  };

  const handleAddAction = (actionDef: typeof ACTION_DEFINITIONS[0]) => {
    if (!activeWorkflow) return;
    const newStep: RpaStep = {
      id: 'step-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      order: activeWorkflow.steps.length + 1,
      action: actionDef.type,
      label: actionDef.label,
      selector: actionDef.defaultSelector,
      value: actionDef.defaultValue,
      timeoutMs: 10000,
      optional: false
    };

    const newSteps = [...activeWorkflow.steps, newStep];
    db.updateWorkflow(activeWorkflow.id, { steps: newSteps });
    setIsAddStepOpen(false);
    refresh();
  };

  const handleSaveStepConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkflow || !editingStep) return;

    const newSteps = activeWorkflow.steps.map(s => s.id === editingStep.id ? editingStep : s);
    db.updateWorkflow(activeWorkflow.id, { steps: newSteps });
    setEditingStep(null);
    refresh();
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim()) return;

    const created = db.addWorkflow({
      name: newWfName.trim(),
      description: newWfDesc.trim() || 'Custom RPA automation workflow',
      category: newWfCategory,
      steps: [
        { id: 's1', order: 1, action: 'open_url', label: '1. Open URL', value: 'https://searx.be/' },
        { id: 's2', order: 2, action: 'take_screenshot', label: '11. Take Screenshot' },
        { id: 's3', order: 3, action: 'save_result', label: '14. Save Result' }
      ]
    });

    setNewWfName('');
    setNewWfDesc('');
    setIsNewWfOpen(false);
    refresh();
    setSelectedWfId(created.id);
  };

  // Workflow JSON Export / Import
  const handleExportJson = () => {
    if (!activeWorkflow) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeWorkflow, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `workflow_${activeWorkflow.name.replace(/\s+/g, '_')}.json`);
    dlAnchor.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.name && Array.isArray(parsed.steps)) {
          const imported = db.addWorkflow({
            name: `${parsed.name} (Imported)`,
            description: parsed.description || 'Imported RPA workflow',
            category: parsed.category || 'General',
            steps: parsed.steps
          });
          refresh();
          setSelectedWfId(imported.id);
          alert(`Imported workflow '${imported.name}' with ${imported.steps.length} steps.`);
        }
      } catch (err) {
        alert('Invalid RPA Workflow JSON format.');
      }
    };
    reader.readAsText(file);
  };

  // Live Step-by-Step Simulator
  const runWorkflowSimulation = async () => {
    if (!activeWorkflow || activeWorkflow.steps.length === 0) return;
    setIsSimulating(true);
    setSimLogs([]);
    setCapturedScreenshot(null);

    const logs: string[] = [];
    const log = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setSimLogs([...logs]);
    };

    log(`Initializing execution for '${activeWorkflow.name}'...`);
    log(`Allocating Playwright browser context under profile '${profiles[0]?.name || 'Default'}'...`);
    await new Promise(r => setTimeout(r, 600));

    for (let i = 0; i < activeWorkflow.steps.length; i++) {
      const step = activeWorkflow.steps[i];
      setActiveStepIndex(i);
      log(`Executing Step ${step.order}: ${step.label}...`);

      if (step.action === 'open_url') {
        log(`Navigating to ${step.value || 'https://searx.be/'}... (200 OK)`);
      } else if (step.action === 'fill_input') {
        log(`Simulating human keyboard input on '${step.selector || 'input'}' value: '${step.value}'...`);
      } else if (step.action === 'click_element') {
        log(`Simulated mouse Bezier trajectory to '${step.selector}' and clicked.`);
      } else if (step.action === 'wait_duration') {
        log(`Paused for ${step.waitDurationMs || 1500}ms for content rendering.`);
      } else if (step.action === 'extract_title') {
        log(`Extracted document.title: "SearXNG Metasearch Engine - Authorized Audit"`);
      } else if (step.action === 'take_screenshot') {
        log(`Captured viewport bitmap (1920x1080) to SQLite evidence store.`);
        setCapturedScreenshot('simulated');
      } else if (step.action === 'save_result') {
        log(`Recorded step variables and execution metrics to database.`);
      }

      await new Promise(r => setTimeout(r, 500));
    }

    setActiveStepIndex(-1);
    setIsSimulating(false);
    log(`Workflow '${activeWorkflow.name}' completed successfully with 0 exceptions.`);
    db.logActivity('rpa', 'success', `Simulated execution of workflow '${activeWorkflow.name}' passed all ${activeWorkflow.steps.length} steps.`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Visual RPA Workflow Builder
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>Module 6 &amp; 7 Architecture</span>
            <span aria-hidden="true">·</span>
            <span>17 Authorized Actions</span>
            <span aria-hidden="true">·</span>
            <span>DOM Inspection &amp; Live Step Simulation</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setIsNewWfOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Workflow</span>
          </button>

          <button
            disabled={isSimulating || !activeWorkflow}
            onClick={runWorkflowSimulation}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-pulse' : ''}`} />
            <span>{isSimulating ? 'Running Steps...' : 'Simulate Workflow'}</span>
          </button>
        </div>
      </div>

      {/* Workflow Selector Bar */}
      <div className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
        <div className="flex items-center gap-3">
          <Workflow className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Active Workflow:</span>
          <select
            value={selectedWfId}
            onChange={(e) => setSelectedWfId(e.target.value)}
            className="text-xs font-semibold px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
          >
            {workflows.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.steps.length} steps)</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
          <span>Category: <strong className="font-semibold text-slate-700 dark:text-slate-300">{activeWorkflow?.category}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Executions: <strong className="font-mono text-slate-700 dark:text-slate-300">{activeWorkflow?.runCount}</strong></span>
        </div>
      </div>

      {/* Main Grid: Steps Sequence Left (7 cols) + Live Runner & Inspector Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Step Flow Canvas */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Workflow Sequence ({activeWorkflow?.steps.length || 0} Steps)
            </h2>
            <button
              onClick={() => setIsAddStepOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add RPA Action Step</span>
            </button>
          </div>

          <div className="space-y-2">
            {activeWorkflow?.steps.map((step, idx) => {
              const isCurrent = activeStepIndex === idx;
              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isCurrent
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                        {step.order}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {step.label}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mt-0.5 truncate">
                          {step.selector && <span>Selector: <code className="text-indigo-600 dark:text-indigo-400">{step.selector}</code></span>}
                          {step.value && <span>Value: <code className="text-slate-700 dark:text-slate-300 truncate max-w-xs">{step.value}</code></span>}
                          {step.waitDurationMs && <span>Duration: {step.waitDurationMs}ms</span>}
                        </div>
                      </div>
                    </div>

                    {/* Step Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveStep(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Step Up"
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveStep(idx, 'down')}
                        disabled={idx === (activeWorkflow?.steps.length || 0) - 1}
                        title="Move Step Down"
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingStep(step)}
                        title="Edit Step Parameters"
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeStep(step.id)}
                        title="Delete Step"
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Execution Logs & Virtual Screen (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Live Execution Logs
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {isSimulating ? 'SIMULATOR ACTIVE' : 'IDLE'}
              </span>
            </div>

            {/* Virtual DOM / Screenshot Preview Slot if captured */}
            {capturedScreenshot && (
              <div className="my-2 p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-300">
                <div className="flex items-center justify-between mb-1 text-slate-400 text-[10px]">
                  <span>Virtual Viewport Capture (1920x1080)</span>
                  <Camera className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800/80 font-mono text-[10px] space-y-0.5">
                  <div className="text-emerald-400">&lt;html lang=&quot;en&quot;&gt;</div>
                  <div className="text-slate-400 pl-2">&lt;title&gt;SearXNG Metasearch Engine - Authorized Audit&lt;/title&gt;</div>
                  <div className="text-slate-400 pl-2">&lt;div id=&quot;results&quot;&gt; ... 18 verified records ... &lt;/div&gt;</div>
                  <div className="text-emerald-400">&lt;/html&gt;</div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto font-mono text-[11px] p-2 bg-slate-50 dark:bg-slate-950/50 rounded mt-2 space-y-1 text-slate-700 dark:text-slate-300">
              {simLogs.length === 0 ? (
                <div className="text-slate-400 italic p-4 text-center">
                  Click &apos;Simulate Workflow&apos; to execute the 17-action RPA sequence step-by-step with real-time logs.
                </div>
              ) : (
                simLogs.map((logStr, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {logStr}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADD STEP MODAL (Palette of 17 Actions) */}
      {isAddStepOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-2xl w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Select Action to Insert into Workflow
                </h3>
                <p className="text-xs text-slate-500">Choose from the 17 authorized RPA action primitives.</p>
              </div>
              <button onClick={() => setIsAddStepOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto p-1">
              {ACTION_DEFINITIONS.map((def) => (
                <button
                  key={def.type}
                  onClick={() => handleAddAction(def)}
                  className="p-3 text-left border border-slate-200 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 rounded-lg bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all text-xs"
                >
                  <div className="font-bold text-slate-900 dark:text-slate-100">{def.label}</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{def.description}</p>
                </button>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsAddStepOpen(false)}
                className="px-4 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STEP PARAMETERS MODAL */}
      {editingStep && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Configure Step: {editingStep.label}
            </h3>

            <form onSubmit={handleSaveStepConfig} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Step Description / Label
                </label>
                <input
                  type="text"
                  value={editingStep.label}
                  onChange={(e) => setEditingStep({ ...editingStep, label: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  CSS / XPath Target Selector
                </label>
                <input
                  type="text"
                  placeholder="e.g. input[name='q'] or #submit_btn"
                  value={editingStep.selector || ''}
                  onChange={(e) => setEditingStep({ ...editingStep, selector: e.target.value })}
                  className="w-full font-mono text-[11px] px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Input / Parameter Value
                </label>
                <input
                  type="text"
                  placeholder="URL, text to type, or scroll delta"
                  value={editingStep.value || ''}
                  onChange={(e) => setEditingStep({ ...editingStep, value: e.target.value })}
                  className="w-full font-mono text-[11px] px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Wait Timeout (ms)
                  </label>
                  <input
                    type="number"
                    value={editingStep.timeoutMs || 10000}
                    onChange={(e) => setEditingStep({ ...editingStep, timeoutMs: Number(e.target.value) })}
                    className="w-full font-mono px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingStep.optional || false}
                      onChange={(e) => setEditingStep({ ...editingStep, optional: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>Continue on Error (Optional)</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStep(null)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW WORKFLOW MODAL */}
      {isNewWfOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Create New RPA Workflow
            </h3>

            <form onSubmit={handleCreateWorkflow} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Workflow Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., E-Commerce Price Checker"
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe goal and target elements..."
                  value={newWfDesc}
                  onChange={(e) => setNewWfDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newWfCategory}
                  onChange={(e) => setNewWfCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  <option value="Search & SEO Audit">Search &amp; SEO Audit</option>
                  <option value="Content Research">Content Research</option>
                  <option value="E-Commerce Audit">E-Commerce Audit</option>
                  <option value="QA Form Testing">QA Form Testing</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewWfOpen(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded"
                >
                  Create Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
