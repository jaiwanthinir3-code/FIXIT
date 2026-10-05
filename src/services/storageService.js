/**
 * Firebase Storage Service
 * Handles all file uploads for complaint images and resolution evidence
 */
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../firebase/firebaseConfig';

/**
 * Upload a single file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g. "complaints/CMP-001/reported/")
 * @param {function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<string>} Download URL
 */
export async function uploadFileToStorage(file, path, onProgress) {
  if (!isFirebaseConfigured || !storage) {
    throw new Error("Firebase Storage is not configured.");
  }

  const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storageRef = ref(storage, `${path}${filename}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error("Storage upload error:", error);
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

/**
 * Upload multiple complaint images
 * @param {FileList|File[]} files
 * @param {string} complaintId
 * @param {string} type - 'reported' or 'resolution'
 * @param {function} onProgress
 * @returns {Promise<string[]>} Array of download URLs
 */
export async function uploadComplaintImages(files, complaintId, type = 'reported', onProgress) {
  if (!files || files.length === 0) return [];

  const fileArray = Array.from(files);
  const path = `complaints/${complaintId}/${type}/`;

  const uploadPromises = fileArray.map((file, index) =>
    uploadFileToStorage(file, path, (progress) => {
      if (onProgress) {
        // Report average progress across all files
        onProgress(Math.round(progress / fileArray.length));
      }
    })
  );

  return await Promise.all(uploadPromises);
}
