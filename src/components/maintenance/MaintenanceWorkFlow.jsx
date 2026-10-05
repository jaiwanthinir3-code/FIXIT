import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { uploadComplaintImages } from '../../services/storageService';
import { isFirebaseConfigured } from '../../firebase/firebaseConfig';
import {
  CheckCircle2,
  Wrench,
  Play,
  Camera,
  Loader2,
  AlertCircle,
  UploadCloud,
  X
} from 'lucide-react';

export function MaintenanceWorkFlow({ complaint }) {
  const { updateComplaintStatus } = useComplaints();
  const { user } = useAuth();

  const [diagnosis, setDiagnosis] = useState(complaint?.diagnosis || '');
  const [actionTaken, setActionTaken] = useState(complaint?.actionTaken || '');
  const [resolutionNotes, setResolutionNotes] = useState(complaint?.resolutionNotes || '');

  // Resolution image upload state
  const [resolutionFiles, setResolutionFiles] = useState([]);
  const [resolutionPreviews, setResolutionPreviews] = useState(complaint?.resolutionImageUrls || []);

  const [inspectionDone, setInspectionDone] = useState(
    complaint?.inspectionStatus === 'Inspected'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!complaint) return null;

  const isCompleted = complaint.status === 'COMPLETED';
  const isInProgress = complaint.status === 'IN_PROGRESS';

  const showTempMsg = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  const handleResolutionFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...resolutionFiles, ...files].slice(0, 4);
    setResolutionFiles(newFiles);

    // Generate previews for new files
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResolutionPreviews(prev => [...prev, reader.result].slice(0, 4));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveResolutionFile = (index) => {
    setResolutionFiles(prev => prev.filter((_, i) => i !== index));
    setResolutionPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadResolutionImages = async () => {
    if (resolutionFiles.length === 0) return resolutionPreviews;

    if (!isFirebaseConfigured) return resolutionPreviews;

    setIsUploading(true);
    try {
      const uploadedUrls = await uploadComplaintImages(
        resolutionFiles,
        complaint.id,
        'resolution',
        (progress) => setUploadProgress(progress)
      );
      // Merge with existing resolution images
      const existing = (complaint.resolutionImageUrls || []).filter(u => u.startsWith('http'));
      return [...existing, ...uploadedUrls];
    } catch (err) {
      console.error("Resolution image upload failed:", err);
      showError(`Image upload failed: ${err.message}`);
      return complaint.resolutionImageUrls || [];
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleMarkInspected = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      await updateComplaintStatus(complaint.id, {
        inspectionStatus: 'Inspected',
        status: 'PENDING',
        assignedStaffId: user?.uid || complaint.assignedStaffId,
        assignedStaffName: user?.name || user?.displayName || complaint.assignedStaffName
      }, user);
      setInspectionDone(true);
      showTempMsg("Marked as Inspected!");
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartWork = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      await updateComplaintStatus(complaint.id, {
        status: 'IN_PROGRESS',
        diagnosis: diagnosis || 'Inspected source issue on site.',
        inspectionStatus: 'Inspected',
        assignedStaffId: user?.uid || complaint.assignedStaffId,
        assignedStaffName: user?.name || user?.displayName || complaint.assignedStaffName
      }, user);
      showTempMsg("Status updated to IN PROGRESS!");
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProgress = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      const uploadedUrls = await uploadResolutionImages();
      await updateComplaintStatus(complaint.id, {
        diagnosis,
        actionTaken,
        resolutionNotes,
        resolutionImageUrls: uploadedUrls
      }, user);
      setResolutionFiles([]); // clear pending uploads
      showTempMsg("Work progress saved!");
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!actionTaken.trim()) {
      showError("Please enter the Action Taken before marking as completed.");
      return;
    }
    setIsSaving(true);
    setErrorMsg('');
    try {
      const uploadedUrls = await uploadResolutionImages();
      await updateComplaintStatus(complaint.id, {
        status: 'COMPLETED',
        diagnosis,
        actionTaken,
        resolutionNotes,
        resolutionImageUrls: uploadedUrls
      }, user);
      setResolutionFiles([]);
      showTempMsg("Complaint successfully COMPLETED!");
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600" />
            <span>Maintenance Staff Resolution Methodology</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">8-Step Guided Work Protocol</p>
        </div>
        {successMsg && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
            ✓ {successMsg}
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          {errorMsg}
        </div>
      )}

      <div className="space-y-6">

        {/* STEP 1: RECEIVE */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">1</div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">STEP 1 — RECEIVE COMPLAINT</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Review student description: <span className="font-semibold text-slate-900">"{complaint.description}"</span>
            </p>
          </div>
        </div>

        {/* STEP 2: INSPECT */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
              inspectionDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              2
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">STEP 2 — INSPECT ON-SITE</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Physically inspect: <span className="font-medium">{complaint.location}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleMarkInspected}
            disabled={inspectionDone || isSaving || isCompleted}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              inspectionDone
                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50'
            }`}
          >
            {inspectionDone ? '✓ Inspected' : 'Mark as Inspected'}
          </button>
        </div>

        {/* STEP 3: DIAGNOSE */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">3</div>
            <h4 className="text-xs font-bold text-slate-900">STEP 3 — DIAGNOSE / FINDINGS</h4>
          </div>
          <textarea
            rows={2}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Record diagnostic findings (e.g. Broken motor bearing, cracked PVC pipe, burnt switch terminal)..."
            disabled={isCompleted}
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* STEP 4: START WORK */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
              isInProgress || isCompleted ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              4
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">STEP 4 — START WORK</h4>
              <p className="text-xs text-slate-600">Transition complaint status to IN PROGRESS for student real-time visibility.</p>
            </div>
          </div>
          <button
            onClick={handleStartWork}
            disabled={isInProgress || isCompleted || isSaving}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              isInProgress || isCompleted
                ? 'bg-blue-100 text-blue-800 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs disabled:opacity-50'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isInProgress || isCompleted ? 'Status: In Progress' : 'Start Work (IN PROGRESS)'}</span>
          </button>
        </div>

        {/* STEP 5: ACTION TAKEN */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">5</div>
            <h4 className="text-xs font-bold text-slate-900">STEP 5 — REPAIR ACTION TAKEN</h4>
          </div>
          <textarea
            rows={2}
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
            placeholder="Describe action taken (e.g. Replaced motor bearing, sealed joint with PVC cement, tested speed regulation)..."
            disabled={isCompleted}
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* STEP 6: EVIDENCE PHOTOS */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">6</div>
            <h4 className="text-xs font-bold text-slate-900">STEP 6 — RESOLUTION EVIDENCE PHOTOS</h4>
          </div>

          {!isCompleted && (
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white rounded-2xl p-4 text-center transition-colors relative cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleResolutionFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={resolutionPreviews.length >= 4}
              />
              <div className="flex flex-col items-center">
                <UploadCloud className="w-6 h-6 text-indigo-500 mb-1" />
                <p className="text-xs font-semibold text-slate-700">Click to upload after-repair photos</p>
                <p className="text-[11px] text-slate-500">PNG, JPG, WEBP — Max 4 photos</p>
                {isUploading && (
                  <div className="mt-2 w-full max-w-xs bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {resolutionPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {resolutionPreviews.map((url, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-emerald-200 aspect-video group bg-slate-900">
                  <img src={url} alt={`Resolution ${idx + 1}`} className="w-full h-full object-cover" />
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleRemoveResolutionFile(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* STEP 7: RESOLUTION NOTES */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">7</div>
            <h4 className="text-xs font-bold text-slate-900">STEP 7 — RESOLUTION NOTES</h4>
          </div>
          <textarea
            rows={2}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Additional notes for student (e.g. Room tested and confirmed functional for 15 mins at full load)..."
            disabled={isCompleted}
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* STEP 8: COMPLETE */}
        <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
              isCompleted ? 'bg-emerald-600 text-white' : 'bg-emerald-200 text-emerald-900'
            }`}>
              8
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">STEP 8 — VERIFY & COMPLETE</h4>
              <p className="text-xs text-emerald-800">Confirm resolution and update student tracking to COMPLETED.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleSaveProgress}
              disabled={isSaving || isCompleted || isUploading}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors disabled:opacity-50"
            >
              {isUploading ? `Uploading ${uploadProgress}%...` : 'Save Draft Progress'}
            </button>

            <button
              onClick={handleMarkCompleted}
              disabled={isSaving || isCompleted || isUploading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                isCompleted
                  ? 'bg-emerald-800 text-white cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50'
              }`}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{isCompleted ? '✓ Complaint Fully Completed' : 'Mark Complaint COMPLETED'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MaintenanceWorkFlow;
