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
import { useFriends } from '../../src/hooks/useFriends';
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
  const { friends } = useFriends();
  const startSession = useSessionStore((state) => state.startSession);
  const submitBeforeProof = useSessionStore((state) => state.submitBeforeProof);

  const [duration, setDuration] = useState(DURATION_PRESETS[0]);
  const [tag, setTag] = useState<SessionTag>('Study');
  const [selectedBuddies, setSelectedBuddies] = useState<string[]>([]);
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Start a Lock-In</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Photo Preview */}
        {initialProofUri && (
          <TouchableOpacity
            onPress={() => setShowPreviewModal(true)}
            activeOpacity={0.9}
            style={styles.photoPreviewContainer}
          >
            <Image source={{ uri: initialProofUri }} style={styles.photoPreview} />
          </TouchableOpacity>
        )}

        {/* Tag Selector - No header */}
        <View style={styles.section}>
          <TagSelector tags={SESSION_TAGS} selected={tag} onSelect={setTag} />
        </View>

        {/* Duration Picker */}
        <View style={styles.durationSection}>
          <Text style={styles.sectionLabel}>Duration</Text>
          <DurationPicker
            selected={duration}
            onSelect={setDuration}
          />
        </View>

        {/* Friend Accountability Section */}
        <View style={styles.section}>
          <Text style={styles.accountabilityHeading}>Keep yourself accountable</Text>
          <Text style={styles.optionalText}>(optional)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendCircles}
          >
            {/* Friend circles - multi-select */}
            {friends.map((friend) => {
              const isSelected = selectedBuddies.includes(friend.uid);
              return (
                <TouchableOpacity
                  key={friend.uid}
                  style={styles.friendCircle}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedBuddies(selectedBuddies.filter(id => id !== friend.uid));
                    } else {
                      setSelectedBuddies([...selectedBuddies, friend.uid]);
                    }
                  }}
                >
                  <View style={[styles.friendAvatar, isSelected && styles.friendAvatarSelected]}>
                    <Image source={{ uri: friend.avatarUrl || 'https://i.pravatar.cc/150' }} style={styles.friendAvatarImage} />
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={12} color="white" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.friendName, isSelected && styles.friendNameSelected]}>
                    {friend.fullName || friend.username}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>


        {/* Start Button */}
        <View style={styles.startSection}>
          <TouchableOpacity
            onPress={handleStart}
            disabled={starting}
            style={styles.startButton}
          >
            <Text style={[styles.startButtonText, starting && styles.startButtonTextDisabled]}>
              {starting ? 'STARTING...' : 'START'}
            </Text>
            <Ionicons name="arrow-forward" size={32} color={starting ? '#6B7280' : 'white'} />
          </TouchableOpacity>
        </View>

      </ScrollView>


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
    marginBottom: 24,
  },
  durationSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
  startSection: {
    marginTop: 40,
    paddingBottom: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 3,
  },
  startButtonTextDisabled: {
    color: '#6B7280',
  },
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  photoPreviewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoPreview: {
    width: '90%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: '#374151',
  },
  decisionBar: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  decisionPill: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  decisionPillText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  decisionPillIcon: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  noteCollapsed: {
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 16,
  },
  notePlaceholder: {
    color: '#6B7280',
    fontSize: 16,
  },
  noteInputExpanded: {
    minHeight: 100,
  },
  // Friend Accountability Section
  accountabilityHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  friendCircles: {
    paddingVertical: 4,
    gap: 12,
  },
  friendCircle: {
    alignItems: 'center',
    width: 56,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  friendAvatarSelected: {
    borderColor: '#FBBF24',
  },
  friendAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  friendName: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  friendNameSelected: {
    color: '#FBBF24',
    fontWeight: '600',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#111827',
  },
  optionalText: {
    color: '#6B7280',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
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
  buddyListTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  bottomSheet: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  bottomSheetClose: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
});
