// Reaction bar component
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { REACTION_EMOJIS, ReactionEmoji } from '../../utils/constants';
import { addReaction, removeReaction, getUserReaction } from '../../services/reactions';
import { ConfettiBurst, ConfettiBurstHandle } from './ConfettiBurst';

interface ReactionBarProps {
  sessionId: string;
  reactionCount: number;
  isBeRealStyle?: boolean;
}

export function ReactionBar({ sessionId, reactionCount, isBeRealStyle }: ReactionBarProps) {
  const [userReaction, setUserReaction] = useState<ReactionEmoji | null>(null);
  const [localCount, setLocalCount] = useState(reactionCount);
  const [showPicker, setShowPicker] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const confettiRef = useRef<ConfettiBurstHandle>(null);

  useEffect(() => {
    getUserReaction(sessionId).then(setUserReaction);
  }, [sessionId]);

  const animatePop = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.4,
        useNativeDriver: true,
        speed: 50,
        bounciness: 15,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
      }),
    ]).start();
  };

  const handleReaction = async (emoji: ReactionEmoji) => {
    try {
      if (userReaction === emoji) {
        // Remove reaction
        await removeReaction(sessionId);
        setUserReaction(null);
        setLocalCount((c) => c - 1);
      } else {
        // Add or change reaction
        const hadReaction = userReaction !== null;
        await addReaction(sessionId, emoji);
        setUserReaction(emoji);
        if (!hadReaction) {
          setLocalCount((c) => c + 1);
        }
        animatePop();
        confettiRef.current?.start();
      }
    } catch (error) {
      console.error('Reaction error:', error);
    }
    setShowPicker(false);
  };

  return (
    <View style={isBeRealStyle && styles.containerBeReal}>
      <View style={styles.mainRow}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPress={() => setShowPicker(!showPicker)}
            style={[
              styles.reactButton,
              userReaction && styles.reactButtonActive,
              isBeRealStyle && styles.reactButtonBeReal,
            ]}
          >
            {isBeRealStyle ? (
              <Text style={styles.smileyIcon}>{userReaction || '😊'}</Text>
            ) : userReaction ? (
              <>
                <Text style={styles.emoji}>{userReaction}</Text>
                <Text style={styles.reactedText}>You reacted</Text>
              </>
            ) : (
              <Text style={styles.reactText}>React</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
        <ConfettiBurst ref={confettiRef} />

        {!isBeRealStyle && localCount > 0 && (
          <Text style={styles.count}>
            {localCount} reaction{localCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {showPicker && (
        <View style={[styles.picker, isBeRealStyle && styles.pickerBeReal]}>
          {REACTION_EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => handleReaction(emoji)}
              style={[
                styles.emojiButton,
                userReaction === emoji && styles.emojiButtonActive,
              ]}
            >
              <Text style={[
                styles.pickerEmoji,
                userReaction === emoji && styles.pickerEmojiActive
              ]}>
                {emoji}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  containerBeReal: {
    position: 'relative',
    zIndex: 10,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  reactButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  reactButtonBeReal: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  smileyIcon: {
    fontSize: 24,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 16,
    marginRight: 4,
  },
  reactText: {
    color: '#9CA3AF',
  },
  reactedText: {
    color: '#818CF8',
    fontSize: 14,
  },
  count: {
    color: '#6B7280',
    fontSize: 14,
  },
  picker: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: '#374151',
    borderRadius: 9999,
    padding: 8,
  },
  pickerBeReal: {
    position: 'absolute',
    bottom: 56,
    right: 0,
    width: 44,
    backgroundColor: 'rgba(31, 41, 55, 0.98)',
    borderWidth: 1,
    borderColor: '#4B5563',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    paddingVertical: 6,
    borderRadius: 22,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 22,
    marginVertical: 4,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  pickerEmoji: {
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 28,
  },
  pickerEmojiActive: {
    // Selection state handled by button background
  },
});
