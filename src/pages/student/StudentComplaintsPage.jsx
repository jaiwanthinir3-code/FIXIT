import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import ComplaintTable from '../../components/dashboard/ComplaintTable';
import ComplaintCard from '../../components/dashboard/ComplaintCard';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel from '../../components/common/FilterPanel';
import EmptyState from '../../components/common/EmptyState';
import { LayoutGrid, List } from 'lucide-react';

export function StudentComplaintsPage() {
  const { complaints } = useComplaints();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('table');

  const studentComplaints = complaints.filter(c => c.studentId === user?.uid || !c.studentId || user?.role === 'student');

  const filtered = studentComplaints.filter(c => {
    const matchSearch = searchTerm === '' || 
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.building?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.room?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchCat = categoryFilter === 'ALL' || c.category === categoryFilter || c.aiCategory === categoryFilter;
    const matchPrio = priorityFilter === 'ALL' || c.aiPriority === priorityFilter || c.studentPriority === priorityFilter;

    return matchSearch && matchStatus && matchCat && matchPrio;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">My Maintenance Complaints</h1>
        <p className="text-xs text-slate-500 mt-1">Complete record of your submitted issues and live status resolution history.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3">
          <FilterPanel
            selectedStatus={statusFilter}
            onStatusChange={setStatusFilter}
            selectedCategory={categoryFilter}
            onCategoryChange={setCategoryFilter}
            selectedPriority={priorityFilter}
            onPriorityChange={setPriorityFilter}
          />

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description="Try adjusting your search criteria."
        />
      ) : viewMode === 'table' ? (
        <ComplaintTable complaints={filtered} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentComplaintsPage;
