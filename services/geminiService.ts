import { GoogleGenAI, Type } from "@google/genai";
import { Step, Strategy, PlanItem, Language } from "../types";

// Check if API key is available
const rawKey = import.meta.env.VITE_GEMINI_API_KEY ||
  (typeof process !== 'undefined' ? (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY) : undefined);
const apiKey = (rawKey && rawKey !== 'undefined' && rawKey !== 'null') ? rawKey : undefined;

console.log('Gemini Service - Auth Check:', {
  hasViteKey: !!import.meta.env.VITE_GEMINI_API_KEY,
  viteKeyType: typeof import.meta.env.VITE_GEMINI_API_KEY,
  hasProcessKey: typeof process !== 'undefined' && !!process.env.VITE_GEMINI_API_KEY,
  finalResolved: !!apiKey,
  keyPrefix: apiKey ? apiKey.substring(0, 4) + '...' : 'none'
});

if (!apiKey) {
  console.warn('VITE_GEMINI_API_KEY not found or invalid. AI features will be disabled.');
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const MODEL_NAME = 'gemini-1.5-flash';

/**
 * Generates 3 strategies (Titles & Descriptions only) for speed optimization.
 */
export const generateStrategies = async (
  goal: string,
  quantification: string,
  environment: string,
  language: Language
): Promise<Strategy[]> => {
  if (!ai) {
    throw new Error('AI service not available. Please check your API key configuration.');
  }

  const langName = language === 'zh' ? 'Simplified Chinese' : 'English';

  const prompt = `
    User Goal: "${goal}"
    Quantification: "${quantification}"
    Context/Environment: "${environment}"

    Task: Generate exactly 3 distinct, highly reliable, and realistic strategies (options) to achieve this goal, taking into account the user's specific context/environment if provided.
    
    Requirements:
    1. Output in ${langName}.
    2. Provide ONLY the title and a persuasive description for each strategy.
    3. DO NOT generate the detailed steps yet.
  `;

  try {
    // Use standardized SDK call
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const text = response.text || "";

    // Parse the response into strategies
    const strategies: Strategy[] = [];
    const lines = text.split('\n').filter(line => line.trim());

    let currentStrategy: Partial<Strategy> = {};

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check if it's a title (starts with number or is short)
      if (trimmedLine.match(/^\d+\./) || (trimmedLine.length < 100 && !currentStrategy.title)) {
        // Save previous strategy if exists
        if (currentStrategy.title && currentStrategy.description) {
          strategies.push({
            id: `strategy-${strategies.length + 1}`,
            title: currentStrategy.title,
            description: currentStrategy.description
          });
        }

        // Start new strategy
        currentStrategy = {
          title: trimmedLine.replace(/^\d+\.\s*/, '').trim()
        };
      } else if (currentStrategy.title && !currentStrategy.description) {
        // Add to description
        currentStrategy.description = trimmedLine;
      }
    }

    // Add the last strategy
    if (currentStrategy.title && currentStrategy.description) {
      strategies.push({
        id: `strategy-${strategies.length + 1}`,
        title: currentStrategy.title,
        description: currentStrategy.description
      });
    }

    // Ensure we have exactly 3 strategies
    while (strategies.length < 3) {
      strategies.push({
        id: `strategy-${strategies.length + 1}`,
        title: `Strategy ${strategies.length + 1}`,
        description: `An alternative approach to achieve your goal.`
      });
    }

    return strategies.slice(0, 3);
  } catch (error: any) {
    console.error('Error generating strategies:', error);
    throw new Error(`Failed to generate strategies: ${error.message || 'Please check your connection'}`);
  }
};

/**
 * Generates the detailed plan for a specific strategy.
 */
export const generateStrategyPlan = async (
  strategy: Strategy,
  goal: string,
  environment: string,
  language: Language
): Promise<PlanItem[]> => {
  const langName = language === 'zh' ? 'Simplified Chinese' : 'English';

  const prompt = `
    Goal: "${goal}"
    Context/Environment: "${environment}"
    Selected Strategy: "${strategy.title}"
    Strategy Description: "${strategy.description}"

    Task: Generate a detailed execution plan for this strategy.

    Requirements:
    1. Output in ${langName}.
    2. The plan must consist of 3 to 5 high-level steps.
    3. An item can be a "single" step OR a "parallel" group of steps.
    4. For each step instruction: wrap specific tools, software, or physical resources in square brackets like [Hammer] or [VS Code]. Keep resource names in ${langName} or English as appropriate.
    5. List extracted resources array for each step.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        systemInstruction: `You are a helpful expert planner. You MUST output your response in ${langName}, even if the input text is in a different language.`,
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["single", "parallel"] },
              instruction: { type: Type.STRING },
              resources: { type: Type.ARRAY, items: { type: Type.STRING } },
              parallelSteps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    instruction: { type: Type.STRING },
                    resources: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["instruction", "resources"]
                }
              }
            },
          },
        },
      },
    });

    const text = response.text || "[]";
    const rawPlan = JSON.parse(text);

    return rawPlan.map((item: any, itemIdx: number) => {
      const timestamp = Date.now();

      if (item.type === 'parallel' && item.parallelSteps) {
        return {
          type: 'parallel',
          group: {
            id: `group-${timestamp}-${itemIdx}`,
            steps: item.parallelSteps.map((ps: any, pIdx: number) => ({
              id: `step-${timestamp}-${itemIdx}-${pIdx}`,
              instruction: ps.instruction,
              resources: ps.resources || [],
              subSteps: [],
              isExpanded: false,
            }))
          }
        } as PlanItem;
      }

      return {
        type: 'single',
        step: {
          id: `step-${timestamp}-${itemIdx}`,
          instruction: item.instruction || "Do this step",
          resources: item.resources || [],
          subSteps: [],
          isExpanded: false,
        }
      } as PlanItem;
    });
  } catch (error: any) {
    console.error('Error generating strategy plan:', error);
    throw new Error(`Failed to generate strategy plan: ${error.message || 'Unknown error'}`);
  }
};

export const expandStep = async (
  stepInstruction: string,
  context: string,
  language: Language
): Promise<Step[]> => {
  const langName = language === 'zh' ? 'Simplified Chinese' : 'English';

  const prompt = `
    Context: "${context}"
    Current Step: "${stepInstruction}"

    Task: Break down this specific step into 3 to 5 smaller sub-steps.
    
    Requirements:
    1. Output in ${langName}.
    2. Identify and bracket [Resources] if new ones appear.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        systemInstruction: `You are a helpful expert planner. You MUST output your response in ${langName}, even if the input text is in a different language.`,
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              instruction: { type: Type.STRING },
              resources: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["instruction", "resources"],
          },
        },
      },
    });

    const text = response.text || "[]";
    const rawSteps = JSON.parse(text);

    return rawSteps.map((st: any, idx: number) => ({
      id: `substep-${Date.now()}-${idx}`,
      instruction: st.instruction,
      resources: st.resources || [],
    }));
  } catch (error: any) {
    console.error('Error expanding step:', error);
    throw new Error(`Failed to expand step: ${error.message || 'Unknown error'}`);
  }
};

export const generateResourcePlan = async (resourceName: string, language: Language): Promise<Step[]> => {
  const langName = language === 'zh' ? 'Simplified Chinese' : 'English';

  const prompt = `
    Resource needed: "${resourceName}"

    Task: Provide a 3 to 5 step process on how a user can acquire, install, buy, or learn to use this resource.
    
    Requirements:
    1. Output in ${langName}.
    2. Wrap any sub-resources in brackets [Like This] if necessary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        systemInstruction: `You are a helpful expert planner. You MUST output your response in ${langName}, even if the input text is in a different language.`,
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              instruction: { type: Type.STRING },
              resources: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["instruction", "resources"],
          },
        },
      },
    });

    const text = response.text || "[]";
    const rawSteps = JSON.parse(text);

    return rawSteps.map((st: any, idx: number) => ({
      id: `res-step-${Date.now()}-${idx}`,
      instruction: st.instruction,
      resources: st.resources || [],
    }));
  } catch (error: any) {
    console.error('Error generating resource plan:', error);
    throw new Error(`Failed to generate resource plan: ${error.message || 'Unknown error'}`);
  }
};

export const regenerateStepText = async (
  currentInstruction: string,
  context: string,
  language: Language
): Promise<{ instruction: string, resources: string[] }> => {
  const langName = language === 'zh' ? 'Simplified Chinese' : 'English';

  const prompt = `
    Context: "${context}"
    Current Instruction: "${currentInstruction}"

    Task: Rewrite the current instruction to be more clear, actionable, or alternative. Keep the same intent but improve the phrasing or method.
    
    Requirements:
    1. Output in ${langName}.
    2. Bracket [Resources].
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            instruction: { type: Type.STRING },
            resources: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["instruction", "resources"],
        },
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Error regenerating step text:', error);
    throw new Error(`Failed to regenerate step: ${error.message || 'Unknown error'}`);
  }
};

export const regenerateFutureSteps = async (
  goal: string,
  contextBefore: string[],
  currentStep: string,
  count: number,
  language: Language
): Promise<PlanItem[]> => {
  const langName = language === 'zh' ? 'Simplified Chinese' : 'English';

  const prompt = `
    Goal: "${goal}"
    History of steps already planned/completed: ${JSON.stringify(contextBefore)}
    The step that just changed/edited: "${currentStep}"

    Task: Generate the remaining ${count} steps needed to complete the goal, starting AFTER "The step that just changed". The flow must adapt to the changed step.

    Requirements:
    1. Output in ${langName}.
    2. Generate exactly ${count} items.
    3. Items can be single or parallel.
    4. Bracket [Resources].
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        systemInstruction: `You are a helpful expert planner. You MUST output your response in ${langName}, even if the input text is in a different language.`,
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["single", "parallel"] },
              instruction: { type: Type.STRING },
              resources: { type: Type.ARRAY, items: { type: Type.STRING } },
              parallelSteps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    instruction: { type: Type.STRING },
                    resources: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["instruction", "resources"]
                }
              }
            },
          },
        },
      },
    });

    const text = response.text || "[]";
    const rawPlan = JSON.parse(text);

    return rawPlan.map((item: any, itemIdx: number) => {
      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substr(2, 5);

      if (item.type === 'parallel' && item.parallelSteps) {
        return {
          type: 'parallel',
          group: {
            id: `group-regen-${timestamp}-${uniqueId}-${itemIdx}`,
            steps: item.parallelSteps.map((ps: any, pIdx: number) => ({
              id: `step-regen-${timestamp}-${uniqueId}-${itemIdx}-${pIdx}`,
              instruction: ps.instruction,
              resources: ps.resources || [],
              subSteps: [],
              isExpanded: false,
            }))
          }
        } as PlanItem;
      }

      return {
        type: 'single',
        step: {
          id: `step-regen-${timestamp}-${uniqueId}-${itemIdx}`,
          instruction: item.instruction || "Do this step",
          resources: item.resources || [],
          subSteps: [],
          isExpanded: false,
        }
      } as PlanItem;
    });
  } catch (error: any) {
    console.error('Error regenerating future steps:', error);
    throw new Error(`Failed to regenerate future steps: ${error.message || 'Unknown error'}`);
  }
};
