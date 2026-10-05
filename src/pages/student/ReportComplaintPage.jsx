import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { uploadComplaintImages } from '../../services/storageService';
import { isFirebaseConfigured } from '../../firebase/firebaseConfig';
import AIAnalysisCard from '../../components/common/AIAnalysisCard';
import LoadingState from '../../components/common/LoadingState';
import { Sparkles, Send, ArrowLeft, CheckCircle2, UploadCloud, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

export function ReportComplaintPage() {
  const { createComplaint } = useComplaints();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    building: 'Academic Block A',
    floor: 'Floor 2',
    room: 'Room 204',
    studentPriority: 'MEDIUM'
  });

  const [selectedFiles, setSelectedFiles] = useState([]); // File objects
  const [filePreviews, setFilePreviews] = useState([]); // data URL previews

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState(''); // 'uploading' | 'analyzing' | 'saving'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createdComplaint, setCreatedComplaint] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [error, setError] = useState('');

  const categories = [
    'Electrical', 'Plumbing', 'Water Leakage', 'Furniture', 'Classroom',
    'Laboratory', 'Cleaning', 'Internet / Network', 'Infrastructure', 'Safety', 'Other'
  ];

  const buildings = [
    'Academic Block A', 'Academic Block B', 'Academic Block C',
    'Hostel Block A', 'Hostel Block B', 'Laboratory Block',
    'Central Library', 'Student Dining Hall', 'Sports Complex'
  ];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...selectedFiles, ...files].slice(0, 4); // max 4 files
    setSelectedFiles(newFiles);

    // Generate previews
    newFiles.forEach((file, idx) => {
      if (!filePreviews[idx]) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews(prev => {
            const updated = [...prev];
            updated[idx] = reader.result;
            return updated;
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) { setError("Please provide an issue title."); return; }
    if (!formData.description.trim()) { setError("Please describe the issue."); return; }
    if (!user?.uid) { setError("You must be logged in to submit a complaint."); return; }

    setIsSubmitting(true);
    setDuplicateWarning(null);

    try {
      let uploadedImageUrls = [];

      // Phase 1: Upload images to Firebase Storage
      if (selectedFiles.length > 0) {
        setSubmitPhase('uploading');
        if (isFirebaseConfigured) {
          // Generate a temporary ID for the storage path
          const tempId = `temp_${Date.now()}`;
          uploadedImageUrls = await uploadComplaintImages(
            selectedFiles,
            tempId,
            'reported',
            (progress) => setUploadProgress(progress)
          );
        } else {
          // Fallback: use local data URLs (dev only)
          uploadedImageUrls = filePreviews;
        }
      }

      // Phase 2: AI Analysis
      setSubmitPhase('analyzing');

      // Phase 3: Save to Firestore
      setSubmitPhase('saving');
      const result = await createComplaint(formData, user, uploadedImageUrls);

      // Check for AI duplicate warning
      if (result.aiDuplicateMatch && result.aiDuplicateConfidence >= 65) {
        setDuplicateWarning({
          matchId: result.aiDuplicateMatch,
          confidence: result.aiDuplicateConfidence
        });
      }

      setCreatedComplaint(result);
    } catch (err) {
      console.error("Complaint submission failed:", err);
      setError(err.message || "Unable to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
      setSubmitPhase('');
      setUploadProgress(0);
    }
  };

  const getLoadingMessage = () => {
    switch (submitPhase) {
      case 'uploading': return `Uploading images... ${uploadProgress}%`;
      case 'analyzing': return 'AI is analyzing your complaint...';
      case 'saving': return 'Saving your complaint...';
      default: return 'Submitting complaint...';
    }
  };

  const getLoadingSubmessage = () => {
    switch (submitPhase) {
      case 'uploading': return 'Securely uploading your evidence photos to Firebase Storage.';
      case 'analyzing': return 'Evaluating safety risk, determining technical priority, and matching optimal maintenance staff.';
      case 'saving': return 'Storing your complaint in Firestore and notifying the assigned maintenance team.';
      default: return '';
    }
  };

  if (isSubmitting) {
    return (
      <LoadingState
        message={getLoadingMessage()}
        submessage={getLoadingSubmessage()}
      />
    );
  }

  if (createdComplaint) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-6">
          <div className="flex items-center gap-3 bg-emerald-50 text-emerald-900 p-4 rounded-2xl border border-emerald-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold">Complaint #{createdComplaint.id} Successfully Logged!</h3>
              <p className="text-xs text-emerald-800">
                Your issue has been processed by the FIXIT AI Manager and assigned to the maintenance team.
              </p>
            </div>
          </div>

          {/* Duplicate Warning */}
          {duplicateWarning && (
            <div className="flex items-start gap-3 bg-amber-50 text-amber-900 p-4 rounded-2xl border border-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">Possible Duplicate Complaint Detected</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  AI detected a similar existing complaint (<span className="font-mono font-bold">#{duplicateWarning.matchId}</span>) with{' '}
                  <span className="font-bold">{duplicateWarning.confidence}%</span> similarity. Your complaint has still been filed as a separate issue.
                </p>
              </div>
            </div>
          )}

          <AIAnalysisCard complaint={createdComplaint} />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setCreatedComplaint(null);
                setFormData({ title: '', description: '', category: '', building: 'Academic Block A', floor: 'Floor 2', room: 'Room 204', studentPriority: 'MEDIUM' });
                setSelectedFiles([]);
                setFilePreviews([]);
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Report Another Issue
            </button>

            <button
              onClick={() => navigate(`/student/complaint/${createdComplaint.id}`)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Track Complaint Progress →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          AI Autonomous Routing Active
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">Report Campus Maintenance Issue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Describe what is broken. AI will automatically classify, prioritize, detect duplicate complaints, and route to the correct repair team.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Issue Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Broken Fan Rattling Loudly / Water Dripping from Sink"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide details about what is wrong, exact location hints, or safety concerns..."
              className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Building</label>
              <select
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {buildings.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Floor</label>
              <input
                type="text"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="e.g. Floor 2"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Room / Spot</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g. Room 204"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category (Optional — AI auto-detects)
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Auto-Detect via AI</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Priority Assessment
              </label>
              <select
                value={formData.studentPriority}
                onChange={(e) => setFormData({ ...formData, studentPriority: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="LOW">Low (Minor inconvenience)</option>
                <option value="MEDIUM">Medium (Normal repair)</option>
                <option value="HIGH">High (Impacts daily study/rest)</option>
                <option value="CRITICAL">Critical (Safety hazard)</option>
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Attach Issue Photos (Optional — AI Visual Analysis)
            </label>

            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/50 rounded-2xl p-4 text-center transition-colors relative cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={selectedFiles.length >= 4}
              />
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">Click or drag photos here to attach</p>
                <p className="text-[11px] text-slate-500 mt-0.5">PNG, JPG, WEBP — Max 4 photos</p>
              </div>
            </div>

            {filePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {filePreviews.map((url, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group bg-slate-900">
                    <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-violet-200" />
            <span>Submit & Analyze with AI</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReportComplaintPage;
