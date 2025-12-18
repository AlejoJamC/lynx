import React, { forwardRef } from 'react';
import { ModelStreamState } from '../hooks/useLynxStream';
import { Cpu, CheckCircle, AlertOctagon, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Props {
    stream: ModelStreamState;
    className?: string;
}

const statusColor = {
    IDLE: 'text-slate-500',
    STREAMING: 'text-blue-400',
    DONE: 'text-green-400',
    ERROR: 'text-red-400',
};

const statusIcon = {
    IDLE: Cpu,
    STREAMING: Loader2,
    DONE: CheckCircle,
    ERROR: AlertOctagon,
};

export const ModelStreamCard = forwardRef<HTMLDivElement, Props>(({ stream, className }, ref) => {
    const Icon = statusIcon[stream.status];

    return (
        <div className={twMerge("flex flex-col h-full bg-surface border border-slate-700/50 rounded-lg overflow-hidden", className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                    <Icon className={clsx("w-4 h-4", statusColor[stream.status], stream.status === 'STREAMING' && "animate-spin")} />
                    <span className="font-semibold text-sm tracking-wide text-slate-200">
                        {stream.providerId.toUpperCase()}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">LOCAL</span>
                    {stream.latency && <span>{stream.latency}ms</span>}
                </div>
            </div>

            {/* Content */}
            <div
                ref={ref}
                className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed text-slate-300 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            >
                {stream.status === 'IDLE' ? (
                    <div className="h-full flex items-center justify-center text-slate-600 italic">
                        Waiting for prompt...
                    </div>
                ) : (
                    <div className="whitespace-pre-wrap">
                        {stream.content}
                        {stream.status === 'STREAMING' && <span className="animate-pulse text-blue-400">â–‹</span>}
                    </div>
                )}

                {stream.error && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-300 text-xs">
                        {stream.error}
                    </div>
                )}
            </div>
        </div>
    );
});

ModelStreamCard.displayName = 'ModelStreamCard';
