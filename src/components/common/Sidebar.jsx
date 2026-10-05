import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  Bell, 
  User, 
  Sparkles, 
  Wrench, 
  BarChart3,
  ShieldAlert
} from 'lucide-react';

export function Sidebar() {
  const { isStudent, isStaff } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/report', label: '+ Report New Issue', icon: PlusCircle, highlight: true },
    { to: '/student/complaints', label: 'My Complaints', icon: ClipboardList },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
    { to: '/student/profile', label: 'Profile', icon: User }
  ];

  const staffLinks = [
    { to: '/maintenance/dashboard', label: 'Work Dashboard', icon: LayoutDashboard },
    { to: '/maintenance/complaints', label: 'All Complaints', icon: ClipboardList },
    { to: '/maintenance/insights', label: '✨ AI Insights', icon: BarChart3, highlight: true },
    { to: '/maintenance/notifications', label: 'Alerts & Escalations', icon: Bell },
    { to: '/maintenance/profile', label: 'Staff Profile', icon: User }
  ];

  const links = isStudent ? studentLinks : staffLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <h2 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {isStudent ? 'Student Workspace' : 'Maintenance Operations'}
          </h2>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : link.highlight 
                        ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-sm hover:opacity-95' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-3.5 text-center">
        <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold text-violet-950">AI Maintenance Layer</h4>
        <p className="text-[11px] text-violet-700 mt-1 leading-relaxed">
          Autonomously classifying, prioritizing & routing complaints in real-time.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
