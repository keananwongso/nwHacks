// Session query operations
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  Timestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { Session } from '../types';

export async function getUserSessions(
  userId: string,
  limitCount: number = 50
): Promise<Session[]> {
  const q = query(
    collection(db, 'sessions'),
    where('userId', '==', userId),
    orderBy('startedAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Session);
}

export async function getFriendsSessions(
  friendIds: string[],
  limitCount: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ sessions: Session[]; lastDoc: DocumentSnapshot | null }> {
  if (friendIds.length === 0) {
    return { sessions: [], lastDoc: null };
  }

  // Firestore 'in' queries limited to 30 items
  const batchedIds = friendIds.slice(0, 30);

  let q = query(
    collection(db, 'sessions'),
    where('userId', 'in', batchedIds),
    where('status', 'in', ['active', 'completed', 'abandoned']),
    orderBy('startedAt', 'desc'),
    limit(limitCount)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const sessions = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Session
  );
  const newLastDoc =
    snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

  return { sessions, lastDoc: newLastDoc };
}

export async function getTodaySessions(userId: string): Promise<Session[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, 'sessions'),
    where('userId', '==', userId),
    where('startedAt', '>=', Timestamp.fromDate(today)),
    orderBy('startedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Session);
}
