import React, { useState } from 'react';
import { Play, Square } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    onSummon: (prompt: string, models: string[]) => void;
    onStop: () => void;
    isStreaming: boolean;
}

const AVAILABLE_MODELS = [
    { id: 'gpt4', label: 'GPT-4 (Mock)', type: 'MOCK' },
    { id: 'claude', label: 'Claude 3 (Mock)', type: 'MOCK' },
    { id: 'gpt-oss', label: 'GPT OSS', type: 'LOCAL' },
    { id: 'gemma3', label: 'Gemma 3', type: 'LOCAL' },
];

export const CommandCenter: React.FC<Props> = ({ onSummon, onStop, isStreaming }) => {
    const [prompt, setPrompt] = useState('');
    const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-oss', 'gemma3']);

    const toggleModel = (id: string) => {
        setSelectedModels(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || selectedModels.length === 0) return;
        onSummon(prompt, selectedModels);
    };

    return (
        <div className="bg-surface border-b border-slate-700/50 p-6 sticky top-0 z-10 shadow-xl">
            <div className="max-w-7xl mx-auto flex gap-6 items-start">
                {/* Prompt Input */}
                <div className="flex-1">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Present your case to the Boardroom..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24 font-mono text-sm leading-relaxed"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                handleSubmit(e);
                            }
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="w-64 flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_MODELS.map(model => (
                            <button
                                key={model.id}
                                onClick={() => toggleModel(model.id)}
                                className={clsx(
                                    "flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 border",
                                    selectedModels.includes(model.id)
                                        ? "bg-slate-700 border-slate-500 text-white"
                                        : "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-600"
                                )}
                            >
                                <div className={clsx("w-2 h-2 rounded-full", model.type === 'LOCAL' ? "bg-green-500" : "bg-blue-500")} />
                                {model.label}
                            </button>
                        ))}
                    </div>

                    {isStreaming ? (
                        <button
                            onClick={onStop}
                            className="flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold text-sm uppercase tracking-wider transition-all shadow-lg bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 animate-pulse"
                        >
                            <Square className="w-4 h-4 fill-current" />
                            Stop Session
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!prompt || selectedModels.length === 0}
                            className={clsx(
                                "flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold text-sm uppercase tracking-wider transition-all shadow-lg",
                                (!prompt || selectedModels.length === 0)
                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                    : "bg-primary hover:bg-blue-600 text-white shadow-blue-500/20"
                            )}
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Summon Board
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
