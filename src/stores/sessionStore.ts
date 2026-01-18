// Zustand store for active session state
import { create } from 'zustand';
import { doc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { uploadProofImage } from '../services/storage';
import { ActiveSessionState, SessionTag, SessionStatus } from '../types';

// Generate a simple unique ID
const generateId = () =>
  `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useSessionStore = create<ActiveSessionState>((set, get) => ({
  sessionId: null,
  startedAt: null,
  durationMin: 0,
  tag: null,
  note: '',
  beforeProofUrl: null,
  status: null,

  startSession: async (
    durationMin: number,
    tag: SessionTag,
    note: string,
    username: string,
    avatarUrl: string | null
  ) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const sessionId = generateId();
    const startedAt = new Date();

    // Create session document
    await setDoc(doc(db, 'sessions', sessionId), {
      userId: user.uid,
      username,
      avatarUrl,
      startedAt: Timestamp.fromDate(startedAt),
      endedAt: null,
      durationMin,
      tag,
      note,
      status: 'active' as SessionStatus,
      beforeProofUrl: null,
      afterProofUrl: null,
      reactionCount: 0,
    });

    set({
      sessionId,
      startedAt,
      durationMin,
      tag,
      note,
      beforeProofUrl: null,
      status: 'active',
    });

    return sessionId;
  },

  submitBeforeProof: async (imageUri: string) => {
    const { sessionId } = get();
    const user = auth.currentUser;
    if (!sessionId || !user) throw new Error('No active session');

    const url = await uploadProofImage(imageUri, sessionId, 'before');

    await updateDoc(doc(db, 'sessions', sessionId), {
      beforeProofUrl: url,
    });

    set({ beforeProofUrl: url });
  },

  endSession: async () => {
    const { sessionId, startedAt } = get();
    if (!sessionId || !startedAt) throw new Error('No active session');

    // Calculate actual duration worked (in minutes)
    const endTime = new Date();
    const actualDurationMs = endTime.getTime() - new Date(startedAt).getTime();
    const actualDurationMin = Math.round(actualDurationMs / (1000 * 60)); // Convert to minutes

    // Timer ended, set status to completed so user appears "free" (blue dot)
    await updateDoc(doc(db, 'sessions', sessionId), {
      endedAt: serverTimestamp(),
      actualDurationMin,
      status: 'completed' as SessionStatus,
    });

    set({ status: 'completed' });
  },

  submitAfterProof: async (imageUri: string) => {
    const { sessionId } = get();
    const user = auth.currentUser;
    if (!sessionId || !user) throw new Error('No active session');

    const url = await uploadProofImage(imageUri, sessionId, 'after');

    await updateDoc(doc(db, 'sessions', sessionId), {
      afterProofUrl: url,
      status: 'completed' as SessionStatus,
    });

    set({ status: 'completed' });
  },

  abandonSession: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    await updateDoc(doc(db, 'sessions', sessionId), {
      endedAt: serverTimestamp(),
      status: 'abandoned' as SessionStatus,
    });

    set({
      sessionId: null,
      startedAt: null,
      durationMin: 0,
      tag: null,
      note: '',
      beforeProofUrl: null,
      status: null,
    });
  },

  clearSession: () => {
    set({
      sessionId: null,
      startedAt: null,
      durationMin: 0,
      tag: null,
      note: '',
      beforeProofUrl: null,
      status: null,
    });
  },
}));
