import React, { useState } from 'react';
import { useCubes } from '../context/CubesContext';
import { Activity, Search, Download, Trash2, Clock, Zap, CheckCircle2 } from 'lucide-react';

export const ActivityLogs: React.FC = () => {
  const { activityLogs, cubes } = useCubes();
  const [filterCubeId, setFilterCubeId] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredLogs = activityLogs.filter((log) => {
    if (filterCubeId !== 'all' && log.cubeId !== filterCubeId) return false;
    if (
      search &&
      !log.action.toLowerCase().includes(search.toLowerCase()) &&
      !log.details.toLowerCase().includes(search.toLowerCase()) &&
      !log.cubeName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalTokens = activityLogs.reduce((acc, curr) => acc + (curr.tokens || 0), 0);
  const avgLatency = activityLogs.length > 0
    ? Math.round(
        activityLogs.reduce((acc, curr) => acc + (curr.latencyMs || 0), 0) / activityLogs.length
      )
    : 0;

  const handleExportJSON = () => {
    const data = JSON.stringify(activityLogs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cubes-activity-telemetry-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex-1 flex flex-col p-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-indigo-400" />
            </span>
            <span>Workforce Activity & Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time observability into multi-agent task execution, inter-cube handoffs, and token consumption.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export Logs JSON</span>
        </button>
      </div>

      {/* KPI Stats Strip (Tabular Figures) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 bg-[#101622] border border-slate-800 rounded-xl">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            Total Telemetry Events
          </span>
          <span className="text-xl font-bold text-white font-mono tabular-nums mt-1 block">
            {activityLogs.length}
          </span>
        </div>

        <div className="p-4 bg-[#101622] border border-slate-800 rounded-xl">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            Tokens Processed
          </span>
          <span className="text-xl font-bold text-indigo-400 font-mono tabular-nums mt-1 block">
            {(totalTokens / 1000).toFixed(1)}k
          </span>
        </div>

        <div className="p-4 bg-[#101622] border border-slate-800 rounded-xl">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            Active Workforce
          </span>
          <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-1 block">
            {cubes.length} Cubes
          </span>
        </div>

        <div className="p-4 bg-[#101622] border border-slate-800 rounded-xl">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            Avg Turn Latency
          </span>
          <span className="text-xl font-bold text-slate-200 font-mono tabular-nums mt-1 block">
            {avgLatency}ms
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action or details..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Filter Cube:</span>
          <select
            value={filterCubeId}
            onChange={(e) => setFilterCubeId(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
          >
            <option value="all">All Digital Employees</option>
            {cubes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Events Feed */}
      <div className="bg-[#101622] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0F17] border-b border-slate-800/80 text-slate-400 font-mono">
              <tr>
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-4 font-medium">Cube Agent</th>
                <th className="py-3 px-4 font-medium">Action</th>
                <th className="py-3 px-4 font-medium">Details</th>
                <th className="py-3 px-4 font-medium text-right">Tokens</th>
                <th className="py-3 px-4 font-medium text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className="font-semibold text-xs inline-flex items-center gap-1.5"
                      style={{ color: log.cubeColor || '#818cf8' }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: log.cubeColor || '#818cf8' }}
                      />
                      {log.cubeName}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-300 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-400 max-w-md truncate">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                    {log.tokens > 0 ? log.tokens : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                    {log.latencyMs > 0 ? `${log.latencyMs}ms` : '—'}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No activity logs recorded yet. Send a direct message or run a Supervisor orchestration to generate telemetry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
