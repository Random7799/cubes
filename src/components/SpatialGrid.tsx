import React, { useState } from 'react';
import { useCubes } from '../context/CubesContext';
import { Cube, CubePermission } from '../types/cube';
import {
  MessageSquare,
  Mic,
  Sliders,
  Search,
  Sparkles,
  Network,
  Compass,
  Terminal,
  ShieldCheck,
  Bot,
  Activity,
  TrendingUp,
  GripVertical,
  Magnet,
  LayoutGrid,
  Cpu,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface MiniSparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  className?: string;
}

const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  color,
  width = 240,
  height = 28,
  className = '',
}) => {
  const pointsData = data && data.length > 1 ? data : [20, 30, 45, 40, 55, 65, 78, 85];
  const min = Math.min(...pointsData);
  const max = Math.max(...pointsData);
  const range = max - min || 1;
  const paddingX = 4;
  const paddingY = 4;
  const effectiveWidth = width - paddingX * 2;
  const effectiveHeight = height - paddingY * 2;

  const points = pointsData.map((val, idx) => {
    const x = paddingX + (idx / (pointsData.length - 1)) * effectiveWidth;
    const y = height - paddingY - ((val - min) / range) * effectiveHeight;
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    return `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;
  const lastPoint = points[points.length - 1];

  const safeColorId = color.replace(/[^a-zA-Z0-9]/g, '');
  const gradientId = `spark-grad-${safeColorId}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible w-full ${className}`}
      preserveAspectRatio="none"
      style={{ height: `${height}px` }}
      aria-label="Diagnostic activity sparkline"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Area gradient under curve */}
      <path d={areaD} fill={`url(#${gradientId})`} />
      {/* Sparkline curve */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Active Pulse Marker */}
      {lastPoint && (
        <g>
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="4.5"
            fill={color}
            opacity="0.35"
            className="animate-ping"
          />
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="2.5"
            fill={color}
            stroke="#0B0F17"
            strokeWidth="1"
          />
        </g>
      )}
    </svg>
  );
};

export const NodeGrid: React.FC = () => {
  const {
    cubes,
    setChatModalCube,
    setVoiceModalCube,
    setStudioModalData,
    updateCubePermission,
    reorderCubes,
    autoAlignGrid,
    setActiveTab,
  } = useCubes();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [draggedCubeId, setDraggedCubeId] = useState<string | null>(null);
  const [dragOverCubeId, setDragOverCubeId] = useState<string | null>(null);

  // Drag-and-drop repositioning handlers with automatic magnetic snap
  const handleDragStart = (e: React.DragEvent, cubeId: string) => {
    setDraggedCubeId(cubeId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cubeId);
  };

  const handleDragOver = (e: React.DragEvent, cubeId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedCubeId && draggedCubeId !== cubeId && dragOverCubeId !== cubeId) {
      setDragOverCubeId(cubeId);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, cubeId: string) => {
    if (dragOverCubeId === cubeId) {
      setDragOverCubeId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetCubeId: string) => {
    e.preventDefault();
    if (draggedCubeId && draggedCubeId !== targetCubeId) {
      // Magnetic snap reordering executes on drop
      reorderCubes(draggedCubeId, targetCubeId);
    }
    setDraggedCubeId(null);
    setDragOverCubeId(null);
  };

  const handleDragEnd = () => {
    setDraggedCubeId(null);
    setDragOverCubeId(null);
  };

  // Dynamic icon helper
  const renderIcon = (iconName: string, color: string) => {
    const props = { className: 'w-5 h-5', style: { color } };
    switch (iconName) {
      case 'Network':
        return <Network {...props} />;
      case 'Compass':
        return <Compass {...props} />;
      case 'Terminal':
        return <Terminal {...props} />;
      case 'ShieldCheck':
        return <ShieldCheck {...props} />;
      case 'Sparkles':
        return <Sparkles {...props} />;
      default:
        return <Bot {...props} />;
    }
  };

  const filteredCubes = cubes.filter((cube) => {
    const matchesSearch =
      cube.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cube.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cube.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (roleFilter === 'all') return true;
    if (roleFilter === 'lead') return cube.isLead;
    if (roleFilter === 'engineering') return cube.skills.some((s) => s.includes('Engineering') || s.includes('Systems'));
    if (roleFilter === 'intelligence') return cube.skills.some((s) => s.includes('Research') || s.includes('Grounding'));
    if (roleFilter === 'security') return cube.skills.some((s) => s.includes('Security') || s.includes('QA') || s.includes('Audit'));
    if (roleFilter === 'creative') return cube.skills.some((s) => s.includes('Brand') || s.includes('Copywriting'));

    return true;
  });

  return (
    <div className="w-full flex-1 flex flex-col p-6 max-w-7xl mx-auto">
      {/* Node Grid Workspace Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Cpu className="w-6 h-6 text-indigo-400" />
              <span>Node Grid Studio</span>
            </h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {cubes.length} Active Nodes
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Modular digital employee nodes with real-time bus telemetry and magnetic socket snap alignment.</span>
          </p>
        </div>

        {/* Node Grid Search & Alignment Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes by role or skill..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Auto-Align Nodes Button */}
          <button
            onClick={autoAlignGrid}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors shrink-0"
            title="Auto-pack and snap all nodes into optimal matrix order"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Auto-Align</span>
          </button>
        </div>
      </div>

      {/* Role Filter Tabs (Discipline Slices) */}
      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Disciplines' },
          { id: 'lead', label: 'Supervisor Lead' },
          { id: 'engineering', label: 'Engineering' },
          { id: 'intelligence', label: 'Intelligence' },
          { id: 'security', label: 'Security & QA' },
          { id: 'creative', label: 'Creative & Copy' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setRoleFilter(filter.id)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              roleFilter === filter.id
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800/60'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Planar Node Grid Matrix Container */}
      <div className="relative node-grid-matrix p-4 rounded-3xl border border-slate-800/80 bg-[#0A0E17]/60">
        {/* Underlying Permanent Magnetic Socket Sockets */}
        <div
          className="absolute inset-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pointer-events-none"
          aria-hidden="true"
        >
          {Array.from({ length: Math.max(filteredCubes.length, 6) }).map((_, slotIdx) => {
            const col = (slotIdx % 3) + 1;
            const row = Math.floor(slotIdx / 3) + 1;
            const targetCube = filteredCubes[slotIdx];
            const isSnapLocked = draggedCubeId && dragOverCubeId === targetCube?.id;

            return (
              <div
                key={slotIdx}
                className={`rounded-2xl border transition-all duration-200 relative min-h-[400px] p-4 flex flex-col justify-between ${
                  isSnapLocked
                    ? 'border-indigo-400/90 bg-indigo-500/15 shadow-[0_0_35px_rgba(99,102,241,0.25)] ring-2 ring-indigo-400/80 scale-[1.01]'
                    : draggedCubeId
                    ? 'border-dashed border-indigo-500/40 bg-indigo-950/20'
                    : 'border-dashed border-slate-800/50 bg-slate-950/30'
                }`}
              >
                {/* Engineering Alignment Crosshairs */}
                <span className="absolute top-2 left-2.5 text-[10px] font-mono text-indigo-400/40 select-none">┌</span>
                <span className="absolute top-2 right-2.5 text-[10px] font-mono text-indigo-400/40 select-none">┐</span>
                <span className="absolute bottom-2 left-2.5 text-[10px] font-mono text-indigo-400/40 select-none">└</span>
                <span className="absolute bottom-2 right-2.5 text-[10px] font-mono text-indigo-400/40 select-none">┘</span>

                {/* Socket Coordinates */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    <span>NODE SOCKET [R{row}:C{col}]</span>
                  </span>
                  <span className="tabular-nums">BAY #{String(slotIdx + 1).padStart(2, '0')}</span>
                </div>

                {/* Active Magnetic Lock Guidance during drag */}
                {draggedCubeId && (
                  <div className="flex flex-col items-center justify-center gap-2 my-auto">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isSnapLocked
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 animate-pulse'
                          : 'bg-slate-900/80 border border-slate-800 text-slate-500'
                      }`}
                    >
                      <Magnet className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-medium tracking-wide uppercase ${
                        isSnapLocked ? 'text-indigo-300 font-bold' : 'text-slate-600'
                      }`}
                    >
                      {isSnapLocked ? 'Magnetic Snap Locked' : 'Drop Target Socket'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Foreground Active Node Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filteredCubes.map((cube, index) => {
            const isBeingDragged = draggedCubeId === cube.id;
            const isDropTarget = dragOverCubeId === cube.id;
            const row = Math.floor(index / 3) + 1;
            const col = (index % 3) + 1;

            return (
              <div
                key={cube.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, cube.id)}
                onDragOver={(e) => handleDragOver(e, cube.id)}
                onDragLeave={(e) => handleDragLeave(e, cube.id)}
                onDrop={(e) => handleDrop(e, cube.id)}
                onDragEnd={handleDragEnd}
                className={`node-card relative bg-[#101622]/95 border rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between group overflow-hidden ${
                  isBeingDragged
                    ? 'opacity-30 scale-[0.98] border-dashed border-indigo-400 shadow-none'
                    : isDropTarget
                    ? 'ring-2 ring-indigo-400 border-indigo-400 bg-indigo-950/60 scale-[1.01] shadow-2xl z-20'
                    : 'border-slate-800/90 hover:border-slate-700/80'
                }`}
              >
                {/* Magnetic Snap Lock Banner when Drop Target */}
                {isDropTarget && (
                  <div className="absolute top-1 left-2.5 right-2.5 bg-indigo-600 text-white text-[9px] font-mono font-bold py-1 px-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/40 z-30 animate-pulse">
                    <Magnet className="w-3.5 h-3.5 text-cyan-300" />
                    <span>MAGNETIC SNAP LOCKED · BAY #{String(index + 1).padStart(2, '0')}</span>
                  </div>
                )}

                {/* Top Accent Rim Line */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: cube.accentColor }}
                />

                {/* Node Grid Meta Bar: Node ID, Bus Connection Status, Port Tags */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-2.5 mb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-200">
                        NODE #{String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500">[R{row}:C{col}]</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                        <Radio className="w-2.5 h-2.5 animate-pulse" />
                        <span>BUS SYNC</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Header: Icon + Name + Role + Lead Tag */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105 shrink-0"
                        style={{
                          backgroundColor: `${cube.accentColor}15`,
                          borderColor: `${cube.accentColor}40`,
                        }}
                      >
                        {renderIcon(cube.iconName, cube.accentColor)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h2 className="text-base font-bold text-white tracking-tight truncate">
                            {cube.name}
                          </h2>
                          {cube.isLead && (
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded shrink-0">
                              Lead
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium truncate">
                          {cube.role}
                        </p>
                      </div>
                    </div>

                    {/* Access Level Selector & Tactile Drag Handle */}
                    <div className="flex items-center gap-1.5 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
                      <select
                        value={cube.permissions}
                        onChange={(e) => updateCubePermission(cube.id, e.target.value as CubePermission)}
                        aria-label="Access permission level"
                        className="text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="owner">Owner</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>

                      {/* Tactile Drag Grip Handle */}
                      <div
                        className="p-1 rounded text-slate-500 hover:text-indigo-400 hover:bg-slate-800/80 cursor-grab active:cursor-grabbing transition-colors"
                        title="Drag node to snap into another grid socket"
                        aria-label="Drag to reposition node"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-2">
                    {cube.tagline}
                  </p>

                  {/* Node Bus Port Connectivity Indicators */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 bg-slate-950/50 px-2 py-1 rounded-md mb-3 border border-slate-900">
                    <span className="flex items-center gap-1 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>IN: STREAM_BUS</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <span>OUT: DISPATCH</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    </span>
                  </div>

                  {/* Zero-Pill Unboxed Metadata (SOPs, Skills, Memories) */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3.5 font-mono">
                    <span>{cube.sops?.length || 0} SOPs</span>
                    <span aria-hidden="true">·</span>
                    <span>{cube.skills?.length || 0} Skills</span>
                    <span aria-hidden="true">·</span>
                    <span>{cube.memory?.length || 0} Memories</span>
                  </div>

                  {/* Real-time Diagnostic Telemetry Indicator Panel */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-900 mb-4 group/diagnostic">
                    {/* Diagnostic Panel Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                          Node Telemetry
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: cube.accentColor }}
                        />
                        <span className="text-slate-300 font-medium">
                          {cube.stats?.diagnosticStatus || 'Nominal'}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-emerald-400 font-medium tabular-nums flex items-center">
                          <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />
                          Live
                        </span>
                      </div>
                    </div>

                    {/* Miniature Sparkline */}
                    <div className="w-full h-7 mb-2 bg-slate-900/60 rounded-lg p-1 border border-slate-900/90 flex items-center overflow-hidden">
                      <MiniSparkline
                        data={cube.stats?.activitySparkline || [20, 28, 35, 30, 48, 55, 62, 75, 84]}
                        color={cube.accentColor}
                        width={240}
                        height={24}
                      />
                    </div>

                    {/* Diagnostic Metrics: Uptime, Tokens, Task Completion Rate */}
                    <div className="grid grid-cols-3 gap-1.5 font-mono pt-1.5 border-t border-slate-900/80">
                      {/* Uptime */}
                      <div className="text-left">
                        <span className="block text-[9px] text-slate-500 uppercase tracking-wider">
                          Uptime
                        </span>
                        <span className="text-xs font-semibold text-slate-200 tabular-nums">
                          {(cube.stats?.uptimePercent ?? 99.9).toFixed(1)}%
                        </span>
                        <span className="block text-[9px] text-slate-500 tabular-nums">
                          {cube.stats?.uptimeHours ?? 0}h
                        </span>
                      </div>

                      {/* Token Usage */}
                      <div className="text-center border-x border-slate-900/90 px-1">
                        <span className="block text-[9px] text-slate-500 uppercase tracking-wider">
                          Tokens
                        </span>
                        <span className="text-xs font-semibold text-slate-200 tabular-nums">
                          {((cube.stats?.tokensGenerated ?? 0) / 1000).toFixed(1)}k
                        </span>
                        <span className="block text-[9px] text-slate-500">
                          Usage
                        </span>
                      </div>

                      {/* Task Completion Rate */}
                      <div className="text-right">
                        <span className="block text-[9px] text-slate-500 uppercase tracking-wider">
                          Comp. Rate
                        </span>
                        <span className="text-xs font-semibold text-emerald-400 tabular-nums">
                          {(cube.stats?.completionRate ?? 98.4).toFixed(1)}%
                        </span>
                        <span className="block text-[9px] text-slate-500 tabular-nums">
                          {cube.stats?.tasksCompleted ?? 0} done
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Node Action Toolbar */}
                <div
                  className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 flex-1">
                    {/* Direct Talk Button */}
                    <button
                      onClick={() => setChatModalCube(cube)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>Talk</span>
                    </button>

                    {/* Real-time Voice Button */}
                    <button
                      onClick={() => setVoiceModalCube(cube)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors"
                      title={`Start voice conversation with ${cube.name}`}
                    >
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Voice</span>
                    </button>
                  </div>

                  {/* SOP Studio / Configure Button */}
                  <button
                    onClick={() => setStudioModalData({ cube, isNew: false })}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
                    title="Inspect SOPs & Knowledge"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredCubes.length === 0 && (
        <div className="text-center py-16 px-4 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 mt-6">
          <Bot className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No Nodes Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4 max-w-sm mx-auto">
            No digital employee nodes matched your filter query. Adjust the filters or spawn a specialized Cube.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('all');
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Inter-Node Orchestration Banner */}
      <div className="mt-8 p-4 bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Network className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">
              Inter-Node Bus & Supervisor Orchestration
            </h4>
            <p className="text-xs text-slate-400">
              Cubes communicate across the node bus to decompose goals and hand off deliverables in a synchronized pipeline.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('supervisor')}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          Open Supervisor Hub
        </button>
      </div>
    </div>
  );
};

// Also export as SpatialGrid for backwards compatibility
export const SpatialGrid = NodeGrid;
