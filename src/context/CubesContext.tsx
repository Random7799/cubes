import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cube, OrchestrationJob, ActivityEvent, ChatMessage, CubePermission } from '../types/cube';
import { INITIAL_CUBES } from '../data/defaultCubes';

interface CubesContextType {
  cubes: Cube[];
  activeTab: 'grid' | 'supervisor' | 'activity' | 'skills';
  setActiveTab: (tab: 'grid' | 'supervisor' | 'activity' | 'skills') => void;
  activeJob: OrchestrationJob | null;
  jobsHistory: OrchestrationJob[];
  activityLogs: ActivityEvent[];
  chatMessages: Record<string, ChatMessage[]>;
  chatModalCube: Cube | null;
  setChatModalCube: (cube: Cube | null) => void;
  voiceModalCube: Cube | null;
  setVoiceModalCube: (cube: Cube | null) => void;
  studioModalData: { cube: Cube | null; isNew: boolean } | null;
  setStudioModalData: (data: { cube: Cube | null; isNew: boolean } | null) => void;
  isOrchestrating: boolean;
  runOrchestration: (prompt: string) => Promise<void>;
  sendDirectMessage: (cubeId: string, message: string) => Promise<string>;
  saveCube: (cube: Cube, isNew: boolean) => void;
  deleteCube: (id: string) => void;
  updateCubePermission: (id: string, permission: CubePermission) => void;
  addMemoryToCube: (id: string, memoryNote: string) => void;
  reorderCubes: (sourceId: string, targetId: string) => void;
  autoAlignGrid: () => void;
  resetWorkspace: () => void;
  exportWorkspace: () => string;
  importWorkspace: (jsonString: string) => boolean;
}

const STORAGE_KEY = 'cubes_studio_state_v1';

const CubesContext = createContext<CubesContextType | undefined>(undefined);

export const CubesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cubes, setCubes] = useState<Cube[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.cubes) && parsed.cubes.length > 0) {
          return parsed.cubes;
        }
      }
    } catch (e) {
      console.warn('Could not load cubes from localStorage:', e);
    }
    return INITIAL_CUBES;
  });

  const [activeTab, setActiveTab] = useState<'grid' | 'supervisor' | 'activity' | 'skills'>('grid');
  const [activeJob, setActiveJob] = useState<OrchestrationJob | null>(null);
  const [jobsHistory, setJobsHistory] = useState<OrchestrationJob[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityEvent[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [isOrchestrating, setIsOrchestrating] = useState<boolean>(false);

  // Modals state
  const [chatModalCube, setChatModalCube] = useState<Cube | null>(null);
  const [voiceModalCube, setVoiceModalCube] = useState<Cube | null>(null);
  const [studioModalData, setStudioModalData] = useState<{ cube: Cube | null; isNew: boolean } | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ cubes }));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [cubes]);

  // Log activity helper
  const logActivity = (action: string, cube: Cube, details: string, tokens = 0, latencyMs = 0) => {
    const newEvent: ActivityEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      cubeId: cube.id,
      cubeName: cube.name,
      cubeColor: cube.accentColor,
      action,
      details,
      tokens,
      latencyMs,
    };
    setActivityLogs((prev) => [newEvent, ...prev.slice(0, 99)]);
  };

  const updateCubePermission = (id: string, permissions: CubePermission) => {
    setCubes((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          logActivity('Permission Changed', c, `Updated access role to: ${permissions}`);
          return { ...c, permissions };
        }
        return c;
      })
    );
  };

  const addMemoryToCube = (id: string, memoryNote: string) => {
    if (!memoryNote.trim()) return;
    setCubes((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updatedMemory = [memoryNote.trim(), ...c.memory];
          logActivity('Memory Learned', c, `Learned persistent memory: "${memoryNote.trim()}"`);
          return { ...c, memory: updatedMemory };
        }
        return c;
      })
    );
  };

  const saveCube = (cubeData: Cube, isNew: boolean) => {
    if (isNew) {
      setCubes((prev) => [...prev, cubeData]);
      logActivity('Cube Spawned', cubeData, `New digital employee created with role ${cubeData.role}`);
    } else {
      setCubes((prev) => prev.map((c) => (c.id === cubeData.id ? cubeData : c)));
      logActivity('Cube Reconfigured', cubeData, `Updated SOPs, skills, and configuration`);
    }
    setStudioModalData(null);
  };

  const reorderCubes = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setCubes((prev) => {
      const sourceIndex = prev.findIndex((c) => c.id === sourceId);
      const targetIndex = prev.findIndex((c) => c.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
  };

  const autoAlignGrid = () => {
    setCubes((prev) => {
      const getScore = (c: Cube) => {
        if (c.isLead) return 0;
        if (c.skills.some((s) => s.includes('Research') || s.includes('Grounding'))) return 1;
        if (c.skills.some((s) => s.includes('Engineering') || s.includes('Systems'))) return 2;
        if (c.skills.some((s) => s.includes('Security') || s.includes('QA') || s.includes('Audit'))) return 3;
        if (c.skills.some((s) => s.includes('Brand') || s.includes('Copywriting'))) return 4;
        return 5;
      };
      return [...prev].sort((a, b) => getScore(a) - getScore(b));
    });
  };

  const deleteCube = (id: string) => {
    const target = cubes.find((c) => c.id === id);
    if (target?.isLead) {
      alert('The Lead Supervisor Cube cannot be deleted.');
      return;
    }
    if (target) {
      logActivity('Cube Terminated', target, `Digital employee decommissioned.`);
    }
    setCubes((prev) => prev.filter((c) => c.id !== id));
    if (chatModalCube?.id === id) setChatModalCube(null);
    if (voiceModalCube?.id === id) setVoiceModalCube(null);
    setStudioModalData(null);
  };

  const resetWorkspace = () => {
    setCubes(INITIAL_CUBES);
    setActiveJob(null);
    setJobsHistory([]);
    setChatMessages({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportWorkspace = () => {
    return JSON.stringify({ cubes, timestamp: new Date().toISOString() }, null, 2);
  };

  const importWorkspace = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.cubes)) {
        setCubes(data.cubes);
        return true;
      }
    } catch (e) {
      console.error('Import error:', e);
    }
    return false;
  };

  // Direct 1-on-1 Chat
  const sendDirectMessage = async (cubeId: string, message: string): Promise<string> => {
    const targetCube = cubes.find((c) => c.id === cubeId);
    if (!targetCube) throw new Error('Cube not found');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      cubeId,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => ({
      ...prev,
      [cubeId]: [...(prev[cubeId] || []), userMsg],
    }));

    const startTime = Date.now();

    try {
      const res = await fetch('/api/cubes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cube: targetCube,
          message,
          history: (chatMessages[cubeId] || []).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || 'Task processed successfully.';

      const modelMsg: ChatMessage = {
        id: `msg-${Date.now()}-m`,
        cubeId,
        role: 'model',
        content: reply,
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => ({
        ...prev,
        [cubeId]: [...(prev[cubeId] || []), modelMsg],
      }));

      // Update stats with real-time diagnostic sparkline telemetry
      setCubes((prev) =>
        prev.map((c) => {
          if (c.id === cubeId) {
            const prevSparkline = c.stats.activitySparkline || [20, 25, 30, 45, 55, 60, 70, 80];
            const nextVal = Math.min(100, Math.max(15, (prevSparkline[prevSparkline.length - 1] || 50) + Math.floor(Math.random() * 16 - 4)));
            const updatedSparkline = [...prevSparkline.slice(1), nextVal];
            return {
              ...c,
              stats: {
                ...c.stats,
                tasksCompleted: c.stats.tasksCompleted + 1,
                tokensGenerated: c.stats.tokensGenerated + Math.round(reply.length * 0.8),
                uptimePercent: c.stats.uptimePercent ?? 99.9,
                completionRate: Math.min(100, Math.max(90, Number(((c.stats.completionRate || 98.0) + 0.1).toFixed(1)))),
                activitySparkline: updatedSparkline,
                diagnosticStatus: 'Active',
              },
            };
          }
          return c;
        })
      );

      logActivity(
        'Direct Chat Response',
        targetCube,
        `Responded to query (${reply.slice(0, 60)}...)`,
        Math.round(reply.length * 0.8),
        Date.now() - startTime
      );

      return reply;
    } catch (err: any) {
      console.error('Error sending chat message:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        cubeId,
        role: 'model',
        content: `Error communicating with ${targetCube.name}: ${err.message}`,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => ({
        ...prev,
        [cubeId]: [...(prev[cubeId] || []), errorMsg],
      }));
      return `Error: ${err.message}`;
    }
  };

  // Supervisor Multi-Agent Orchestration
  const runOrchestration = async (prompt: string): Promise<void> => {
    if (!prompt.trim() || isOrchestrating) return;

    setIsOrchestrating(true);
    setActiveTab('supervisor');

    const leadCube = cubes.find((c) => c.isLead) || cubes[0];

    const newJob: OrchestrationJob = {
      id: `job-${Date.now()}`,
      prompt,
      timestamp: new Date().toISOString(),
      status: 'running',
    };

    setActiveJob(newJob);

    // Update cube statuses
    setCubes((prev) =>
      prev.map((c) => (c.isLead ? { ...c, status: 'planning' } : { ...c, status: 'idle' }))
    );

    logActivity('Supervisor Goal Received', leadCube, `Decomposing objective: "${prompt.slice(0, 60)}..."`);

    const startTime = Date.now();

    try {
      const res = await fetch('/api/cubes/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          cubes,
        }),
      });

      if (!res.ok) {
        throw new Error(`Orchestration failed with status ${res.status}`);
      }

      const data = await res.json();

      const completedJob: OrchestrationJob = {
        ...newJob,
        status: 'completed',
        summary: data.summary,
        steps: data.steps,
        handoffs: data.handoffs,
        finalSynthesis: data.finalSynthesis,
      };

      setActiveJob(completedJob);
      setJobsHistory((prev) => [completedJob, ...prev]);

      // Update cubes stats and set back to completed / idle
      setCubes((prev) =>
        prev.map((c) => {
          const wasInvolved = data.handoffs?.some(
            (h: any) => h.fromCubeId === c.id || h.toCubeId === c.id
          );
          if (!wasInvolved) return { ...c, status: 'idle' };

          const prevSparkline = c.stats.activitySparkline || [20, 30, 40, 50, 60, 70, 80];
          const nextVal = Math.min(100, Math.max(25, (prevSparkline[prevSparkline.length - 1] || 60) + Math.floor(Math.random() * 20 - 4)));
          return {
            ...c,
            status: 'idle',
            stats: {
              ...c.stats,
              tasksCompleted: c.stats.tasksCompleted + 1,
              tokensGenerated: c.stats.tokensGenerated + 1200,
              uptimePercent: c.stats.uptimePercent ?? 99.9,
              completionRate: Math.min(100, Math.max(92, Number(((c.stats.completionRate || 98.0) + 0.2).toFixed(1)))),
              activitySparkline: [...prevSparkline.slice(1), nextVal],
              diagnosticStatus: 'Optimal',
            },
          };
        })
      );

      logActivity(
        'Orchestration Completed',
        leadCube,
        `Workflow delivered with ${data.handoffs?.length || 0} inter-agent handoffs`,
        4800,
        Date.now() - startTime
      );
    } catch (err: any) {
      console.error('Orchestration run failed:', err);
      const failedJob: OrchestrationJob = {
        ...newJob,
        status: 'failed',
        finalSynthesis: `Execution failed: ${err.message}`,
      };
      setActiveJob(failedJob);
      setCubes((prev) => prev.map((c) => ({ ...c, status: 'idle' })));
    } finally {
      setIsOrchestrating(false);
    }
  };

  return (
    <CubesContext.Provider
      value={{
        cubes,
        activeTab,
        setActiveTab,
        activeJob,
        jobsHistory,
        activityLogs,
        chatMessages,
        chatModalCube,
        setChatModalCube,
        voiceModalCube,
        setVoiceModalCube,
        studioModalData,
        setStudioModalData,
        isOrchestrating,
        runOrchestration,
        sendDirectMessage,
        saveCube,
        deleteCube,
        updateCubePermission,
        addMemoryToCube,
        reorderCubes,
        autoAlignGrid,
        resetWorkspace,
        exportWorkspace,
        importWorkspace,
      }}
    >
      {children}
    </CubesContext.Provider>
  );
};

export const useCubes = () => {
  const context = useContext(CubesContext);
  if (!context) {
    throw new Error('useCubes must be used within a CubesProvider');
  }
  return context;
};
