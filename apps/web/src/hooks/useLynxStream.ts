import { useState, useCallback, useRef } from 'react';
import { LynxEvent } from '@lynx/shared';

export interface ModelStreamState {
    status: 'IDLE' | 'STREAMING' | 'DONE' | 'ERROR';
    content: string;
    latency?: number;
    error?: string;
    providerId: string;
}

export const useLynxStream = () => {
    const [streams, setStreams] = useState<Map<string, ModelStreamState>>(new Map());
    const [synthesis, setSynthesis] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState(false);

    // Keep track of active streams to avoid stale closure issues in the loop if needed,
    // but simpler to accumulate in a local variable and update state periodically.

    const generate = useCallback(async (prompt: string, modelIds: string[]) => {
        setIsStreaming(true);
        setSynthesis('');

        // Initialize streams
        const initialStreams = new Map<string, ModelStreamState>();
        modelIds.forEach(id => {
            initialStreams.set(id, {
                status: 'IDLE',
                content: '',
                providerId: id
            });
        });
        setStreams(initialStreams);

        const startTime = Date.now();

        try {
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, modelIds, includeSynthesis: true }),
            });

            if (!response.ok) throw new Error(response.statusText);
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            // Update helper
            const updateStream = (id: string, update: Partial<ModelStreamState>) => {
                setStreams(prev => {
                    const next = new Map(prev);
                    const current = next.get(id);
                    if (current) {
                        next.set(id, { ...current, ...update });
                    }
                    return next;
                });
            };

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep partial line

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    if (line.startsWith('event:')) continue; // skip event type line for now, assumes data follows

                    if (line.startsWith('data: ')) {
                        try {
                            const data = line.slice(6);
                            const event: LynxEvent = JSON.parse(data);

                            switch (event.type) {
                                case 'start':
                                    updateStream(event.modelId, { status: 'STREAMING', latency: Date.now() - startTime });
                                    break;
                                case 'chunk':
                                    setStreams(prev => {
                                        const next = new Map(prev);
                                        const current = next.get(event.modelId);
                                        if (current) {
                                            next.set(event.modelId, { ...current, content: current.content + event.text });
                                        }
                                        return next;
                                    });
                                    break;
                                case 'done':
                                    updateStream(event.modelId, { status: 'DONE' });
                                    break;
                                case 'error':
                                    updateStream(event.modelId, { status: 'ERROR', error: event.error });
                                    break;
                                case 'synthesis':
                                    setSynthesis(prev => prev + event.text);
                                    break;
                            }
                        } catch (e) {
                            console.error('Error parsing SSE', e);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Stream failed", err);
        } finally {
            setIsStreaming(false);
        }
    }, []);

    return { generate, streams, synthesis, isStreaming };
};
