import React from 'react';
import { ShieldAlert, ShieldCheck, Flame, Info } from 'lucide-react';

export function PriorityBadge({ priority, className = '' }) {
  const normPriority = (priority || 'LOW').toUpperCase();

  const config = {
    'LOW': {
      label: 'Low Priority',
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: Info
    },
    'MEDIUM': {
      label: 'Medium Priority',
      bg: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: ShieldCheck
    },
    'HIGH': {
      label: 'High Priority',
      bg: 'bg-orange-100 text-orange-800 border-orange-300 font-semibold',
      icon: ShieldAlert
    },
    'CRITICAL': {
      label: 'CRITICAL',
      bg: 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse',
      icon: Flame
    }
  };

  const current = config[normPriority] || config['LOW'];
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${current.bg} ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {current.label}
    </span>
  );
}

export default PriorityBadge;
