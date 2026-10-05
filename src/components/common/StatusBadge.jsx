import React from 'react';
import { Clock, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export function StatusBadge({ status, className = '' }) {
  // Normalize both old space format and new underscore format
  const raw = (status || 'NOT_STARTED').toUpperCase().replace(/ /g, '_');

  const config = {
    'NOT_STARTED': {
      label: 'Not Started',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Clock
    },
    'PENDING': {
      label: 'Pending Review',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertCircle
    },
    'IN_PROGRESS': {
      label: 'In Progress',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: RefreshCw,
      spin: true
    },
    'COMPLETED': {
      label: 'Completed',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2
    }
  };

  const current = config[raw] || config['NOT_STARTED'];
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg} ${className}`}>
      <Icon className={`w-3.5 h-3.5 ${current.spin ? 'animate-spin' : ''}`} />
      {current.label}
    </span>
  );
}

export default StatusBadge;
