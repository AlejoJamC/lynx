import Fastify from 'fastify';
import cors from '@fastify/cors';
import { StreamOrchestrator, ManualStrategy, LLMProvider } from '@lynx/core';
import { LynxRequestSchema } from '@lynx/shared';
import { z } from 'zod';

const fastify = Fastify({ logger: true });

// Mock Providers for demonstration
class MockProvider implements LLMProvider {
    public id: string;
    public name: string;
    private speed: number;

    constructor(id: string, name: string, speed: number) {
        this.id = id;
        this.name = name;
        this.speed = speed;
    }

    async *stream(prompt: string) {
        const tokens = ["This ", "is ", "response ", "from ", this.name, ". "];
        for (const token of tokens) {
            await new Promise(resolve => setTimeout(resolve, this.speed));
            yield token;
        }
    }
}

const providers = [
    new MockProvider('gpt4', 'GPT-4', 100),
    new MockProvider('claude', 'Claude 3', 150), // slightly slower
    new MockProvider('local', 'Local Llama', 50), // fast
];

const strategy = new ManualStrategy();
const orchestrator = new StreamOrchestrator(providers, strategy);

const start = async () => {
    try {
        await fastify.register(cors);

        fastify.post('/chat', async (request, reply) => {
            try {
                const body = LynxRequestSchema.parse(request.body);

                // Set headers for SSE
                reply.raw.setHeader('Content-Type', 'text/event-stream');
                reply.raw.setHeader('Cache-Control', 'no-cache');
                reply.raw.setHeader('Connection', 'keep-alive');
                reply.raw.flushHeaders();

                for await (const event of orchestrator.orchestrate(body)) {
                    // Server-Sent Event format
                    reply.raw.write(`event: ${event.type}\n`);
                    reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
                }

                reply.raw.end();
            } catch (error) {
                if (error instanceof z.ZodError) {
                    reply.status(400).send(error);
                } else {
                    request.log.error(error);
                    reply.status(500).send({ error: 'Internal Server Error' });
                }
            }
        });

        await fastify.listen({ port: 3000 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
