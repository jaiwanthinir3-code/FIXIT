import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ComplaintTable({ complaints = [] }) {
  const { isStudent } = useAuth();

  if (!complaints || complaints.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">ID</th>
              <th className="py-3.5 px-4">Issue Title</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Last Updated</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {complaints.map((c) => {
              const targetLink = isStudent 
                ? `/student/complaint/${c.id}` 
                : `/maintenance/complaint/${c.id}`;

              return (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    #{c.id}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors max-w-xs truncate">
                    {c.title}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100 text-[11px]">
                      <Sparkles className="w-3 h-3 text-violet-500" />
                      {c.aiCategory || c.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap max-w-xs truncate">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.location || `${c.building} ${c.room}`}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <PriorityBadge priority={c.aiPriority || c.studentPriority} />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {new Date(c.updatedAt || c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Link
                      to={targetLink}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ComplaintTable;
