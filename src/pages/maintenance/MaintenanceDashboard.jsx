import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/dashboard/DashboardCard';
import ComplaintTable from '../../components/dashboard/ComplaintTable';
import ComplaintCard from '../../components/dashboard/ComplaintCard';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel from '../../components/common/FilterPanel';
import EmptyState from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import { 
  UserCheck, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  ShieldAlert, 
  Flame, 
  Sparkles,
  List,
  LayoutGrid,
  BarChart3
} from 'lucide-react';

export function MaintenanceDashboard() {
  const { complaints } = useComplaints();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('table');

  // Priority sorting helper: CRITICAL > HIGH > MEDIUM > LOW
  const priorityWeight = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };

  const sortedComplaints = [...complaints].sort((a, b) => {
    const pA = priorityWeight[a.aiPriority] || 1;
    const pB = priorityWeight[b.aiPriority] || 1;
    return pB - pA;
  });

  const filtered = sortedComplaints.filter(c => {
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

  const assignedToMe = complaints.filter(c => c.assignedStaffId === user?.uid).length;
  const notStarted = complaints.filter(c => c.status === 'NOT_STARTED').length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'PENDING').length;
  const completed = complaints.filter(c => c.status === 'COMPLETED').length;
  const highPriority = complaints.filter(c => (c.aiPriority === 'HIGH' || c.aiPriority === 'CRITICAL') && c.status !== 'COMPLETED').length;
  const criticalCount = complaints.filter(c => c.aiPriority === 'CRITICAL' && c.status !== 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Maintenance Staff Operations Dashboard</h1>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
              Staff Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <span className="font-bold text-slate-800">{user?.displayName}</span> ({user?.specialization || 'Electrical/Plumbing Specialist'}). Prioritizing by AI risk level.
          </p>
        </div>

        <Link
          to="/maintenance/insights"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all"
        >
          <BarChart3 className="w-4 h-4" />
          <span>✨ View AI Campus Analytics</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <DashboardCard title="Assigned to Me" count={assignedToMe} icon={UserCheck} color="indigo" />
        <DashboardCard title="Not Started" count={notStarted} icon={Clock} color="gray" />
        <DashboardCard title="In Progress" count={inProgress} icon={RefreshCw} color="blue" />
        <DashboardCard title="Completed" count={completed} icon={CheckCircle2} color="emerald" />
        <DashboardCard title="High Priority" count={highPriority} icon={ShieldAlert} color="orange" />
        <DashboardCard title="Critical Risk" count={criticalCount} icon={Flame} color="red" />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search by complaint ID, title, building, or room..." />
        
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

      {/* Complaints Table/Grid */}
      {filtered.length === 0 ? (
        <EmptyState title="No assigned complaints found" description="Adjust your filters or search terms." />
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

export default MaintenanceDashboard;
