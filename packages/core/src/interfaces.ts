import { LynxRequest, LynxEvent } from '@lynx/shared';

export interface LLMProvider {
    id: string;
    name: string;
    metadata?: { isLocal?: boolean;[key: string]: any };
    stream(prompt: string): AsyncGenerator<string, void, unknown>;
}

export interface ModelStrategy {
    selectProviders(request: LynxRequest, availableProviders: Map<string, LLMProvider>): Promise<LLMProvider[]>;
}
