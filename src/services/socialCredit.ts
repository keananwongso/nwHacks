// Social credit calculation and management service
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { getSessionDecisions } from './decisions';

export interface LeaderboardEntry {
  uid: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  socialCreditScore: number;
}

/**
 * Get decision counts for a session
 */
export async function getDecisionCounts(sessionId: string): Promise<{
  tickCount: number;
  crossCount: number;
}> {
  const decisions = await getSessionDecisions(sessionId);
  
  let tickCount = 0;
  let crossCount = 0;
  
  decisions.forEach((decision: any) => {
    if (decision.type === 'tick') {
      tickCount++;
    } else if (decision.type === 'cross') {
      crossCount++;
    }
  });
  
  return { tickCount, crossCount };
}

/**
 * Calculate net social credit delta for a session
 */
export function calculateSessionDelta(tickCount: number, crossCount: number): number {
  return tickCount - crossCount;
}

/**
 * Update user's social credit score atomically
 */
export async function updateUserSocialCredit(
  userId: string,
  delta: number
): Promise<void> {
  if (delta === 0) return;
  
  const profileRef = doc(db, 'profiles', userId);
  await updateDoc(profileRef, {
    socialCreditScore: increment(delta),
  });
}

/**
 * Get user's current social credit score
 */
export async function getUserSocialCredit(userId: string): Promise<number> {
  const profileRef = doc(db, 'profiles', userId);
  const profileDoc = await getDoc(profileRef);
  
  if (!profileDoc.exists()) {
    return 0;
  }
  
  return profileDoc.data().socialCreditScore || 0;
}

/**
 * Get leaderboard with top users by social credit score
 */
export async function getLeaderboard(limitCount: number = 50): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, 'profiles'),
    orderBy('socialCreditScore', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      username: data.username,
      fullName: data.fullName,
      avatarUrl: data.avatarUrl || null,
      socialCreditScore: data.socialCreditScore || 0,
    };
  });
}

/**
 * Get friend leaderboard - only friends of the given user
 */
export async function getFriendLeaderboard(
  friendIds: string[],
  currentUserId: string
): Promise<LeaderboardEntry[]> {
  // Include current user in the list
  const allIds = [...friendIds, currentUserId];
  
  // Firestore 'in' queries limited to 30 items
  const batchedIds = allIds.slice(0, 30);
  
  // Fetch all profiles for the IDs
  const profiles: LeaderboardEntry[] = [];
  
  for (const uid of batchedIds) {
    try {
      const profileRef = doc(db, 'profiles', uid);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        profiles.push({
          uid: profileDoc.id,
          username: data.username,
          fullName: data.fullName,
          avatarUrl: data.avatarUrl || null,
          socialCreditScore: data.socialCreditScore || 0,
        });
      }
    } catch (error) {
      console.error(`Error fetching profile ${uid}:`, error);
    }
  }
  
  // Sort by social credit score descending
  profiles.sort((a, b) => b.socialCreditScore - a.socialCreditScore);
  
  return profiles;
}

/**
 * Get user's rank in the global leaderboard
 */
export async function getUserRank(userId: string): Promise<number | null> {
  const userScore = await getUserSocialCredit(userId);
  
  // Count how many users have a higher score
  const q = query(
    collection(db, 'profiles'),
    where('socialCreditScore', '>', userScore)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.size + 1; // +1 because ranking is 1-indexed
}
