// Home screen - Lock In button, today status, stats
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useStats } from '../../src/hooks/useStats';
import { StatsCard } from '../../src/components/home/StatsCard';
import { TodayStatus } from '../../src/components/home/TodayStatus';
import { DEMO_MODE } from '../../src/utils/constants';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { stats, todaySessions } = useStats();

  const handleLockIn = () => {
    router.push('/session/setup');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
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

        {/* Lock In Button */}
        {/* <TouchableOpacity
          onPress={handleLockIn}
          style={styles.lockInButton}
          activeOpacity={0.8}
        >
          <Text style={styles.lockInEmoji}>🔒</Text>
          <Text style={styles.lockInText}>Lock In</Text>
          <Text style={styles.lockInSubtext}>Start a focused session</Text>
        </TouchableOpacity> */}

        {/* Statistics */}
        <TouchableOpacity
          style={styles.lockInButton}
          activeOpacity={0.8}
        >
          <Text style={styles.lockInEmoji}>🔒</Text>
          <Text style={styles.lockInText}>Lock In</Text>
          <Text style={styles.lockInSubtext}>Start a focused session</Text>
        </TouchableOpacity>

        {/* Today's Status */}
        <TodayStatus sessions={todaySessions} />

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatsCard
            label="Total Sessions"
            value={stats?.totalSessions || 0}
            icon="📊"
          />
          <StatsCard
            label="Minutes This Week"
            value={stats?.minutesThisWeek || 0}
            icon="⏱️"
          />
        </View>

        {/* Sign Out */}
        <TouchableOpacity onPress={signOut} style={styles.signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 24,
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
