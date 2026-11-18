// Lesson 2: controlling the AI with system instructions and temperature.
// Run:  npm run lesson src/lessons/02-system-and-temperature.ts
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  httpOptions: { timeout: 30_000, retryOptions: { attempts: 2 } },
});

// Must be a model that still honours temperature (Gemini 3.6+ ignores it).
const MODEL = "gemini-3.1-flash-lite";

// System instruction: rules the AI follows for EVERY message.
// Think of it as the job description; the prompt is the individual request.
const TASK_ASSISTANT = `
You are the assistant inside a task management app.
Rules:
- Only help with tasks, to-dos, planning and productivity.
- If asked about anything else, politely say you can only help with tasks.
- Keep answers under 60 words.
- When you suggest tasks, use a bullet list.
`.trim();

// One helper so each experiment stays short.
async function ask(prompt: string, opts: { system?: string; temperature?: number } = {}) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      systemInstruction: opts.system,   // undefined = no system instruction
      temperature: opts.temperature,    // undefined = model default
    },
  });
  return {
    text: response.text?.trim() ?? "",
    inputTokens: response.usageMetadata?.promptTokenCount,
  };
}

function heading(title: string) {
  console.log(`\n${"=".repeat(70)}\n${title}\n${"=".repeat(70)}`);
}

try {
  // ── Experiment 1: same question, with and without a system instruction ──
  const question = "I'm launching a website next week. What should I do?";

  heading("1A. No system instruction");
  const plain = await ask(question);
  console.log(plain.text);
  console.log(`\n(input tokens: ${plain.inputTokens})`);

  heading("1B. With the task-assistant system instruction");
  const guided = await ask(question, { system: TASK_ASSISTANT });
  console.log(guided.text);
  console.log(`\n(input tokens: ${guided.inputTokens})  <- the system instruction costs tokens too`);

  // ── Experiment 2: off-topic question. Does the AI follow the rules? ──
  heading("2. Off-topic question with the system instruction");
  const offTopic = await ask("What is the capital of France?", { system: TASK_ASSISTANT });
  console.log(offTopic.text);

  // ── Experiment 3: temperature = how random the answer is ──
  // An open-ended prompt: many good answers exist, so temperature has room to matter.
  const creativePrompt =
    "Write one short, fun motivational line for someone with 10 overdue tasks. Reply with only the line.";

  heading("3A. temperature 0 (predictable), asked 3 times");
  for (let i = 1; i <= 3; i++) {
    console.log(`  ${i}. ${(await ask(creativePrompt, { temperature: 0 })).text}`);
  }

  heading("3B. temperature 2 (most random), asked 3 times");
  for (let i = 1; i <= 3; i++) {
    console.log(`  ${i}. ${(await ask(creativePrompt, { temperature: 2 })).text}`);
  }

  // ── Experiment 4: a narrow prompt at the HIGHEST temperature ──
  // Only one obvious answer exists, so even temperature 2 has nothing to pick from.
  const narrowPrompt =
    "Suggest a short title for a task about fixing a login bug. Reply with only the title.";

  heading("4. Narrow prompt at temperature 2, asked 3 times");
  for (let i = 1; i <= 3; i++) {
    console.log(`  ${i}. ${(await ask(narrowPrompt, { temperature: 2 })).text}`);
  }
} catch (err) {
  console.error("\nAI call failed:", err instanceof Error ? err.message : err);
  process.exit(1);
}
