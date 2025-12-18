# Lynx

**The AI Boardroom — Synthesis of Diverse Intelligence.**

Lynx is not just a model router; it's a multi-modal orchestration engine designed to consult multiple LLMs simultaneously ("The Boardroom") to find patterns, reach consensus, and identify outliers.

## The Vision

Most orchestration tools focus on reducing costs by routing to the cheapest model. Lynx takes a different approach: **Intelligence Density**.

By streaming responses from multiple frontier models (e.g., GPT-4, Claude 3, Llama 3) in parallel and synthesizing them in real-time, Lynx provides:
- **Consensus**: High confidence when models agree.
- **Nuance**: Different perspectives on complex creative or reasoning tasks.
- **Reliability**: Fallback redundancy and outlier detection.

## Architecture

Lynx is built as a TypeScript Monorepo using **Turborepo**.

### Workspace Structure

- **`apps/api`**: Node.js backend using **Fastify**. Handles client connections, manages SSE (Server-Sent Events) streams, and invokes the orchestrator.
- **`apps/web`**: React + Vite frontend. Provides the "Boardroom" UI for users to select models and watch parallel streams.
- **`packages/core`**: The brain of Lynx. Contains the `StreamOrchestrator`, `ModelStrategy` interfaces, and provider logic. It uses advanced async handling to merge distinct model streams into a single unified event stream.
- **`packages/shared`**: Shared Zod schemas (`LynxRequest`, `LynxEvent`) and TypeScript types used across the entire stack.

### Tech Stack

- **Language**: TypeScript throughout.
- **Monorepo**: Turborepo, NPM Workspaces.
- **Backend**: Fastify, Server-Sent Events (SSE).
- **Frontend**: React, Tailwind CSS, Vite.
- **Validation**: Zod.
- **AI/LLM**: Ollama (Local), Mock Providers (Remote simulation).

## User Guide

### 1. Prerequisites (Local Intelligence)

Lynx is configured to use local models via **Ollama**.
1. Install [Ollama](https://ollama.com/).
2. Pull the required models:
   ```bash
   ollama pull gemma3
   ollama pull gpt-oss  # Or any other model you wish to map
   ```
3. Start the Ollama server:
   ```bash
   ollama serve
   ```

### 2. Installation & Start

```bash
# Install dependencies
npm install

# Start the full stack (API + Web)
npm run dev
```
- **API** runs on `http://localhost:3000`
- **Web Interface** runs on `http://localhost:5173` (typical Vite port)

### 3. Using the Boardroom UI

1. Open `http://localhost:5173` in your browser.
2. **Command Center**:
   - Enter your prompt (e.g., "Analyze the impact of AI on privacy").
   - Select the models you want to consult (toggle `gpt-oss`, `gemma3`, or mocks).
   - Click **"SUMMON BOARD"**.
3. **The Workspace**:
   - Watch as multiple columns stream text in parallel.
   - **Sync Scroll**: Scrolling one column will automatically scroll the others for easy line-by-line comparison.
4. **Synthesis**:
   - The top/highlighted card will show the **Aggregated Insight**, a synthesized summary of the board's opinions.

## Developer Guide

### Build

Compile all packages and apps:
```bash
npm run build
```

### Verification

To verify the core orchestration logic independently:
```bash
# Run the demo script in packages/core
npm run test --workspace=@lynx/core

# Verify API connection to Ollama
npx ts-node apps/api/test-ollama.ts
```

## Detailed Flow

1. **Client** sends request with `prompt` and `modelIds`.
2. **API** validates request using `@lynx/shared` schemas.
3. **Orchestrator** initializes selected providers (Ollama or Mock).
4. **Parallel Streaming**: Opens streams to all providers concurrently.
5. **Merging**: Chunks are yielded instantly as they arrive from *any* provider via `Promise.race`.
6. **Synthesis**: Aggregates results after streams finish for a final summary.
7. **Client** receives a single server-sent event stream updating the UI in real-time.
