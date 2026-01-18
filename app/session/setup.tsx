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
import { Ionicons } from '@expo/vector-icons';
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

const MOCK_FRIENDS = [
  { id: '1', name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Sam', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Jordan', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Taylor', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'Casey', avatar: 'https://i.pravatar.cc/150?u=5' },
];

export default function SetupScreen() {
  const router = useRouter();
  const { initialProofUri } = useLocalSearchParams<{ initialProofUri: string }>();
  const { profile } = useAuth();
  const startSession = useSessionStore((state) => state.startSession);
  const submitBeforeProof = useSessionStore((state) => state.submitBeforeProof);

  const [duration, setDuration] = useState(DURATION_PRESETS[0]);
  const [tag, setTag] = useState<SessionTag>('Study');
  const [note, setNote] = useState('');
  const [mode, setMode] = useState<'solo' | 'buddy'>('solo');
  const [selectedBuddy, setSelectedBuddy] = useState<string | null>(null);
  const [isTimed, setIsTimed] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

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
        {/* Photo Section */}
        {initialProofUri && (
          <View style={styles.photoContainer}>
            <TouchableOpacity onPress={() => setShowPreviewModal(true)} activeOpacity={0.9}>
              <Image source={{ uri: initialProofUri }} style={styles.previewImage} />
            </TouchableOpacity>
          </View>
        )}

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

        {/* Mode Selector */}
        <View style={styles.section}>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'solo' && styles.modeButtonActive]}
              onPress={() => setMode('solo')}
            >
              <Text style={[styles.modeButtonText, mode === 'solo' && styles.modeButtonTextActive]}>Solo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'buddy' && styles.modeButtonActive]}
              onPress={() => setMode('buddy')}
            >
              <Text style={[styles.modeButtonText, mode === 'buddy' && styles.modeButtonTextActive]}>Buddy</Text>
            </TouchableOpacity>
          </View>
          {mode === 'buddy' && (
            <View style={{ marginTop: 12 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buddyList}>
                {MOCK_FRIENDS.map((friend) => (
                  <TouchableOpacity
                    key={friend.id}
                    style={styles.buddyItem}
                    onPress={() => setSelectedBuddy(friend.id)}
                  >
                    <View style={[styles.buddyAvatarContainer, selectedBuddy === friend.id && styles.buddyAvatarSelected]}>
                      <Image source={{ uri: friend.avatar }} style={styles.buddyAvatar} />
                      {selectedBuddy === friend.id && (
                        <View style={styles.checkmarkBadge}>
                          <Ionicons name="checkmark" size={12} color="white" />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.buddyName, selectedBuddy === friend.id && styles.buddyNameSelected]}>{friend.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Duration Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.durationRow}>
            <TouchableOpacity
              style={[styles.timeTypeButton, isTimed && styles.timeTypeButtonActive]}
              onPress={() => setIsTimed(true)}
            >
              <Text style={[styles.timeTypeButtonTextUnselected, isTimed && styles.timeTypeButtonText]}>Timed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeTypeButton, !isTimed && styles.timeTypeButtonActive]}
              onPress={() => setIsTimed(false)}
            >
              <Text style={[styles.timeTypeButtonTextUnselected, !isTimed && styles.timeTypeButtonText]}>Untimed</Text>
            </TouchableOpacity>
          </View>

          {isTimed ? (
            <DurationPicker
              presets={[15, 30, 45, 60, 90]}
              selected={duration}
              onSelect={setDuration}
            />
          ) : (
            <Text style={{ color: '#9CA3AF' }}>Session will run until you stop it.</Text>
          )}
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

      {/* Full Screen Image Preview Modal */}
      {
        showPreviewModal && initialProofUri && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black', zIndex: 100, justifyContent: 'center' }]}>
            <Image source={{ uri: initialProofUri }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
            <TouchableOpacity
              onPress={() => setShowPreviewModal(false)}
              style={{ position: 'absolute', top: 60, left: 20, padding: 10 }}
            >
              <Ionicons name="close-circle" size={40} color="white" />
            </TouchableOpacity>
          </View>
        )
      }
    </SafeAreaView >
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
    paddingHorizontal: 24,
    paddingTop: 12, // Reduced from 24
    paddingBottom: 24,
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
  photoContainer: {
    width: '100%',
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: '#374151',
  },
  photoActions: {
    display: 'none',
  },
  minimalRetakeButton: {
    display: 'none',
  },
  minimalRetakeText: {
    display: 'none',
  },
  helperText: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 4,
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    padding: 4,
    borderRadius: 99,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 99,
  },
  modeButtonActive: {
    backgroundColor: '#6366F1',
  },
  modeButtonText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },

  durationRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  timeTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 99,
    backgroundColor: '#374151',
  },
  timeTypeButtonActive: {
    backgroundColor: '#6366F1',
  },
  timeTypeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  timeTypeButtonTextUnselected: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  subLabel: {
    color: '#9CA3AF',
    marginBottom: 12,
    fontSize: 14,
  },
  buddyList: {
    flexDirection: 'row',
  },
  buddyItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  buddyAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    padding: 2, // Border selection gap
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buddyAvatarSelected: {
    borderColor: '#6366F1',
  },
  buddyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#374151',
  },
  checkmarkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#6366F1',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#111827',
  },
  buddyName: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  buddyNameSelected: {
    color: 'white',
    fontWeight: '600',
  },
});
