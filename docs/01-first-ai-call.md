# Chapter 1: Your first AI call

> **Code:** [`src/lessons/01-hello.ts`](../src/lessons/01-hello.ts)
> **Run:** `npm run lesson src/lessons/01-hello.ts`
> **Goal:** Send one question to an AI from Node, get an answer back, and
> understand every number it returns.

---

## What we built

A 45-line TypeScript script that:

1. Reads an API key from `.env`
2. Sends one sentence to Google's Gemini model
3. Prints the reply, how long it took, and how many **tokens** it used

That's the whole lesson. Every AI feature you'll ever build (chatbots, MCP
servers, RAG, agents) is this same call with more around it.

## The output we got

```
--- Reply ---
A task management app is a digital tool designed to help individuals or teams organize,
track, and prioritize their to-do lists to improve productivity and ensure deadlines are met.

--- Behind the scenes ---
model:           gemini-3.1-flash-lite
time taken:      956 ms
input tokens:    12
output tokens:   34
thinking tokens: 0
total tokens:    46
```

The rest of this chapter explains each part of this output and the code that
produced it.

---

## 1. What an LLM is, in practice

An **LLM (Large Language Model)** is a program that takes text in and writes
text out. You don't run it yourself; a company (Google, Anthropic, OpenAI)
runs it on their servers, and you call it over HTTP, like any third-party API.

**The mental model that matters for a developer:**

```
Your code  ──HTTP request (your text)──▶  AI provider's servers
           ◀──HTTP response (AI's text)──
```

From your code's point of view, an LLM is **an API endpoint that accepts text
and returns text**. It's like calling Stripe or SendGrid, except the response
is generated fresh every time instead of looked up.

**How it writes the answer (one paragraph, no math):** The model has learned
from huge amounts of text which words tend to follow which. Given your text,
it predicts a likely next piece, adds it, then predicts the next one, and so
on until the answer is done. Two practical consequences follow, and you'll
see both in later chapters:

- It writes **one piece at a time**, so long answers take longer (and can be
  streamed: Chapter 5).
- It **predicts likely text**; it doesn't look facts up. It can sound
  confident and still be wrong (this is called **hallucination**; RAG in
  Part 3 is one of the main fixes).

## 2. The API key

```ts
import "dotenv/config";

if (!process.env.GEMINI_API_KEY) { ... }
```

The **API key** identifies you to Google, the same way a JWT identifies a
user to your task-management API. Every request uses it, and on a paid plan
every request is billed to it.

**Rules (same as any secret you've handled in MERN):**

- Keep it in `.env`, and make sure `.env` is in `.gitignore`. We commit
  `.env.example` with an empty value instead, so others know what to set.
- **Never put an API key in React/client code.** Anything shipped to the
  browser is public. AI calls always go through your server.
- If a key leaks, delete it in AI Studio and create a new one.

## 3. The SDK and the client

```ts
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  httpOptions: { timeout: 30_000, retryOptions: { attempts: 2 } },
});
```

- **SDK** (`@google/genai`): Google's npm package that wraps their HTTP API.
  You could call the API with `fetch`, but the SDK gives you TypeScript
  types, retries and nicer methods.
- **Client** (`ai`): one configured instance you reuse, like an axios
  instance with a base URL and default headers. It reads `GEMINI_API_KEY`
  from the environment automatically.
- `timeout` and `retryOptions` are explained in [section 9](#9-ai-apis-fail-often).

> **Same idea, other providers:** Anthropic (Claude) has `@anthropic-ai/sdk`,
> OpenAI has `openai`. Method names differ; the concepts in this guide are
> the same for all of them.

## 4. The model

```ts
const MODEL = "gemini-3.1-flash-lite";
```

A provider offers many **models**. Picking one is a trade-off between three
things:

| | Smaller / "lite" models | Bigger / "pro" models |
|---|---|---|
| Speed | Fast (we got under 1 second) | Slower |
| Cost | Cheap | Expensive |
| Quality | Good for simple, clear tasks | Better at hard reasoning |

**What we learned the hard way:** our first choice, `gemini-3.8-flash` (the
newest), was overloaded for free-tier users and never answered. A slightly
older, lighter model answered instantly. In real projects you choose a model
**per job** (lite for simple extraction, pro for hard reasoning), and you
often keep a fallback model ready.

To see which models your key can use, the SDK has `ai.models.list()`.

## 5. The prompt

```ts
const prompt = "In one sentence, what is a task management app?";

const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
```

The **prompt** is the text you send. `generateContent` is the method that
sends it and waits for the full answer.

Notice what the prompt controlled: we asked for "one sentence", and we got
one sentence. **How you phrase the prompt is how you control the output.**
Chapter 2 goes further with *system instructions* (rules the AI follows for
every message).

## 6. Tokens

```
input tokens:    12
output tokens:   34
```

Models don't read words or characters. They read **tokens**: chunks of text,
often a whole short word, sometimes part of a longer word or a punctuation
mark.

**Rule of thumb for English:** 1 token ≈ 4 characters ≈ ¾ of a word.
Our 10-word prompt became 12 tokens.

- **Input tokens**: what you sent (prompt, instructions, chat history, documents).
- **Output tokens**: what the model wrote back.

**Why a developer cares about tokens:**

1. **Cost.** Paid plans charge per token, per million tokens. Output tokens
   usually cost several times more than input tokens. "This feature costs X
   per request" is always a token calculation.
2. **Speed.** The model writes output tokens one at a time, so more output
   means a slower reply. Asking for "one sentence" is also a performance
   optimisation.
3. **Limits.** Every model has a **context window**: the maximum tokens
   (input + output) it can handle in one call. Large documents or long
   chats eventually hit it. This becomes important in Chapter 3 (chat
   history) and Part 3 (RAG).

The response tells you exact counts in `response.usageMetadata`. Log them in
real apps: it's how you track cost.

## 7. Thinking tokens

```
thinking tokens: 0
```

Some models **think before answering**: they write hidden reasoning tokens
first, then the visible answer. You pay for these tokens and wait for them,
but you don't see them.

**What we measured:** asking `gemini-3.5-flash` to "Say hi in 3 words" used
**510 thinking tokens** to produce a **5-token** answer, and took about
5 seconds. `gemini-3.1-flash-lite` used 0 and took about 1 second.

**Takeaway:** thinking helps with hard problems (planning, maths, tricky
logic) and is wasted on simple ones. Choosing between a thinking and a
non-thinking model is a real cost and speed decision.

## 8. Latency

```
time taken:      956 ms
```

Under a second felt fast, but compare it to your MongoDB queries, which take
a few milliseconds. AI calls are typically **0.5 to 30+ seconds**, depending
on the model, the output length and thinking.

**Consequences for app design:**

- Always show a loading state in the UI.
- Prefer streaming for long replies (Chapter 5).
- Never make an AI call inside a hot path that must be fast.

## 9. AI APIs fail often

The first time we ran the script it **hung with no output**. What was
actually happening:

1. The model was overloaded and returned **HTTP 503** ("high demand, try
   again later").
2. The SDK retried automatically, again and again, without printing anything.
3. It looked frozen.

**The fix** (now part of the client setup):

```ts
httpOptions: { timeout: 30_000, retryOptions: { attempts: 2 } }
```

- `timeout`: give up after 30 seconds.
- `retryOptions.attempts`: try at most 2 times, then throw an error.

And a `try/catch` around the call so the error is printed clearly.

**Errors you'll see from any AI provider:**

| Code | Meaning | What to do |
|---|---|---|
| **503** | Model overloaded | Retry after a short wait, or fall back to another model |
| **429** | Rate limit: too many requests (very common on free tier) | Wait and retry with backoff; slow down |
| **400** | Bad request (wrong model name, bad parameters) | Fix your code; retrying won't help |
| **401 / 403** | Bad or missing API key | Check `.env` |
| **404** | Model doesn't exist or isn't available to you | Pick another model (we saw this with `gemini-2.5-flash`) |

> **Production rule:** every AI call needs a timeout, a retry limit and error
> handling. Treat the AI like an unreliable external service, because it is one.

## 10. Free tier notes

- Free tier is enough to learn everything in Part 1.
- It has **lower rate limits** and **lower priority**: the newest models may
  be overloaded for free users when paid users get answers.
- If a model hangs or returns 503, switch to `gemini-3.1-flash-lite` or
  `gemini-3.5-flash`.

---

## Experiments to try

1. **Run the script 3 times without changes.** Are the replies identical?
   (They won't be. Chapter 2 explains why: *temperature*.)
2. **Switch `MODEL` to `"gemini-3.5-flash"`.** Compare time taken and
   thinking tokens.
3. **Ask for 200 words instead of one sentence.** Watch output tokens and
   time taken grow together.

---

## Cheat sheet

```ts
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  httpOptions: { timeout: 30_000, retryOptions: { attempts: 2 } },
});

const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-lite",
  contents: "your prompt",
});

response.text;                               // the reply
response.usageMetadata?.promptTokenCount;    // input tokens
response.usageMetadata?.candidatesTokenCount;// output tokens
response.usageMetadata?.thoughtsTokenCount;  // thinking tokens
```

- An LLM is an HTTP API: text in, text out, generated fresh each time.
- API key lives in server `.env`, never in the browser.
- Model choice = speed vs. cost vs. quality. Pick per job.
- Token ≈ ¾ word. Tokens drive cost, speed and limits.
- Thinking tokens: smarter, slower, costlier. Hidden but billed.
- AI calls are slow (seconds) and fail often (503, 429). Always set timeout,
  retry limit and `try/catch`.

## Interview questions

**Q: What is a token and why does it matter?**
A chunk of text the model processes, about ¾ of an English word. Pricing,
latency and the context window limit are all measured in tokens, so token
count drives cost and performance.

**Q: How do you choose which model to use?**
By trade-off between quality, speed and cost for that specific task. Simple
extraction or classification → small fast model. Complex reasoning → larger
or thinking model. Keep a fallback model for outages.

**Q: How do you handle LLM API failures in production?**
Set request timeouts, retry transient errors (503, 429) with backoff and a
retry limit, don't retry client errors (400, 401), fall back to another
model if needed, and surface clear errors to the user.

**Q: Why should LLM calls never be made from the frontend?**
The API key would be exposed to anyone using the app. Calls go through the
backend, which also lets you add auth, rate limiting and cost tracking.

**Q: What is hallucination?**
The model generating confident but incorrect information, because it
predicts likely text rather than looking facts up. Mitigations include
giving it the right data in the prompt (RAG), asking for structured output
and validating it, and grounding answers in tool results.
