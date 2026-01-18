// Firebase Storage service for proof photo uploads
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './firebase';

export async function uploadProofImage(
  localUri: string,
  sessionId: string,
  type: 'before' | 'after' | 'challenge'
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  // Convert local URI to blob
  const response = await fetch(localUri);
  const blob = await response.blob();

  // Create storage reference
  const filename = `${sessionId}_${type}_${Date.now()}.jpg`;
  const storageRef = ref(storage, `proof-photos/${user.uid}/${sessionId}/${filename}`);

  // Upload
  await uploadBytes(storageRef, blob);

  // Get download URL
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}
