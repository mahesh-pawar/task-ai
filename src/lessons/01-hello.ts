// Lesson 1: your first LLM call.
// Run:  npm run lesson src/lessons/01-hello.ts
import "dotenv/config"; // loads .env (GEMINI_API_KEY lives there)
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY. Copy .env.example to .env, add your key, then run again.");
  process.exit(1);
}

// The client. Like creating an axios instance; it reads GEMINI_API_KEY itself.
// timeout: give up after 30s instead of hanging forever.
// retryOptions: try at most 2 times, so errors show up quickly.
const ai = new GoogleGenAI({
  httpOptions: { timeout: 30_000, retryOptions: { attempts: 2 } },
});

// Which "brain" answers. Flash-lite = fastest + cheapest, and it works on the free tier.
// Try "gemini-3.5-flash" later and compare the token numbers.
const MODEL = "gemini-3.1-flash-lite";

// What we send. Change this line and re-run to experiment.
const prompt = "In one sentence, what is a task management app? with one best feature.";

try {
  const start = Date.now();
  const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
  const ms = Date.now() - start;

  console.log("\n--- Reply ---");
  console.log(response.text);

  console.log("\n--- Behind the scenes ---");
  console.log("model:          ", MODEL);
  console.log("time taken:     ", ms, "ms");
  console.log("input tokens:   ", response.usageMetadata?.promptTokenCount);
  console.log("output tokens:  ", response.usageMetadata?.candidatesTokenCount);
  console.log("thinking tokens:", response.usageMetadata?.thoughtsTokenCount ?? 0);
  console.log("total tokens:   ", response.usageMetadata?.totalTokenCount);
} catch (err) {
  // Real AI APIs fail often: overloaded (503), rate-limited (429), timeouts.
  console.error("\nAI call failed:", err instanceof Error ? err.message : err);
  process.exit(1);
}
