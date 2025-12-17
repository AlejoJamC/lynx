import { LynxRequest, LynxEvent } from '@lynx/shared';
import { LLMProvider, ModelStrategy } from './interfaces';

export class StreamOrchestrator {
    private providers: Map<string, LLMProvider> = new Map();
    private defaultStrategy: ModelStrategy;

    constructor(
        providers: LLMProvider[],
        defaultStrategy: ModelStrategy
    ) {
        this.defaultStrategy = defaultStrategy;
        for (const p of providers) {
            this.providers.set(p.id, p);
        }
    }

    async *orchestrate(request: LynxRequest): AsyncGenerator<LynxEvent, void, unknown> {
        const selectedProviders = await this.defaultStrategy.selectProviders(request, this.providers);

        // We need to capture the full output of each model for the synthesizer
        const modelOutputs: Map<string, string> = new Map();
        selectedProviders.forEach(p => modelOutputs.set(p.id, ''));

        // Create an array of async generators, one for each provider
        const streams = selectedProviders.map(async function* (provider) {
            yield { type: 'start' as const, modelId: provider.id };

            try {
                for await (const chunk of provider.stream(request.prompt)) {
                    modelOutputs.set(provider.id, modelOutputs.get(provider.id) + chunk);
                    yield { type: 'chunk' as const, modelId: provider.id, text: chunk };
                }
                yield { type: 'done' as const, modelId: provider.id };
            } catch (err: any) {
                yield { type: 'error' as const, modelId: provider.id, error: err.message || 'Unknown error' };
            }
        });

        // Merge all streams concurrently
        yield* this.mergeGenerators(streams);

        // After all streams are done, run synthesis if requested
        if (request.includeSynthesis) {
            yield* this.synthesize(modelOutputs);
        }
    }

    // Helper to merge multiple async generators into a single stream
    // This ensures we yield events as soon as they arrive from ANY provider
    private async *mergeGenerators<T>(generators: AsyncGenerator<T, void, unknown>[]): AsyncGenerator<T, void, unknown> {
        const promises = generators.map((gen, index) => gen.next().then(res => ({ index, res })));
        const Map = new globalThis.Map(promises.map((p, i) => [i, p]));

        while (Map.size > 0) {
            const { index, res } = await Promise.race(Map.values());

            if (res.done) {
                Map.delete(index);
            } else {
                yield res.value;
                // Enqueue the next item from this generator
                Map.set(index, generators[index].next().then(nextRes => ({ index, res: nextRes })));
            }
        }
    }

    private async *synthesize(outputs: Map<string, string>): AsyncGenerator<LynxEvent, void, unknown> {
        // In a real app, this would call another LLM with the context of all outputs.
        // For this foundation, we will simulate a streaming synthesis.

        const summaryPrefix = "Synthesis based on " + outputs.size + " models: ";
        yield { type: 'synthesis', text: summaryPrefix };

        // Mock synthesis logic
        // calculating average length or finding common patterns
        const combined = Array.from(outputs.values()).join(" | ");
        const synthesisMock = `Consensus found across models. Combined analysis: ${combined.substring(0, 50)}...`;

        // Stream the mock synthesis
        const chunks = synthesisMock.match(/.{1,10}/g) || [];
        for (const chunk of chunks) {
            await new Promise(resolve => setTimeout(resolve, 50)); // Artificial delay
            yield { type: 'synthesis', text: chunk };
        }
    }
}
