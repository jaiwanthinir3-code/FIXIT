import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, GraduationCap, Building, ShieldCheck } from 'lucide-react';

export function StudentProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Student Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Campus user account and contact details.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <img 
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
            alt={user?.displayName} 
            className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-sm"
          />
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.displayName}</h2>
            <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
            <span className="mt-2 inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200">
              <GraduationCap className="w-3.5 h-3.5" /> Student Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
            <span className="font-bold text-slate-900 mt-1 block">{user?.department || 'Computer Science'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Hostel / Campus Residence</span>
            <span className="font-bold text-slate-900 mt-1 block">{user?.room || 'Hostel Block B - Room 204'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfilePage;
