import { OllamaProvider } from '@lynx/core';

async function run() {
    console.log("Testing Ollama Connection...");
    // Using 'gemma3' as requested
    const ollama = new OllamaProvider('gemma3', 'Gemma 3', 'gemma3');

    try {
        console.log("Sending prompt: 'Why is the sky blue?'");
        for await (const chunk of ollama.stream('Why is the sky blue?')) {
            process.stdout.write(chunk);
        }
        console.log("\n\nDone.");
    } catch (error: any) {
        console.error("Error streaming from Ollama:", error.message);
        console.log("Hint: Is Ollama running? (run `ollama serve`)");
        console.log("Hint: Do you have the model? (run `ollama pull llama3`)");
    }
}

run();
