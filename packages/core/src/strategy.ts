import { LynxRequest } from '@lynx/shared';
import { ModelStrategy, LLMProvider } from './interfaces';

export class ManualStrategy implements ModelStrategy {
    async selectProviders(request: LynxRequest, availableProviders: Map<string, LLMProvider>): Promise<LLMProvider[]> {
        const selected: LLMProvider[] = [];

        for (const id of request.modelIds) {
            const provider = availableProviders.get(id);
            if (provider) {
                selected.push(provider);
            } else {
                console.warn(`Provider ${id} not found in registry.`);
            }
        }

        return selected;
    }
}
