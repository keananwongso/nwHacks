// Friends screen - Add by username, list friends, view leaderboard
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useFriends } from '../../src/hooks/useFriends';
import { useAuth } from '../../src/hooks/useAuth';
import { FriendListItem } from '../../src/components/friends/FriendListItem';
import { SocialCreditBadge } from '../../src/components/ui/SocialCreditBadge';
import { getLeaderboard, getFriendLeaderboard, getUserRank, LeaderboardEntry } from '../../src/services/socialCredit';
import { getFriendIds } from '../../src/services/friends';
import { eventEmitter, EVENTS } from '../../src/utils/eventEmitter';

type View = 'friends' | 'leaderboard';

export default function FriendsScreen() {
  const { friends, loading: friendsLoading, addFriend, removeFriend } = useFriends();
  const { profile } = useAuth();
  const isFocused = useIsFocused();
  const [searchUsername, setSearchUsername] = useState('');
  const [adding, setAdding] = useState(false);
  const [currentView, setCurrentView] = useState<View>('friends');
  
  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  const loadLeaderboard = useCallback(async () => {
    if (!profile) return;

    try {
      setLoadingLeaderboard(true);
      const friendIds = await getFriendIds();
      const data = await getFriendLeaderboard(friendIds, profile.uid);
      setLeaderboard(data);
      
      // Find user's rank in friend list
      const userIndex = data.findIndex(entry => entry.uid === profile.uid);
      setUserRank(userIndex >= 0 ? userIndex + 1 : null);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, [profile]);

  // Reload leaderboard when tab comes into focus and leaderboard view is active
  useEffect(() => {
    if (isFocused && currentView === 'leaderboard') {
      loadLeaderboard();
    }
  }, [isFocused, currentView, loadLeaderboard]);

  useEffect(() => {
    if (currentView === 'leaderboard') {
      loadLeaderboard();
    }
  }, [currentView, loadLeaderboard]);

  // Listen for vote events to refresh leaderboard
  useEffect(() => {
    const handleVoteCast = () => {
      if (currentView === 'leaderboard') {
        // Reload leaderboard when a vote is cast
        loadLeaderboard();
      }
    };

    eventEmitter.on(EVENTS.VOTE_CAST, handleVoteCast);

    return () => {
      eventEmitter.off(EVENTS.VOTE_CAST, handleVoteCast);
    };
  }, [currentView, loadLeaderboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  }, [loadLeaderboard]);

  const handleAddFriend = async () => {
    if (!searchUsername.trim()) return;

    setAdding(true);
    try {
      await addFriend(searchUsername.toLowerCase());
      setSearchUsername('');
      Alert.alert('Success', 'Friend added!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not add friend');
    } finally {
      setAdding(false);
    }
  };

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
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Friends</Text>
          
          {/* View Toggle */}
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                currentView === 'friends' && styles.toggleButtonActive,
              ]}
              onPress={() => setCurrentView('friends')}
            >
              <Text
                style={[
                  styles.toggleText,
                  currentView === 'friends' && styles.toggleTextActive,
                ]}
              >
                Friends
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                currentView === 'leaderboard' && styles.toggleButtonActive,
              ]}
              onPress={() => setCurrentView('leaderboard')}
            >
              <Text
                style={[
                  styles.toggleText,
                  currentView === 'leaderboard' && styles.toggleTextActive,
                ]}
              >
                Leaderboard
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {currentView === 'friends' ? (
          <>
            {/* Add Friend Section */}
            <View style={styles.addSection}>
              <Text style={styles.addTitle}>Add Friend</Text>
              <View style={styles.addRow}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.atSymbol}>@</Text>
                  <TextInput
                    value={searchUsername}
                    onChangeText={(text) =>
                      setSearchUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
                    placeholder="username"
                    placeholderTextColor="#6B7280"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleAddFriend}
                  disabled={adding || !searchUsername.trim()}
                  style={[
                    styles.addButton,
                    !searchUsername.trim() && styles.addButtonDisabled,
                  ]}
                >
                  <Text style={styles.addButtonText}>{adding ? '...' : 'Add'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Friends List */}
            <FlatList
              data={friends}
              keyExtractor={(item) => item.uid}
              renderItem={({ item }) => (
                <FriendListItem
                  friend={item}
                  onRemove={() => removeFriend(item.uid)}
                />
              )}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>👋</Text>
                  <Text style={styles.emptyTitle}>No friends yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Add friends by their username to see their lock-ins
                  </Text>
                </View>
              }
            />
          </>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.leaderboardContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#6366F1"
              />
            }
          >
            {/* User's Rank Card */}
            {profile && !loadingLeaderboard && (
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
            {loadingLeaderboard ? (
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
                  Add friends to see rankings!
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
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
  addSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  addTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  addRow: {
    flexDirection: 'row',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  atSymbol: {
    color: '#6B7280',
    fontSize: 16,
  },
  input: {
    flex: 1,
    color: 'white',
    paddingVertical: 12,
    paddingHorizontal: 4,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#6366F1',
    marginLeft: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#374151',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#6B7280',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#4B5563',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  // Leaderboard styles
  scrollView: {
    flex: 1,
  },
  leaderboardContent: {
    padding: 20,
    paddingBottom: 40,
  },
  userRankCard: {
    marginBottom: 20,
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
});
