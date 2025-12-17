import axios from 'axios';
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
            const response = await axios.post(
                `${this.baseUrl}/api/chat`,
                {
                    model: this.modelName,
                    messages: [{ role: 'user', content: prompt }],
                },
                {
                    responseType: 'stream',
                }
            );

            // Node.js stream needs to be cast to async iterable or processed chunk by chunk
            const stream = response.data;

            for await (const chunk of stream) {
                // chunk is a Buffer
                const lines = chunk.toString().split('\n').filter((line: string) => line.trim() !== '');

                for (const line of lines) {
                    try {
                        const json = JSON.parse(line);
                        if (json.message && json.message.content) {
                            yield json.message.content;
                        }
                        if (json.done) {
                            return;
                        }
                    } catch (e) {
                        // ignore partial JSON parse errors usually due to chunk boundaries
                        // simpler handling for now; robust JSON streaming parser would be better
                    }
                }
            }
        } catch (error: any) {
            // Orchestrator catches this
            throw new Error(`Ollama Error: ${error.message}`);
        }
    }
}
