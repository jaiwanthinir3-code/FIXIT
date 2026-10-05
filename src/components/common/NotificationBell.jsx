import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Sparkles, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { subscribeNotifications, markNotificationRead } from '../../services/complaintService';

export function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeNotifications(userId, (data) => {
      setNotifications(data);
    });
    return () => unsubscribe && unsubscribe();
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    setIsOpen(false);
    if (notif.complaintId) {
      if (notif.userId?.includes('student') || notif.type === 'STATUS_CHANGE' || notif.type === 'AI_CLASSIFICATION') {
        navigate(`/student/complaint/${notif.complaintId}`);
      } else {
        navigate(`/maintenance/complaint/${notif.complaintId}`);
      }
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'AI_CLASSIFICATION': return <Sparkles className="w-4 h-4 text-violet-600 shrink-0" />;
      case 'ESCALATION': return <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />;
      case 'STATUS_CHANGE': return <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />;
      default: return <Shield className="w-4 h-4 text-indigo-600 shrink-0" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-50 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-red-200">
                  {unreadCount} new
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">In-App Live Alerts</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                    !notif.read ? 'bg-indigo-50/40 font-medium' : ''
                  }`}
                >
                  <div className="mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{notif.title}</p>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{notif.message}</p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
