import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import { MapPin, Calendar, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ComplaintCard({ complaint }) {
  const { isStudent } = useAuth();
  if (!complaint) return null;

  const targetLink = isStudent 
    ? `/student/complaint/${complaint.id}` 
    : `/maintenance/complaint/${complaint.id}`;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header Badges & ID */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              #{complaint.id}
            </span>
            <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-violet-500" />
              {complaint.aiCategory || complaint.category}
            </span>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
          {complaint.title}
        </h3>

        {/* Location & Reported date */}
        <div className="space-y-1 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{complaint.location || `${complaint.building} ${complaint.room}`}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Updated {new Date(complaint.updatedAt || complaint.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <PriorityBadge priority={complaint.aiPriority || complaint.studentPriority} />

        <Link
          to={targetLink}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors group-hover:translate-x-0.5 transform duration-150"
        >
          <span>View Issue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default ComplaintCard;
