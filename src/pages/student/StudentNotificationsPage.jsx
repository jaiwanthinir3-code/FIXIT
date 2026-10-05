import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeNotifications, markNotificationRead } from '../../services/complaintService';
import { useNavigate } from 'react-router-dom';
import { Bell, Sparkles, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';

export function StudentNotificationsPage() {
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
      navigate(`/student/complaint/${notif.complaintId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Student In-App Notifications</h1>
        <p className="text-xs text-slate-500 mt-1">Live alerts regarding AI classification, staff assignment, and complaint status progress.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No notifications available.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-4 ${
                !notif.read ? 'bg-indigo-50/30 font-medium' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {notif.type === 'AI_CLASSIFICATION' ? <Sparkles className="w-5 h-5 text-violet-600" /> :
                 notif.type === 'ESCALATION' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
                 <CheckCircle2 className="w-5 h-5 text-blue-600" />}
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

export default StudentNotificationsPage;
