// Session card for feed display
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { Session } from '../../types';
import { ReactionBar } from './ReactionBar';
import { TAG_ICONS } from '../../utils/constants';

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const statusText = !session.endedAt
    ? 'In Progress...'
    : `${formatDistanceToNow(session.startedAt.toDate(), { addSuffix: false })} ago`;
  const isAbandoned = session.status === 'abandoned';

  const mainPhoto = session.afterProofUrl || session.beforeProofUrl;
  const insetPhoto = session.afterProofUrl ? session.beforeProofUrl : null;

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
          <Text style={styles.username}>{session.username}</Text>
          <Text style={styles.location}>Life Sciences Institute, UBC • {statusText}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
      {isAbandoned && (
        <View style={styles.abandonedBadge}>
          <Text style={styles.abandonedText}>Abandoned</Text>
        </View>
      )}

      {/* Note */}
      {session.note ? <Text style={styles.note}>{session.note}</Text> : null}

      {/* Photos */}
      {mainPhoto ? (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: mainPhoto }}
            style={styles.mainPhoto}
            resizeMode="cover"
          />
          {insetPhoto && (
            <View style={styles.insetPhotoWrapper}>
              <Image
                source={{ uri: insetPhoto }}
                style={styles.insetPhoto}
                resizeMode="cover"
              />
            </View>
          )}
          <View style={styles.reactionAbsoluteWrapper}>
            <ReactionBar sessionId={session.id} reactionCount={session.reactionCount || 0} isBeRealStyle={true} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 0,
    paddingVertical: 8,
    marginBottom: 16,
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
    backgroundColor: '#111827',
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  insetPhotoWrapper: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: '30%',
    aspectRatio: 3 / 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'black',
    overflow: 'hidden',
    backgroundColor: '#1F2937',
  },
  insetPhoto: {
    width: '100%',
    height: '100%',
  },
  reactionAbsoluteWrapper: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  abandonedBadge: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  abandonedText: {
    color: '#F87171',
    fontSize: 14,
  },
  note: {
    color: 'white',
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    fontSize: 15,
    lineHeight: 20,
  },
});
