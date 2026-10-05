import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscribeComplaintById } from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import AIAnalysisCard from '../../components/common/AIAnalysisCard';
import MaintenanceWorkFlow from '../../components/maintenance/MaintenanceWorkFlow';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { ArrowLeft, MapPin, Calendar, User, Sparkles, Image as ImageIcon } from 'lucide-react';

export function MaintenanceComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeComplaintById(id, (data) => {
      setComplaint(data);
      setLoading(false);
    });
    return () => unsubscribe && unsubscribe();
  }, [id]);

  if (loading) {
    return <LoadingState message="Loading maintenance work order..." submessage="Connecting to Firestore live state..." />;
  }

  if (!complaint) {
    return <ErrorState message={`Complaint ${id} not found.`} onRetry={() => navigate('/maintenance/dashboard')} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/maintenance/dashboard')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                #{complaint.id}
              </span>
              <PriorityBadge priority={complaint.aiPriority || complaint.studentPriority} />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">{complaint.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Main Grid: Left 8-Step Workflow & Right Info / AI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Guided 8-Step Maintenance Work Process */}
        <div className="lg:col-span-7 space-y-6">
          <MaintenanceWorkFlow complaint={complaint} />
        </div>

        {/* Right 5 Cols: ✨ AI COMPLAINT MANAGER & Complaint Info */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Analysis Card */}
          <AIAnalysisCard complaint={complaint} />

          {/* Student Overview Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Complaint Data</h3>

            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
              "{complaint.description}"
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span><strong className="text-slate-900">Location:</strong> {complaint.location}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span><strong className="text-slate-900">Reported By:</strong> {complaint.studentName || 'Student'}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span><strong className="text-slate-900">Reported At:</strong> {new Date(complaint.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Student Uploaded Images */}
            {complaint.imageUrls && complaint.imageUrls.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Student Attachments
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {complaint.imageUrls.map((img, i) => (
                    <img key={i} src={img} alt="Evidence" className="rounded-xl border border-slate-200 aspect-video object-cover" />
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default MaintenanceComplaintDetailPage;
