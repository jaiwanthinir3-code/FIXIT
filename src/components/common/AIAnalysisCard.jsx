import React from 'react';
import { Sparkles, ShieldAlert, UserCheck, Wrench, AlertTriangle, Eye, Layers } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

export function AIAnalysisCard({ complaint, compact = false }) {
  if (!complaint) return null;

  const {
    aiCategory,
    category,
    aiPriority,
    safetyRisk,
    recommendedTeam,
    assignedStaffName,
    priorityReason,
    aiRecommendation,
    aiVisualObservations,
    aiDuplicateMatch,
    aiDuplicateConfidence
  } = complaint;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-50/80 via-indigo-50/40 to-purple-50/60 border border-violet-200/80 shadow-md p-5 relative overflow-hidden">
      {/* Decorative Shimmer Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600"></div>

      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-violet-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-violet-950 uppercase tracking-wider flex items-center gap-1.5">
              ✨ AI COMPLAINT MANAGER
            </h3>
            <p className="text-xs text-violet-700">Autonomous Classification, Risk & Routing Analysis</p>
          </div>
        </div>
        <PriorityBadge priority={aiPriority} />
      </div>

      {/* Duplicate Warning Callout if found */}
      {aiDuplicateMatch && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold flex items-center gap-1">
              Possible Duplicate Complaint Detected ({aiDuplicateConfidence}% match)
            </p>
            <p className="text-amber-800 mt-0.5">
              Matches active complaint <span className="font-mono font-bold text-amber-950">#{aiDuplicateMatch}</span> at the same building location.
            </p>
          </div>
        </div>
      )}

      {/* Grid Properties */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Category */}
        <div className="bg-white/80 rounded-xl p-3 border border-violet-100 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <Layers className="w-3.5 h-3.5 text-violet-600" />
            AI Classification
          </div>
          <span className="text-xs font-bold text-slate-900">{aiCategory || category || 'General'}</span>
        </div>

        {/* Priority */}
        <div className="bg-white/80 rounded-xl p-3 border border-violet-100 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
            AI Priority
          </div>
          <span className="text-xs font-bold text-slate-900">{aiPriority}</span>
        </div>

        {/* Safety Risk */}
        <div className="bg-white/80 rounded-xl p-3 border border-violet-100 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            Safety Risk
          </div>
          <span className={`text-xs font-bold ${
            safetyRisk === 'CRITICAL' ? 'text-red-700' :
            safetyRisk === 'HIGH' ? 'text-orange-700' :
            safetyRisk === 'MEDIUM' ? 'text-amber-700' : 'text-slate-700'
          }`}>{safetyRisk}</span>
        </div>

        {/* Recommended Team */}
        <div className="bg-white/80 rounded-xl p-3 border border-violet-100 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <Wrench className="w-3.5 h-3.5 text-indigo-600" />
            Recommended Team
          </div>
          <span className="text-xs font-bold text-slate-900">{recommendedTeam}</span>
        </div>
      </div>

      {/* Staff Recommendation */}
      {assignedStaffName && (
        <div className="mb-4 bg-white/90 rounded-xl p-3 border border-indigo-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-slate-500 font-medium">Assigned Staff Recommendation: </span>
              <span className="font-bold text-slate-900">{assignedStaffName}</span>
            </div>
          </div>
          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-200">
            Workload Matched
          </span>
        </div>
      )}

      {/* Reason */}
      {priorityReason && (
        <div className="mb-3">
          <h4 className="text-xs font-bold text-violet-950 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-violet-600" /> AI Reason
          </h4>
          <p className="text-xs text-slate-700 bg-white/70 p-2.5 rounded-xl border border-violet-100/80 leading-relaxed">
            "{priorityReason}"
          </p>
        </div>
      )}

      {/* Visual Observation */}
      {aiVisualObservations && (
        <div className="mb-3">
          <h4 className="text-xs font-bold text-violet-950 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Eye className="w-3 h-3 text-indigo-600" /> AI Visual Observation
          </h4>
          <p className="text-xs text-slate-700 bg-white/70 p-2.5 rounded-xl border border-violet-100/80 leading-relaxed">
            {aiVisualObservations}
          </p>
        </div>
      )}

      {/* Suggested Action */}
      {aiRecommendation && (
        <div>
          <h4 className="text-xs font-bold text-violet-950 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Wrench className="w-3 h-3 text-violet-600" /> Suggested Action / Methodology
          </h4>
          <div className="text-xs text-slate-800 bg-white/90 p-3 rounded-xl border border-violet-200 leading-relaxed whitespace-pre-line font-mono">
            {aiRecommendation}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIAnalysisCard;
