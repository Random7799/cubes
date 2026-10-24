import React from 'react';
import { CubesProvider, useCubes } from './context/CubesContext';
import { TopBar } from './components/TopBar';
import { NodeGrid } from './components/SpatialGrid';
import { SupervisorHub } from './components/SupervisorHub';
import { ActivityLogs } from './components/ActivityLogs';
import { SkillLibrary } from './components/SkillLibrary';
import { CubeChatModal } from './components/CubeChatModal';
import { VoiceConsoleModal } from './components/VoiceConsoleModal';
import { CubeStudioModal } from './components/CubeStudioModal';

const MainContent: React.FC = () => {
  const { activeTab, cubes } = useCubes();

  return (
    <div className="min-h-screen flex flex-col bg-[#090D14] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <TopBar />

      <main className="flex-1 flex flex-col">
        {activeTab === 'grid' && <NodeGrid />}
        {activeTab === 'supervisor' && <SupervisorHub />}
        {activeTab === 'activity' && <ActivityLogs />}
        {activeTab === 'skills' && <SkillLibrary />}
      </main>

      {/* Global Modals */}
      <CubeChatModal />
      <VoiceConsoleModal />
      <CubeStudioModal />

      {/* Clean, unboxed footer with zero telemetry tickers */}
      <footer className="border-t border-slate-900 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">Cubes</span>
          <span aria-hidden="true">·</span>
          <span>Autonomous Multi-Agent Workspace</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{cubes.length} Active Digital Employees</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Role-Based Access: Owner / Editor / Viewer</span>
          <span aria-hidden="true">·</span>
          <span>Inter-Cube Protocol v1.4</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CubesProvider>
      <MainContent />
    </CubesProvider>
  );
}
