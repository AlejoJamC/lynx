import { LLMProvider } from '../interfaces';

export class OllamaProvider implements LLMProvider {
    public metadata = { isLocal: true };

    constructor(
        public id: string,
        public name: string,
        private modelName: string,
        private baseUrl: string = 'http://localhost:11434'
    ) { }

    async *stream(prompt: string): AsyncGenerator<string, void, unknown> {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.modelName,
                    messages: [{ role: 'user', content: prompt }],
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama API Error: ${response.status} ${response.statusText}`);
            }

            if (!response.body) {
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);
                        if (json.message && json.message.content) {
                            yield json.message.content;
                        }
                        if (json.done) return;
                    } catch (e) {
                        // ignore partial JSON
                    }
                }
            }
        } catch (error: any) {
            throw new Error(`Ollama Error: ${error.message}`);
        }
    }
}
