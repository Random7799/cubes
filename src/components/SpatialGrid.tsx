import React, { useState } from 'react';
import { useCubes } from '../context/CubesContext';
import { Cube, CubePermission } from '../types/cube';
import {
  MessageSquare,
  Mic,
  Sliders,
  Shield,
  Search,
  Sparkles,
  Network,
  Compass,
  Terminal,
  ShieldCheck,
  Bot,
  Layers,
  Grid,
  Activity,
  TrendingUp,
  GripVertical,
  Move,
  Magnet,
  LayoutGrid,
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

  // Unique gradient identifier based on color
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
      {/* Active Terminal Pulse Marker */}
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

export const SpatialGrid: React.FC = () => {
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
  const [isIsometric, setIsIsometric] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [draggedCubeId, setDraggedCubeId] = useState<string | null>(null);
  const [dragOverCubeId, setDragOverCubeId] = useState<string | null>(null);

  // Drag-and-drop repositioning handlers
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
      {/* Control Strip & Workspace Subheader */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Spatial Cube Studio</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
              {cubes.length} Active Digital Employees
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span>Specialized autonomous agents ready for direct delegation or coordinated execution.</span>
            <span className="hidden md:inline text-slate-500 font-mono text-[11px]">· Drag cards to organize layout</span>
          </p>
        </div>

        {/* View Mode & Search Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Cubes by role or skill..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Snap-to-Grid & Auto-Align Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Snap to Grid Toggle */}
            <button
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                snapToGrid
                  ? 'bg-indigo-950/70 border-indigo-500/80 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Magnetic Snap-to-Grid alignment"
            >
              <Magnet className={`w-3.5 h-3.5 ${snapToGrid ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Snap</span>
              <span className="text-[10px] font-mono opacity-80">{snapToGrid ? 'ON' : 'OFF'}</span>
            </button>

            {/* Auto-Align Button */}
            <button
              onClick={autoAlignGrid}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              title="Auto-align cards into an optimal geometric matrix"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Auto-Align</span>
            </button>
          </div>

          {/* Perspective mode toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shrink-0">
            <button
              onClick={() => setIsIsometric(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                isIsometric ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Isometric 3D Spatial Grid"
            >
              <Layers className="w-3 h-3" />
              <span className="hidden sm:inline">3D Grid</span>
            </button>
            <button
              onClick={() => setIsIsometric(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                !isIsometric ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Flat Orthographic Grid"
            >
              <Grid className="w-3 h-3" />
              <span className="hidden sm:inline">Flat Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Filter Tabs (interactive filter controls) */}
      <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-1 scrollbar-none">
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

      {/* 3D Perspective Stage Container */}
      <div className={isIsometric ? 'spatial-stage py-4' : 'py-2'}>
        <div className="relative">
          {/* Snap-to-Grid Blueprint Floor Guides on the Isometric Matrix */}
          {snapToGrid && (
            <div
              className={`absolute inset-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pointer-events-none transition-all duration-300 ${
                isIsometric ? 'isometric-plane' : 'isometric-plane-flat'
              } ${draggedCubeId ? 'opacity-100 z-10' : 'opacity-40 -z-10'}`}
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
                    className={`rounded-2xl border transition-all duration-200 relative min-h-[380px] p-4 flex flex-col justify-between ${
                      isSnapLocked
                        ? 'border-indigo-400/90 bg-indigo-500/15 shadow-[0_0_35px_rgba(99,102,241,0.25)] ring-2 ring-indigo-400/80 scale-[1.01]'
                        : draggedCubeId
                        ? 'border-dashed border-indigo-500/40 bg-indigo-950/25'
                        : 'border-dashed border-slate-800/60 bg-slate-950/20'
                    }`}
                  >
                    {/* Corner Crosshairs */}
                    <span className="absolute top-2 left-2.5 text-[10px] font-mono text-indigo-400/50 select-none">┌</span>
                    <span className="absolute top-2 right-2.5 text-[10px] font-mono text-indigo-400/50 select-none">┐</span>
                    <span className="absolute bottom-2 left-2.5 text-[10px] font-mono text-indigo-400/50 select-none">└</span>
                    <span className="absolute bottom-2 right-2.5 text-[10px] font-mono text-indigo-400/50 select-none">┘</span>

                    {/* Slot Coordinates */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <span>ISOMETRIC GRID [R{row}, C{col}]</span>
                      </span>
                      <span className="tabular-nums">SLOT #{String(slotIdx + 1).padStart(2, '0')}</span>
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
                            isSnapLocked ? 'text-indigo-300' : 'text-slate-600'
                          }`}
                        >
                          {isSnapLocked ? 'Magnetic Snap Locked' : 'Alignment Cell'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-transform duration-500 relative z-20 ${
              isIsometric ? 'isometric-plane' : 'isometric-plane-flat'
            }`}
          >
            {filteredCubes.map((cube, index) => {
              const isBeingDragged = draggedCubeId === cube.id;
              const isDropTarget = dragOverCubeId === cube.id;

              return (
                <div
                  key={cube.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, cube.id)}
                  onDragOver={(e) => handleDragOver(e, cube.id)}
                  onDragLeave={(e) => handleDragLeave(e, cube.id)}
                  onDrop={(e) => handleDrop(e, cube.id)}
                  onDragEnd={handleDragEnd}
                  className={`cube-card-3d relative bg-[#101622]/90 border rounded-2xl p-5 shadow-xl backdrop-blur-sm flex flex-col justify-between group overflow-hidden transition-all duration-200 ${
                    isBeingDragged
                      ? 'opacity-35 scale-[0.97] border-dashed border-indigo-400 shadow-none'
                      : isDropTarget
                      ? 'ring-2 ring-indigo-400 border-indigo-400 bg-indigo-950/50 scale-[1.02] shadow-2xl z-20'
                      : 'border-slate-800/90 hover:border-slate-700/80'
                  }`}
                >
                  {/* Magnetic Snap Lock Banner when Drop Target & Snap is Active */}
                  {isDropTarget && snapToGrid && (
                    <div className="absolute top-1 left-2.5 right-2.5 bg-indigo-600 text-white text-[9px] font-mono font-bold py-1 px-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/40 z-30 animate-pulse">
                      <Magnet className="w-3.5 h-3.5 text-cyan-300" />
                      <span>SNAP-TO-GRID · LOCKED TO SLOT #{String(index + 1).padStart(2, '0')}</span>
                    </div>
                  )}

                  {/* Top Accent Rim Line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: cube.accentColor }}
                  />

                {/* Card Header: Icon + Name + Drag Grip & Spatial Node Indicator */}
                <div>
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

                    {/* Spatial Node Coordinate, Permission Select, and Tactile Drag Handle */}
                    <div className="flex items-center gap-1.5 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
                      <span
                        className="text-[10px] font-mono text-slate-500 tabular-nums hidden sm:inline"
                        title={snapToGrid ? 'Snap-Aligned Grid Coordinate' : 'Slot Position'}
                      >
                        {snapToGrid
                          ? `[R${Math.floor(index / 3) + 1}, C${(index % 3) + 1}]`
                          : `#${String(index + 1).padStart(2, '0')}`}
                      </span>

                      {/* Access Level Selector (Owner / Editor / Viewer) */}
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
                        title="Drag to reposition in workspace"
                        aria-label="Drag to reposition card"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-2">
                    {cube.tagline}
                  </p>

                {/* Unboxed Metadata (Zero-Pill Discipline with typographic separator) */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-mono">
                  <span>{cube.sops?.length || 0} SOPs</span>
                  <span aria-hidden="true">·</span>
                  <span>{cube.skills?.length || 0} Skills</span>
                  <span aria-hidden="true">·</span>
                  <span>{cube.memory?.length || 0} Memories</span>
                </div>

                {/* Diagnostic Visual Indicator Panel */}
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-900 mb-4 group/diagnostic">
                  {/* Diagnostic Panel Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                        Diagnostics
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
                  <div className="w-full h-7 mb-2.5 bg-slate-900/60 rounded-lg p-1 border border-slate-900/90 flex items-center overflow-hidden">
                    <MiniSparkline
                      data={cube.stats?.activitySparkline || [20, 28, 35, 30, 48, 55, 62, 75, 84]}
                      color={cube.accentColor}
                      width={240}
                      height={24}
                    />
                  </div>

                  {/* 3 Core Diagnostic Metrics: Uptime, Token Usage, and Task Completion Rate */}
                  <div className="grid grid-cols-3 gap-1.5 font-mono pt-1.5 border-t border-slate-900/80">
                    {/* 1. Uptime */}
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

                    {/* 2. Token Usage */}
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

                    {/* 3. Task Completion Rate */}
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

              {/* Action Toolbar */}
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

        {/* Empty state */}
        {filteredCubes.length === 0 && (
          <div className="text-center py-16 px-4 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
            <Bot className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-200">No Cubes found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4 max-w-sm mx-auto">
              No digital employees matched your filter query. Adjust the filters or spawn a specialized Cube.
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
      </div>

      {/* Floating Shortcut Banner to Supervisor Hub */}
      <div className="mt-12 p-4 bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Network className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">
              Supervisor Orchestration Ready
            </h4>
            <p className="text-xs text-slate-400">
              Dispatch cross-functional objectives where Orion leads Lyra, Vektor, Cipher, and Aura in a collaborative pipeline.
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
