import { Timestamp } from 'firebase/firestore';

// Re-export from constants for convenience
export { SessionTag, ReactionEmoji } from '../utils/constants';
import type { SessionTag, ReactionEmoji } from '../utils/constants';

// Profile stored at profiles/{uid}
export interface Profile {
  uid: string;
  username: string;
  usernameLower: string;
  fullName: string;
  avatarUrl: string | null;
  label: string;
  createdAt: Timestamp;
}

// Username reservation at usernames/{usernameLower}
export interface UsernameDoc {
  uid: string;
}

// Friend relationship at friends/{uid}/list/{friendUid}
export interface FriendRelation {
  friendUid: string;
  createdAt: Timestamp;
}

// Session status
export type SessionStatus = 'active' | 'completed' | 'abandoned';

// Session document at sessions/{sessionId}
export interface Session {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  startedAt: Timestamp;
  endedAt: Timestamp | null;
  durationMin: number; // Target duration in minutes
  actualDurationMin?: number; // Actual duration worked (calculated when ended)
  tag: SessionTag;
  note: string;
  status: SessionStatus;
  beforeProofUrl: string | null;
  afterProofUrl: string | null;
  reactionCount: number;
}

// Reaction at sessions/{sessionId}/reactions/{uid}
export interface Reaction {
  uid: string;
  emoji: ReactionEmoji;
  createdAt: Timestamp;
}

// Stats computed client-side
export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  minutesThisWeek: number;
  sessionsToday: number;
  hourlyBuckets: number[];
}

// Active session state (Zustand store)
export interface ActiveSessionState {
  sessionId: string | null;
  startedAt: Date | null;
  durationMin: number;
  tag: SessionTag | null;
  note: string;
  beforeProofUrl: string | null;
  status: SessionStatus | null;

  // Actions
  startSession: (
    durationMin: number,
    tag: SessionTag,
    note: string,
    username: string,
    avatarUrl: string | null
  ) => Promise<string>;
  submitBeforeProof: (imageUri: string) => Promise<void>;
  endSession: () => Promise<void>;
  submitAfterProof: (imageUri: string) => Promise<void>;
  abandonSession: () => Promise<void>;
  clearSession: () => void;
}
