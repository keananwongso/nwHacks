// Zustand store for active session state
import { create } from 'zustand';
import { doc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { uploadProofImage } from '../services/storage';
import { ActiveSessionState, SessionTag, SessionStatus, Session } from '../types';

// Generate a simple unique ID
const generateId = () =>
  `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useSessionStore = create<ActiveSessionState>((set, get) => ({
  sessionId: null,
  startedAt: null,
  durationMin: 0,
  tag: null,
  note: '',
  witnessId: undefined, // Add to state
  beforeProofUrl: null,
  status: null,

  startSession: async (
    durationMin: number,
    tag: SessionTag,
    note: string,
    username: string,
    avatarUrl: string | null,
    witnessId?: string // New param
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
      witnessId: witnessId || null,
      witnessResponse: null,
      // Initialize social credit fields
      tickCount: 0,
      crossCount: 0,
      socialCreditDelta: 0,
    });

    set({
      sessionId,
      startedAt,
      durationMin,
      tag,
      note,
      witnessId, // Set in store
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
    const { sessionId } = get();
    if (!sessionId) throw new Error('No active session');

    // Just mark the end time. Status change happens after proof upload.
    await updateDoc(doc(db, 'sessions', sessionId), {
      endedAt: serverTimestamp(),
      // Status remains active until proof is uploaded
    });
  },

  // Witness Actions
  witnessApprove: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    await updateDoc(doc(db, 'sessions', sessionId), {
      status: 'completed' as SessionStatus,
      witnessResponse: 'approved',
    });
    set({ status: 'completed' });
  },

  witnessReject: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    await updateDoc(doc(db, 'sessions', sessionId), {
      status: 'challenged' as SessionStatus,
      witnessResponse: 'rejected',
    });
    set({ status: 'challenged' });
  },

  handleWitnessTimeout: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    await updateDoc(doc(db, 'sessions', sessionId), {
      status: 'completed' as SessionStatus,
      witnessResponse: 'timeout',
    });
    set({ status: 'completed' });
  },

  submitChallenge: async (imageUri: string, note?: string) => {
    const { sessionId } = get();
    if (!sessionId) return;

    const url = await uploadProofImage(imageUri, sessionId, 'challenge');

    // Mock AI Verification for now
    const mockConfidence = Math.floor(Math.random() * 20) + 80; // 80-100 score

    await updateDoc(doc(db, 'sessions', sessionId), {
      status: 'completed' as SessionStatus, // Or back to Active? No, complete it.
      challengeProofUrl: url,
      aiConfidence: mockConfidence,
      aiFeedback: 'AI verification passed. Good job!',
    });

    set({ status: 'completed' });
  },

  submitAfterProof: async (imageUri: string) => {
    const { sessionId, witnessId } = get();
    const user = auth.currentUser;
    if (!sessionId || !user) throw new Error('No active session');

    const url = await uploadProofImage(imageUri, sessionId, 'after');

    if (witnessId) {
      // Now we wait for witness
      await updateDoc(doc(db, 'sessions', sessionId), {
        afterProofUrl: url,
        status: 'awaiting_witness' as SessionStatus,
      });
      set({ status: 'awaiting_witness' });
    } else {
      // Complete immediately
      await updateDoc(doc(db, 'sessions', sessionId), {
        afterProofUrl: url,
        status: 'completed' as SessionStatus,
      });
      set({ status: 'completed' });
    }
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
