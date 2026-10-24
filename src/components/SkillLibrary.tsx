import React, { useState } from 'react';
import { useCubes } from '../context/CubesContext';
import { CubeSkill } from '../types/cube';
import { INITIAL_SKILL_CATALOG } from '../data/defaultCubes';
import { Sparkles, Plus, Check, Shield, Code, Search, Brain, Wrench } from 'lucide-react';

export const SkillLibrary: React.FC = () => {
  const { cubes, saveCube } = useCubes();
  const [skills, setSkills] = useState<CubeSkill[]>(INITIAL_SKILL_CATALOG);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<any>('Engineering');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [newSkillTools, setNewSkillTools] = useState('');

  const handleToggleCubeSkill = (cubeId: string, skillName: string) => {
    const cube = cubes.find((c) => c.id === cubeId);
    if (!cube) return;

    const hasSkill = cube.skills.includes(skillName);
    const updatedSkills = hasSkill
      ? cube.skills.filter((s) => s !== skillName)
      : [...cube.skills, skillName];

    saveCube({ ...cube, skills: updatedSkills }, false);
  };

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim() || !newSkillDesc.trim()) return;

    const created: CubeSkill = {
      id: `skill-custom-${Date.now()}`,
      name: newSkillName.trim(),
      category: newSkillCategory,
      description: newSkillDesc.trim(),
      toolsRequired: newSkillTools
        ? newSkillTools.split(',').map((t) => t.trim())
        : ['Custom Tooling Engine'],
    };

    setSkills([...skills, created]);
    setNewSkillName('');
    setNewSkillDesc('');
    setNewSkillTools('');
    setShowAddSkill(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Intelligence':
        return <Search className="w-4 h-4 text-cyan-400" />;
      case 'Engineering':
        return <Code className="w-4 h-4 text-indigo-400" />;
      case 'Security':
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'Management':
        return <Brain className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col p-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </span>
            <span>Skill & SOP Capability Library</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Train, improve, and equip your Cubes with modular competencies and operational playbooks.
          </p>
        </div>

        <button
          onClick={() => setShowAddSkill(!showAddSkill)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Author Custom Skill</span>
        </button>
      </div>

      {/* Author New Skill Form */}
      {showAddSkill && (
        <form
          onSubmit={handleCreateSkill}
          className="bg-[#101622] border border-indigo-500/40 rounded-2xl p-5 mb-6 shadow-xl space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="text-sm font-bold text-white">Create New Specialized Skill</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Skill Name *</label>
              <input
                type="text"
                required
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="E.g., Financial Audit & Reconciliation"
                className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Discipline Category</label>
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value as any)}
                className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              >
                <option value="Engineering">Engineering</option>
                <option value="Intelligence">Intelligence</option>
                <option value="Security">Security</option>
                <option value="Creative">Creative</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Skill Description *</label>
            <input
              type="text"
              required
              value={newSkillDesc}
              onChange={(e) => setNewSkillDesc(e.target.value)}
              placeholder="What this skill allows the Cube to analyze or produce"
              className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Required Tools (comma separated)</label>
            <input
              type="text"
              value={newSkillTools}
              onChange={(e) => setNewSkillTools(e.target.value)}
              placeholder="E.g., Ledger Parser, Invariant Validator, Tax API"
              className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddSkill(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
            >
              Save Skill
            </button>
          </div>
        </form>
      )}

      {/* Skill Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((skill) => {
          const equippedCubes = cubes.filter((c) => c.skills.includes(skill.name));
          return (
            <div
              key={skill.id}
              className="bg-[#101622] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                      {getCategoryIcon(skill.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{skill.name}</h3>
                      <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                        {skill.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-slate-400">
                    {equippedCubes.length} equipped
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {skill.description}
                </p>

                {/* Required Tools */}
                <div className="mb-4">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-1.5">
                    Attached Tooling:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {skill.toolsRequired?.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[11px] font-mono bg-slate-950 border border-slate-800 rounded text-slate-400"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Equipping Checklist by Cube */}
              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block mb-2">
                  Equip to Digital Employees:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cubes.map((cube) => {
                    const isEquipped = cube.skills.includes(skill.name);
                    return (
                      <button
                        key={cube.id}
                        onClick={() => handleToggleCubeSkill(cube.id, skill.name)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                          isEquipped
                            ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: cube.accentColor }}
                        />
                        <span>{cube.name}</span>
                        {isEquipped && <Check className="w-3 h-3 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
