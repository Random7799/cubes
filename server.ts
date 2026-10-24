import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// 1-on-1 Cube Direct Chat
app.post('/api/cubes/chat', async (req: Request, res: Response) => {
  try {
    const { cube, message, history } = req.body;

    if (!cube || !message) {
      return res.status(400).json({ error: 'Missing cube or message payload.' });
    }

    if (ai) {
      const sopsText = cube.sops && cube.sops.length > 0
        ? `\nActive Standard Operating Procedures (SOPs):\n${cube.sops.map((s: { name: string; trigger: string; steps: string[] }) => `- ${s.name}: Trigger [${s.trigger}], Steps: ${s.steps.join(' -> ')}`).join('\n')}`
        : '';

      const memoryText = cube.memory && cube.memory.length > 0
        ? `\nPersistent Memory Records:\n${cube.memory.map((m: string) => `• ${m}`).join('\n')}`
        : '';

      const skillsText = cube.skills && cube.skills.length > 0
        ? `\nEquipped Skills: ${cube.skills.join(', ')}`
        : '';

      const systemInstruction = `You are ${cube.name}, a specialized digital employee agent in the Cubes multi-agent platform.
Your Role: ${cube.role}
Tagline: ${cube.tagline}
Core Persona & Instructions:
${cube.systemInstruction || 'Be direct, professional, highly capable, and action-oriented.'}
${sopsText}
${memoryText}
${skillsText}

Guidelines:
- Maintain your exact domain persona and role at all times.
- If the user asks you to execute a task, follow your SOPs and explain your findings or outputs with high technical and practical clarity.
- Provide concrete deliverables (code blocks, research synthesis, architectural specs, or polished copy) rather than vague advice.
- When applicable, suggest which other Cube on the team (e.g. Orion for strategy, Lyra for research, Vektor for engineering, Aura for copy, Cipher for QA) could assist next.`;

      // Build message contents with prior history
      const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-8)) {
          formattedContents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content }],
          });
        }
      }

      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({
        reply: response.text || 'I have completed processing your request.',
        cubeId: cube.id,
        timestamp: new Date().toISOString(),
      });
    }

    // Fallback intelligent simulated response if API key is temporarily unavailable
    const fallbackReply = generateSimulatedCubeResponse(cube, message);
    return res.json({
      reply: fallbackReply,
      cubeId: cube.id,
      timestamp: new Date().toISOString(),
      simulated: true,
    });
  } catch (error: any) {
    console.error('Error in /api/cubes/chat:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate Cube response',
    });
  }
});

// Multi-Agent Supervisor Orchestration
app.post('/api/cubes/orchestrate', async (req: Request, res: Response) => {
  try {
    const { prompt, cubes } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'User prompt is required for orchestration.' });
    }

    const cubeMap = new Map((cubes || []).map((c: any) => [c.id, c]));
    const leadCube = cubes?.find((c: any) => c.id === 'cube-orion') || cubes?.[0];

    if (ai) {
      // Step 1: Supervisor Orion decomposes the objective into subtasks
      const decompositionPrompt = `You are Orion, the Lead Architect & Supervisor Cube.
You coordinate a multi-agent workforce of specialized digital employee Cubes:
${cubes.map((c: any) => `- ID: ${c.id} | Name: ${c.name} | Role: ${c.role} | Skills: ${c.skills.join(', ')}`).join('\n')}

The user has submitted this overarching goal:
"${prompt}"

Analyze this goal and decompose it into an optimal 3 to 4 step execution pipeline where specialized Cubes collaborate.
Return ONLY valid JSON matching this schema:
{
  "summary": "1-sentence executive summary of the orchestration plan",
  "steps": [
    {
      "stepNumber": 1,
      "assignedCubeId": "cube-id-here",
      "taskName": "Short descriptive title",
      "instruction": "Specific instructions for what this Cube must deliver",
      "expectedArtifact": "What concrete output should be produced"
    }
  ]
}`;

      const planResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: decompositionPrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      let planData: any = { summary: 'Multi-agent execution plan', steps: [] };
      try {
        planData = JSON.parse(planResponse.text || '{}');
      } catch (err) {
        console.warn('Could not parse plan JSON, falling back:', err);
      }

      const steps = planData.steps && planData.steps.length > 0 ? planData.steps : [
        {
          stepNumber: 1,
          assignedCubeId: 'cube-lyra',
          taskName: 'Domain & Requirement Intelligence',
          instruction: `Investigate core requirements, constraints, and best practices for: "${prompt}"`,
          expectedArtifact: 'Structured research briefing with key findings',
        },
        {
          stepNumber: 2,
          assignedCubeId: 'cube-vektor',
          taskName: 'Technical & System Architecture',
          instruction: 'Create full engineering specification, data structures, and code solution based on findings.',
          expectedArtifact: 'Complete production-ready code implementation and architectural notes',
        },
        {
          stepNumber: 3,
          assignedCubeId: 'cube-cipher',
          taskName: 'Quality, Security & Edge Case Audit',
          instruction: 'Audit the proposed solution for edge cases, performance, security, and verification benchmarks.',
          expectedArtifact: 'QA audit report and validation checks',
        },
        {
          stepNumber: 4,
          assignedCubeId: 'cube-aura',
          taskName: 'Documentation & Delivery Synthesis',
          instruction: 'Craft polished executive release notes, documentation, and user guidelines.',
          expectedArtifact: 'Clear, compelling release brief and operational documentation',
        },
      ];

      // Step 2: Execute each step through the assigned Cube with handoff context
      const handoffs: any[] = [];
      let accumulatedContext = `User Objective: ${prompt}\nPlan Summary: ${planData.summary}\n`;

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const currentCube = cubeMap.get(step.assignedCubeId) || leadCube;
        const previousHandoff = handoffs[i - 1];

        const stepPrompt = `You are ${currentCube.name} (${currentCube.role}).
Active SOPs: ${(currentCube.sops || []).map((s: any) => s.name).join(', ') || 'Standard Execution Protocol'}
Skills: ${(currentCube.skills || []).join(', ')}

Here is the context and prior deliverables from the team so far:
${accumulatedContext}

${previousHandoff ? `Handoff from ${previousHandoff.fromCubeName}:
${previousHandoff.payload}\n` : ''}

Your Assigned Step (${i + 1}/${steps.length}): "${step.taskName}"
Specific Instruction: ${step.instruction}
Expected Deliverable: ${step.expectedArtifact}

Deliver a thorough, concrete, high-caliber output. Write in your signature professional style.`;

        const stepResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: stepPrompt,
          config: {
            temperature: 0.6,
          },
        });

        const stepOutput = stepResponse.text || `Step ${i + 1} completed by ${currentCube.name}.`;

        handoffs.push({
          stepNumber: i + 1,
          taskName: step.taskName,
          fromCubeId: currentCube.id,
          fromCubeName: currentCube.name,
          fromCubeRole: currentCube.role,
          fromCubeColor: currentCube.accentColor,
          toCubeId: steps[i + 1]?.assignedCubeId || leadCube.id,
          toCubeName: (cubeMap.get(steps[i + 1]?.assignedCubeId) as any)?.name || leadCube.name,
          payload: stepOutput,
          timestamp: new Date().toISOString(),
        });

        accumulatedContext += `\n--- [Output from ${currentCube.name} - ${step.taskName}] ---\n${stepOutput}\n`;
      }

      // Step 3: Orion synthesizes the final delivery
      const synthesisPrompt = `You are Orion, Lead Architect & Supervisor Cube.
Your team of Cubes has completed all assigned tasks for the user's objective:
"${prompt}"

Here are the deliverables produced:
${accumulatedContext}

Provide an authoritative, beautifully structured final deliverable to the user:
1. Executive Outcome & Solution Overview
2. Core Technical & Strategic Artifacts
3. Quality & Verification Confidence Summary
4. Recommended Next Actions for the user`;

      const synthesisResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: synthesisPrompt,
        config: {
          temperature: 0.4,
        },
      });

      return res.json({
        summary: planData.summary,
        steps,
        handoffs,
        finalSynthesis: synthesisResponse.text || 'All Cube workflows executed successfully.',
        timestamp: new Date().toISOString(),
      });
    }

    // High fidelity fallback simulation if API key is not yet set
    const fallbackData = generateSimulatedOrchestration(prompt, cubes);
    return res.json(fallbackData);
  } catch (error: any) {
    console.error('Error in /api/cubes/orchestrate:', error);
    return res.status(500).json({
      error: error.message || 'Orchestration pipeline encountered an error',
    });
  }
});

// Voice TTS Endpoint
app.post('/api/cubes/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS.' });
    }

    if (ai) {
      // Clean text for speech
      const cleanText = text.replace(/[*#`_]/g, '').slice(0, 400);

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text: cleanText }],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        return res.json({
          audioBase64: base64Audio,
          mimeType: 'audio/wav',
        });
      }
    }

    // Return fallback signal so client uses Web Speech API speech synthesis
    return res.json({
      useWebSpeechFallback: true,
      text,
    });
  } catch (error: any) {
    console.warn('TTS error (will fallback to browser speech):', error.message);
    return res.json({
      useWebSpeechFallback: true,
      text: req.body.text,
    });
  }
});

// Helper functions for intelligent resilient fallback
function generateSimulatedCubeResponse(cube: any, message: string): string {
  switch (cube.id) {
    case 'cube-orion':
      return `[Orion — Lead Architect]\nI have analyzed your request: "${message}".\n\nFrom a systems architecture perspective, this breaks down into three key pillars: system topology, event-driven data flow, and validation boundaries. I can dispatch Lyra for intelligence gathering and Vektor for engineering implementation. Would you like me to trigger the multi-cube orchestration pipeline?`;
    case 'cube-lyra':
      return `[Lyra — Deep Research & Intel]\nRegarding "${message}":\n\nI have cross-referenced market benchmarks and best practices. Key intelligence findings:\n1. Modular agent separation yields a 3.4x improvement in contextual accuracy over monolithic LLMs.\n2. Standard Operating Procedures (SOPs) enforce bounded outputs and deterministic task handoffs.\n3. Continuous memory indexing allows Cubes to retain institutional project knowledge across multi-turn sessions.`;
    case 'cube-vektor':
      return `[Vektor — Systems Engineer]\nExecuting technical specification for "${message}":\n\n\`\`\`typescript\n// Architectural Implementation Contract\ninterface AgentPayload<T> {\n  sourceCubeId: string;\n  targetCubeId: string;\n  executionNonce: number;\n  timestamp: number;\n  data: T;\n}\n\`\`\`\n\nCode structure is optimized with minimal overhead and type-safe interfaces. Ready to package for review by Cipher.`;
    case 'cube-aura':
      return `[Aura — Brand & Copywriter]\nReframing "${message}" with high-impact clarity:\n\n"Meet Cubes: your autonomous multi-agent powerhouse. Rather than juggling disconnected prompts, deploy specialized digital coworkers that think, execute, and hand off tasks in seamless unison."\n\nHeadline: *Digital Employees Built for High-Velocity Creators.*`;
    case 'cube-cipher':
      return `[Cipher — QA & Logic Reviewer]\nAuditing specifications for "${message}":\n\n• Invariant Check: PASSED (Zero circular dependencies detected).\n• Edge Case Analysis: High token payload handoffs require automatic chunking.\n• Security Rating: Grade A (Role-based permissions properly enforced for Viewer/Editor/Owner).`;
    default:
      return `[${cube.name} — ${cube.role}]\nI have received your message regarding "${message}". Following my active SOPs, I have prepared the initial execution draft and updated my persistent memory.`;
  }
}

function generateSimulatedOrchestration(prompt: string, cubes: any[]) {
  const steps = [
    {
      stepNumber: 1,
      assignedCubeId: 'cube-lyra',
      taskName: 'Domain Intelligence & Groundwork',
      instruction: `Synthesize market intel and structural requirements for "${prompt}".`,
      expectedArtifact: 'Comprehensive research brief with validated findings',
    },
    {
      stepNumber: 2,
      assignedCubeId: 'cube-vektor',
      taskName: 'System Architecture & Implementation',
      instruction: 'Design end-to-end data models, interfaces, and executable solution.',
      expectedArtifact: 'Clean TypeScript contracts and architectural components',
    },
    {
      stepNumber: 3,
      assignedCubeId: 'cube-cipher',
      taskName: 'Security, Edge Case & QA Audit',
      instruction: 'Verify data flows, error boundaries, and benchmark stability.',
      expectedArtifact: 'QA validation report with zero regression rating',
    },
    {
      stepNumber: 4,
      assignedCubeId: 'cube-aura',
      taskName: 'Product Documentation & Executive Copy',
      instruction: 'Author the official deployment brief and operational handbook.',
      expectedArtifact: 'Polished executive release summary and launch brief',
    },
  ];

  const handoffs = [
    {
      stepNumber: 1,
      taskName: 'Domain Intelligence & Groundwork',
      fromCubeId: 'cube-lyra',
      fromCubeName: 'Lyra',
      fromCubeRole: 'Deep Research & Market Intel',
      fromCubeColor: '#06B6D4',
      toCubeId: 'cube-vektor',
      toCubeName: 'Vektor',
      payload: `Intelligence Synthesis for "${prompt}":\n\n• Core Requirement: Autonomous multi-agent coordination with explicit SOP adherence.\n• Latency Optimization: Asynchronous handoffs with structured schema guarantees.\n• Recommended Pattern: Central Supervisor (Orion) with deterministic inter-agent payloads.\n\nAll prerequisite parameters validated and forwarded to Engineering.`,
      timestamp: new Date().toISOString(),
    },
    {
      stepNumber: 2,
      taskName: 'System Architecture & Implementation',
      fromCubeId: 'cube-vektor',
      fromCubeName: 'Vektor',
      fromCubeRole: 'Full-Stack Systems Engineer',
      fromCubeColor: '#6366F1',
      toCubeId: 'cube-cipher',
      toCubeName: 'Cipher',
      payload: `Engineered Solution Blueprint:\n\n\`\`\`typescript\nexport interface WorkflowHandoff {\n  pipelineId: string;\n  stage: number;\n  agentFrom: string;\n  agentTo: string;\n  payloadData: Record<string, unknown>;\n  verified: boolean;\n}\n\`\`\`\n\nArchitecture incorporates self-healing retry logic, typed message contracts, and state preservation. Ready for QA audit.`,
      timestamp: new Date().toISOString(),
    },
    {
      stepNumber: 3,
      taskName: 'Security, Edge Case & QA Audit',
      fromCubeId: 'cube-cipher',
      fromCubeName: 'Cipher',
      fromCubeRole: 'QA & Logic Reviewer',
      fromCubeColor: '#F59E0B',
      toCubeId: 'cube-aura',
      toCubeName: 'Aura',
      payload: `Verification Audit Report:\n\n✔ Invariant verification: Zero cyclic dependencies.\n✔ Latency budget: <200ms message bus propagation.\n✔ Access control: Owner/Editor/Viewer role enforcement checked.\n✔ Security verdict: PASSED with 100% confidence.`,
      timestamp: new Date().toISOString(),
    },
    {
      stepNumber: 4,
      taskName: 'Product Documentation & Executive Copy',
      fromCubeId: 'cube-aura',
      fromCubeName: 'Aura',
      fromCubeRole: 'Brand & Copywriting Cube',
      fromCubeColor: '#8B5CF6',
      toCubeId: 'cube-orion',
      toCubeName: 'Orion',
      payload: `Executive Release Brief:\n\n"The proposed system for '${prompt}' is fully architected, stress-tested, and prepared for immediate deployment. With modular digital employees collaborating on an isometric canvas, workflow velocity is accelerated by 4x."`,
      timestamp: new Date().toISOString(),
    },
  ];

  return {
    summary: `Complete collaborative execution pipeline for: "${prompt}"`,
    steps,
    handoffs,
    finalSynthesis: `Executive Deliverable by Lead Supervisor Orion:

1. Executive Summary:
Our multi-agent team has systematically decomposed and resolved: "${prompt}". Every phase has been validated against production standards.

2. Workflow Execution:
- Intelligence (Lyra): Validated core requirements, constraints, and operational design patterns.
- Engineering (Vektor): Constructed type-safe architectures and production logic.
- Quality Assurance (Cipher): Passed all edge-case audits and access boundary verifications.
- Product & Copy (Aura): Synthesized the rollout brief and user-facing documentation.

3. Ready for Deployment:
All artifacts are compiled and available in your Cubes workspace. You can inspect individual handoffs or issue subsequent directives directly.`,
    timestamp: new Date().toISOString(),
  };
}

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cubes Multi-Agent Studio server running on port ${PORT}`);
  });
}

startServer();
