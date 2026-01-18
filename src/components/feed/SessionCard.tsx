// Session card for feed display
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Alert } from 'react-native';
import { useState, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { Session } from '../../types';
import { Timestamp } from 'firebase/firestore';
import { ReactionBar } from './ReactionBar';
import { DecisionBar } from './DecisionBar';
import { Confetti } from './Confetti';
import { auth } from '../../services/firebase';
import { deleteSession, subscribeToUserActiveStatus } from '../../services/sessions';
import { useEffect } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 0; // Padding is handled by container or content
const PHOTO_WIDTH = SCREEN_WIDTH;

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDecisionOverlay, setShowDecisionOverlay] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentDecision, setCurrentDecision] = useState<'tick' | 'cross' | null>(null);
  const [activeSessionData, setActiveSessionData] = useState<{ isActive: boolean; startedAt?: Timestamp | null }>({ isActive: false });
  const hasHandledInitialDecision = useRef(false);
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const overlayScale = useRef(new Animated.Value(1)).current;
  const isMyPost = auth.currentUser?.uid === session.userId;

  const statusText = !session.endedAt
    ? 'In Progress...'
    : `${formatDistanceToNow(session.startedAt.toDate(), { addSuffix: false })} ago`;
  const isAbandoned = session.status === 'abandoned';

  const photos = [session.beforeProofUrl, session.afterProofUrl].filter(Boolean);

  useEffect(() => {
    const unsubscribe = subscribeToUserActiveStatus(session.userId, (data) => {
      setActiveSessionData(data);
    });
    return () => unsubscribe();
  }, [session.userId]);

  // Timer for active session duration
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    if (!activeSessionData.isActive || !activeSessionData.startedAt) {
      setElapsed('');
      return;
    }

    const updateElapsed = () => {
      const start = activeSessionData.startedAt!.toDate();
      const diffTotalSec = Math.floor((new Date().getTime() - start.getTime()) / 1000);
      const m = Math.floor(diffTotalSec / 60);
      const s = diffTotalSec % 60;
      setElapsed(`${m}:${s.toString().padStart(2, '0')}`);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeSessionData.isActive, activeSessionData.startedAt]);

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / PHOTO_WIDTH);
    setActiveIndex(index);
  };

  const fadeOutOverlay = () => {
    setShowConfetti(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(overlayScale, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
    ]).start(() => {
      setShowDecisionOverlay(false);
      // Confetti will clean itself up via animation duration internally or we can timeout it
      setTimeout(() => setShowConfetti(false), 3000);
    });
  };

  const reopenOverlay = () => {
    // Mark as handled so the initial decision check doesn't hide it again
    hasHandledInitialDecision.current = true;
    setShowDecisionOverlay(true);

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(overlayScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
    ]).start();
  };

  return (
    <View style={[styles.card, isAbandoned && styles.cardAbandoned]}>
      {/* Header */}
      <View style={styles.header}>
        {session.avatarUrl ? (
          <Image source={{ uri: session.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {session.username?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View style={styles.headerText}>
          <View style={styles.usernameRow}>
            <Text style={styles.username}>{session.username}</Text>
            <View style={[
              styles.statusDot,
              { backgroundColor: activeSessionData.isActive ? '#FBBC05' : '#4FC3F7' }
            ]} />
            {activeSessionData.isActive && elapsed && (
              <Text style={styles.activeDuration}>• {elapsed}</Text>
            )}
          </View>
          <Text style={styles.location}>Life Sciences Institute, UBC • {statusText}</Text>
        </View>
        {isMyPost && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              Alert.alert(
                "Delete Post",
                "Are you sure you want to delete this post?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await deleteSession(session.id);
                      } catch (error) {
                        console.error("Error deleting session:", error);
                        Alert.alert("Error", "Failed to delete post.");
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.moreButtonText}>•••</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Note */}
      {session.note ? <Text style={styles.note}>{session.note}</Text> : null}

      {/* Photos Carousel */}
      {photos.length > 0 ? (
        <View style={styles.photoContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            scrollEnabled={photos.length > 1}
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.carousel}
          >
            {photos.map((url, index) => (
              <View key={index} style={styles.photoSlide}>
                <Image
                  source={{ uri: url! }}
                  style={styles.photo}
                  resizeMode="cover"
                />

                {/* Decision Bar Overlay (Only on After photo for friends) */}
                {index === 1 && !isMyPost && (
                  <>
                    {showDecisionOverlay ? (
                      <Animated.View
                        style={[
                          styles.decisionOverlay,
                          {
                            opacity: overlayOpacity,
                            transform: [{ scale: overlayScale }]
                          }
                        ]}
                      >
                        <Text style={styles.decisionPrompt}>Did they lock in?</Text>
                        <DecisionBar
                          sessionId={session.id}
                          onDecision={(decision, isInitial) => {
                            if (decision) {
                              setCurrentDecision(decision as any);
                              if (isInitial && !hasHandledInitialDecision.current) {
                                // Already answered on mount, hide immediately
                                setShowDecisionOverlay(false);
                                overlayOpacity.setValue(0);
                                hasHandledInitialDecision.current = true;
                              } else if (!isInitial) {
                                // User just clicked a choice, fade out
                                fadeOutOverlay();
                                hasHandledInitialDecision.current = true;
                              }
                            } else {
                              setCurrentDecision(null);
                            }
                          }}
                        />
                      </Animated.View>
                    ) : currentDecision && (
                      <TouchableOpacity
                        style={styles.miniDecisionIndicator}
                        onPress={reopenOverlay}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.miniDecisionEmoji}>
                          {currentDecision === 'tick' ? '🔒' : '😐'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <Confetti isActive={showConfetti} type={currentDecision} />
                  </>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Indicator Dots */}
          {photos.length > 1 && (
            <View style={styles.pagination}>
              {photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeIndex === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Legacy Reaction Bar (Always visible or on first slide?) */}
          {activeIndex === 0 && (
            <View style={styles.reactionAbsoluteWrapper}>
              <ReactionBar sessionId={session.id} reactionCount={session.reactionCount || 0} isBeRealStyle={true} />
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#111827',
  },
  cardAbandoned: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  headerText: {
    flex: 1,
  },
  username: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  activeDuration: {
    color: '#FBBC05',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  location: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  moreButton: {
    padding: 4,
  },
  moreButtonText: {
    color: 'white',
    fontSize: 16,
    letterSpacing: 1,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    position: 'relative',
  },
  carousel: {
    flex: 1,
  },
  photoSlide: {
    width: PHOTO_WIDTH,
    height: '100%',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  pagination: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  activeDot: {
    backgroundColor: 'white',
    width: 12, // Longer dot for active
  },
  reactionAbsoluteWrapper: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  decisionOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Removed black opacity overlay
  },
  decisionPrompt: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  miniDecisionIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  miniDecisionEmoji: {
    fontSize: 22,
  },
  note: {
    color: 'white',
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 15,
    lineHeight: 20,
  },
});
