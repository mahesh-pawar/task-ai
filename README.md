# task-ai

Hands-on project for learning LLM integration, built on top of my
[MERN task manager](https://github.com/mahesh-pawar/mern-task-management) API.

Roadmap:

1. LLM basics and tool calling
2. MCP server for the task API
3. RAG (semantic search over tasks)
4. AI agent

📖 **[The guide](docs/README.md)**: one chapter per lesson, with concepts,
real outputs, a cheat sheet and interview questions.

## Setup

Requires Node 22+.

```bash
npm install
cp .env.example .env   # then add your GEMINI_API_KEY
```

## Run a lesson

```bash
npm run lesson src/lessons/01-hello.ts
```
