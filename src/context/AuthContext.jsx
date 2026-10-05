import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/firebaseConfig';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pendingProfileUids = useRef(new Set());
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      console.warn("Firebase not configured — authentication unavailable.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          // Fetch user role and profile from Firestore
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: userData.name || fbUser.displayName || fbUser.email,
              name: userData.name || fbUser.displayName,
              role: userData.role, // 'student' or 'maintenance'
              department: userData.department || '',
              specialization: userData.specialization || '',
              availability: userData.availability || true,
              activeComplaintCount: userData.activeComplaintCount || 0,
              createdAt: userData.createdAt
            });
          } else {
            // During registration, Firebase Auth may fire before
            // the Firestore profile has been created.
            if (pendingProfileUids.current.has(fbUser.uid)) {
              console.log("Waiting for Firestore profile to be created...");
              return;
            }

            console.warn("User document not found in Firestore.");
            setUser(null);
          }
        } catch (err) {
          console.error("Error fetching user document:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Student Registration
   */
  const registerStudent = async (email, password, name) => {
    if (!isFirebaseConfigured || !auth || !db) {
      throw new Error("Firebase is not configured. Please set up your .env file.");
    }

    setLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const { uid } = credential.user;

      // Tell the auth listener that this user is currently
      // waiting for their Firestore profile.
      pendingProfileUids.current.add(uid);

      // Update Firebase Auth display name
      await updateProfile(credential.user, {
        displayName: name
      });

      // Create the user's Firestore profile
      await setDoc(doc(db, 'users', uid), {
        uid,
        name,
        email,
        role: 'student',
        createdAt: serverTimestamp()
      });

      // Remove from pending registrations
      pendingProfileUids.current.delete(uid);

      // Set application user state immediately
      setUser({
        uid,
        email,
        displayName: name,
        name,
        role: 'student',
        department: '',
        specialization: '',
        availability: true,
        activeComplaintCount: 0,
        createdAt: null
      });

      setLoading(false);

      return credential.user;

    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  /**
   * Login with Email + Password
   */
  const loginWithEmailPassword = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured. Please add your Firebase credentials to .env file.");
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will update user state
    } catch (err) {
      setLoading(false);
      // Map Firebase auth errors to friendly messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error("Invalid email or password. Please check your credentials.");
      } else if (err.code === 'auth/too-many-requests') {
        throw new Error("Too many failed login attempts. Please try again later.");
      } else if (err.code === 'auth/user-disabled') {
        throw new Error("This account has been disabled. Please contact support.");
      }
      throw err;
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Sign out error:", err);
      }
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      registerStudent,
      loginWithEmailPassword,
      logout,
      isStudent: user?.role === 'student',
      isStaff: user?.role === 'maintenance',
      isConfigured: isFirebaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
