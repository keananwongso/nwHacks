import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, RefreshControl } from 'react-native';
import { Timestamp } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useStats } from '../../src/hooks/useStats';
import { useFeed } from '../../src/hooks/useFeed';
import { TodayBlob } from '../../src/components/home/TodayBlob';
import { SessionCard } from '../../src/components/feed/SessionCard';
import { DEMO_MODE } from '../../src/utils/constants';
import { Session } from '../../src/types';

const MOCK_SESSIONS: Session[] = [
  {
    id: 'mock1',
    userId: 'u1',
    username: 'Keanan',
    avatarUrl: 'https://i.pravatar.cc/150?u=keanan',
    startedAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 45)),
    endedAt: null,
    durationMin: 90,
    tag: 'Build',
    note: 'Grinding on the new mobile app features! 🚀',
    status: 'active',
    beforeProofUrl: 'https://ikblc.ubc.ca/files/2016/07/ubc-irving-k-barber-learning-centre_23048531806_o-min.jpg',
    afterProofUrl: null,
    reactionCount: 5,
  },
  {
    id: 'mock2',
    userId: 'u2',
    username: 'Alex',
    avatarUrl: 'https://i.pravatar.cc/150?u=alex',
    startedAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 120)),
    endedAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60)),
    durationMin: 60,
    tag: 'Study',
    note: 'Studying chem rn',
    status: 'completed',
    beforeProofUrl: 'https://cdn.prod.website-files.com/667c59abb9df9789d17407a6/667dd777d5f64df921fde5fd_20171201-Study-Spaces-Roberge-5_2-scaled.jpeg',
    afterProofUrl: 'https://about.library.ubc.ca/files/2022/07/UBCLibrary_MalcolmsonCollection_blog_920x512_V2.jpg',
    reactionCount: 12,
  },
  {
    id: 'mock3',
    userId: 'u3',
    username: 'Sarah',
    avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
    startedAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 200)),
    endedAt: null,
    durationMin: 45,
    tag: 'Study',
    note: 'Coffee and algorithms. ☕️📖',
    status: 'active',
    beforeProofUrl: 'https://woodward-branch-050713.sites.olt.ubc.ca/files/2022/08/memorialRoom.jpg',
    afterProofUrl: null,
    reactionCount: 8,
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { stats, loading: statsLoading } = useStats();
  const { sessions: feedSessions, loading: feedLoading, refresh: refreshFeed } = useFeed();
  const sessionsToDisplay = DEMO_MODE ? [...feedSessions, ...MOCK_SESSIONS] : feedSessions;

  const handleLockIn = () => {
    router.push('/session/setup');
  };

  const todayMinutes = stats?.hourlyBuckets?.reduce((a: number, b: number) => a + b, 0) || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={statsLoading || feedLoading}
            onRefresh={refreshFeed}
            tintColor="#6366F1"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeftContainer}>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={styles.avatarButton}
            >
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.placeholderAvatar]}>
                  <Text style={styles.avatarInitial}>
                    {(profile?.fullName || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.name}>{profile?.fullName || 'User'}</Text>
            </View>
          </View>

          <View style={styles.streakBox}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakNumber}>{stats?.currentStreak || 0}</Text>
            <Text style={styles.streakLabel}>days</Text>
          </View>
        </View>

        {/* Today Stats Blob */}
        <TodayBlob
          minutes={todayMinutes}
          sessions={stats?.sessionsToday || 0}
          hourlyBuckets={stats?.hourlyBuckets || new Array(24).fill(0)}
          style={styles.todayBlob}
        />

        {/* Feed Section */}
        <View style={styles.feedSection}>
          <Text style={styles.feedTitle}>Friend Activity</Text>
          {sessionsToDisplay.length > 0 ? (
            sessionsToDisplay.map((session) => (
              <View key={session.id} style={styles.feedItem}>
                <SessionCard session={session} />
              </View>
            ))
          ) : (
            <View style={styles.emptyFeed}>
              <Text style={styles.emptyTitle}>No activity from friends yet</Text>
              <Text style={styles.emptySubtitle}>
                Start a session or add friends to see their activity here!
              </Text>
            </View>
          )}

          {sessionsToDisplay.length > 0 && (
            <View style={styles.footerContainer}>
              <Text style={styles.footerEmoji}>☀️</Text>
              <Text style={styles.footerTitle}>
                And with that, we wrap up today's lock-in.
              </Text>
              <Text style={styles.footerSubtitle}>
                Now, you can lock out. Go touch some grass!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 12, // Reduced padding
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarButton: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  placeholderAvatar: {
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  avatarInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  streakBox: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    flexDirection: 'row',
  },
  streakNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  streakIcon: {
    fontSize: 18,
    marginRight: 5,
  },
  streakLabel: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '500',
  },
  lockInButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 24,
    borderRadius: 20,
    marginVertical: 24,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  lockInEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  lockInText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  lockInSubtext: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    fontSize: 16,
  },
  todayBlob: {
    marginBottom: 15,
    marginHorizontal: 12, // Reduced margin
  },
  feedSection: {
    marginTop: 8,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 21,
    paddingHorizontal: 12,
  },
  feedItem: {
    marginBottom: 16,
  },
  emptyFeed: {
    padding: 40,
    marginHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
    borderStyle: 'dashed',
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
  footerContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  footerEmoji: {
    fontSize: 40,
    marginBottom: 16,
  },
  footerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  signOut: {
    marginTop: 32,
    marginBottom: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: '#6B7280',
    fontSize: 16,
  },
});
