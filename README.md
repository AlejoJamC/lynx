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

## Developer Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation

```bash
# Install dependencies for all workspaces
npm install
```

### Development

Run all apps and packages in development mode:

```bash
npm run dev
```

### Build

Compile all packages and apps:

```bash
npm run build
```

### Verification

To verify the core orchestration logic without spinning up the full server, run the standalone test script (requires `ts-node`):

```bash
# Run the demo script in packages/core
npm run test --workspace=@lynx/core
```

## detailed Flow

1. **Client** sends a request with `prompt` and `modelIds`.
2. **API** validates the request using `@lynx/shared` schemas.
3. **Orchestrator** (`@lynx/core`) initializes the selected providers.
4. **Parallel Streaming**: The orchestrator opens streams to all providers concurrently.
5. **Merging**: Chunks are yielded instantly as they arrive from *any* provider (using async iterators and `Promise.race`).
6. **Synthesis**: Once all models finish, an aggregator synthesizes the results for a final summary.
7. **Client** receives a single server-sent event stream containing interleaved chunks and the final synthesis.
