import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export function LoadingState({ message = "AI is analyzing your complaint...", submessage = "Classifying category, priority, and routing to maintenance team..." }) {
  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center shadow-sm max-w-lg mx-auto my-8">
      <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-violet-100 animate-ping opacity-75"></div>
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
          <Sparkles className="w-7 h-7 animate-spin-slow" />
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-1">{message}</h3>
      <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mb-4">{submessage}</p>

      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-violet-700 bg-violet-50 px-4 py-2 rounded-full w-fit mx-auto border border-violet-200">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-600" />
        <span>Processing in progress</span>
      </div>
    </div>
  );
}

export default LoadingState;
