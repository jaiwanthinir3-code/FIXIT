import React from 'react';
import { ClipboardX, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyState({ 
  title = "No maintenance complaints found.", 
  description = "There are no complaints matching your criteria at this moment.",
  actionText = "+ Report New Issue",
  actionLink = "/student/report"
}) {
  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center shadow-2xs my-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200">
        <ClipboardX className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">{description}</p>
      
      {actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{actionText}</span>
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
