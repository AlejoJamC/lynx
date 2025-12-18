import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
    content: string;
}

export const SynthesisCard: React.FC<Props> = ({ content }) => {
    if (!content) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/10 border border-indigo-500/30 rounded-xl p-6 shadow-2xl backdrop-blur-sm mb-6">
            <div className="flex items-center gap-2 mb-3 text-indigo-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold tracking-wider text-sm uppercase">Boardroom Synthesis</h3>
            </div>
            <div className="font-medium text-slate-200 leading-relaxed text-lg">
                {content}
            </div>
        </div>
    );
};
