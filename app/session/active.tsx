// Active session screen - Timer, proof status, end button
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSessionStore } from '../../src/stores/sessionStore';
import { Timer } from '../../src/components/ui/Timer';
import { PROOF_WINDOW_SECONDS, TAG_ICONS } from '../../src/utils/constants';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../src/services/firebase';

export default function ActiveSessionScreen() {
  const router = useRouter();
  const {
    sessionId,
    startedAt,
    durationMin,
    tag,
    beforeProofUrl,
    endSession,
    status,
    witnessId,
    handleWitnessTimeout,
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
    // Navigate to camera for everyone (Witness flow now requires proof first)
    router.replace('/session/after-camera');
  }, [endSession, router]);

  // Effect to handle status changes (e.g. witness approved/rejected)
  useEffect(() => {
    if (!sessionId) return;

    // Subscribe to the session document for real-time status updates
    // This is needed because the 'witness' might update the doc remotely
    const unsubscribe = onSnapshot(doc(db, 'sessions', sessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const remoteStatus = data.status;

        // Update local store if different (optional, or just react locally)
        // Ideally we update the store so other components know
        if (remoteStatus !== status) {
          useSessionStore.setState({ status: remoteStatus });
        }
      }
    });

    return () => unsubscribe();
  }, [sessionId, status]);

  // Witness Timeout Logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (status === 'awaiting_witness') {
      timeoutId = setTimeout(() => {
        handleWitnessTimeout();
        // The store update status to 'completed' will trigger the existing navigation effect
      }, 30000); // 30 seconds
    }

    return () => clearTimeout(timeoutId);
  }, [status, handleWitnessTimeout]);

  // React to status changes
  useEffect(() => {
    if (status === 'challenged') {
      router.replace('/session/challenge');
    } else if (status === 'completed' && witnessId) {
      // Witness approved (or timed out)! We already took the photo, so go to feed
      router.replace('/(tabs)');
    }
  }, [status, witnessId]);


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

        {/* Proof Status - only show if proof not yet submitted */}
        {!beforeProofUrl && (
          <View style={styles.proofStatus}>
            {proofWindowPassed ? (
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
        )}
      </View>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleEndSession}
          style={[styles.endButton, status === 'awaiting_witness' && styles.endButtonDisabled]}
          disabled={status === 'awaiting_witness'}
        >
          <Text style={styles.endButtonText}>
            {status === 'awaiting_witness' ? 'Waiting for Witness... ⏳' : 'End Session'}
          </Text>
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
  endButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.8,
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
