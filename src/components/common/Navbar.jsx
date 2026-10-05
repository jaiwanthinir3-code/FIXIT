import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import NotificationBell from './NotificationBell';
import { 
  Wrench, 
  User, 
  LogOut, 
  RotateCcw, 
  Sparkles, 
  Shield, 
  GraduationCap, 
  ChevronDown,
  Activity
} from 'lucide-react';

export function Navbar() {
  const { user, logout, switchUser, isStudent, isStaff } = useAuth();
  const { resetDemoData } = useComplaints();
  const navigate = useNavigate();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSwitchToStudent = () => {
    switchUser({
      uid: "student-alex-001",
      email: "student@campus.edu",
      displayName: "Alex Rivera",
      role: "student",
      department: "Computer Science",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    });
    setShowRoleMenu(false);
    navigate('/student/dashboard');
  };

  const handleSwitchToStaffElectrical = () => {
    switchUser({
      uid: "staff-ravi-002",
      email: "staff@campus.edu",
      displayName: "Ravi Kumar",
      role: "staff",
      department: "Electrical Maintenance",
      specialization: "Electrical",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    });
    setShowRoleMenu(false);
    navigate('/maintenance/dashboard');
  };

  const handleSwitchToStaffPlumbing = () => {
    switchUser({
      uid: "staff-sarah-003",
      email: "sarah.staff@campus.edu",
      displayName: "Sarah Jenkins",
      role: "staff",
      department: "Plumbing & Sanitation",
      specialization: "Plumbing",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
    });
    setShowRoleMenu(false);
    navigate('/maintenance/dashboard');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <Link to={isStudent ? "/student/dashboard" : "/maintenance/dashboard"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">FIXIT</span>
                <span className="bg-violet-100 text-violet-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-violet-200">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">Report. Understand. Resolve.</p>
            </div>
          </Link>

          {/* Current Role Badge */}
          {user && (
            <div className="relative">
              <button 
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  isStudent 
                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                {isStudent ? <GraduationCap className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                <span>{isStudent ? 'Student Mode' : `Staff: ${user.displayName}`}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {/* Quick Switch Dropdown */}
              {showRoleMenu && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Role Switcher (Demo)
                  </div>
                  <button 
                    onClick={handleSwitchToStudent}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2"
                  >
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold text-slate-900">Alex Rivera (Student)</div>
                      <div className="text-[10px] text-slate-500">Computer Science - Hostel 204</div>
                    </div>
                  </button>

                  <button 
                    onClick={handleSwitchToStaffElectrical}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-bold text-slate-900">Ravi Kumar (Staff - Electrical)</div>
                      <div className="text-[10px] text-slate-500">Electrical Specialist</div>
                    </div>
                  </button>

                  <button 
                    onClick={handleSwitchToStaffPlumbing}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-900">Sarah Jenkins (Staff - Plumbing)</div>
                      <div className="text-[10px] text-slate-500">Plumbing Specialist</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Seed / Reset Demo Button */}
          <button
            onClick={resetDemoData}
            title="Reset to default seed complaints"
            className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition-all border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          {/* In-App Notification Bell */}
          {user && <NotificationBell userId={user.uid} />}

          {/* User Profile */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <img 
                  src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300"
                />
                <span className="text-xs font-bold text-slate-800 hidden sm:block">{user.displayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user.displayName}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{user.email}</p>
                    <span className="mt-1 inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Role: {user.role}
                    </span>
                  </div>

                  <Link
                    to={isStudent ? "/student/profile" : "/maintenance/profile"}
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>View Profile</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-medium"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              Sign In
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}

export default Navbar;
