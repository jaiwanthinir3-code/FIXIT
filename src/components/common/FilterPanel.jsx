import React from 'react';
import { Filter } from 'lucide-react';

export function FilterPanel({ 
  selectedStatus, 
  onStatusChange, 
  selectedCategory, 
  onCategoryChange,
  selectedPriority,
  onPriorityChange
}) {
  const categories = [
    'ALL',
    'Electrical',
    'Plumbing',
    'Water Leakage',
    'Furniture',
    'Classroom',
    'Laboratory',
    'Cleaning',
    'Internet / Network',
    'Infrastructure',
    'Safety',
    'Other'
  ];

  const statuses = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' }
  ];

  const priorities = [
    { value: 'ALL', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mr-1">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        Filters:
      </div>

      {/* Status Filter */}
      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
      >
        {statuses.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Category Filter */}
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
      >
        <option value="ALL">All Categories</option>
        {categories.filter(c => c !== 'ALL').map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Priority Filter */}
      <select
        value={selectedPriority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
      >
        {priorities.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
    </div>
  );
}

export default FilterPanel;
