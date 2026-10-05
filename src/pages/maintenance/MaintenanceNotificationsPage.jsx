import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeNotifications, markNotificationRead } from '../../services/complaintService';
import { useNavigate } from 'react-router-dom';
import { Bell, Sparkles, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export function MaintenanceNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeNotifications(user.uid, (data) => {
      setNotifications(data);
    });
    return () => unsubscribe && unsubscribe();
  }, [user]);

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    if (notif.complaintId) {
      navigate(`/maintenance/complaint/${notif.complaintId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Maintenance Alerts & Escalation Notifications</h1>
        <p className="text-xs text-slate-500 mt-1">Live dispatch notifications, critical safety alerts, and SLA escalation warnings.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No alerts or escalations active.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-4 ${
                !notif.read ? 'bg-amber-50/40 font-medium' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                {notif.type === 'ESCALATION' ? <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" /> :
                 <Sparkles className="w-5 h-5 text-violet-600" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900">{notif.title}</h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleString() : notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MaintenanceNotificationsPage;
