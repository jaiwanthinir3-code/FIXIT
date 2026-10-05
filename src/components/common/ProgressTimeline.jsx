import React from 'react';
import { CheckCircle2, Clock, Sparkles, UserCheck, Wrench, CheckCheck } from 'lucide-react';

export function ProgressTimeline({ status, createdAt, updatedAt, resolvedAt }) {
  // Normalize both "IN PROGRESS" and "IN_PROGRESS" formats
  const normStatus = (status || 'NOT_STARTED').toUpperCase().replace(/ /g, '_');

  const steps = [
    {
      id: 'submitted',
      title: 'Complaint Submitted',
      description: 'Filed by Student',
      icon: CheckCircle2,
      isDone: true,
      time: createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    },
    {
      id: 'analyzed',
      title: 'AI Analyzed',
      description: 'Category & Priority Classified',
      icon: Sparkles,
      isDone: true,
      time: createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    },
    {
      id: 'assigned',
      title: 'Assigned',
      description: 'Routed to Maintenance Staff',
      icon: UserCheck,
      isDone: normStatus === 'PENDING' || normStatus === 'IN_PROGRESS' || normStatus === 'COMPLETED',
      isCurrent: normStatus === 'PENDING',
      time: updatedAt ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    },
    {
      id: 'in_progress',
      title: 'Work In Progress',
      description: 'Inspection & Repair Active',
      icon: Wrench,
      isDone: normStatus === 'COMPLETED',
      isCurrent: normStatus === 'IN_PROGRESS',
      time: normStatus === 'IN_PROGRESS' && updatedAt ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    },
    {
      id: 'completed',
      title: 'Completed',
      description: 'Resolved & Verified',
      icon: CheckCheck,
      isDone: normStatus === 'COMPLETED',
      isCurrent: normStatus === 'COMPLETED',
      time: resolvedAt ? new Date(resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
        <span>Complaint Tracking Timeline</span>
        <span className="text-xs text-slate-500 font-normal">Real-Time Synchronization</span>
      </h3>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative flex md:flex-col items-center md:items-start gap-3 md:gap-2">
                {/* Connector Line for Desktop */}
                {idx < steps.length - 1 && (
                  <div className={`hidden md:block absolute top-4 left-8 right-0 h-0.5 z-0 ${
                    steps[idx + 1].isDone || steps[idx + 1].isCurrent ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}></div>
                )}

                {/* Node Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                  step.isDone 
                    ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50' 
                    : step.isCurrent 
                      ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100 animate-pulse' 
                      : 'bg-slate-100 text-slate-400 border border-slate-300'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div>
                  <h4 className={`text-xs font-bold ${
                    step.isDone || step.isCurrent ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{step.description}</p>
                  {step.time && (
                    <span className="inline-block mt-1 text-[10px] text-slate-400 font-mono">
                      {step.time}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProgressTimeline;
