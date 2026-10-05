import React from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import AIInsightCard from '../../components/common/AIInsightCard';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { 
  Sparkles, 
  BarChart3, 
  Building2, 
  Wrench, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

export function MaintenanceInsightsPage() {
  const { complaints, insights, insightsLoading } = useComplaints();

  const total = complaints.length;
  const critical = complaints.filter(c => c.aiPriority === 'CRITICAL' && c.status !== 'COMPLETED').length;
  const high = complaints.filter(c => c.aiPriority === 'HIGH' && c.status !== 'COMPLETED').length;
  const completed = complaints.filter(c => c.status === 'COMPLETED').length;
  const inProgress = complaints.filter(c => c.status === 'IN PROGRESS').length;

  // Building cluster breakdown
  const buildingCounts = {};
  complaints.forEach(c => {
    if (c.building) {
      buildingCounts[c.building] = (buildingCounts[c.building] || 0) + 1;
    }
  });

  // Category breakdown
  const categoryCounts = {};
  complaints.forEach(c => {
    const cat = c.aiCategory || c.category || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full filter blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">AI Maintenance Analytics & Insights</h1>
          </div>
          <p className="text-xs text-violet-200 mt-1 max-w-xl leading-relaxed">
            Real-time statistical synthesis computed directly from live Firestore complaint data. Autonomously detecting hot spots, escalation risks, and category volume trends.
          </p>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
          <span className="text-[10px] text-violet-300 font-bold uppercase tracking-wider block">Live Data Sync</span>
          <span className="text-xl font-mono font-extrabold text-white">{total} Complaints</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Critical Incidents" count={critical} icon={ShieldAlert} color="red" subtitle="Requires immediate dispatch" />
        <DashboardCard title="High Priority" count={high} icon={TrendingUp} color="orange" subtitle="Impacting campus operations" />
        <DashboardCard title="Active In Progress" count={inProgress} icon={Wrench} color="blue" subtitle="Work active on site" />
        <DashboardCard title="Verified Resolved" count={completed} icon={CheckCircle2} color="emerald" subtitle="Completed with proof" />
      </div>

      {/* AI Synthesized Insights Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span>AI Synthesized Strategic Insights</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Calculated from stored complaints</span>
        </div>

        {insightsLoading ? (
          <div className="p-6 text-center text-xs text-slate-400">Synthesizing insights...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <AIInsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Building Cluster Analytics */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Building Location Incident Volume</span>
          </h3>

          <div className="space-y-3">
            {Object.keys(buildingCounts).length === 0 ? (
              <p className="text-xs text-slate-400">No building data available.</p>
            ) : (
              Object.entries(buildingCounts).map(([bldg, count]) => {
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={bldg} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span>{bldg}</span>
                      <span className="font-mono text-indigo-600">{count} issue(s) ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-violet-600" />
            <span>Category Volume Distribution</span>
          </h3>

          <div className="space-y-3">
            {Object.keys(categoryCounts).length === 0 ? (
              <p className="text-xs text-slate-400">No category data available.</p>
            ) : (
              Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span>{cat}</span>
                      <span className="font-mono text-violet-600">{count} issue(s) ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-600 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default MaintenanceInsightsPage;
