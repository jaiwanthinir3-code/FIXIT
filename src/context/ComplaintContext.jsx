import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  subscribeComplaints,
  subscribeStudentComplaints,
  createComplaint,
  updateComplaintProgress,
  submitFeedback
} from '../services/complaintService';
import { generateAIInsights } from '../services/aiService';
import { useAuth } from './AuthContext';

const ComplaintContext = createContext();

export function ComplaintProvider({ children }) {
  const { user, isStudent, isStaff } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setComplaints([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let unsubscribe;

    try {
      if (isStudent) {
        // Students only see their own complaints
        unsubscribe = subscribeStudentComplaints(
          user.uid,
          (data) => {
            setComplaints(data);
            setLoading(false);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          }
        );
      } else if (isStaff) {
        // Maintenance staff sees all complaints
        unsubscribe = subscribeComplaints(
          (data) => {
            setComplaints(data);
            setLoading(false);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          }
        );
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }

    return () => unsubscribe && unsubscribe();
  }, [user, isStudent, isStaff]);

  // Generate AI insights whenever complaints change
  useEffect(() => {
    if (complaints.length > 0) {
      setInsightsLoading(true);
      try {
        const result = generateAIInsights(complaints);
        setInsights(result);
      } catch (err) {
        console.warn("Insights generation error:", err);
      } finally {
        setInsightsLoading(false);
      }
    } else {
      setInsights([]);
    }
  }, [complaints]);

  const handleCreateComplaint = async (formData, user, uploadedImageUrls) => {
    return await createComplaint(formData, user, uploadedImageUrls || []);
  };

  const handleUpdateStatus = async (complaintId, updates, user) => {
    return await updateComplaintProgress(complaintId, updates, user);
  };

  const handleSubmitFeedback = async (complaintId, rating, feedbackText, user) => {
    return await submitFeedback(complaintId, rating, feedbackText, user);
  };

  return (
    <ComplaintContext.Provider value={{
      complaints,
      loading,
      error,
      insights,
      insightsLoading,
      createComplaint: handleCreateComplaint,
      updateComplaintStatus: handleUpdateStatus,
      submitFeedback: handleSubmitFeedback
    }}>
      {children}
    </ComplaintContext.Provider>
  );
}

export const useComplaints = () => useContext(ComplaintContext);
