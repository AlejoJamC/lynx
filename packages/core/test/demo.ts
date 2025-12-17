import { StreamOrchestrator } from '../src/orchestrator';
import { ManualStrategy } from '../src/strategy';
import { LLMProvider } from '../src/interfaces';

// Mock Provider
class MockProvider implements LLMProvider {
    public id: string;
    public name: string;
    private delay: number;

    constructor(id: string, name: string, delay: number) {
        this.id = id;
        this.name = name;
        this.delay = delay;
    }

    async *stream(prompt: string) {
        yield "Start ";
        await new Promise(r => setTimeout(r, this.delay));
        yield "Middle ";
        await new Promise(r => setTimeout(r, this.delay));
        yield "End";
    }
}

async function run() {
    const providers = [
        new MockProvider('fast', 'Fast Model', 10),
        new MockProvider('slow', 'Slow Model', 50)
    ];
    const strategy = new ManualStrategy();
    const orchestrator = new StreamOrchestrator(providers, strategy);

    console.log("Starting Orchestration...");
    const iterator = orchestrator.orchestrate({
        prompt: "Hello",
        modelIds: ['fast', 'slow'],
        includeSynthesis: true
    });

    const start = Date.now();
    for await (const event of iterator) {
        const time = Date.now() - start;
        console.log(`[${time}ms] ${event.type} from ${event.type === 'chunk' || event.type === 'start' || event.type === 'done' ? event.modelId : 'System'}: ${event.type === 'chunk' || event.type === 'synthesis' ? event.text : ''}`);
    }
}

run().catch(console.error);
