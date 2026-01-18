// Feed hook - fetches friend sessions with pagination
import { useState, useEffect, useCallback } from 'react';
import { DocumentSnapshot } from 'firebase/firestore';
import { getFriendIds } from '../services/friends';
import { getFriendsSessions } from '../services/sessions';
import { Session } from '../types';
import { auth } from '../services/firebase';

export function useFeed() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [friendIds, setFriendIds] = useState<string[]>([]);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const ids = await getFriendIds();
      // Include current user in the feed
      if (auth.currentUser) {
        ids.push(auth.currentUser.uid);
      }
      setFriendIds(ids);

      if (ids.length === 0) {
        setSessions([]);
        setHasMore(false);
        return;
      }

      const { sessions: newSessions, lastDoc: newLastDoc } =
        await getFriendsSessions(ids, 20);
      setSessions(newSessions);
      setLastDoc(newLastDoc);
      setHasMore(newSessions.length === 20);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const refresh = useCallback(async () => {
    setLastDoc(null);
    await loadFeed();
  }, [loadFeed]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !lastDoc) return;

    setLoading(true);
    try {
      const { sessions: newSessions, lastDoc: newLastDoc } =
        await getFriendsSessions(friendIds, 20, lastDoc);
      setSessions((prev) => [...prev, ...newSessions]);
      setLastDoc(newLastDoc);
      setHasMore(newSessions.length === 20);
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setLoading(false);
    }
  }, [friendIds, hasMore, loading, lastDoc]);

  return { sessions, loading, refresh, loadMore, hasMore };
}
