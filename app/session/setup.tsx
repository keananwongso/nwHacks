// Lock Setup screen - Duration, tags, note, start
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useAuth } from '../../src/hooks/useAuth';
import {
  DURATION_PRESETS,
  SESSION_TAGS,
  SessionTag,
  DEMO_MODE,
} from '../../src/utils/constants';
import { DurationPicker } from '../../src/components/session/DurationPicker';
import { TagSelector } from '../../src/components/session/TagSelector';

export default function SetupScreen() {
  const router = useRouter();
  const { initialProofUri } = useLocalSearchParams<{ initialProofUri: string }>();
  const { profile } = useAuth();
  const startSession = useSessionStore((state) => state.startSession);
  const submitBeforeProof = useSessionStore((state) => state.submitBeforeProof);

  const [duration, setDuration] = useState(DURATION_PRESETS[0]);
  const [tag, setTag] = useState<SessionTag>('Study');
  const [note, setNote] = useState('');
  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    if (!profile) return;

    setStarting(true);
    try {
      await startSession(
        duration,
        tag,
        note,
        profile.username,
        profile.avatarUrl
      );

      if (initialProofUri) {
        await submitBeforeProof(initialProofUri);
        router.replace('/session/active');
      } else {
        router.replace('/session/proof?type=before');
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      setStarting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Proof Preview if available */}
        {initialProofUri && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📸 Ready to lock in!</Text>
            <Image source={{ uri: initialProofUri }} style={styles.previewImage} />
          </View>
        )}

        {/* Duration Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How long are you locking in?</Text>
          {DEMO_MODE && (
            <Text style={styles.demoNote}>(Demo mode: durations in minutes)</Text>
          )}
          <DurationPicker
            presets={DURATION_PRESETS}
            selected={duration}
            onSelect={setDuration}
          />
        </View>

        {/* Tag Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What are you working on?</Text>
          <TagSelector tags={SESSION_TAGS} selected={tag} onSelect={setTag} />
        </View>

        {/* Note Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a note (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What's your goal for this session?"
            placeholderTextColor="#6B7280"
            multiline
            maxLength={200}
            style={styles.noteInput}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleStart}
          disabled={starting}
          style={[styles.startButton, starting && styles.startButtonDisabled]}
        >
          <Text style={styles.startButtonText}>
            {starting ? 'Starting...' : `Start ${duration} min Session`}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  demoNote: {
    color: '#CA8A04',
    fontSize: 14,
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: '#1F2937',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 100,
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  startButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 20,
    borderRadius: 9999,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#374151',
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#000',
  },
});
