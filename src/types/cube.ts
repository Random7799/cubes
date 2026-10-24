export type CubePermission = 'owner' | 'editor' | 'viewer';

export type CubeStatus = 'idle' | 'planning' | 'executing' | 'handing_off' | 'completed';

export interface CubeSOP {
  id: string;
  name: string;
  trigger: string;
  steps: string[];
  outputFormat: string;
}

export interface CubeSkill {
  id: string;
  name: string;
  category: 'Intelligence' | 'Engineering' | 'Security' | 'Creative' | 'Management';
  description: string;
  toolsRequired: string[];
}

export interface Cube {
  id: string;
  name: string;
  role: string;
  tagline: string;
  accentColor: string;
  iconName: string;
  systemInstruction: string;
  sops: CubeSOP[];
  skills: string[];
  permissions: CubePermission;
  status: CubeStatus;
  memory: string[];
  voiceName: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr';
  isLead?: boolean;
  stats: {
    tasksCompleted: number;
    tokensGenerated: number;
    uptimeHours: number;
    uptimePercent?: number;
    completionRate?: number;
    activitySparkline?: number[];
    diagnosticStatus?: 'Nominal' | 'Active' | 'Optimal' | 'Synchronized';
  };
}

export interface HandoffPacket {
  stepNumber: number;
  taskName: string;
  fromCubeId: string;
  fromCubeName: string;
  fromCubeRole: string;
  fromCubeColor: string;
  toCubeId: string;
  toCubeName: string;
  payload: string;
  timestamp: string;
}

export interface OrchestrationStep {
  stepNumber: number;
  assignedCubeId: string;
  taskName: string;
  instruction: string;
  expectedArtifact: string;
}

export interface OrchestrationJob {
  id: string;
  prompt: string;
  timestamp: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  summary?: string;
  steps?: OrchestrationStep[];
  handoffs?: HandoffPacket[];
  finalSynthesis?: string;
}

export interface ChatMessage {
  id: string;
  cubeId: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  cubeId: string;
  cubeName: string;
  cubeColor: string;
  action: string;
  details: string;
  tokens: number;
  latencyMs: number;
}
