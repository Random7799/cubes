import React, { useState } from 'react';
import { useCubes } from '../context/CubesContext';
import { Cube, CubePermission, CubeSOP } from '../types/cube';
import { INITIAL_SKILL_CATALOG } from '../data/defaultCubes';
import {
  X,
  Check,
  Plus,
  Trash2,
  Shield,
  BookOpen,
  Sparkles,
  Bot,
  Brain,
  Sliders,
  Network,
  Compass,
  Terminal,
  ShieldCheck,
} from 'lucide-react';

const ACCENT_COLORS = [
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
];

const ICONS = ['Network', 'Compass', 'Terminal', 'ShieldCheck', 'Sparkles', 'Bot'];

export const CubeStudioModal: React.FC = () => {
  const { studioModalData, setStudioModalData, saveCube, deleteCube } = useCubes();

  if (!studioModalData) return null;

  const { cube, isNew } = studioModalData;

  const [name, setName] = useState(cube?.name || '');
  const [role, setRole] = useState(cube?.role || '');
  const [tagline, setTagline] = useState(cube?.tagline || '');
  const [accentColor, setAccentColor] = useState(cube?.accentColor || '#6366F1');
  const [iconName, setIconName] = useState(cube?.iconName || 'Bot');
  const [permissions, setPermissions] = useState<CubePermission>(cube?.permissions || 'editor');
  const [systemInstruction, setSystemInstruction] = useState(
    cube?.systemInstruction ||
      'You are a specialized digital employee agent. Execute tasks with high technical rigor, explicit contracts, and proactive risk analysis.'
  );
  const [voiceName, setVoiceName] = useState<'Kore' | 'Zephyr' | 'Puck' | 'Fenrir'>(
    cube?.voiceName || 'Zephyr'
  );
  const [sops, setSops] = useState<CubeSOP[]>(cube?.sops || []);
  const [skills, setSkills] = useState<string[]>(cube?.skills || []);
  const [memory, setMemory] = useState<string[]>(cube?.memory || []);

  // New SOP form state
  const [showAddSOP, setShowAddSOP] = useState(false);
  const [newSOPName, setNewSOPName] = useState('');
  const [newSOPTrigger, setNewSOPTrigger] = useState('');
  const [newSOPSteps, setNewSOPSteps] = useState('');
  const [newSOPOutput, setNewSOPOutput] = useState('');

  // New Memory state
  const [newMemory, setNewMemory] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      alert('Please provide a name and role for this Cube.');
      return;
    }

    const cubeData: Cube = {
      id: cube?.id || `cube-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      role: role.trim(),
      tagline: tagline.trim() || `${role} executing specialized multi-agent workflows.`,
      accentColor,
      iconName,
      permissions,
      systemInstruction,
      voiceName,
      isLead: cube?.isLead || false,
      status: 'idle',
      sops,
      skills,
      memory,
      stats: cube?.stats || {
        tasksCompleted: 0,
        tokensGenerated: 0,
        uptimeHours: 1,
        uptimePercent: 99.9,
        completionRate: 100.0,
        activitySparkline: [12, 18, 25, 30, 45, 52, 65, 78],
        diagnosticStatus: 'Nominal',
      },
    };

    saveCube(cubeData, isNew);
  };

  const handleAddSOP = () => {
    if (!newSOPName.trim() || !newSOPTrigger.trim()) return;
    const sop: CubeSOP = {
      id: `sop-${Date.now()}`,
      name: newSOPName.trim(),
      trigger: newSOPTrigger.trim(),
      steps: newSOPSteps
        ? newSOPSteps.split('\n').filter((s) => s.trim().length > 0)
        : ['Execute standardized analysis', 'Compile structured deliverable'],
      outputFormat: newSOPOutput.trim() || 'Structured deliverable',
    };
    setSops([...sops, sop]);
    setNewSOPName('');
    setNewSOPTrigger('');
    setNewSOPSteps('');
    setNewSOPOutput('');
    setShowAddSOP(false);
  };

  const handleToggleSkill = (skillName: string) => {
    if (skills.includes(skillName)) {
      setSkills(skills.filter((s) => s !== skillName));
    } else {
      setSkills([...skills, skillName]);
    }
  };

  const handleAddMemoryItem = () => {
    if (!newMemory.trim()) return;
    setMemory([newMemory.trim(), ...memory]);
    setNewMemory('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl w-full max-w-3xl my-8 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#101624]">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {isNew ? 'Spawn New Digital Employee' : `Configure ${cube?.name} Studio`}
              </h2>
              <p className="text-xs text-slate-400">
                Define operational SOPs, specialized skill plugins, and access boundaries.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStudioModalData(null)}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Identity Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>Identity & Discipline</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Cube Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Kairo"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Digital Employee Role *
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="E.g., FinOps & Cloud Cost Architect"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Responsibility Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="One sentence describing what this Cube delivers"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Accent Color & Icon Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAccentColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        accentColor === c ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Voice Profile
                </label>
                <select
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value="Zephyr">Zephyr (Authoritative, Clear)</option>
                  <option value="Kore">Kore (Professional, Warm)</option>
                  <option value="Puck">Puck (Energetic, Inquisitive)</option>
                  <option value="Fenrir">Fenrir (Calm, Technical)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Access Control & Permissions */}
          <div className="pt-4 border-t border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Access Level & Permissions</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'owner', label: 'Owner', desc: 'Full write, reconfigure, & deletion control' },
                { id: 'editor', label: 'Editor', desc: 'Can execute tasks and edit SOPs & memory' },
                { id: 'viewer', label: 'Viewer', desc: 'Read-only queries and chat interactions' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPermissions(p.id as CubePermission)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    permissions === p.id
                      ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="block text-xs font-bold text-slate-200">{p.label}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5 leading-snug">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Core System Instructions */}
          <div className="pt-4 border-t border-slate-800/80">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Core Persona & System Instructions
            </label>
            <textarea
              rows={3}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
            />
          </div>

          {/* Standard Operating Procedures (SOPs) */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Standard Operating Procedures (SOPs)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddSOP(!showAddSOP)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add SOP</span>
              </button>
            </div>

            {showAddSOP && (
              <div className="p-4 bg-slate-950 border border-slate-700 rounded-xl space-y-3 mb-4">
                <h4 className="text-xs font-semibold text-slate-200">Define New Operational SOP</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newSOPName}
                    onChange={(e) => setNewSOPName(e.target.value)}
                    placeholder="SOP Name (e.g. Rate Limit Stress Test)"
                    className="p-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                  <input
                    type="text"
                    value={newSOPTrigger}
                    onChange={(e) => setNewSOPTrigger(e.target.value)}
                    placeholder="Trigger (e.g. Receipt of backend schema)"
                    className="p-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <textarea
                  rows={2}
                  value={newSOPSteps}
                  onChange={(e) => setNewSOPSteps(e.target.value)}
                  placeholder="Steps (one per line)"
                  className="w-full p-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                />
                <input
                  type="text"
                  value={newSOPOutput}
                  onChange={(e) => setNewSOPOutput(e.target.value)}
                  placeholder="Expected Deliverable Format"
                  className="w-full p-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSOP(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSOP}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg"
                  >
                    Save SOP
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {sops.map((sop, idx) => (
                <div
                  key={sop.id || idx}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">{sop.name}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Trigger: {sop.trigger}
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                      <span>{sop.steps?.length || 0} stages</span>
                      <span>·</span>
                      <span>Format: {sop.outputFormat}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSops(sops.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Equipped Skills Catalog */}
          <div className="pt-4 border-t border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Skill Capabilities ({skills.length} Equipped)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INITIAL_SKILL_CATALOG.map((skill) => {
                const isEquipped = skills.includes(skill.name);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleToggleSkill(skill.name)}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                      isEquipped
                        ? 'bg-indigo-950/40 border-indigo-500 text-white'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-semibold text-slate-200">{skill.name}</span>
                      <span className="block text-[11px] text-slate-400 mt-0.5 line-clamp-1">{skill.description}</span>
                    </div>
                    {isEquipped && <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Persistent Memory Bank */}
          <div className="pt-4 border-t border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-emerald-400" />
              <span>Persistent Memory Records</span>
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newMemory}
                onChange={(e) => setNewMemory(e.target.value)}
                placeholder="Add institutional knowledge note..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddMemoryItem}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Learn
              </button>
            </div>
            <div className="space-y-1.5">
              {memory.map((mem, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-slate-950/50 border border-slate-800/60 rounded-lg text-xs text-slate-300 flex items-center justify-between"
                >
                  <span>• {mem}</span>
                  <button
                    type="button"
                    onClick={() => setMemory(memory.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            {!isNew && !cube?.isLead && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Decommission ${cube?.name}?`)) {
                    deleteCube(cube!.id);
                  }
                }}
                className="px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Decommission Cube</span>
              </button>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={() => setStudioModalData(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-colors"
              >
                {isNew ? 'Spawn Digital Employee' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
