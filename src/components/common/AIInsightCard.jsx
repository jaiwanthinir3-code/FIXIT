import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, TrendingUp, Info } from 'lucide-react';

export function AIInsightCard({ insight }) {
  if (!insight) return null;

  const { type, title, message } = insight;

  const styleMap = {
    danger: {
      bg: 'bg-red-50/90 border-red-200 text-red-950',
      icon: AlertTriangle,
      iconBg: 'bg-red-100 text-red-600'
    },
    warning: {
      bg: 'bg-amber-50/90 border-amber-200 text-amber-950',
      icon: TrendingUp,
      iconBg: 'bg-amber-100 text-amber-600'
    },
    success: {
      bg: 'bg-emerald-50/90 border-emerald-200 text-emerald-950',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100 text-emerald-600'
    },
    info: {
      bg: 'bg-violet-50/90 border-violet-200 text-violet-950',
      icon: Sparkles,
      iconBg: 'bg-violet-100 text-violet-600'
    }
  };

  const style = styleMap[type] || styleMap.info;
  const Icon = style.icon;

  return (
    <div className={`rounded-2xl p-4 border shadow-2xs flex items-start gap-3.5 transition-all ${style.bg}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">{title}</h4>
        <p className="text-xs leading-relaxed opacity-90">{message}</p>
      </div>
    </div>
  );
}

export default AIInsightCard;
