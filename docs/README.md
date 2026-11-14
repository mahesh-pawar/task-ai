# The task-ai Guide

My personal handbook for LLM integration, written while building `task-ai`.
Each chapter matches a lesson: what we built, the concepts behind it, the real
output, the mistakes we hit, and a quick-revision section at the end.

> **How to use this guide:** Read a chapter top to bottom the first time.
> When revising, jump straight to the **Cheat sheet** and **Interview questions**
> at the end of each chapter.

## Part 1: LLM fundamentals and tool calling

| Ch. | Title | Code | Status |
|---|---|---|---|
| 1 | [Your first AI call](01-first-ai-call.md) | `src/lessons/01-hello.ts` | ✅ |
| 2 | Controlling the AI: system instructions and temperature | | ⏳ |
| 3 | Chat with memory: message history and the context window | | ⏳ |
| 4 | Getting JSON back: structured output | | ⏳ |
| 5 | Streaming responses | | ⏳ |
| 6 | Tool calling basics | | ⏳ |
| 7 | Connecting the AI to the real task API | | ⏳ |
| 8 | Making it production-ready | | ⏳ |

## Part 2: MCP server (coming later)

## Part 3: RAG (coming later)

## Part 4: AI agents (coming later)

## Glossary

Short definitions, collected from all chapters. Each links to the chapter
that explains it properly.

| Term | Meaning | Chapter |
|---|---|---|
| **LLM** | Large Language Model. An AI that reads text and writes text back. | [1](01-first-ai-call.md#1-what-an-llm-is-in-practice) |
| **Model** | One specific LLM you choose to call, e.g. `gemini-3.1-flash-lite`. | [1](01-first-ai-call.md#4-the-model) |
| **Prompt** | The text you send to the model. | [1](01-first-ai-call.md#5-the-prompt) |
| **Token** | The unit of text a model reads and writes; roughly ¾ of an English word. | [1](01-first-ai-call.md#6-tokens) |
| **Input / output tokens** | Tokens you send vs. tokens the model writes back. Both are counted and billed. | [1](01-first-ai-call.md#6-tokens) |
| **Thinking tokens** | Hidden tokens some models use to "reason" before answering. Slower, costlier, smarter. | [1](01-first-ai-call.md#7-thinking-tokens) |
| **Context window** | The maximum number of tokens a model can handle in one call. | [1](01-first-ai-call.md#6-tokens) |
| **Latency** | How long the model takes to reply. | [1](01-first-ai-call.md#8-latency) |
| **503 / 429** | "Model overloaded" / "you're sending too many requests (rate limit)". | [1](01-first-ai-call.md#9-ai-apis-fail-often) |
