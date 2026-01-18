// Leaderboard Screen - Shows social credit rankings
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getLeaderboard, getFriendLeaderboard, getUserRank, LeaderboardEntry } from '../../src/services/socialCredit';
import { getFriendIds } from '../../src/services/friends';
import { useAuth } from '../../src/hooks/useAuth';
import { SocialCreditBadge } from '../../src/components/ui/SocialCreditBadge';

type LeaderboardView = 'global' | 'friends';

export default function LeaderboardScreen() {
  const { profile } = useAuth();
  const [view, setView] = useState<LeaderboardView>('friends');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    if (!profile) return;

    try {
      setLoading(true);

      if (view === 'global') {
        const data = await getLeaderboard(50);
        setLeaderboard(data);
        
        // Get user's rank
        const rank = await getUserRank(profile.uid);
        setUserRank(rank);
      } else {
        // Friends leaderboard
        const friendIds = await getFriendIds();
        const data = await getFriendLeaderboard(friendIds, profile.uid);
        setLeaderboard(data);
        
        // Find user's rank in friend list
        const userIndex = data.findIndex(entry => entry.uid === profile.uid);
        setUserRank(userIndex >= 0 ? userIndex + 1 : null);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [profile, view]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  }, [loadLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const renderLeaderboardItem = (entry: LeaderboardEntry, index: number) => {
    const isCurrentUser = profile?.uid === entry.uid;
    const rank = index + 1;

    return (
      <View
        key={entry.uid}
        style={[
          styles.leaderboardItem,
          isCurrentUser && styles.currentUserItem,
        ]}
      >
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{getRankIcon(rank)}</Text>
        </View>

        <View style={styles.userInfo}>
          {entry.avatarUrl ? (
            <Image source={{ uri: entry.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {entry.username?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}

          <View style={styles.userDetails}>
            <Text style={styles.username}>
              {entry.username}
              {isCurrentUser && <Text style={styles.youTag}> (You)</Text>}
            </Text>
            <Text style={styles.fullName}>{entry.fullName}</Text>
          </View>
        </View>

        <SocialCreditBadge score={entry.socialCreditScore} size="small" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              view === 'friends' && styles.toggleButtonActive,
            ]}
            onPress={() => setView('friends')}
          >
            <Text
              style={[
                styles.toggleText,
                view === 'friends' && styles.toggleTextActive,
              ]}
            >
              Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              view === 'global' && styles.toggleButtonActive,
            ]}
            onPress={() => setView('global')}
          >
            <Text
              style={[
                styles.toggleText,
                view === 'global' && styles.toggleTextActive,
              ]}
            >
              Global
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User's Rank Card */}
      {profile && !loading && (
        <View style={styles.userRankCard}>
          <Text style={styles.userRankLabel}>Your Rank</Text>
          <View style={styles.userRankContent}>
            <Text style={styles.userRankNumber}>
              {userRank ? getRankIcon(userRank) : '—'}
            </Text>
            <SocialCreditBadge 
              score={profile.socialCreditScore || 0} 
              size="medium" 
            />
          </View>
        </View>
      )}

      {/* Leaderboard List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : leaderboard.length > 0 ? (
          leaderboard.map((entry, index) => renderLeaderboardItem(entry, index))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyTitle}>No rankings yet</Text>
            <Text style={styles.emptySubtitle}>
              {view === 'friends'
                ? 'Add friends to see rankings!'
                : 'Be the first to earn social credit!'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#6366F1',
  },
  toggleText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: 'white',
  },
  userRankCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  userRankLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  userRankContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRankNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  currentUserItem: {
    borderColor: '#6366F1',
    backgroundColor: '#1e1b4b',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  youTag: {
    color: '#6366F1',
    fontSize: 14,
  },
  fullName: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
});
