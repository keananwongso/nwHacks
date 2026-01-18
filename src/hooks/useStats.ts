// Stats hook - calculates streak and session statistics
import { useState, useEffect, useCallback } from 'react';
import { auth } from '../services/firebase';
import { getUserSessions, getTodaySessions } from '../services/sessions';
import { UserStats, Session } from '../types';
import { startOfDay, subDays, isSameDay } from 'date-fns';

export function useStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get all completed sessions
      const sessions = await getUserSessions(user.uid, 100);
      const completedSessions = sessions.filter((s) => s.status === 'completed');

      // Get today's sessions
      const today = await getTodaySessions(user.uid);
      setTodaySessions(today);

      // Calculate streak
      const { currentStreak, longestStreak } = calculateStreak(completedSessions);

      // Calculate minutes this week
      const weekStart = subDays(new Date(), 7);
      const minutesThisWeek = completedSessions
        .filter((s) => s.startedAt?.toDate() >= weekStart)
        .reduce((sum, s) => sum + s.durationMin, 0);

      // Calculate hourly activity for today (24 buckets)
      const hourlyBuckets = new Array(24).fill(0);
      today.forEach(s => {
        if (s.startedAt && s.status === 'completed') {
          const hour = s.startedAt.toDate().getHours();
          hourlyBuckets[hour] += s.durationMin;
        }
      });

      setStats({
        currentStreak,
        longestStreak,
        totalSessions: completedSessions.length,
        minutesThisWeek,
        sessionsToday: today.filter((s) => s.status === 'completed').length,
        hourlyBuckets,
        socialCreditScore: 0, // Will be updated from profile
      } as any);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, todaySessions, loading, refresh: loadStats };
}

function calculateStreak(sessions: Session[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Group sessions by day
  const sessionDays = new Set<string>();
  sessions.forEach((s) => {
    if (s.startedAt) {
      const date = startOfDay(s.startedAt.toDate());
      sessionDays.add(date.toISOString());
    }
  });

  const sortedDays = Array.from(sessionDays)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  if (sortedDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 0;

  // Check if user did a session today or yesterday
  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);
  const mostRecentSession = sortedDays[0];

  if (!isSameDay(mostRecentSession, today) && !isSameDay(mostRecentSession, yesterday)) {
    // Streak broken
    currentStreak = 0;
  } else {
    // Calculate current streak
    let expectedDay = isSameDay(mostRecentSession, today) ? today : yesterday;
    for (const day of sortedDays) {
      if (isSameDay(day, expectedDay)) {
        currentStreak++;
        expectedDay = subDays(expectedDay, 1);
      } else if (day < expectedDay) {
        break;
      }
    }
  }

  // Calculate longest streak
  let tempStreak = 1;
  longestStreak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const diff = sortedDays[i - 1].getTime() - sortedDays[i].getTime();
    const daysDiff = diff / (1000 * 60 * 60 * 24);

    if (daysDiff <= 1.5) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
}
