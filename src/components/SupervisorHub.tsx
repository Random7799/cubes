import React, { useState } from 'react';
import { useCubes } from '../context/CubesContext';
import {
  Network,
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  RotateCw,
  Terminal,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const SupervisorHub: React.FC = () => {
  const {
    cubes,
    activeJob,
    isOrchestrating,
    runOrchestration,
    jobsHistory,
  } = useCubes();

  const [promptInput, setPromptInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedHandoff, setExpandedHandoff] = useState<number | null>(null);

  const leadCube = cubes.find((c) => c.isLead) || cubes[0];

  const suggestedPrompts = [
    'Design an autonomous real-time data sync engine with retry invariants and security audit',
    'Perform a market intelligence brief on multi-agent frameworks with launch strategy and copy',
    'Architect a high-velocity event-driven webhook pipeline with edge-case test suite',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isOrchestrating) return;
    const task = promptInput;
    setPromptInput('');
    await runOrchestration(task);
  };

  const handleCopySynthesis = () => {
    if (activeJob?.finalSynthesis) {
      navigator.clipboard.writeText(activeJob.finalSynthesis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Network className="w-4 h-4 text-emerald-400" />
            </span>
            <span>Supervisor Orchestration Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Lead Supervisor Orion decomposes goals, dispatches sub-tasks to specialized digital employees, and unifies deliverables.
          </p>
        </div>

        {/* Lead Cube Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-300 font-medium">{leadCube.name} (Supervisor)</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 font-mono">
            {isOrchestrating ? 'Orchestrating...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Goal Input Console */}
      <div className="bg-[#101622] border border-slate-800 rounded-2xl p-5 shadow-xl mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Direct High-Level Objective to Team</span>
            <span className="text-slate-500 font-normal lowercase">Multi-agent delegation</span>
          </label>

          <div className="relative">
            <textarea
              rows={3}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="E.g., Architect a scalable multi-agent microservice architecture, perform security edge-case audit, and draft the developer launch brief..."
              disabled={isOrchestrating}
              className="w-full p-3.5 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Quick suggested prompt tags */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 whitespace-nowrap">Examples:</span>
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPromptInput(p)}
                  className="px-2.5 py-1 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded-md transition-colors whitespace-nowrap truncate max-w-xs text-left"
                  title={p}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={!promptInput.trim() || isOrchestrating}
              className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-indigo-600/30"
            >
              {isOrchestrating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Cubes Collaborating...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch to Workforce</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Pipeline Execution or Results */}
      {isOrchestrating && (
        <div className="bg-[#101622] border border-indigo-500/30 rounded-2xl p-6 shadow-xl mb-8 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-white">Supervisor Orchestration in Progress</h3>
                <p className="text-xs text-slate-400">
                  Orion is deconstructing the goal, delegating steps, and validating inter-Cube handoffs...
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-indigo-400 font-medium">Pipeline Active</span>
          </div>

          {/* Simulated step animation indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3 bg-slate-950/60 border border-cyan-500/40 rounded-xl">
              <span className="text-[10px] text-cyan-400 font-mono block">Stage 1 · Intelligence</span>
              <span className="text-xs text-slate-200 font-medium">Lyra Gathering Groundwork</span>
            </div>
            <div className="p-3 bg-slate-950/60 border border-indigo-500/40 rounded-xl">
              <span className="text-[10px] text-indigo-400 font-mono block">Stage 2 · Engineering</span>
              <span className="text-xs text-slate-200 font-medium">Vektor Building Architecture</span>
            </div>
            <div className="p-3 bg-slate-950/60 border border-amber-500/40 rounded-xl">
              <span className="text-[10px] text-amber-400 font-mono block">Stage 3 · Verification</span>
              <span className="text-xs text-slate-200 font-medium">Cipher Auditing Invariants</span>
            </div>
            <div className="p-3 bg-slate-950/60 border border-purple-500/40 rounded-xl">
              <span className="text-[10px] text-purple-400 font-mono block">Stage 4 · Release Copy</span>
              <span className="text-xs text-slate-200 font-medium">Aura Polishing Delivery</span>
            </div>
          </div>
        </div>
      )}

      {/* Current Completed Job Deliverables */}
      {activeJob && activeJob.status === 'completed' && !isOrchestrating && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-[#101622] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-5">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Workflow Execution Succeeded
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {activeJob.summary || 'Multi-Agent Collective Deliverable'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Original Objective: "{activeJob.prompt}"
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySynthesis}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied' : 'Copy Deliverable'}</span>
                </button>
              </div>
            </div>

            {/* Orion's Consolidated Synthesis */}
            <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Network className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  Unified Synthesis by Lead Supervisor Orion
                </span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                {activeJob.finalSynthesis}
              </div>
            </div>

            {/* Inter-Cube Message Bus & Handoff Stream */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Inter-Cube Message Bus & Handoff Trail</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {activeJob.handoffs?.length || 0} Packets Exchanged
                </span>
              </div>

              <div className="space-y-3">
                {activeJob.handoffs?.map((handoff, idx) => {
                  const isExpanded = expandedHandoff === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-950/80 border border-slate-800/80 rounded-xl overflow-hidden transition-colors"
                    >
                      {/* Handoff Header */}
                      <button
                        onClick={() => setExpandedHandoff(isExpanded ? null : idx)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-900/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-slate-800 text-[11px] font-mono font-bold text-slate-300 flex items-center justify-center">
                            {handoff.stepNumber}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="text-xs font-bold"
                                style={{ color: handoff.fromCubeColor || '#38bdf8' }}
                              >
                                {handoff.fromCubeName}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              <span className="text-xs font-medium text-slate-300">
                                {handoff.toCubeName}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-normal">
                              Task: {handoff.taskName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="hidden sm:inline font-mono text-[10px]">
                            {new Date(handoff.timestamp).toLocaleTimeString()}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Expandable Payload */}
                      {isExpanded && (
                        <div className="p-4 border-t border-slate-900 bg-[#0B0F17] text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                          {handoff.payload}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prior Execution History Section */}
      {jobsHistory.length > 1 && (
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Past Orchestrations in Session</span>
          </h3>
          <div className="space-y-2">
            {jobsHistory.slice(1, 5).map((job) => (
              <div
                key={job.id}
                className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="truncate max-w-lg">
                  <span className="text-slate-200 font-medium block truncate">
                    {job.prompt}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(job.timestamp).toLocaleTimeString()} · {job.handoffs?.length || 0} handoffs
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
