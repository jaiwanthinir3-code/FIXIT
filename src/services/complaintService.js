import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

import { db, isFirebaseConfigured } from '../firebase/firebaseConfig';
import { analyzeComplaintWithAI } from './aiService';


// ─────────────────────────────────────────────────────────────────────────────
// Guards
// ─────────────────────────────────────────────────────────────────────────────

function requireFirestore() {
  if (!isFirebaseConfigured || !db) {
    throw new Error(
      "Firebase Firestore is not configured. " +
      "Please add your Firebase credentials to .env and restart the dev server."
    );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// ID Generation
// ─────────────────────────────────────────────────────────────────────────────

async function generateComplaintId() {
  try {
    const snapshot = await getDocs(
      collection(db, 'complaints')
    );

    const count = snapshot.size;

    const paddedNum = String(1000 + count + 1);

    return `CMP-${paddedNum}`;

  } catch (err) {

    console.warn(
      "Could not count complaints. Using timestamp ID:",
      err.message
    );

    // Fallback ID generation
    return `CMP-${Date.now()}`;
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// Subscriptions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subscribe to all complaints
 * Used by maintenance staff
 */
export function subscribeComplaints(callback, onError) {
  requireFirestore();

  const q = query(
    collection(db, 'complaints'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,

    (snapshot) => {

      const list = snapshot.docs.map(d =>
        normalizeComplaint({
          id: d.id,
          ...d.data()
        })
      );

      callback(list);
    },

    (err) => {

      console.error(
        "Firestore complaints subscription error:",
        err
      );

      if (onError) {
        onError(err);
      } else {
        callback([]);
      }
    }
  );
}


/**
 * Subscribe to complaints for a specific student
 */
export function subscribeStudentComplaints(studentId, callback, onError) {
  try {
    requireFirestore();

    const q = query(
      collection(db, 'complaints'),
      where('studentId', '==', studentId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const complaints = snapshot.docs
          .map((docSnap) =>
            normalizeComplaint({
              id: docSnap.id,
              ...docSnap.data()
            })
          )
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
          });

        console.log(
          'Student complaints updated:',
          complaints.length,
          complaints
        );

        callback(complaints);
      },
      (error) => {
        console.error('Firestore student complaints error:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('Failed to subscribe to student complaints:', error);
    if (onError) onError(error);
    return () => { };
  }
}


/**
 * Subscribe to complaints assigned to a specific maintenance staff member
 */
export function subscribeStaffComplaints(
  staffId,
  callback,
  onError
) {
  requireFirestore();

  const q = query(
    collection(db, 'complaints'),
    where('assignedStaffId', '==', staffId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,

    (snapshot) => {

      const list = snapshot.docs.map(d =>
        normalizeComplaint({
          id: d.id,
          ...d.data()
        })
      );

      callback(list);
    },

    (err) => {

      console.error(
        "Firestore staff complaints error:",
        err
      );

      if (onError) {
        onError(err);
      } else {
        callback([]);
      }
    }
  );
}


/**
 * Subscribe to a single complaint by ID
 */
export function subscribeComplaintById(
  complaintId,
  callback,
  onError
) {
  requireFirestore();

  const docRef = doc(
    db,
    'complaints',
    complaintId
  );

  return onSnapshot(
    docRef,

    (snap) => {

      if (snap.exists()) {

        callback(
          normalizeComplaint({
            id: snap.id,
            ...snap.data()
          })
        );

      } else {

        callback(null);
      }
    },

    (err) => {

      console.error(
        "Firestore complaint subscription error:",
        err
      );

      if (onError) {
        onError(err);
      } else {
        callback(null);
      }
    }
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Create Complaint
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new complaint with AI analysis and Firestore storage
 */
export async function createComplaint(
  formData,
  user,
  uploadedImageUrls = []
) {

  requireFirestore();

  if (!user?.uid) {
    throw new Error(
      "User must be authenticated to submit a complaint."
    );
  }


  // ──────────────────────────────────────────────────────────────────────────
  // 1. Fetch existing complaints for duplicate detection
  // ──────────────────────────────────────────────────────────────────────────

  let existingComplaints = [];

  try {

    const recentQuery = query(
      collection(db, 'complaints'),
      where('status', '!=', 'COMPLETED'),
      orderBy('status'),
      orderBy('createdAt', 'desc')
    );

    const snap = await getDocs(recentQuery);

    existingComplaints = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

  } catch (err) {

    console.warn(
      "Could not fetch existing complaints for duplicate check:",
      err.message
    );
  }


  // ──────────────────────────────────────────────────────────────────────────
  // 2. AI Analysis
  // ──────────────────────────────────────────────────────────────────────────

  let aiResult;

  try {

    aiResult = await analyzeComplaintWithAI(
      {
        ...formData,
        imageUrls: uploadedImageUrls
      },
      existingComplaints
    );

    console.log(
      "🤖 AI analysis completed:",
      aiResult
    );

  } catch (err) {

    console.error(
      "❌ AI analysis failed:",
      err
    );

    // Safe fallback
    aiResult = {
      aiCategory: formData.category || 'Infrastructure',
      aiPriority: 'MEDIUM',
      safetyRisk: 'MEDIUM',
      recommendedTeam: 'Infrastructure',
      priorityReason:
        'AI analysis was unavailable. Manual inspection is recommended.',
      suggestedAction:
        'Conduct physical inspection and diagnose the issue.',
      aiVisualObservations:
        'Visual inspection recommended upon technician arrival.',
      aiDuplicateMatch: null,
      aiDuplicateConfidence: 0,
      aiStatus: 'FALLBACK'
    };
  }


  // ──────────────────────────────────────────────────────────────────────────
  // 3. Find available maintenance staff
  // ──────────────────────────────────────────────────────────────────────────

  let assignedStaffId = null;
  let assignedStaffName = null;

  try {

    const staffQuery = query(
      collection(db, 'users'),
      where('role', '==', 'maintenance'),
      where('availability', '==', true)
    );

    const staffSnap = await getDocs(staffQuery);

    const staffList = staffSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));


    // Match staff specialization with recommended team

    const teamLower =
      (aiResult.recommendedTeam || '')
        .toLowerCase();


    const matching = staffList.filter(s => {

      const specialization =
        (s.specialization || '')
          .toLowerCase();

      return (
        specialization.includes(teamLower) ||
        teamLower.includes(specialization)
      );
    });


    const pool =
      matching.length > 0
        ? matching
        : staffList;


    // Sort by workload

    pool.sort(
      (a, b) =>
        (a.activeComplaintCount || 0) -
        (b.activeComplaintCount || 0)
    );


    // Select staff

    if (pool.length > 0) {

      assignedStaffId =
        pool[0].uid || pool[0].id;

      assignedStaffName =
        pool[0].name ||
        pool[0].displayName;

      console.log(
        "👷 Complaint assigned to:",
        assignedStaffName
      );
    }

  } catch (err) {

    console.warn(
      "Staff assignment query failed:",
      err.message
    );

    // Complaint can still be created without staff assignment
    assignedStaffId = null;
    assignedStaffName = null;
  }


  // ──────────────────────────────────────────────────────────────────────────
  // 4. Generate complaint ID
  // ──────────────────────────────────────────────────────────────────────────

  const complaintId =
    await generateComplaintId();


  console.log(
    "🆔 Generated complaint ID:",
    complaintId
  );


  // ──────────────────────────────────────────────────────────────────────────
  // 5. Calculate SLA deadline
  // ──────────────────────────────────────────────────────────────────────────

  const slaHours = {
    CRITICAL: 6,
    HIGH: 12,
    MEDIUM: 24,
    LOW: 48
  };


  const expectedResolutionDate =
    Timestamp.fromDate(
      new Date(
        Date.now() +
        (
          slaHours[aiResult.aiPriority] || 24
        ) *
        3600 *
        1000
      )
    );


  // ──────────────────────────────────────────────────────────────────────────
  // 6. Build complaint document
  // ──────────────────────────────────────────────────────────────────────────

  const complaintDoc = {

    // Basic complaint information

    title:
      formData.title || '',

    description:
      formData.description || '',


    // Student information

    studentId:
      user.uid,

    studentName:
      user.name ||
      user.displayName ||
      user.email,


    // Category

    category:
      formData.category ||
      aiResult.aiCategory,

    aiCategory:
      aiResult.aiCategory,


    // Location

    building:
      formData.building || '',

    floor:
      formData.floor || '',

    room:
      formData.room || '',

    location:
      `${formData.building || ''} - ${formData.floor || ''
      } (${formData.room || ''})`,


    // Priority

    studentPriority:
      formData.studentPriority ||
      'MEDIUM',

    aiPriority:
      aiResult.aiPriority ||
      'MEDIUM',

    priorityReason:
      aiResult.priorityReason ||
      '',

    safetyRisk:
      aiResult.safetyRisk ||
      'MEDIUM',


    // Team

    recommendedTeam:
      aiResult.recommendedTeam ||
      'Infrastructure',


    // Staff assignment

    assignedStaffId:
      assignedStaffId,

    assignedStaffName:
      assignedStaffName,


    // Status

    status:
      'NOT_STARTED',


    // Timestamps

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),

    resolvedAt:
      null,

    expectedResolutionDate:
      expectedResolutionDate,


    // Images

    imageUrls:
      uploadedImageUrls,

    resolutionImageUrls:
      [],


    // Resolution information

    diagnosis:
      '',

    actionTaken:
      '',

    resolutionNotes:
      '',


    // AI information

    aiRecommendation:
      aiResult.suggestedAction ||
      '',

    aiVisualObservations:
      aiResult.aiVisualObservations ||
      '',

    aiDuplicateMatch:
      aiResult.aiDuplicateMatch ||
      null,

    aiDuplicateConfidence:
      aiResult.aiDuplicateConfidence ||
      0,

    aiStatus:
      aiResult.aiStatus ||
      'SUCCESS',

    aiAnalyzedAt:
      serverTimestamp(),


    // Inspection

    inspectionStatus:
      'Pending'
  };


  // ──────────────────────────────────────────────────────────────────────────
  // 7. SAVE COMPLAINT TO FIRESTORE
  // ──────────────────────────────────────────────────────────────────────────

  try {

    console.log(
      "🔥 Saving complaint to Firestore:",
      complaintId
    );

    console.log(
      "🔥 Complaint data:",
      complaintDoc
    );


    await setDoc(
      doc(
        db,
        'complaints',
        complaintId
      ),
      complaintDoc
    );


    console.log(
      "✅ Complaint saved successfully:",
      complaintId
    );

  } catch (err) {

    console.error(
      "❌ FAILED TO SAVE COMPLAINT:",
      err
    );

    console.error(
      "❌ Error code:",
      err.code
    );

    console.error(
      "❌ Error message:",
      err.message
    );


    throw new Error(
      `Complaint could not be saved: ${err.message}`
    );
  }


  // ──────────────────────────────────────────────────────────────────────────
  // 8. Create complaint update history
  // ──────────────────────────────────────────────────────────────────────────

  try {

    await addDoc(
      collection(db, 'complaint_updates'),
      {
        complaintId,

        status:
          'NOT_STARTED',

        updatedBy:
          user.uid,

        updatedByName:
          user.name ||
          user.displayName,

        role:
          'student',

        note:
          'Complaint submitted and AI-analyzed.',

        timestamp:
          serverTimestamp()
      }
    );

  } catch (err) {

    console.warn(
      "Could not create complaint update:",
      err.message
    );
  }


  // ──────────────────────────────────────────────────────────────────────────
  // 9. Create notifications
  // ──────────────────────────────────────────────────────────────────────────

  const notifPromises = [];


  // Student notification

  notifPromises.push(
    addDoc(
      collection(db, 'notifications'),
      {
        userId:
          user.uid,

        title:
          `Complaint ${complaintId} Submitted`,

        message:
          `AI classified your issue as ${aiResult.aiCategory} with ${aiResult.aiPriority} priority.`,

        type:
          'AI_CLASSIFICATION',

        complaintId,

        read:
          false,

        createdAt:
          serverTimestamp()
      }
    )
  );


  // Staff notification

  if (assignedStaffId) {

    notifPromises.push(
      addDoc(
        collection(db, 'notifications'),
        {
          userId:
            assignedStaffId,

          title:
            `New ${aiResult.aiPriority} Complaint Assigned`,

          message:
            `${complaintId}: ${formData.title} at ${formData.building} - ${formData.room}.`,

          type:
            aiResult.aiPriority === 'CRITICAL'
              ? 'ESCALATION'
              : 'ASSIGNMENT',

          complaintId,

          read:
            false,

          createdAt:
            serverTimestamp()
        }
      )
    );
  }


  // ──────────────────────────────────────────────────────────────────────────
  // 10. Update staff workload
  // ──────────────────────────────────────────────────────────────────────────

  if (assignedStaffId) {

    try {

      const staffRef =
        doc(
          db,
          'users',
          assignedStaffId
        );


      const staffSnap =
        await getDoc(staffRef);


      if (staffSnap.exists()) {

        const currentCount =
          staffSnap.data()
            .activeComplaintCount || 0;


        await updateDoc(
          staffRef,
          {
            activeComplaintCount:
              currentCount + 1
          }
        );
      }

    } catch (err) {

      console.warn(
        "Could not update staff workload:",
        err.message
      );
    }
  }


  // Wait for notifications

  try {

    await Promise.all(
      notifPromises
    );

  } catch (err) {

    console.warn(
      "Could not create notifications:",
      err.message
    );
  }


  // ──────────────────────────────────────────────────────────────────────────
  // Return created complaint
  // ──────────────────────────────────────────────────────────────────────────

  return {
    id: complaintId,
    ...complaintDoc
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Update Complaint
// ─────────────────────────────────────────────────────────────────────────────

export async function updateComplaintProgress(
  complaintId,
  updates,
  updatedByUser
) {

  requireFirestore();


  const complaintRef =
    doc(
      db,
      'complaints',
      complaintId
    );


  const snap =
    await getDoc(
      complaintRef
    );


  if (!snap.exists()) {

    throw new Error(
      `Complaint ${complaintId} not found in Firestore.`
    );
  }


  const current =
    snap.data();


  const previousStatus =
    current.status;


  const updatePayload = {
    ...updates,
    updatedAt:
      serverTimestamp()
  };


  // Set resolvedAt when completed

  if (
    updates.status === 'COMPLETED' &&
    !current.resolvedAt
  ) {

    updatePayload.resolvedAt =
      serverTimestamp();
  }


  // Update complaint

  await updateDoc(
    complaintRef,
    updatePayload
  );


  // Record update history

  try {

    await addDoc(
      collection(
        db,
        'complaint_updates'
      ),
      {

        complaintId,

        status:
          updates.status ||
          current.status,

        updatedBy:
          updatedByUser?.uid ||
          'system',

        updatedByName:
          updatedByUser?.name ||
          updatedByUser?.displayName ||
          'Staff',

        role:
          updatedByUser?.role ||
          'maintenance',

        note:
          updates.actionTaken ||
          updates.diagnosis ||
          `Status updated to ${updates.status ||
          current.status
          }`,

        timestamp:
          serverTimestamp()
      }
    );

  } catch (err) {

    console.warn(
      "Could not create update history:",
      err.message
    );
  }


  // Notify student when status changes

  if (
    updates.status &&
    updates.status !== previousStatus
  ) {

    const statusMessages = {

      PENDING:
        'Your complaint is under review by maintenance staff.',

      IN_PROGRESS:
        `Maintenance staff ${updatedByUser?.name || ''
        } has started working on your complaint.`,

      COMPLETED:
        'Your complaint has been resolved. Please rate the service.'
    };


    try {

      await addDoc(
        collection(
          db,
          'notifications'
        ),
        {

          userId:
            current.studentId,

          title:
            `Complaint ${complaintId} — ${updates.status.replace(
              '_',
              ' '
            )
            }`,

          message:
            statusMessages[
            updates.status
            ] ||
            `Status updated to ${updates.status}.`,

          type:
            'STATUS_CHANGE',

          complaintId,

          read:
            false,

          createdAt:
            serverTimestamp()
        }
      );

    } catch (err) {

      console.warn(
        "Could not create status notification:",
        err.message
      );
    }


    // Reduce staff workload after completion

    if (
      updates.status === 'COMPLETED' &&
      current.assignedStaffId
    ) {

      try {

        const staffRef =
          doc(
            db,
            'users',
            current.assignedStaffId
          );


        const staffSnap =
          await getDoc(
            staffRef
          );


        if (staffSnap.exists()) {

          const count =
            staffSnap.data()
              .activeComplaintCount || 0;


          await updateDoc(
            staffRef,
            {
              activeComplaintCount:
                Math.max(
                  0,
                  count - 1
                )
            }
          );
        }

      } catch (err) {

        console.warn(
          "Could not update staff workload on completion:",
          err.message
        );
      }
    }
  }


  return {
    id: complaintId,
    ...current,
    ...updatePayload
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Feedback
// ─────────────────────────────────────────────────────────────────────────────

export async function submitFeedback(
  complaintId,
  rating,
  comment,
  user
) {

  requireFirestore();


  const complaintRef =
    doc(
      db,
      'complaints',
      complaintId
    );


  const snap =
    await getDoc(
      complaintRef
    );


  if (!snap.exists()) {

    throw new Error(
      `Complaint ${complaintId} not found.`
    );
  }


  const complaint =
    snap.data();


  if (
    complaint.studentId !== user?.uid
  ) {

    throw new Error(
      "You are not authorized to submit feedback for this complaint."
    );
  }


  if (
    complaint.status !== 'COMPLETED'
  ) {

    throw new Error(
      "Feedback can only be submitted for completed complaints."
    );
  }


  // Store feedback

  await addDoc(
    collection(
      db,
      'feedback'
    ),
    {

      complaintId,

      studentId:
        user.uid,

      rating,

      comment:
        comment || '',

      createdAt:
        serverTimestamp()
    }
  );


  // Update complaint

  await updateDoc(
    complaintRef,
    {

      rating,

      feedbackComment:
        comment || '',

      updatedAt:
        serverTimestamp()
    }
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────────────────

export function subscribeNotifications(userId, callback, onError) {
  try {
    requireFirestore();

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs
          .map((d) => {
            const data = d.data();

            let createdAt = null;

            if (data.createdAt?.toDate) {
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt) {
              createdAt = new Date(data.createdAt);
            }

            return {
              id: d.id,
              ...data,
              createdAt
            };
          })
          .sort((a, b) => {
            const dateA = a.createdAt
              ? a.createdAt.getTime()
              : 0;

            const dateB = b.createdAt
              ? b.createdAt.getTime()
              : 0;

            return dateB - dateA;
          });

        console.log(
          '🔔 Notifications updated:',
          notifications.length,
          notifications
        );

        callback(notifications);
      },
      (error) => {
        console.error(
          '❌ Notifications subscription error:',
          error
        );

        if (onError) {
          onError(error);
        } else {
          callback([]);
        }
      }
    );
  } catch (error) {
    console.error(
      '❌ Failed to subscribe to notifications:',
      error
    );

    if (onError) {
      onError(error);
    }

    return () => { };
  }
}
// ─────────────────────────────────────────────────────────────────────────────
// Mark Notification Read
// ─────────────────────────────────────────────────────────────────────────────

export async function markNotificationRead(
  notifId
) {

  requireFirestore();


  const notifRef =
    doc(
      db,
      'notifications',
      notifId
    );


  await updateDoc(
    notifRef,
    {
      read: true
    }
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Mark All Notifications Read
// ─────────────────────────────────────────────────────────────────────────────

export async function markAllNotificationsRead(
  userId
) {

  requireFirestore();


  const q =
    query(
      collection(
        db,
        'notifications'
      ),
      where(
        'userId',
        '==',
        userId
      ),
      where(
        'read',
        '==',
        false
      )
    );


  const snap =
    await getDocs(q);


  const updates =
    snap.docs.map(
      d =>
        updateDoc(
          doc(
            db,
            'notifications',
            d.id
          ),
          {
            read: true
          }
        )
    );


  await Promise.all(
    updates
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Complaint Updates History
// ─────────────────────────────────────────────────────────────────────────────

export function subscribeComplaintUpdates(
  complaintId,
  callback
) {

  requireFirestore();


  const q =
    query(
      collection(
        db,
        'complaint_updates'
      ),
      where(
        'complaintId',
        '==',
        complaintId
      ),
      orderBy(
        'timestamp',
        'asc'
      )
    );


  return onSnapshot(
    q,

    (snapshot) => {

      const updates =
        snapshot.docs.map(
          d => ({
            id: d.id,
            ...d.data()
          })
        );

      callback(updates);
    }
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize a complaint document from Firestore
 * Converts Firestore timestamps to ISO strings
 */
function normalizeComplaint(data) {

  const toISO = (val) => {

    if (!val) {
      return null;
    }


    if (val?.toDate) {
      return val
        .toDate()
        .toISOString();
    }


    if (typeof val === 'string') {
      return val;
    }


    return null;
  };


  return {

    ...data,

    createdAt:
      toISO(data.createdAt),

    updatedAt:
      toISO(data.updatedAt),

    resolvedAt:
      toISO(data.resolvedAt),

    aiAnalyzedAt:
      toISO(data.aiAnalyzedAt),

    expectedResolutionDate:
      toISO(
        data.expectedResolutionDate
      )
  };
}
