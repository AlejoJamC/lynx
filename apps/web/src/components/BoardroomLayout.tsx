import React, { createRef, useMemo } from 'react';
import { useLynxStream } from '../hooks/useLynxStream';
import { useSyncScroll } from '../hooks/useSyncScroll';
import { CommandCenter } from './CommandCenter';
import { ModelStreamCard } from './ModelStreamCard';
import { SynthesisCard } from './SynthesisCard';
import { StatusPill } from './StatusPill';
import { LayoutGrid } from 'lucide-react';

export const BoardroomLayout: React.FC = () => {
    const { generate, stop, streams, synthesis, isStreaming } = useLynxStream();

    // Create refs for sync scrolling based on active streams
    const streamList = useMemo(() => Array.from(streams.values()), [streams]);
    const scrollRefs = useMemo(() =>
        streamList.map(() => createRef<HTMLDivElement>()),
        [streamList]
    );

    // @ts-ignore - ref type mismatch with hook expectation logic vs createRef but works in runtime
    useSyncScroll(scrollRefs as React.RefObject<HTMLElement>[]);

    const handleSummon = (prompt: string, models: string[]) => {
        generate(prompt, models);
    };

    return (
        <div className="flex flex-col h-screen bg-background text-slate-200 overflow-hidden">
            {/* Header Logo */}
            <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <LayoutGrid className="w-6 h-6 text-primary" />
                    <span className="font-bold text-lg tracking-tight">LYNX <span className="text-slate-600 font-normal">BOARDROOM</span></span>
                </div>
                <StatusPill />
            </div>

            <CommandCenter onSummon={generate} onStop={stop} isStreaming={isStreaming} />

            <div className="flex-1 overflow-hidden flex flex-col p-6 max-w-7xl mx-auto w-full">
                {/* Synthesis Overlay */}
                <SynthesisCard content={synthesis} />

                {/* Parallel Grid */}
                <div className="flex-1 min-h-0 grid grid-flow-col auto-cols-fr gap-4 overflow-x-auto pb-4">
                    {streamList.length === 0 ? (
                        <div className="col-span-full h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                            <p className="text-lg font-medium">The Boardroom is empty.</p>
                            <p className="text-sm">Select models and enter a prompt to begin.</p>
                        </div>
                    ) : (
                        streamList.map((stream, index) => (
                            <div key={stream.providerId} className="h-full min-w-[350px]">
                                <ModelStreamCard
                                    ref={scrollRefs[index]}
                                    stream={stream}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
