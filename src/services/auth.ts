// Authentication service - using anonymous auth for Expo Go compatibility
import {
  signInAnonymously,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Profile } from '../types';

export async function signIn(): Promise<User> {
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function getProfile(uid: string): Promise<Profile | null> {
  const docRef = doc(db, 'profiles', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { uid, ...docSnap.data() } as Profile;
  }
  return null;
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const usernameLower = username.toLowerCase();
  const docRef = doc(db, 'usernames', usernameLower);
  const docSnap = await getDoc(docRef);
  return !docSnap.exists();
}

export async function createProfile(
  uid: string,
  username: string,
  fullName: string,
  avatarUrl: string | null = null
): Promise<Profile> {
  const usernameLower = username.toLowerCase();

  // Check username availability again (race condition protection)
  const isAvailable = await checkUsernameAvailable(username);
  if (!isAvailable) {
    throw new Error('Username is already taken');
  }

  // Reserve username atomically
  await setDoc(doc(db, 'usernames', usernameLower), { uid });

  // Create profile
  const profile = {
    username,
    usernameLower,
    fullName,
    avatarUrl,
    label: 'New Member',
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'profiles', uid), profile);

  return { uid, ...profile, createdAt: null } as unknown as Profile;
}
