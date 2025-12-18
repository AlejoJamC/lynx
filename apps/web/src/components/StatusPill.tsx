import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, XCircle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export const StatusPill: React.FC = () => {
    const [status, setStatus] = useState<'LOADING' | 'OK' | 'ERROR'>('LOADING');

    const checkStatus = async () => {
        setStatus('LOADING');
        try {
            // Check API
            const apiRes = await fetch('http://localhost:3000/health').catch(() => null);
            if (!apiRes || !apiRes.ok) throw new Error("API Unreachable");

            // We could expand this to ask API to check Ollama
            setStatus('OK');
        } catch (e) {
            setStatus('ERROR');
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    return (
        <button
            onClick={checkStatus}
            className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                status === 'OK' && "bg-green-900/20 border-green-800 text-green-400 hover:bg-green-900/40",
                status === 'ERROR' && "bg-red-900/20 border-red-800 text-red-400 hover:bg-red-900/40",
                status === 'LOADING' && "bg-slate-800 border-slate-700 text-slate-400"
            )}
        >
            {status === 'LOADING' && <RefreshCw className="w-3 h-3 animate-spin" />}
            {status === 'OK' && <Activity className="w-3 h-3" />}
            {status === 'ERROR' && <XCircle className="w-3 h-3" />}
            <span>{status === 'OK' ? "SYSTEM ONLINE" : status === 'ERROR' ? "SYSTEM OFFLINE" : "CONNECTING..."}</span>
        </button>
    );
};
