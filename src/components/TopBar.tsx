import React, { useState } from 'react';
import { useCubes } from '../context/CubesContext';
import { Plus, Download, Upload, RotateCcw } from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setStudioModalData,
    cubes,
    resetWorkspace,
    exportWorkspace,
    importWorkspace,
  } = useCubes();

  const [showMenu, setShowMenu] = useState(false);

  const handleExport = () => {
    const data = exportWorkspace();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cubes-workforce-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const success = importWorkspace(text);
          if (success) {
            alert('Cubes workspace successfully imported!');
          } else {
            alert('Failed to parse Cubes configuration JSON.');
          }
        }
      };
      reader.readAsText(file);
    }
    setShowMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#090D14]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Brand wordmark & quiet descriptor */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('grid');
          }}
          className="text-lg font-bold tracking-tight text-white hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-5 h-5 rounded bg-gradient-to-tr from-indigo-500 to-cyan-400 inline-block shadow-sm shadow-indigo-500/20" />
          <span>Cubes</span>
        </a>
        <span className="hidden sm:inline text-xs text-slate-500 whitespace-nowrap">
          Digital Employee Studio
        </span>
      </div>

      {/* Zone 2: 4-5 single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('grid')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'grid'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-slate-400'
          }`}
        >
          Node Grid
          <span className="ml-1.5 text-xs text-slate-500 font-mono tabular-nums">
            ({cubes.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('supervisor')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'supervisor'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-slate-400'
          }`}
        >
          Supervisor Hub
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'activity'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-slate-400'
          }`}
        >
          Activity & Telemetry
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'skills'
              ? 'border-indigo-500 text-white font-semibold'
              : 'border-transparent text-slate-400'
          }`}
        >
          Skill Library
        </button>
      </nav>

      {/* Zone 3: Primary action + Utilities */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile menu tab switcher */}
        <div className="flex md:hidden items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-2 py-1 text-xs rounded ${activeTab === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
          >
            Nodes
          </button>
          <button
            onClick={() => setActiveTab('supervisor')}
            className={`px-2 py-1 text-xs rounded ${activeTab === 'supervisor' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
          >
            Hub
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-2 py-1 text-xs rounded ${activeTab === 'activity' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
          >
            Logs
          </button>
        </div>

        {/* Primary Spawn Cube CTA */}
        <button
          onClick={() => setStudioModalData({ cube: null, isNew: true })}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Spawn Cube</span>
        </button>

        {/* Workspace state options */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            title="Workspace Options"
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <span className="text-xs font-mono px-1">⚙</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#121824] border border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-xs">
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-800/80 hover:text-white text-left transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export Workspace JSON</span>
              </button>

              <label className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-800/80 hover:text-white text-left transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Import Workspace</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={() => {
                  if (confirm('Reset workforce to default Creator & Tech Team?')) {
                    resetWorkspace();
                  }
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 text-left transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset to Seed Workforce</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
