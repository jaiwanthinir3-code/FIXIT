import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/dashboard/DashboardCard';
import ComplaintTable from '../../components/dashboard/ComplaintTable';
import ComplaintCard from '../../components/dashboard/ComplaintCard';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel from '../../components/common/FilterPanel';
import EmptyState from '../../components/common/EmptyState';
import { PlusCircle, ClipboardList, Clock, RefreshCw, CheckCircle2, LayoutGrid, List } from 'lucide-react';

export function StudentDashboard() {
  const { complaints, loading } = useComplaints();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Filter complaints for current student
  // ComplaintContext already filters to only this student's complaints
  const studentComplaints = complaints;

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

  const total = studentComplaints.length;
  const notStarted = studentComplaints.filter(c => c.status === 'NOT_STARTED').length;
  const inProgress = studentComplaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'PENDING').length;
  const resolved = studentComplaints.filter(c => c.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Student Maintenance Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, <span className="font-bold text-slate-800">{user?.displayName}</span>! Track your reported campus maintenance issues in real-time.
          </p>
        </div>

        <Link
          to="/student/report"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Report New Issue</span>
        </Link>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Complaints"
          count={total}
          icon={ClipboardList}
          color="indigo"
          subtitle="All complaints filed"
        />
        <DashboardCard
          title="Not Started"
          count={notStarted}
          icon={Clock}
          color="gray"
          subtitle="Awaiting staff pickup"
        />
        <DashboardCard
          title="In Progress"
          count={inProgress}
          icon={RefreshCw}
          color="blue"
          subtitle="Active repair work"
        />
        <DashboardCard
          title="Resolved"
          count={resolved}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Verified complete"
        />
      </div>

      {/* Filter & Search Bar */}
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

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No complaints match your filter"
          description="Try adjusting your search terms or filters, or submit a new maintenance report."
          actionText="+ Report New Issue"
          actionLink="/student/report"
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

export default StudentDashboard;
