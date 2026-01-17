import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Profile } from '../types';

const USERNAME_DOMAIN = 'users.projectlocked.com';

const usernameToEmail = (username: string) =>
  `${username.toLowerCase().trim()}@${USERNAME_DOMAIN}`;

export async function signIn(username: string, password: string): Promise<User> {
  const usernameLower = username.toLowerCase().trim();
  const docRef = doc(db, 'usernames', usernameLower);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Username not found');
  }

  const { email } = docSnap.data();
  if (!email) {
    throw new Error('Email not found for this username');
  }

  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUp(email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
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
  avatarUrl: string | null = null,
  email: string | null = null
): Promise<Profile> {
  const usernameLower = username.toLowerCase();

  // Check username availability again (race condition protection)
  const isAvailable = await checkUsernameAvailable(username);
  if (!isAvailable) {
    throw new Error('Username is already taken');
  }

  // Reserve username atomically and store email for login lookup
  await setDoc(doc(db, 'usernames', usernameLower), { uid, email });

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
