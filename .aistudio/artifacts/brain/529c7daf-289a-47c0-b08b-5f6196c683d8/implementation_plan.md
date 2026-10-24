# Cubes — Interactive Multi-Agent Workspace & Digital Employee Studio

Cubes is an interactive multi-agent platform where individual professionals and creators create, configure, and orchestrate specialized AI agents ("Cubes") that act as collaborative digital employees. The platform features an isometric 3D spatial workspace, a Supervisor Lead Orchestrator for task decomposition and inter-Cube handoffs, real-time voice interactions, and a Cube Studio for training SOPs and skills.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following core design decisions were confirmed via Phase 1 clarification:
> - **Workspace Metaphor**: Spatial 3D-styled interactive grid with physical isometric cube cards with depth layers, perspective shift, and dynamic status geometry.
> - **Collaboration Architecture**: Supervisor mode where a Lead Cube acts as the central orchestrator that breaks down user objectives, delegates sub-tasks to specialized Cubes, and unifies results.
> - **Pre-Configured Workforce**: Full Creator & Tech Team ready out of the box (Lead Architect Supervisor, Deep Researcher, Systems Engineer, Brand Copywriter, and QA/Reviewer).
> - **Open Decision / Recommended Default**: Persistence will be powered by a local reactive store (indexed local state with instant JSON export/import and seed templates) backed by server-side Gemini API execution proxy (`/api/cubes/*`), allowing instant zero-friction startup with no initial DB provisioning blockers.

---

## 1. Overview & Core Concept

- **What It Does**: Cubes enables users to deploy a specialized team of autonomous digital employees in minutes. Each Cube possesses dedicated system instructions, standard operating procedures (SOPs), specialized skills, memory records, and access permissions. Users can either converse 1-on-1 with an individual Cube (via text or real-time voice) or dispatch high-level cross-functional goals through the **Supervisor Hub**, which automatically routes tasks, facilitates inter-Cube message handoffs, and delivers cohesive deliverables.
- **Target Audience / Persona**: Solopreneurs, software developers, creative directors, researchers, and project managers who need a cohesive virtual team rather than disjointed individual chat windows.
- **Key Value**: Replaces repetitive manual prompt copy-pasting with a persistent, interconnected multi-agent mesh where agents share context, follow standard operating procedures, and execute multi-stage workflows seamlessly.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **The Spatial Cube Studio (Home / Canvas)**:
   - Users view their digital employees arranged on an isometric coordinate grid with physical 3D cube card aesthetics (tilted perspective, top/face planes, subtle ambient glow, active indicator ring).
   - Quick-action controls per Cube: *Talk / Direct Chat*, *Voice Channel*, *Inspect Memory & SOPs*, *Edit Permissions* (Owner, Editor, Viewer), and *Assign Task*.
2. **One-Click Cube Spawning**:
   - Creating a new Cube is as effortless as starting a new chat: click the "+ Spawn Cube" action.
   - Configure role, avatar glyph, cube color accent, domain instructions, SOP rules, attached skills (Web Research, Code Compiler, Copy Optimizer, Logic Verifier), and memory buffer.
3. **Supervisor Orchestration Pipeline**:
   - The user submits a complex prompt to the Lead Cube (Orion).
   - Orion analyzes requirements, breaks them down into subtasks, and generates a visual execution plan.
   - The orchestration hub displays live step-by-step handoffs: Lyra (Researcher) produces facts $\rightarrow$ Vektor (Engineer) builds implementation $\rightarrow$ Cipher (QA) audits edge cases $\rightarrow$ Aura (Copywriter) polishes documentation.
   - Live inter-Cube message stream allows users to inspect exactly what data and instructions were passed between Cubes.
4. **Real-Time Voice Interface**:
   - Users can toggle the voice console with any active Cube or the Lead Supervisor.
   - Push-to-talk or continuous microphone mode with animated audio waveform, live transcription, and natural text-to-speech feedback using Gemini audio TTS / Web Speech synthesis.
5. **Observability & Activity Telemetry**:
   - Visual dashboard with task execution history, inter-agent message logs, token/runtime counts, and status indicators (`Idle`, `Planning`, `Executing`, `Handing Off`, `Completed`).

### Visual Identity & Theme
- **Aesthetic Direction**: Neo-industrial spatial computing aesthetic. Clean dark slate canvas (`#0b0f17`) with refined metallic hairline borders (`rgba(255,255,255,0.08)`), subtle isometric grid guides, and crisp chromatic accents for each agent discipline (Emerald for Architecture, Cyan for Research, Indigo for Engineering, Amber for QA, Violet for Creative).
- **Color Discipline (60-30-10)**:
  - 60% Canvas: Deep dark slate background (`#0B0F17`) with faint isometric dot-matrix grid.
  - 30% Structural Surfaces: Elevated isometric cube planes and frosted console panels (`#131B2A`, `#1A2337`).
  - 10% Accents: Purposeful role accents and state indicators (active amber glow during execution, emerald upon task completion).
- **Typography**:
  - Display & Headings: `Plus Jakarta Sans` for clean, confident titles and navigation.
  - Body Prose: `DM Sans` for high legibility at 14px–16px.
  - Telemetry & Metrics: Monospace with tabular numerals (`JetBrains Mono`, `tabular-nums`) for timestamps, token usage, and status identifiers.
- **Top Bar Contract**:
  - Left Zone: Clean brand wordmark `Cubes` with quiet label `Multi-Agent Studio`.
  - Middle Zone: 4 clean single-line navigation tabs: `Spatial Grid`, `Supervisor Hub`, `Activity & Logs`, `SOP & Skill Library`.
  - Right Zone: `+ Spawn Cube` primary action button with quick seed toggle.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Stack Gemini Server Proxy**:
  - *Chosen Approach*: Implement an Express backend (`server.ts`) running concurrently with Vite, exposing secure endpoints (`/api/cubes/orchestrate`, `/api/cubes/chat`, `/api/cubes/tts`) using `@google/genai` with `process.env.GEMINI_API_KEY`.
  - *Why*: Adheres strictly to the server-side Gemini guidelines, protects API keys, and enables real autonomous multi-agent reasoning, function calling, and structured JSON generation.
  - *Alternatives Considered*: Pure frontend mock generation (lacks real agent autonomy and reasoning depth).
- **Decision 2: Supervisor Orchestration Pattern**:
  - *Chosen Approach*: Centralized supervisor routing with distributed execution. The Lead Cube (Orion) evaluates tasks, coordinates delegation plans, invokes domain Cubes sequentially or in parallel, reviews their deliverables, and returns a unified synthesis.
  - *Why*: Prevents chaos and circular loops in multi-agent workflows, guarantees predictable deliverables, and gives users full visibility into inter-agent handoffs.
- **Decision 3: Isometric 3D CSS Card Architecture**:
  - *Chosen Approach*: Native CSS 3D transforms (`transform-style: preserve-3d`, isometric projection, interactive hover tilt, light sheen) for the spatial grid.
  - *Why*: Ultra-fast 60fps rendering, accessible DOM elements with real form inputs and text selection, zero heavy WebGL bundle overhead, and fluid responsive degradation on smaller screens.
- **Decision 4: Reactive In-Memory & Persistent Local Storage**:
  - *Chosen Approach*: Client-side reactive state engine backed by `localStorage` with exportable workspace profiles (JSON).
  - *Why*: Immediate startup with zero external database provisioning latency, persistent state across browser reloads, and painless sharing of custom Cube configurations.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CUBES CLIENT WORKSPACE                          │
│                                                                        │
│  ┌─────────────────────── Top Bar Contract ────────────────────────┐   │
│  │ Brand: Cubes  |  Spatial Grid · Supervisor · Activity · Skills  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌──────────────────────── Active Viewport ────────────────────────┐   │
│  │                                                                 │   │
│  │  [Spatial 3D Grid]       [Supervisor Hub]     [Voice Console]   │   │
│  │  ┌─────────────────┐    ┌─────────────────┐  ┌───────────────┐  │   │
│  │  │ Orion (Lead)    │    │ Goal Decomposer │  │ Waveform Vis  │  │   │
│  │  │ Lyra (Research) │    │ Task Dispatcher │  │ Mic Capture   │  │   │
│  │  │ Vektor (Code)   │    │ Inter-Cube Bus  │  │ Gemini TTS    │  │   │
│  │  │ Aura (Copy)     │    │ Synthesis View  │  │ Transcript    │  │   │
│  │  │ Cipher (QA)     │    │                 │  │               │  │   │
│  │  └─────────────────┘    └─────────────────┘  └───────────────┘  │   │
│  │                                                                 │   │
│  │  [Cube Inspector & SOP Studio]      [Activity & Telemetry Log]  │   │
│  │  - Role & Persona definition        - Live task execution trail │   │
│  │  - SOP playbooks & rules            - Hand-off message packets  │   │
│  │  - Tool/Skill assignments           - Token count & latency     │   │
│  │  - Access Control (Owner/Editor)    - Status indicators         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / Streaming API Requests
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    EXPRESS BACKEND PROXY (server.ts)                   │
│                                                                        │
│  • POST /api/cubes/orchestrate  -> Multi-step Supervisor Reasoning     │
│  • POST /api/cubes/chat         -> 1-on-1 Cube Dialog with SOP context │
│  • POST /api/cubes/tts          -> Gemini 3.8 Flash Lite TTS audio     │
│  • GET  /api/health             -> Health & telemetry verification     │
│                                                                        │
│                    Google Gen AI SDK (@google/genai)                   │
│                    Model: gemini-3.8-flash, gemini-3.8-flash-lite-tts  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & Core Entities

1. **Cube Entity**:
   - `id`: Unique identifier (e.g., `cube-orion`, `cube-lyra`).
   - `name`: Human-readable name.
   - `role`: Digital employee designation (e.g., "Lead Architect & Orchestrator").
   - `tagline`: One-line responsibility summary.
   - `accentColor`: Hex color theme (`#10B981`, `#06B6D4`, `#6366F1`, `#F59E0B`, `#8B5CF6`).
   - `icon`: Lucide icon identifier.
   - `systemInstruction`: Deep persona instructions and behavioral constraints.
   - `sops`: List of Standard Operating Procedures (trigger, workflow steps, expected output format).
   - `skills`: Enabled capabilities (`webSearch`, `codeAnalysis`, `docGeneration`, `qaVerification`).
   - `permissions`: Role-based access (`owner` | `editor` | `viewer`).
   - `status`: Current runtime state (`idle` | `planning` | `executing` | `handing_off` | `reviewing`).
   - `memory`: Array of persistent context notes and past learnings.
   - `voiceName`: Prebuilt voice profile (`Zephyr`, `Kore`, `Puck`, `Fenrir`).

2. **Orchestration Task & Handoff Packet**:
   - `id`: Workflow run ID.
   - `userGoal`: High-level prompt/objective.
   - `supervisorPlan`: Decomposed steps generated by Orion.
   - `currentStepIndex`: Integer step pointer.
   - `handoffs`: Array of message packets passed between Cubes:
     - `fromCubeId`: Originating Cube.
     - `toCubeId`: Receiving Cube.
     - `payload`: Artifact, analysis, or code block produced.
     - `timestamp`: Execution timestamp.
   - `finalSynthesis`: Consolidated summary delivered to user.
   - `status`: `pending` | `running` | `completed` | `failed`.

3. **Activity Log Entry**:
   - `id`, `timestamp`, `cubeId`, `actionType`, `summary`, `tokensUsed`, `durationMs`.

### Implementation Steps
1. **Server Setup (`server.ts`)**:
   - Configure Express server with JSON parsing and Vite integration / static file serving.
   - Implement `@google/genai` client with server-side API key and `User-Agent: 'aistudio-build'`.
   - Implement `/api/cubes/orchestrate` for Supervisor decomposition and multi-agent execution pipeline.
   - Implement `/api/cubes/chat` for direct Cube conversation respecting assigned SOPs and skills.
   - Implement `/api/cubes/tts` for speech synthesis using `gemini-3.8-flash-lite-tts` with fallback.
2. **State Store & Seed Workforce**:
   - Pre-configure the 5 digital employees: Orion (Lead), Lyra (Research), Vektor (Engineer), Aura (Copywriter), Cipher (QA).
   - Provide complete initial SOPs, skills, and memory stores.
   - Provide state hooks for Cube CRUD, permission assignment, and workflow dispatching.
3. **Spatial 3D Grid & Isometric UI**:
   - Craft the 3D isometric perspective canvas with interactive Cube cards.
   - Cards display depth bevels, active status indicators, role tags, and quick-action toolbars.
   - Include filter and search controls to toggle between all, active, or role-filtered Cubes.
4. **Supervisor Orchestration Hub & Live Pipeline**:
   - Interactive goal input where users prompt the team.
   - Live visual stage tracker displaying decomposed milestones.
   - Real-time inter-Cube message packet handoff viewer with expandable payloads.
5. **Cube Studio & SOP Customizer**:
   - Drawer/modal to inspect and edit any Cube.
   - Edit instructions, manage SOP playbooks, toggle skills, inject memory notes, and adjust Owner/Editor/Viewer access.
6. **Voice Interface & Audio Visualizer**:
   - Real-time speech input (Web Speech API) with animated audio visualizer.
   - Auto-playback of Cube responses using Gemini TTS audio streams.
7. **Activity Telemetry Dashboard**:
   - Execution timeline, task history, token counts, and export/import functionality.
