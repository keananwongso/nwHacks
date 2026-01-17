// Auth state hook with profile loading
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { Profile } from '../types';
import { signIn, signUp, signOut, createProfile } from '../services/auth';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setupProfile: (username: string, fullName: string) => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Listen to profile when user is signed in
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      doc(db, 'profiles', user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setProfile({ uid: user.uid, ...docSnap.data() } as Profile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Profile snapshot error:', error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  const handleSignIn = async (username: string, password: string) => {
    setLoading(true);
    try {
      await signIn(username, password);
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
      throw error;
    }
  };

  const handleSignUp = async (username: string, password: string) => {
    setLoading(true);
    try {
      await signUp(username, password);
    } catch (error) {
      console.error('Sign up error:', error);
      setLoading(false);
      throw error;
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const setupProfile = async (username: string, fullName: string) => {
    if (!user) throw new Error('Not signed in');
    await createProfile(user.uid, username, fullName, user.photoURL, user.email);
  };

  return {
    user,
    profile,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    setupProfile,
  };
}
