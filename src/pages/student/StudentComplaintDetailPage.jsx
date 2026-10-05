import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscribeComplaintById } from '../../services/complaintService';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ProgressTimeline from '../../components/common/ProgressTimeline';
import AIAnalysisCard from '../../components/common/AIAnalysisCard';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  Star, 
  Wrench, 
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

export function StudentComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitFeedback } = useComplaints();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeComplaintById(id, (data) => {
      setComplaint(data);
      setLoading(false);
      if (data?.rating) {
        setRating(data.rating);
        setFeedbackText(data.feedbackText || '');
        setFeedbackSubmitted(true);
      }
    });
    return () => unsubscribe && unsubscribe();
  }, [id]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    await submitFeedback(id, rating, feedbackText, user);
    setFeedbackSubmitted(true);
  };

  if (loading) {
    return <LoadingState message="Fetching live complaint tracking status..." submessage="Connecting to Firestore real-time listener..." />;
  }

  if (!complaint) {
    return (
      <ErrorState 
        message={`Complaint ${id} was not found.`} 
        onRetry={() => navigate('/student/dashboard')} 
      />
    );
  }

  const isCompleted = complaint.status === 'COMPLETED';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/dashboard')}
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

      {/* Interactive Progress Timeline */}
      <ProgressTimeline 
        status={complaint.status} 
        createdAt={complaint.createdAt} 
        updatedAt={complaint.updatedAt}
        resolvedAt={complaint.resolvedAt}
      />

      {/* Main Grid: Left Details & Right AI Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Issue Info & Maintenance Notes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Issue Overview Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Complaint Information</h3>
            
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              "{complaint.description}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Location</span>
                  <span className="font-bold text-slate-900">{complaint.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Assigned Maintenance Staff</span>
                  <span className="font-bold text-slate-900">{complaint.assignedStaffName || 'Ravi Kumar'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Reported Date</span>
                  <span className="font-medium text-slate-800">{new Date(complaint.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Expected SLA Resolution</span>
                  <span className="font-medium text-slate-800">{new Date(complaint.expectedResolutionDate).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Issue Uploaded Photos */}
            {complaint.imageUrls && complaint.imageUrls.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Issue Photos
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {complaint.imageUrls.map((img, i) => (
                    <img key={i} src={img} alt="Issue" className="rounded-xl border border-slate-200 aspect-video object-cover" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Maintenance Technician Progress & Evidence */}
          {(complaint.diagnosis || complaint.actionTaken || (complaint.resolutionImageUrls && complaint.resolutionImageUrls.length > 0)) && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-600" />
                <span>Maintenance Staff Repair Notes & Evidence</span>
              </h3>

              {complaint.diagnosis && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase mb-1">Technician Diagnosis</h4>
                  <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                    {complaint.diagnosis}
                  </p>
                </div>
              )}

              {complaint.actionTaken && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase mb-1">Action Taken</h4>
                  <p className="text-xs text-slate-800 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 font-medium">
                    {complaint.actionTaken}
                  </p>
                </div>
              )}

              {/* Resolution Images */}
              {complaint.resolutionImageUrls && complaint.resolutionImageUrls.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase mb-2">Resolution Proof Photos (After Repair)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {complaint.resolutionImageUrls.map((img, i) => (
                      <img key={i} src={img} alt="Resolution" className="rounded-xl border border-emerald-200 aspect-video object-cover shadow-2xs" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Student Feedback Form (Shown when COMPLETED) */}
          {isCompleted && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-950">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold">Was your issue resolved?</h3>
              </div>

              {feedbackSubmitted ? (
                <div className="p-4 bg-white/90 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-medium">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    ✓ Feedback Recorded! Rating: {rating} / 5 Stars
                  </p>
                  {feedbackText && <p className="italic text-slate-700">"{feedbackText}"</p>}
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  {/* Star Rating Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Rate Resolution Satisfaction (1 to 5 Stars)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Optional feedback comments for the maintenance team..."
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Submit Resolution Feedback
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Right 1 Col: ✨ AI COMPLAINT MANAGER */}
        <div>
          <AIAnalysisCard complaint={complaint} />
        </div>

      </div>
    </div>
  );
}

export default StudentComplaintDetailPage;
