import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export function ErrorState({ message = "Something went wrong. Please try again.", onRetry }) {
  return (
    <div className="rounded-3xl bg-red-50/80 border border-red-200 p-8 text-center my-6 max-w-md mx-auto">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-red-950 mb-1">Execution Error</h3>
      <p className="text-xs text-red-700 mb-4">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}

export default ErrorState;
