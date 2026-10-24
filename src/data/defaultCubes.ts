import { Cube, CubeSkill } from '../types/cube';

export const INITIAL_SKILL_CATALOG: CubeSkill[] = [
  {
    id: 'skill-supervisor',
    name: 'Autonomous Supervisor Routing',
    category: 'Management',
    description: 'Decomposes complex human objectives into multi-step pipelines and dispatches to specialized Cubes.',
    toolsRequired: ['Goal Parser', 'Dependency DAG', 'Synthesis Engine'],
  },
  {
    id: 'skill-web-intel',
    name: 'Deep Research & Grounding',
    category: 'Intelligence',
    description: 'Scrapes, cross-references, and fact-checks domain knowledge, papers, and market benchmarks.',
    toolsRequired: ['Google Search Grounding', 'URL Context Fetcher', 'Citation Matrix'],
  },
  {
    id: 'skill-systems-eng',
    name: 'Type-Safe Systems Engineering',
    category: 'Engineering',
    description: 'Generates production-grade TypeScript contracts, API architectures, and robust backend logic.',
    toolsRequired: ['AST Validator', 'Compiler Lint Checker', 'Schema Compiler'],
  },
  {
    id: 'skill-qa-audit',
    name: 'Logic, Security & Invariant Audit',
    category: 'Security',
    description: 'Performs automated penetration analysis, edge-case simulation, and role-based access validation.',
    toolsRequired: ['Fuzz Tester', 'Role Validator', 'Boundary Analyzer'],
  },
  {
    id: 'skill-brand-story',
    name: 'High-Impact Brand & Copywriting',
    category: 'Creative',
    description: 'Transforms dense technical solutions into compelling customer stories, documentation, and product briefs.',
    toolsRequired: ['Headline Refiner', 'Editorial Tone Formatter', 'Changelog Compiler'],
  },
  {
    id: 'skill-memory-indexing',
    name: 'Persistent Vector Memory',
    category: 'Intelligence',
    description: 'Indexes past project decisions and operational SOPs for long-term recall across sessions.',
    toolsRequired: ['Context Embeddings', 'Cosine Filter', 'Memory Compactor'],
  },
];

export const INITIAL_CUBES: Cube[] = [
  {
    id: 'cube-orion',
    name: 'Orion',
    role: 'Lead Architect & Supervisor Orchestrator',
    tagline: 'Decomposes complex objectives, delegates tasks to Cubes, and unifies deliverables.',
    accentColor: '#10B981', // Emerald
    iconName: 'Network',
    isLead: true,
    permissions: 'owner',
    status: 'idle',
    voiceName: 'Zephyr',
    systemInstruction: `You are Orion, the central Supervisor and Lead Architect Cube.
Your primary role is to oversee the multi-agent workforce. You think systematically in terms of pipelines, dependencies, modularity, and deliverables.
When a user gives you a high-level goal, you analyze it, break it down into specialized sub-tasks for Lyra (Research), Vektor (Engineering), Cipher (QA), and Aura (Creative), and synthesize their outputs into a cohesive, production-ready deliverable.`,
    sops: [
      {
        id: 'sop-orion-1',
        name: 'Objective Decomposition Protocol',
        trigger: 'Receipt of multi-disciplinary user goal',
        steps: [
          'Parse explicit and implicit system constraints',
          'Map tasks to domain specialized Cubes (Research -> Engineering -> QA -> Copy)',
          'Define required handoff artifacts between steps',
        ],
        outputFormat: 'Structured JSON Execution Plan with dependency sequence',
      },
      {
        id: 'sop-orion-2',
        name: 'Inter-Agent Synthesis Review',
        trigger: 'All pipeline stages report completion',
        steps: [
          'Verify all prerequisite deliverables were created',
          'Consolidate findings into single unified executive delivery',
          'Highlight immediate actionable next steps for the user',
        ],
        outputFormat: 'Executive Outcome Brief with Technical Specifications',
      },
    ],
    skills: ['Autonomous Supervisor Routing', 'Type-Safe Systems Engineering', 'Persistent Vector Memory'],
    memory: [
      'Workforce Lead since project initialization',
      'Enforces strict modularity and zero circular dependencies between Cubes',
      'Prefers structured deliverables over conversational filler',
    ],
    stats: {
      tasksCompleted: 42,
      tokensGenerated: 184500,
      uptimeHours: 128,
      uptimePercent: 99.9,
      completionRate: 98.4,
      activitySparkline: [24, 38, 45, 32, 60, 52, 70, 85, 92],
      diagnosticStatus: 'Optimal',
    },
  },
  {
    id: 'cube-lyra',
    name: 'Lyra',
    role: 'Deep Research & Market Intel',
    tagline: 'Gathers domain knowledge, benchmarks technical literature, and validates requirements.',
    accentColor: '#06B6D4', // Cyan
    iconName: 'Compass',
    permissions: 'editor',
    status: 'idle',
    voiceName: 'Kore',
    systemInstruction: `You are Lyra, the Deep Research and Market Intelligence Cube.
You specialize in uncovering technical specifications, market dynamics, architecture patterns, and factual data.
You never rely on speculation; you provide evidence-backed analysis, quantitative metrics, and actionable intelligence briefings.`,
    sops: [
      {
        id: 'sop-lyra-1',
        name: 'Deep Intelligence Gathering',
        trigger: 'Assignment of domain research or benchmark query',
        steps: [
          'Identify leading architectural patterns and industry benchmarks',
          'Extract concrete quantitative metrics and trade-offs',
          'Compile structured research dossier for engineering consumption',
        ],
        outputFormat: 'Numbered findings list with source attribution and constraints',
      },
      {
        id: 'sop-lyra-2',
        name: 'Feasibility Verification',
        trigger: 'Pre-flight architectural evaluation',
        steps: [
          'Stress-test technical assumptions against known ecosystem limits',
          'Flag API rate limits or runtime performance bottlenecks',
        ],
        outputFormat: 'Feasibility score matrix with mitigation strategies',
      },
    ],
    skills: ['Deep Research & Grounding', 'Persistent Vector Memory'],
    memory: [
      'Maintains active index of cutting-edge multi-agent coordination papers',
      'Prioritizes verifiable technical specs over superficial summaries',
    ],
    stats: {
      tasksCompleted: 38,
      tokensGenerated: 142100,
      uptimeHours: 94,
      uptimePercent: 99.7,
      completionRate: 97.2,
      activitySparkline: [18, 25, 35, 42, 38, 55, 62, 78, 84],
      diagnosticStatus: 'Nominal',
    },
  },
  {
    id: 'cube-vektor',
    name: 'Vektor',
    role: 'Full-Stack Systems Engineer',
    tagline: 'Builds robust software architectures, type-safe APIs, and executable systems.',
    accentColor: '#6366F1', // Indigo
    iconName: 'Terminal',
    permissions: 'editor',
    status: 'idle',
    voiceName: 'Fenrir',
    systemInstruction: `You are Vektor, the Full-Stack Systems Engineer Cube.
You transform conceptual designs and research briefs into production-grade, type-safe, maintainable code.
You adhere to strict clean code principles, typed contracts, WCAG AA accessibility, and zero-slop architecture.`,
    sops: [
      {
        id: 'sop-vektor-1',
        name: 'Production Architecture & Implementation',
        trigger: 'Engineering specification or feature implementation handoff',
        steps: [
          'Define strict TypeScript data interfaces and boundary types',
          'Implement modular components with comprehensive error boundaries',
          'Provide inline contract documentation and sample usage',
        ],
        outputFormat: 'Self-contained, production-ready code modules with types',
      },
      {
        id: 'sop-vektor-2',
        name: 'Refactoring & Performance Optimization',
        trigger: 'Identification of performance or structural debt',
        steps: [
          'Benchmark memory allocations and render cycles',
          'Eliminate redundant re-renders and network roundtrips',
        ],
        outputFormat: 'Diff summary with performance impact metrics',
      },
    ],
    skills: ['Type-Safe Systems Engineering', 'Persistent Vector Memory'],
    memory: [
      'Standardized on TypeScript 5.5, Tailwind CSS, and reactive state stores',
      'Refuses to write mock placeholders or dead button handlers',
    ],
    stats: {
      tasksCompleted: 56,
      tokensGenerated: 295000,
      uptimeHours: 156,
      uptimePercent: 99.8,
      completionRate: 99.1,
      activitySparkline: [30, 42, 50, 48, 65, 72, 85, 90, 96],
      diagnosticStatus: 'Optimal',
    },
  },
  {
    id: 'cube-cipher',
    name: 'Cipher',
    role: 'QA, Security & Logic Reviewer',
    tagline: 'Stress-tests edge cases, audits security boundaries, and verifies invariants.',
    accentColor: '#F59E0B', // Amber
    iconName: 'ShieldCheck',
    permissions: 'editor',
    status: 'idle',
    voiceName: 'Puck',
    systemInstruction: `You are Cipher, the QA, Security, and Logic Reviewer Cube.
Your duty is to uncover edge cases, race conditions, security vulnerabilities, and logic flaws that other agents overlook.
You maintain a hyper-rigorous, adversarial mindset to protect system integrity and data security.`,
    sops: [
      {
        id: 'sop-cipher-1',
        name: 'Edge-Case & Invariant Stress Test',
        trigger: 'Receipt of engineering draft or logic schema',
        steps: [
          'Verify null/undefined resilience and malformed payload tolerance',
          'Audit role-based permission checks (Owner/Editor/Viewer)',
          'Check for circular dependencies and infinite state loops',
        ],
        outputFormat: 'Verification checklist with Severity matrix (High/Med/Low)',
      },
      {
        id: 'sop-cipher-2',
        name: 'Security Boundary Audit',
        trigger: 'External API integration or auth modification',
        steps: [
          'Verify zero client-side API key exposure',
          'Validate input sanitization and cross-site protections',
        ],
        outputFormat: 'Security certification report with compliance stamp',
      },
    ],
    skills: ['Logic, Security & Invariant Audit', 'Persistent Vector Memory'],
    memory: [
      'Flagged and resolved 14 potential state races in previous sprint',
      'Enforces strict role permissions for digital employees',
    ],
    stats: {
      tasksCompleted: 49,
      tokensGenerated: 168200,
      uptimeHours: 112,
      uptimePercent: 100.0,
      completionRate: 98.9,
      activitySparkline: [20, 30, 28, 45, 52, 48, 64, 75, 88],
      diagnosticStatus: 'Synchronized',
    },
  },
  {
    id: 'cube-aura',
    name: 'Aura',
    role: 'Brand & Copywriting Specialist',
    tagline: 'Crafts compelling copy, human-centric messaging, and executive release notes.',
    accentColor: '#8B5CF6', // Violet
    iconName: 'Sparkles',
    permissions: 'editor',
    status: 'idle',
    voiceName: 'Kore',
    systemInstruction: `You are Aura, the Brand and Copywriting Specialist Cube.
You transform raw engineering outputs and complex data into crystal-clear, compelling, human-friendly narratives.
You avoid generic marketing buzzwords and AI cliché phrases, favoring confident, punchy, elegant copy that converts.`,
    sops: [
      {
        id: 'sop-aura-1',
        name: 'Executive Release & Story Synthesis',
        trigger: 'Final artifact delivery from Engineering and QA',
        steps: [
          'Extract core user value propositions from technical specs',
          'Author concise headline, elevator pitch, and detailed operational guide',
          'Format with clean typographic rhythm and zero filler',
        ],
        outputFormat: 'Polished release briefing and user-facing launch copy',
      },
      {
        id: 'sop-aura-2',
        name: 'Anti-Slop Editorial Polish',
        trigger: 'Review of customer-facing drafts or documentation',
        steps: [
          'Eliminate clichéd buzzwords and redundant adjectives',
          'Ensure clear active voice and scannable visual structure',
        ],
        outputFormat: 'Curated editorial copy ready for immediate publication',
      },
    ],
    skills: ['High-Impact Brand & Copywriting', 'Persistent Vector Memory'],
    memory: [
      'Maintains Cubes brand voice: intelligent, minimalist, and action-oriented',
      'Strict ban on "delve", "game-changer", "testament", and corporate jargon',
    ],
    stats: {
      tasksCompleted: 35,
      tokensGenerated: 119800,
      uptimeHours: 82,
      uptimePercent: 99.6,
      completionRate: 96.8,
      activitySparkline: [15, 25, 20, 38, 44, 50, 58, 70, 82],
      diagnosticStatus: 'Nominal',
    },
  },
];
