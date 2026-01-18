// Active session screen - Timer, proof status, end button
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSessionStore } from '../../src/stores/sessionStore';
import { Timer } from '../../src/components/ui/Timer';
import { PROOF_WINDOW_SECONDS, TAG_ICONS } from '../../src/utils/constants';

export default function ActiveSessionScreen() {
  const router = useRouter();
  const {
    sessionId,
    startedAt,
    durationMin,
    tag,
    beforeProofUrl,
    endSession,
    abandonSession,
  } = useSessionStore();

  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [proofWindowPassed, setProofWindowPassed] = useState(false);

  // Calculate/Track elapsed time
  useEffect(() => {
    if (!startedAt) return;

    const startTime = new Date(startedAt).getTime();
    const durationSeconds = durationMin * 60;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setSecondsElapsed(elapsed);

      // Check if proof window has passed (start check immediately)
      if (elapsed > PROOF_WINDOW_SECONDS && !beforeProofUrl) {
        setProofWindowPassed(true);
      }

      // Auto-end removed: User must manually end session even if target reached.
      if (durationMin > 0 && elapsed >= durationSeconds) {
        // Optional: Vibrate or notify user target is reached, but keep counting.
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, durationMin, beforeProofUrl]);

  const handleEndSession = useCallback(async () => {
    await endSession();
    router.replace('/session/proof?type=after');
  }, [endSession, router]);

  const handleAbandon = () => {
    Alert.alert(
      'Abandon Session?',
      'This will end your session without completing it. Your friends will see it as abandoned.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Abandon',
          style: 'destructive',
          onPress: async () => {
            await abandonSession();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  if (!sessionId) {
    router.replace('/(tabs)');
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Tag */}
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>
            {tag && TAG_ICONS[tag]} {tag}
          </Text>
        </View>

        {/* Timer */}
        <Timer secondsElapsed={secondsElapsed} totalSeconds={durationMin * 60} />

        {/* Proof Status */}
        <View style={styles.proofStatus}>
          {beforeProofUrl ? (
            <View style={styles.proofDone}>
              <Text style={styles.proofDoneIcon}>✓</Text>
              <Text style={styles.proofDoneText}>Before proof submitted</Text>
            </View>
          ) : proofWindowPassed ? (
            <View style={styles.proofExpired}>
              <Text style={styles.proofExpiredIcon}>✗</Text>
              <Text style={styles.proofExpiredText}>Proof window expired</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/session/proof?type=before')}
              style={styles.proofButton}
            >
              <Text style={styles.proofButtonText}>📸 Submit Before Proof</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleEndSession} style={styles.endButton}>
          <Text style={styles.endButtonText}>End Session</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAbandon} style={styles.abandonButton}>
          <Text style={styles.abandonButtonText}>Abandon Session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  tagBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    marginBottom: 16,
  },
  tagText: {
    color: '#818CF8',
    fontWeight: '600',
    fontSize: 16,
  },
  proofStatus: {
    marginTop: 32,
    alignItems: 'center',
  },
  proofDone: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proofDoneIcon: {
    color: '#4ADE80',
    marginRight: 8,
    fontSize: 18,
  },
  proofDoneText: {
    color: '#9CA3AF',
  },
  proofExpired: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proofExpiredIcon: {
    color: '#F87171',
    marginRight: 8,
    fontSize: 18,
  },
  proofExpiredText: {
    color: '#F87171',
  },
  proofButton: {
    backgroundColor: '#CA8A04',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  proofButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  endButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    marginBottom: 12,
  },
  endButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  abandonButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  abandonButtonText: {
    color: '#6B7280',
  },
});
